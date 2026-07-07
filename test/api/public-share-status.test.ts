import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/p/[id]/status/route'
import { db } from '@/lib/db/drizzle'
import { previewResults } from '@/lib/db/schema'
import { createUser, signOut } from '../helpers/auth'
import { createPreviewJob } from '../helpers/fixtures'

function getStatus(id: number | string) {
  const request = new NextRequest(`http://localhost/api/p/${id}/status`)
  return GET(request, { params: Promise.resolve({ id: String(id) }) })
}

describe('GET /api/p/[id]/status', () => {
  it('returns status and imageUrl for a completed job without authentication', async () => {
    const owner = await createUser()
    const job = await createPreviewJob({ userId: owner.id, status: 'succeeded' })
    await db.insert(previewResults).values({
      jobId: job.id,
      imageUrl: 'https://example.com/result.png',
      thumbUrl: 'https://example.com/result-thumb.png',
    })
    signOut()

    const response = await getStatus(job.id)
    const body = await response.json()

    expect(response.status).toBe(200)
    // Exhaustive shape check: exactly these two keys, nothing else. The public
    // endpoint must never leak prompt, user, design, body photo, or credit data.
    expect(Object.keys(body).sort()).toEqual(['imageUrl', 'status'])
    expect(body.status).toBe('succeeded')
    expect(body.imageUrl).toBe('https://example.com/result.png')
  })

  it('returns a null imageUrl while the job is still in flight', async () => {
    const owner = await createUser()
    const job = await createPreviewJob({ userId: owner.id, status: 'running' })
    signOut()

    const response = await getStatus(job.id)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(Object.keys(body).sort()).toEqual(['imageUrl', 'status'])
    expect(body.status).toBe('running')
    expect(body.imageUrl).toBeNull()
  })

  it('reports failed jobs with a null imageUrl', async () => {
    const owner = await createUser()
    const job = await createPreviewJob({ userId: owner.id, status: 'failed' })
    signOut()

    const response = await getStatus(job.id)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ status: 'failed', imageUrl: null })
  })

  it('returns 404 for a job that does not exist', async () => {
    signOut()

    const response = await getStatus(999999)

    expect(response.status).toBe(404)
  })

  it('returns 404 for a non-numeric id', async () => {
    signOut()

    const response = await getStatus('not-a-number')

    expect(response.status).toBe(404)
  })
})
