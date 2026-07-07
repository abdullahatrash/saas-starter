import { describe, it, expect } from 'vitest'
import { eq } from 'drizzle-orm'
import { POST } from '@/app/api/stripe/webhook/route'
import { stripe } from '@/lib/payments/stripe'
import { db } from '@/lib/db/drizzle'
import { userCredits, payments } from '@/lib/db/schema'
import { createUser } from '../helpers/auth'

const SECRET = process.env.STRIPE_WEBHOOK_SECRET!

function deliver(payload: string, signature?: string) {
  const header =
    signature ?? stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET })
  const request = new Request('http://localhost/api/stripe/webhook', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'stripe-signature': header },
    body: payload,
  })
  return POST(request as any)
}

function checkoutCompleted(opts: {
  sessionId: string
  userId: number
  credits: number
  priceId?: string
  amountTotal?: number
}) {
  return JSON.stringify({
    id: 'evt_test',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: opts.sessionId,
        object: 'checkout.session',
        mode: 'payment',
        payment_intent: 'pi_test',
        amount_total: opts.amountTotal ?? 299,
        metadata: {
          type: 'credit_pack',
          userId: String(opts.userId),
          credits: String(opts.credits),
          priceId: opts.priceId ?? 'price_entry_test_dummy',
        },
      },
    },
  })
}

async function creditBalance(userId: number) {
  const [row] = await db
    .select({ credits: userCredits.credits })
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .limit(1)
  return row?.credits ?? null
}

async function paymentsForSession(sessionId: string) {
  return db.select().from(payments).where(eq(payments.stripeSessionId, sessionId))
}

describe('POST /api/stripe/webhook', () => {
  it('grants exactly the purchased credits and records one payment', async () => {
    const user = await createUser()
    const sessionId = 'cs_test_grant'

    const response = await deliver(
      checkoutCompleted({ sessionId, userId: user.id, credits: 5 })
    )

    expect(response.status).toBe(200)
    expect(await creditBalance(user.id)).toBe(5)

    const rows = await paymentsForSession(sessionId)
    expect(rows).toHaveLength(1)
    expect(rows[0].purpose).toBe('credit_pack')
    expect(rows[0].status).toBe('succeeded')
    expect(rows[0].userId).toBe(user.id)
  })

  it('grants nothing extra when the same event is replayed', async () => {
    const user = await createUser()
    const sessionId = 'cs_test_replay'
    const payload = checkoutCompleted({ sessionId, userId: user.id, credits: 5 })

    const first = await deliver(payload)
    const second = await deliver(payload)

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
    expect(await creditBalance(user.id)).toBe(5)
    expect(await paymentsForSession(sessionId)).toHaveLength(1)
  })

  it('rejects an event with an invalid signature and writes nothing', async () => {
    const user = await createUser()
    const sessionId = 'cs_test_badsig'
    const payload = checkoutCompleted({ sessionId, userId: user.id, credits: 5 })

    const response = await deliver(payload, 't=123,v1=not-a-real-signature')

    expect(response.status).toBe(400)
    expect(await creditBalance(user.id)).toBeNull()
    expect(await paymentsForSession(sessionId)).toHaveLength(0)
  })
})
