import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { checkoutAction } from '@/lib/payments/actions'
import { stripe } from '@/lib/payments/stripe'
import { db } from '@/lib/db/drizzle'
import { teams, teamMembers } from '@/lib/db/schema'
import { createUser, authenticateAs, signOut } from '../helpers/auth'

function form(fields: Record<string, string>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.append(k, v)
  return fd
}

async function runCheckout(fields: Record<string, string>) {
  try {
    await checkoutAction(form(fields))
    return { redirectedTo: null as string | null }
  } catch (err: any) {
    if (typeof err?.digest === 'string' && err.digest.startsWith('NEXT_REDIRECT')) {
      return { redirectedTo: err.digest.split(';')[2] as string }
    }
    throw err
  }
}

async function memberOfTeam() {
  const user = await createUser()
  const [team] = await db.insert(teams).values({ name: 'Checkout Test Team' }).returning()
  await db.insert(teamMembers).values({ userId: user.id, teamId: team.id, role: 'owner' })
  await authenticateAs(user.id)
  return user
}

let createSession: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  createSession = vi
    .spyOn(stripe.checkout.sessions, 'create')
    .mockResolvedValue({ url: 'https://checkout.stripe.com/c/session-under-test' } as any)
})

afterEach(() => {
  createSession.mockRestore()
  signOut()
})

describe('checkoutAction', () => {
  it('resolves the pack price ID on the server from the submitted pack id', async () => {
    await memberOfTeam()

    const { redirectedTo } = await runCheckout({ packId: 'entry' })

    expect(createSession).toHaveBeenCalledTimes(1)
    const params = createSession.mock.calls[0][0] as any
    expect(params.line_items[0].price).toBe(process.env.STRIPE_PRICE_ENTRY_TEST)
    expect(redirectedTo).toBe('https://checkout.stripe.com/c/session-under-test')
  })

  it('sends the buyer back to pricing for an unknown pack id without calling Stripe', async () => {
    await memberOfTeam()

    const { redirectedTo } = await runCheckout({ packId: 'mega-deluxe' })

    expect(createSession).not.toHaveBeenCalled()
    expect(redirectedTo).toBe('/pricing')
  })

  it('sends the buyer back to pricing when no pack is submitted, without calling Stripe', async () => {
    await memberOfTeam()

    const { redirectedTo } = await runCheckout({})

    expect(createSession).not.toHaveBeenCalled()
    expect(redirectedTo).toBe('/pricing')
  })
})
