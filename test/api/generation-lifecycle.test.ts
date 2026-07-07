import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { eq } from 'drizzle-orm'
import { NextRequest } from 'next/server'

// Mock the Replicate module boundary for the polling route. The webhook route
// never calls Replicate; it only receives signed payloads.
const { getPrediction } = vi.hoisted(() => ({
  getPrediction: vi.fn(),
}))
vi.mock('@/lib/replicate', () => ({
  getPrediction,
  createPrediction: vi.fn(),
  cancelPrediction: vi.fn(),
}))

import { GET } from '@/app/api/preview/[id]/route'
import { POST as webhookPost } from '@/app/api/webhooks/replicate/route'
import { db } from '@/lib/db/drizzle'
import { previewResults, userCredits } from '@/lib/db/schema'
import { createUser, authenticateAs } from '../helpers/auth'
import { createPreviewJob } from '../helpers/fixtures'
import { signReplicateWebhook } from '../helpers/replicate-webhook'
import { initializeUserCredits } from '@/lib/entitlements'

const SECRET = process.env.REPLICATE_WEBHOOK_SIGNING_SECRET!
const PREDICTION_ID = 'pred_lifecycle_1'
const RESULT_URL = 'https://replicate.delivery/xezq/abc/tmp123.jpeg'

// A minimal but valid-enough PNG header: signature + IHDR with 768x1024.
function tinyPng(width: number, height: number) {
  const buf = Buffer.alloc(24)
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0)
  buf.writeUInt32BE(13, 8) // IHDR chunk length
  buf.write('IHDR', 12, 'ascii')
  buf.writeUInt32BE(width, 16)
  buf.writeUInt32BE(height, 20)
  return buf
}

function pollJob(id: number) {
  const request = new NextRequest(`http://localhost/api/preview/${id}`)
  return GET(request, { params: Promise.resolve({ id: String(id) }) })
}

function deliverWebhook(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload)
  const headers = signReplicateWebhook({
    id: `msg_${Math.random().toString(36).slice(2)}`,
    timestamp: String(Math.floor(Date.now() / 1000)),
    body,
    secret: SECRET,
  })
  const request = new Request('http://localhost/api/webhooks/replicate', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body,
  })
  return webhookPost(request as any)
}

async function resultsFor(jobId: number) {
  return db.select().from(previewResults).where(eq(previewResults.jobId, jobId))
}

async function creditBalance(userId: number) {
  const [row] = await db
    .select({ credits: userCredits.credits })
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .limit(1)
  return row?.credits ?? 0
}

async function runningJobFor(userId: number) {
  return createPreviewJob({
    userId,
    status: 'running',
    replicatePredictionId: PREDICTION_ID,
  })
}

