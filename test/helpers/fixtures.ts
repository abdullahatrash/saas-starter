import { db } from '@/lib/db/drizzle'
import {
  teams,
  studios,
  designs,
  bodyPhotos,
  previewJobs,
} from '@/lib/db/schema'

// Creates a preview job together with the rows its foreign keys require
// (team → studio → design, and a body photo owned by the user).
export async function createPreviewJob(opts: {
  userId: number
  status?: string
  replicatePredictionId?: string | null
}) {
  const [team] = await db.insert(teams).values({ name: 'Test Team' }).returning()
  const [studio] = await db
    .insert(studios)
    .values({ teamId: team.id, name: 'Test Studio' })
    .returning()
  const [bodyPhoto] = await db
    .insert(bodyPhotos)
    .values({ userId: opts.userId, part: 'forearm', imageUrl: 'https://example.com/body.jpg' })
    .returning()
  const [design] = await db
    .insert(designs)
    .values({ studioId: studio.id, title: 'Test Design', imageUrl: 'https://example.com/design.jpg' })
    .returning()
  const [job] = await db
    .insert(previewJobs)
    .values({
      userId: opts.userId,
      bodyPhotoId: bodyPhoto.id,
      designId: design.id,
      status: opts.status ?? 'queued',
      replicatePredictionId: opts.replicatePredictionId ?? null,
      prompt: 'a test tattoo prompt',
      seed: 1,
      variantParams: { variant: 'black_gray', scale: 1, rotationDeg: 0, opacity: 1 },
    })
    .returning()
  return job
}
