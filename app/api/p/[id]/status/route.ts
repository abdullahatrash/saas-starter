import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { previewJobs, previewResults } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const runtime = 'nodejs'

// Public status endpoint for the share page (/p/[id]). Intentionally
// anonymous: share pages are a public surface. It exposes ONLY what the
// share page already shows — job status and the result image URL. It must
// never return prompt, user, design, body photo, or credit information.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const jobId = parseInt(id)

  if (isNaN(jobId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const [job] = await db
    .select({ status: previewJobs.status })
    .from(previewJobs)
    .where(eq(previewJobs.id, jobId))
    .limit(1)

  if (!job) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const [result] = await db
    .select({ imageUrl: previewResults.imageUrl })
    .from(previewResults)
    .where(eq(previewResults.jobId, jobId))
    .orderBy(previewResults.createdAt)
    .limit(1)

  return NextResponse.json({
    status: job.status,
    imageUrl: result?.imageUrl ?? null,
  })
}
