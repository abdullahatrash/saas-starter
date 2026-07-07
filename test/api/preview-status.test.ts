import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/preview/[id]/route'
import { createUser, authenticateAs, signOut } from '../helpers/auth'
import { createPreviewJob } from '../helpers/fixtures'

function getJob(id: number | string) {
  const request = new NextRequest(`http://localhost/api/preview/${id}`)
  return GET(request, { params: Promise.resolve({ id: String(id) }) })
}

describe('GET /api/preview/[id]', () => {
  it('rejects an anonymous request with 401', async () => {
    const owner = await createUser()
    const job = await createPreviewJob({ userId: owner.id, status: 'succeeded' })
    signOut()

    const response = await getJob(job.id)

    expect(response.status).toBe(401)
  })

  it('lets the owner read their own preview job status', async () => {
    const owner = await createUser()
    const job = await createPreviewJob({ userId: owner.id, status: 'succeeded' })
    await authenticateAs(owner.id)

    const response = await getJob(job.id)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.job.id).toBe(job.id)
    expect(body.job.status).toBe('succeeded')
  })

  it("rejects another user's request for a job they do not own with 404", async () => {
    const owner = await createUser()
    const stranger = await createUser()
    const job = await createPreviewJob({ userId: owner.id, status: 'succeeded' })
    await authenticateAs(stranger.id)

    const response = await getJob(job.id)

    expect(response.status).toBe(404)
  })

  it('returns 404 for a job that does not exist', async () => {
    const user = await createUser()
    await authenticateAs(user.id)

    const response = await getJob(999999)

    expect(response.status).toBe(404)
  })

  it('reports creditRefunded:false for a job that has not been refunded', async () => {
    const owner = await createUser()
    const job = await createPreviewJob({ userId: owner.id, status: 'succeeded' })
    await authenticateAs(owner.id)

    const response = await getJob(job.id)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.creditRefunded).toBe(false)
  })

  it('reports creditRefunded:true when reconnecting to a job whose credit was already refunded', async () => {
    // Models the reconnect case: the webhook observed the failure and refunded
    // while the user was away. The job is terminal, so the route does not
    // re-check the prediction — the refund state must come from the persisted
    // marker so the returning client can still tell the user their credit is back.
    const owner = await createUser()
    const job = await createPreviewJob({
      userId: owner.id,
      status: 'failed',
      creditRefundedAt: new Date(),
    })
    await authenticateAs(owner.id)

    const response = await getJob(job.id)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.job.status).toBe('failed')
    expect(body.creditRefunded).toBe(true)
  })
})
