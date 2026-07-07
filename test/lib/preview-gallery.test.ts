import { describe, it, expect } from 'vitest'
import { db } from '@/lib/db/drizzle'
import { previewResults } from '@/lib/db/schema'
import { getPreviewJobsForUser } from '@/lib/db/queries'
import { createUser, authenticateAs, signOut } from '../helpers/auth'
import { createPreviewJob } from '../helpers/fixtures'

describe('getPreviewJobsForUser', () => {
  it('rejects an anonymous caller', async () => {
    signOut()

    await expect(getPreviewJobsForUser()).rejects.toThrow('User not authenticated')
  })

  it("lists only the signed-in user's jobs, newest first", async () => {
    const owner = await createUser()
    const stranger = await createUser()

    const first = await createPreviewJob({ userId: owner.id, status: 'succeeded' })
    await createPreviewJob({ userId: stranger.id, status: 'succeeded' })
    const second = await createPreviewJob({ userId: owner.id, status: 'failed' })
    await createPreviewJob({ userId: stranger.id, status: 'queued' })
    const third = await createPreviewJob({ userId: owner.id, status: 'running' })

    await authenticateAs(owner.id)
    const { jobs, totalCount } = await getPreviewJobsForUser()

    expect(totalCount).toBe(3)
    expect(jobs.map((j) => j.id)).toEqual([third.id, second.id, first.id])
    expect(jobs.map((j) => j.status)).toEqual(['running', 'failed', 'succeeded'])
  })

  it('paginates with a fixed page size, newest first across pages', async () => {
    const owner = await createUser()
    const created = []
    for (let i = 0; i < 15; i++) {
      created.push(await createPreviewJob({ userId: owner.id, status: 'succeeded' }))
    }
    const newestFirst = created.map((j) => j.id).reverse()

    await authenticateAs(owner.id)
    const page1 = await getPreviewJobsForUser(1, 12)
    const page2 = await getPreviewJobsForUser(2, 12)

    expect(page1.totalCount).toBe(15)
    expect(page1.jobs).toHaveLength(12)
    expect(page2.jobs).toHaveLength(3)
    expect([...page1.jobs, ...page2.jobs].map((j) => j.id)).toEqual(newestFirst)
  })

  it('includes body part, style metadata, and the latest result image for succeeded jobs', async () => {
    const owner = await createUser()
    const job = await createPreviewJob({ userId: owner.id, status: 'succeeded' })
    await db.insert(previewResults).values({
      jobId: job.id,
      imageUrl: 'https://example.com/result-old.jpg',
      thumbUrl: 'https://example.com/thumb-old.jpg',
    })
    await db.insert(previewResults).values({
      jobId: job.id,
      imageUrl: 'https://example.com/result-new.jpg',
      thumbUrl: 'https://example.com/thumb-new.jpg',
    })

    await authenticateAs(owner.id)
    const { jobs } = await getPreviewJobsForUser()

    expect(jobs).toHaveLength(1)
    expect(jobs[0].bodyPart).toBe('forearm')
    expect(jobs[0].variant).toBe('black_gray')
    expect(jobs[0].createdAt).toBeInstanceOf(Date)
    expect(jobs[0].result).toMatchObject({
      imageUrl: 'https://example.com/result-new.jpg',
      thumbUrl: 'https://example.com/thumb-new.jpg',
    })
  })

  it('returns no result image for jobs without results', async () => {
    const owner = await createUser()
    await createPreviewJob({ userId: owner.id, status: 'queued' })

    await authenticateAs(owner.id)
    const { jobs } = await getPreviewJobsForUser()

    expect(jobs[0].result).toBeNull()
  })
})
