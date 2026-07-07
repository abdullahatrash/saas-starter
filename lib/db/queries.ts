import { desc, and, eq, isNull, count, inArray } from 'drizzle-orm';
import { db } from './drizzle';
import {
  activityLogs,
  teamMembers,
  teams,
  users,
  previewJobs,
  previewResults,
  bodyPhotos
} from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team || null;
}

export const PREVIEW_GALLERY_PAGE_SIZE = 12;

export type GalleryJob = {
  id: number;
  status: string;
  createdAt: Date;
  bodyPart: string | null;
  variant: string | null;
  result: { imageUrl: string; thumbUrl: string | null } | null;
};

export type PreviewGalleryPage = {
  jobs: GalleryJob[];
  totalCount: number;
  page: number;
  pageSize: number;
};

// Lists the signed-in user's preview jobs, newest first, one page at a time.
// Owner-only by construction: the user id comes from the verified session,
// never from the caller.
export async function getPreviewJobsForUser(
  page = 1,
  pageSize = PREVIEW_GALLERY_PAGE_SIZE
): Promise<PreviewGalleryPage> {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const safePage = Math.max(1, Math.floor(page) || 1);

  const [{ value: totalCount }] = await db
    .select({ value: count() })
    .from(previewJobs)
    .where(eq(previewJobs.userId, user.id));

  const jobs = await db
    .select({
      id: previewJobs.id,
      status: previewJobs.status,
      createdAt: previewJobs.createdAt,
      variantParams: previewJobs.variantParams,
      bodyPart: bodyPhotos.part
    })
    .from(previewJobs)
    .leftJoin(bodyPhotos, eq(previewJobs.bodyPhotoId, bodyPhotos.id))
    .where(eq(previewJobs.userId, user.id))
    // id breaks ties for jobs created in the same millisecond.
    .orderBy(desc(previewJobs.createdAt), desc(previewJobs.id))
    .limit(pageSize)
    .offset((safePage - 1) * pageSize);

  // Fetch results for the page's jobs and keep the latest one per job.
  const jobIds = jobs.map((j) => j.id);
  const latestResultByJob = new Map<
    number,
    { imageUrl: string; thumbUrl: string | null }
  >();
  if (jobIds.length > 0) {
    const results = await db
      .select({
        jobId: previewResults.jobId,
        imageUrl: previewResults.imageUrl,
        thumbUrl: previewResults.thumbUrl,
        createdAt: previewResults.createdAt,
        id: previewResults.id
      })
      .from(previewResults)
      .where(inArray(previewResults.jobId, jobIds))
      .orderBy(desc(previewResults.createdAt), desc(previewResults.id));
    for (const r of results) {
      if (!latestResultByJob.has(r.jobId)) {
        latestResultByJob.set(r.jobId, {
          imageUrl: r.imageUrl,
          thumbUrl: r.thumbUrl
        });
      }
    }
  }

  return {
    jobs: jobs.map((j) => ({
      id: j.id,
      status: j.status,
      createdAt: j.createdAt,
      bodyPart: j.bodyPart,
      variant:
        (j.variantParams as { variant?: string } | null)?.variant ?? null,
      result: latestResultByJob.get(j.id) ?? null
    })),
    totalCount,
    page: safePage,
    pageSize
  };
}
