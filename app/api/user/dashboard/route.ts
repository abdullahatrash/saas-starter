import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { getUserCredits } from '@/lib/entitlements';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers, payments } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user credits
    const credits = await getUserCredits(user.id);

    // Get user's team and subscription info
    const userTeam = await db
      .select({
        teamId: teamMembers.teamId,
        teamName: teams.name,
        planName: teams.planName,
        subscriptionStatus: teams.subscriptionStatus,
        stripeCustomerId: teams.stripeCustomerId,
        stripeSubscriptionId: teams.stripeSubscriptionId,
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teams.id, teamMembers.teamId))
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

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

    // Determine subscription type and credit status
    let subscriptionType = 'Free';
    let isSubscribed = false;
    let planType = 'free'; // free, credits_only, subscription
    
    // Check if user has active subscription
    if (userTeam[0]?.subscriptionStatus === 'active' || userTeam[0]?.subscriptionStatus === 'trialing') {
      subscriptionType = userTeam[0].planName || 'Free';
      isSubscribed = true;
      planType = 'subscription';
    } else if (credits > 0) {
      // User has credits but no subscription
      planType = 'credits_only';
      subscriptionType = 'Credits Only';
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      credits: credits,
      subscription: {
        type: subscriptionType,
        status: userTeam[0]?.subscriptionStatus || 'none',
        isActive: isSubscribed,
        planType: planType,
        teamName: userTeam[0]?.teamName || null,
        hasCredits: credits > 0,
      },
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