beforeEach(() => {
  getPrediction.mockReset()
  // The result image lives on Replicate's CDN; dimension probing fetches it.
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(tinyPng(768, 1024)))
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('successful generation', () => {
  it('stores the result with real dimensions when the webhook output is a single URL string', async () => {
    const user = await createUser()
    const job = await runningJobFor(user.id)

    const response = await deliverWebhook({
      id: PREDICTION_ID,
      status: 'succeeded',
      output: RESULT_URL, // nano-banana-2 returns a single URI string
    })

    expect(response.status).toBe(200)
    const results = await resultsFor(job.id)
    expect(results).toHaveLength(1)
    expect(results[0].imageUrl).toBe(RESULT_URL)
    expect(results[0].width).toBe(768)
    expect(results[0].height).toBe(1024)
  })

  it('stores the result when the webhook output is an array of URLs', async () => {
    const user = await createUser()
    const job = await runningJobFor(user.id)

    const response = await deliverWebhook({
      id: PREDICTION_ID,
      status: 'succeeded',
      output: [RESULT_URL],
    })

    expect(response.status).toBe(200)
    const results = await resultsFor(job.id)
    expect(results).toHaveLength(1)
    expect(results[0].imageUrl).toBe(RESULT_URL)
  })

  it('stores null dimensions rather than fabricated ones when the image cannot be probed', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('network down')
    }))
    const user = await createUser()
    const job = await runningJobFor(user.id)

    const response = await deliverWebhook({
      id: PREDICTION_ID,
      status: 'succeeded',
      output: RESULT_URL,
    })

    expect(response.status).toBe(200)
    const results = await resultsFor(job.id)
    expect(results).toHaveLength(1)
    expect(results[0].width).toBeNull()
    expect(results[0].height).toBeNull()
  })

  it('stores the result via polling whether output is a string or an array', async () => {
    for (const output of [RESULT_URL, [RESULT_URL]]) {
      const user = await createUser()
      const job = await runningJobFor(user.id)
      await authenticateAs(user.id)
      getPrediction.mockResolvedValueOnce({
        id: PREDICTION_ID,
        status: 'succeeded',
        output,
      })

      const response = await pollJob(job.id)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.job.status).toBe('succeeded')
      const results = await resultsFor(job.id)
      expect(results).toHaveLength(1)
      expect(results[0].imageUrl).toBe(RESULT_URL)
      expect(results[0].width).toBe(768)
      expect(results[0].height).toBe(1024)
    }
  })
})

describe('failed generation refunds exactly one credit', () => {
  it('refunds one credit when polling observes the failure, and only once across repeated polls', async () => {
    const user = await createUser()
    await initializeUserCredits(user.id, 0)
    const job = await runningJobFor(user.id)
    await authenticateAs(user.id)
    getPrediction.mockResolvedValue({
      id: PREDICTION_ID,
      status: 'failed',
      error: 'generation blew up',
    })

    const first = await pollJob(job.id)
    expect(first.status).toBe(200)
    expect(await creditBalance(user.id)).toBe(1)

    const second = await pollJob(job.id)
    expect(second.status).toBe(200)
    expect(await creditBalance(user.id)).toBe(1)
  })

  it('refunds one credit when the webhook observes the failure, and only once on replay', async () => {
    const user = await createUser()
    await initializeUserCredits(user.id, 0)
    const job = await runningJobFor(user.id)

    const first = await deliverWebhook({ id: PREDICTION_ID, status: 'failed', error: 'boom' })
    expect(first.status).toBe(200)
    expect(await creditBalance(user.id)).toBe(1)

    const replay = await deliverWebhook({ id: PREDICTION_ID, status: 'failed', error: 'boom' })
    expect(replay.status).toBe(200)
    expect(await creditBalance(user.id)).toBe(1)

    void job
  })

  it('refunds only once when the webhook observes the failure first and polling sees it afterwards', async () => {
    const user = await createUser()
    await initializeUserCredits(user.id, 0)
    const job = await runningJobFor(user.id)
    await authenticateAs(user.id)
    getPrediction.mockResolvedValue({
      id: PREDICTION_ID,
      status: 'failed',
      error: 'boom',
    })

    await deliverWebhook({ id: PREDICTION_ID, status: 'failed', error: 'boom' })
    expect(await creditBalance(user.id)).toBe(1)

    const response = await pollJob(job.id)
    expect(response.status).toBe(200)
    expect(await creditBalance(user.id)).toBe(1)
  })

  it('refunds only once when polling observes the failure first and the webhook arrives afterwards', async () => {
    const user = await createUser()
    await initializeUserCredits(user.id, 0)
    const job = await runningJobFor(user.id)
    await authenticateAs(user.id)
    getPrediction.mockResolvedValue({
      id: PREDICTION_ID,
      status: 'failed',
      error: 'boom',
    })

    await pollJob(job.id)
    expect(await creditBalance(user.id)).toBe(1)

    const response = await deliverWebhook({ id: PREDICTION_ID, status: 'failed', error: 'boom' })
    expect(response.status).toBe(200)
    expect(await creditBalance(user.id)).toBe(1)

    void job
  })
})
