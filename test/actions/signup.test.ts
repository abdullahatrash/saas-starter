import { describe, it, expect } from 'vitest'
import { eq } from 'drizzle-orm'
import { signUp } from '@/app/(login)/actions'
import { db } from '@/lib/db/drizzle'
import { users, userCredits } from '@/lib/db/schema'

function form(fields: Record<string, string>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.append(k, v)
  return fd
}

// signUp ends by calling redirect(), which throws a NEXT_REDIRECT error. Run
// the action and surface where it tried to send the user without failing.
async function runSignUp(fields: Record<string, string>) {
  try {
    await signUp({}, form(fields))
    return { redirectedTo: null as string | null }
  } catch (err: any) {
    if (typeof err?.digest === 'string' && err.digest.startsWith('NEXT_REDIRECT')) {
      return { redirectedTo: err.digest.split(';')[2] as string }
    }
    throw err
  }
}

async function creditBalance(userId: number) {
  const [row] = await db
    .select({ credits: userCredits.credits })
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .limit(1)
  return row?.credits ?? null
}

describe('signUp', () => {
  it('grants a freshly signed-up user a credit balance of exactly 0', async () => {
    await runSignUp({ email: 'newuser@test.com', password: 'password123' })

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'newuser@test.com'))
      .limit(1)

    expect(user).toBeDefined()
    expect(await creditBalance(user.id)).toBe(0)
  })
})
