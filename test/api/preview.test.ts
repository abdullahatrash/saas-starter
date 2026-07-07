import { describe, it, expect, vi, beforeEach } from 'vitest'
import { eq } from 'drizzle-orm'

// Mock the Replicate boundary so no real prediction is ever created, and so we
// can assert whether the handler reached out to Replicate at all.
const { createPrediction } = vi.hoisted(() => ({
  createPrediction: vi.fn(async () => ({ id: 'pred_test', status: 'starting' })),
}))
vi.mock('@/lib/replicate', () => ({ createPrediction }))

import { POST } from '@/app/api/preview/route'
import { db } from '@/lib/db/drizzle'
import { teams, teamMembers, userCredits } from '@/lib/db/schema'
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
})
