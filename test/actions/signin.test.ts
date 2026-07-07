import { describe, it, expect } from 'vitest'
import { signIn } from '@/app/(login)/actions'
import { db } from '@/lib/db/drizzle'
import { users } from '@/lib/db/schema'
import { hashPassword } from '@/lib/auth/session'
import { initializeUserCredits } from '@/lib/entitlements'

function form(fields: Record<string, string>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.append(k, v)
  return fd
}

async function runSignIn(fields: Record<string, string>) {
  try {
    await signIn({}, form(fields))
    return { redirectedTo: null as string | null }
  } catch (err: any) {
    if (typeof err?.digest === 'string' && err.digest.startsWith('NEXT_REDIRECT')) {
      return { redirectedTo: err.digest.split(';')[2] as string }
    }
    throw err
  }
}

describe('signIn', () => {
  it('lands a zero-credit user in the studio, not the pricing page', async () => {
    const passwordHash = await hashPassword('password123')
    const [user] = await db
      .insert(users)
      .values({ email: 'zero@test.com', passwordHash, role: 'owner' })
      .returning()
    await initializeUserCredits(user.id, 0)

    const { redirectedTo } = await runSignIn({
      email: 'zero@test.com',
      password: 'password123',
    })

    expect(redirectedTo).toBe('/studio')
  })
})
