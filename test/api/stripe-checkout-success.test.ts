import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/stripe/checkout/route'
import { db } from '@/lib/db/drizzle'
import { userCredits, payments } from '@/lib/db/schema'
import { createUser } from '../helpers/auth'

function visitSuccess(sessionId?: string) {
  const url = sessionId
    ? `http://localhost/api/stripe/checkout?session_id=${sessionId}`
    : 'http://localhost/api/stripe/checkout'
  return GET(new NextRequest(url))
}

describe('GET /api/stripe/checkout (success redirect)', () => {
  it('mutates no credits or payments and redirects into the polling state', async () => {
    const user = await createUser()

    const response = await visitSuccess('cs_test_success')

    // A redirect (not an error) that carries the polling flag.
    expect(response.status).toBe(307)
    const location = response.headers.get('location') ?? ''
    expect(location).toContain('/studio')
    expect(location).toContain('purchase=success')

    // The success page is not a granting path.
    expect(await db.select().from(userCredits)).toHaveLength(0)
    expect(await db.select().from(payments)).toHaveLength(0)
  })
})
