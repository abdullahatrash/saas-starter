import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { getUserCredits } from '@/lib/entitlements';
import { db } from '@/lib/db/drizzle';
import { payments, previewJobs } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user credits
    const credits = await getUserCredits(user.id);

    // Get total credits used (count of completed preview jobs)
    const totalUsedResult = await db
      .select({
        total: sql<number>`COUNT(*)`.mapWith(Number)
      })
      .from(previewJobs)
      .where(eq(previewJobs.userId, user.id));

    const totalCreditsUsed = totalUsedResult[0]?.total || 0;

    // Get recent payments (last 5)
    const recentPayments = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        purpose: payments.purpose,
        status: payments.status,
        createdAt: payments.createdAt,
        metadata: payments.metadata,
      })
      .from(payments)
      .where(eq(payments.userId, user.id))
      .orderBy(desc(payments.createdAt))
      .limit(5);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      credits: credits,
      totalCreditsUsed: totalCreditsUsed,
      recentPayments: recentPayments,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}