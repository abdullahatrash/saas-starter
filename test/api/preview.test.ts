import { describe, it, expect, vi, beforeEach } from 'vitest'
import { eq } from 'drizzle-orm'

// Mock the Replicate boundary so no real prediction is ever created, and so we
// can assert whether the handler reached out to Replicate at all.
const { createPrediction } = vi.hoisted(() => ({
  // Typed with the input arg so tests can assert on what the handler passed to
  // the Replicate boundary (bodyImageUrl/designImageUrl/prompt).
  createPrediction: vi.fn(async (_input: {
    bodyImageUrl: string
    designImageUrl: string
    prompt: string
    webhookUrl?: string
  }) => ({ id: 'pred_test', status: 'starting' })),
}))
vi.mock('@/lib/replicate', () => ({ createPrediction }))

import { POST } from '@/app/api/preview/route'
import { db } from '@/lib/db/drizzle'
import { teams, teamMembers, userCredits, previewJobs } from '@/lib/db/schema'
import { createUser, authenticateAs } from '../helpers/auth'
import { initializeUserCredits } from '@/lib/entitlements'

function generate(body: Record<string, unknown>) {
  const request = new Request('http://localhost/api/preview', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  return POST(request as any)
}

const validBody = {
  bodyImageUrl: 'https://example.com/body.jpg',
  designImageUrl: 'https://example.com/design.jpg',
  part: 'forearm',
}

const compositeBody = {
  bodyImageUrl: 'https://example.com/body.jpg',
  designImageUrl: 'https://example.com/design.jpg',
  compositeImageUrl: 'https://example.com/composite.jpg',
  part: 'forearm',
  variant: 'black_gray',
  // Placement metadata still rides along, but must NOT drive the prompt.
  scale: 0.42,
  rotationDeg: 37,
  opacity: 0.8,
}

async function creditBalance(userId: number) {
  const [row] = await db
    .select({ credits: userCredits.credits })
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .limit(1)
  return row?.credits ?? null
}

// Gives the user a team membership so the handler's studio lookup has a valid
// team_id foreign key to hang the design off of.
async function giveTeam(userId: number) {
  const [team] = await db.insert(teams).values({ name: 'Test Team' }).returning()
  await db.insert(teamMembers).values({ userId, teamId: team.id, role: 'owner' })
}

beforeEach(() => {
  createPrediction.mockClear()
})

describe('POST /api/preview', () => {
  it('returns 402 for a fresh user without granting free credits or calling Replicate', async () => {
    // No credit row at all: the handler's defensive initialization must not
    // hand out free credits on the way to the paywall check.
    const user = await createUser()
    await authenticateAs(user.id)

    const response = await generate(validBody)

    expect(response.status).toBe(402)
    expect(await creditBalance(user.id) ?? 0).toBe(0)
    expect(createPrediction).not.toHaveBeenCalled()
  })

  it('consumes exactly one credit and starts a prediction when the user has credits', async () => {
    const user = await createUser()
    await initializeUserCredits(user.id, 2)
    await giveTeam(user.id)
    await authenticateAs(user.id)

    const response = await generate(validBody)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.creditsRemaining).toBe(1)
    expect(await creditBalance(user.id)).toBe(1)
    expect(createPrediction).toHaveBeenCalledTimes(1)
  })

  it('legacy (no composite) sends the clean body photo and encodes placement as prose', async () => {
    const user = await createUser()
    await initializeUserCredits(user.id, 1)
    await giveTeam(user.id)
    await authenticateAs(user.id)

    await generate({ ...validBody, scale: 0.5, rotationDeg: 30, opacity: 0.7 })

    // image_input for the legacy flow is [body, design].
    const arg = createPrediction.mock.calls[0][0]
    expect(arg.bodyImageUrl).toBe(validBody.bodyImageUrl)
    expect(arg.designImageUrl).toBe(validBody.designImageUrl)
    // The legacy prompt still turns the numbers into English sentences.
    expect(arg.prompt).toMatch(/degrees|%/)
  })

  it('composite flow sends [composite, design] and a prompt free of scale/rotation prose', async () => {
    const user = await createUser()
    await initializeUserCredits(user.id, 1)
    await giveTeam(user.id)
    await authenticateAs(user.id)

    const response = await generate(compositeBody)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(createPrediction).toHaveBeenCalledTimes(1)

    // Replicate receives the composite as the first image (image_input =
    // [composite, design]) and the clean design as the reference.
    const arg = createPrediction.mock.calls[0][0]
    expect(arg.bodyImageUrl).toBe(compositeBody.compositeImageUrl)
    expect(arg.designImageUrl).toBe(compositeBody.designImageUrl)

    // The composite prompt must NOT encode rotation degrees or scale/opacity
    // percentages as prose — the pixels carry the placement now.
    expect(arg.prompt).not.toMatch(/degrees/)
    expect(arg.prompt).not.toMatch(/\d+%/)
    expect(arg.prompt).not.toMatch(/rotate/i)

    // Placement values are still recorded for metadata / the share page.
    const [job] = await db
      .select()
      .from(previewJobs)
      .where(eq(previewJobs.id, data.jobId))
      .limit(1)
    const params = job.variantParams as Record<string, number>
    expect(params.scale).toBe(compositeBody.scale)
    expect(params.rotationDeg).toBe(compositeBody.rotationDeg)
    expect(params.opacity).toBe(compositeBody.opacity)
  })

  it('rejects a custom prompt longer than the cap with 400 and no charge', async () => {
    const user = await createUser()
    await initializeUserCredits(user.id, 1)
    await giveTeam(user.id)
    await authenticateAs(user.id)

    const response = await generate({
      ...validBody,
      customPrompt: 'x'.repeat(2001),
    })

    expect(response.status).toBe(400)
    expect(createPrediction).not.toHaveBeenCalled()
    // A rejected request must not consume the credit.
    expect(await creditBalance(user.id)).toBe(1)
  })
})
