import { describe, it, expect } from 'vitest'
import { eq } from 'drizzle-orm'
import { POST } from '@/app/api/webhooks/replicate/route'
import { db } from '@/lib/db/drizzle'
import { previewJobs, previewResults } from '@/lib/db/schema'
import { createUser } from '../helpers/auth'
import { createPreviewJob } from '../helpers/fixtures'
import { signReplicateWebhook } from '../helpers/replicate-webhook'

const SECRET = process.env.REPLICATE_WEBHOOK_SIGNING_SECRET!
const PREDICTION_ID = 'pred_abc123'

function deliver(body: string, headers: Record<string, string>) {
  const request = new Request('http://localhost/api/webhooks/replicate', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body,
  })
  return POST(request as any)
}

function succeededPayload() {
  return JSON.stringify({
    id: PREDICTION_ID,
    status: 'succeeded',
    output: ['https://example.com/result.png'],
  })
}

async function jobStatus(id: number) {
  const [job] = await db.select().from(previewJobs).where(eq(previewJobs.id, id)).limit(1)
  return job.status
}

async function resultCount(jobId: number) {
  const rows = await db.select().from(previewResults).where(eq(previewResults.jobId, jobId))
  return rows.length
}

describe('POST /api/webhooks/replicate', () => {
  it('rejects a payload with an invalid signature and writes nothing', async () => {
    const user = await createUser()
    const job = await createPreviewJob({
      userId: user.id,
      status: 'running',
      replicatePredictionId: PREDICTION_ID,
    })
    const body = succeededPayload()

    const response = await deliver(body, {
      'webhook-id': 'msg_1',
      'webhook-timestamp': String(Math.floor(Date.now() / 1000)),
      'webhook-signature': 'v1,not-a-real-signature',
    })

    expect(response.status).toBe(401)
    expect(await jobStatus(job.id)).toBe('running')
    expect(await resultCount(job.id)).toBe(0)
  })

  it('rejects a payload with missing signature headers and writes nothing', async () => {
    const user = await createUser()
    const job = await createPreviewJob({
      userId: user.id,
      status: 'running',
      replicatePredictionId: PREDICTION_ID,
    })

    const response = await deliver(succeededPayload(), {})

    expect(response.status).toBe(401)
    expect(await jobStatus(job.id)).toBe('running')
    expect(await resultCount(job.id)).toBe(0)
  })

  it('records the result when the signature is valid', async () => {
    const user = await createUser()
    const job = await createPreviewJob({
      userId: user.id,
      status: 'running',
      replicatePredictionId: PREDICTION_ID,
    })
    const body = succeededPayload()
    const headers = signReplicateWebhook({
      id: 'msg_1',
      timestamp: String(Math.floor(Date.now() / 1000)),
      body,
      secret: SECRET,
    })

    const response = await deliver(body, headers)

    expect(response.status).toBe(200)
    expect(await jobStatus(job.id)).toBe('succeeded')
    expect(await resultCount(job.id)).toBe(1)
  })

  it('marks the job failed when a valid webhook reports failure', async () => {
    const user = await createUser()
    const job = await createPreviewJob({
      userId: user.id,
      status: 'running',
      replicatePredictionId: PREDICTION_ID,
    })
    const body = JSON.stringify({ id: PREDICTION_ID, status: 'failed', error: 'boom' })
    const headers = signReplicateWebhook({
      id: 'msg_2',
      timestamp: String(Math.floor(Date.now() / 1000)),
      body,
      secret: SECRET,
    })

    const response = await deliver(body, headers)

    expect(response.status).toBe(200)
    expect(await jobStatus(job.id)).toBe('failed')
    expect(await resultCount(job.id)).toBe(0)
  })
})
