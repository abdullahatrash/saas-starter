import { db } from '@/lib/db/drizzle'
import { users } from '@/lib/db/schema'
import { signToken } from '@/lib/auth/session'
import { __setCookie, __clearCookies } from '../mocks/next-headers'

let counter = 0

export async function createUser(overrides: Partial<{ email: string; name: string }> = {}) {
  counter += 1
  const [user] = await db
    .insert(users)
    .values({
      email: overrides.email ?? `user${counter}-${Date.now()}@test.com`,
      name: overrides.name ?? `Test User ${counter}`,
      passwordHash: 'not-a-real-hash',
    })
    .returning()
  return user
}

// Signs a real session JWT with the test AUTH_SECRET and installs it as the
// session cookie, so getUser() authenticates through the production code path.
export async function authenticateAs(userId: number) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  const token = await signToken({ user: { id: userId }, expires })
  __setCookie('session', token)
}

export function signOut() {
  __clearCookies()
}
