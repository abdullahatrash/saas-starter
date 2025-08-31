'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { customerPortalAction } from '@/lib/payments/actions';
import { User } from '@/lib/db/schema';
import useSWR from 'swr';
import { Suspense } from 'react';
import { 
  CreditCard, 
  User as UserIcon, 
  Mail, 
  Calendar,
  Coins,
  Package,
  Clock
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// ============================================
// PERSONAL ACCOUNT COMPONENTS (Active)
// ============================================

function AccountOverviewSkeleton() {
  return (
    <Card className="mb-8 h-[200px]">
      <CardHeader>
        <CardTitle>Account Overview</CardTitle>
      </CardHeader>
    </Card>
  );
}

function AccountOverview() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const { data: dashboard } = useSWR('/api/user/dashboard', fetcher);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Account Overview
        </CardTitle>
        <CardDescription>
          Manage your personal account and subscription
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Account Info */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {user?.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {user?.createdAt && new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Credits & Plan Info */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Available Credits</p>
              <p className="font-medium flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="text-2xl font-bold text-yellow-600">
                  {dashboard?.credits || 0}
                </span>
                <span className="text-sm text-muted-foreground">credits</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                {dashboard?.subscription?.planType === 'subscription' ? (
                  <Badge variant="default" className="bg-purple-500">
                    {dashboard.subscription.type}
                  </Badge>
                ) : dashboard?.subscription?.hasCredits ? (
                  <Badge variant="outline" className="border-green-400 text-green-600">
                    Pay As You Go
                  </Badge>
                ) : (
                  <Badge variant="secondary">Free Plan</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="h-[120px] animate-pulse" />
      ))}
    </div>
  );
}

function QuickStats() {
  const { data: dashboard } = useSWR('/api/user/dashboard', fetcher);

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      {/* Credits Used This Month */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Credits Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboard?.credits || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Available for use
          </p>
        </CardContent>
      </Card>

      {/* Total Spent */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${dashboard?.recentPayments?.reduce((sum: number, p: any) => 
              sum + parseFloat(p.amount), 0).toFixed(2) || '0.00'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            All time
          </p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Last Purchase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {dashboard?.recentPayments?.[0] 
              ? new Date(dashboard.recentPayments[0].createdAt).toLocaleDateString()
              : 'Never'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {dashboard?.recentPayments?.[0]?.metadata?.productName || 'No purchases yet'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function SubscriptionManagement() {
  const { data: dashboard } = useSWR('/api/user/dashboard', fetcher);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Billing & Subscription
        </CardTitle>
        <CardDescription>
          Manage your payment methods and subscription
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <p className="font-medium">
                Current Status: {
                  dashboard?.subscription?.planType === 'subscription' 
                    ? (dashboard?.subscription?.type || 'Free')
                    : dashboard?.subscription?.hasCredits 
                      ? 'Pay As You Go' 
                      : 'Free Account'
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {dashboard?.subscription?.status === 'active'
                  ? 'Auto-renews monthly'
                  : dashboard?.subscription?.status === 'trialing'
                  ? 'In trial period'
                  : dashboard?.credits > 0
                    ? `${dashboard.credits} credits remaining`
                    : 'No active plan'}
              </p>
            </div>
            <div className="flex gap-2">
              {dashboard?.subscription?.isActive ? (
                <form action={customerPortalAction}>
                  <Button type="submit" variant="outline">
                    Manage Billing
                  </Button>
                </form>
              ) : (
                <>
                  <Button asChild variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                    <Link href="/pricing">
                      <Coins className="mr-2 h-4 w-4" />
                      Buy Credits
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/pricing">
                      View Plans
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentActivity() {
  const { data: dashboard } = useSWR('/api/user/dashboard', fetcher);

  if (!dashboard?.recentPayments?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No recent activity. Start by purchasing some credits!
          </p>
          <div className="flex justify-center">
            <Button asChild className="bg-yellow-500 hover:bg-yellow-600">
              <Link href="/pricing">Get Started</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Purchases
        </CardTitle>
        <CardDescription>
          Your recent credit purchases and subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dashboard.recentPayments.slice(0, 3).map((payment: any) => (
            <div
              key={payment.id}
              className="flex items-center justify-between pb-4 last:pb-0 border-b last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <CreditCard className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">
                    {payment.metadata?.productName || payment.purpose.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(payment.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">${payment.amount}</p>
                {payment.metadata?.credits && (
                  <p className="text-sm text-green-600">
                    +{payment.metadata.credits} credits
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/dashboard/credits">View All Transactions</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

// ============================================
// TEAM MANAGEMENT COMPONENTS (Commented Out)
// ============================================

/*
// Original team management components - preserved for future SaaS projects
// These imports would be needed to reactivate this code:
// import { TeamDataWithMembers } from '@/lib/db/schema';
// import { removeTeamMember, inviteTeamMember } from '@/app/(login)/actions';
// import { useActionState } from 'react';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { Input } from '@/components/ui/input';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Label } from '@/components/ui/label';
// import { Loader2, PlusCircle, TrendingUp } from 'lucide-react';
// type ActionState = { error?: string; success?: string; };

function TeamMembersSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4 mt-1">
          <div className="flex items-center space-x-4">
            <div className="size-8 rounded-full bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-3 w-14 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembers() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);
  const [removeState, removeAction, isRemovePending] = useActionState<
    ActionState,
    FormData
  >(removeTeamMember, {});

  const getUserDisplayName = (user: Pick<User, 'id' | 'name' | 'email'>) => {
    return user.name || user.email || 'Unknown User';
  };

  if (!teamData?.teamMembers?.length) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No team members yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {teamData.teamMembers.map((member, index) => (
            <li key={member.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {getUserDisplayName(member.user)
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {getUserDisplayName(member.user)}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {member.role}
                  </p>
                </div>
              </div>
              {index > 1 ? (
                <form action={removeAction}>
                  <input type="hidden" name="memberId" value={member.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={isRemovePending}
                  >
                    {isRemovePending ? 'Removing...' : 'Remove'}
                  </Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
        {removeState?.error && (
          <p className="text-red-500 mt-4">{removeState.error}</p>
        )}
      </CardContent>
    </Card>
  );
}

function InviteTeamMemberSkeleton() {
  return (
    <Card className="h-[260px]">
      <CardHeader>
        <CardTitle>Invite Team Member</CardTitle>
      </CardHeader>
    </Card>
  );
}

function InviteTeamMember() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const isOwner = user?.role === 'owner';
  const [inviteState, inviteAction, isInvitePending] = useActionState<
    ActionState,
    FormData
  >(inviteTeamMember, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Team Member</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={inviteAction} className="space-y-4">
          <div>
            <Label htmlFor="email" className="mb-2">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email"
              required
              disabled={!isOwner}
            />
          </div>
          <div>
            <Label>Role</Label>
            <RadioGroup
              defaultValue="member"
              name="role"
              className="flex space-x-4"
              disabled={!isOwner}
            >
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="member" id="member" />
                <Label htmlFor="member">Member</Label>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="owner" id="owner" />
                <Label htmlFor="owner">Owner</Label>
              </div>
            </RadioGroup>
          </div>
          {inviteState?.error && (
            <p className="text-red-500">{inviteState.error}</p>
          )}
          {inviteState?.success && (
            <p className="text-green-500">{inviteState.success}</p>
          )}
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isInvitePending || !isOwner}
          >
            {isInvitePending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inviting...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Invite Member
              </>
            )}
          </Button>
        </form>
      </CardContent>
      {!isOwner && (
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            You must be a team owner to invite new members.
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
*/

export default function AccountPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">My Account</h1>
      
      {/* Quick Stats */}
      <Suspense fallback={<QuickStatsSkeleton />}>
        <QuickStats />
      </Suspense>

      {/* Account Overview */}
      <Suspense fallback={<AccountOverviewSkeleton />}>
        <AccountOverview />
      </Suspense>

      {/* Subscription Management */}
      <Suspense fallback={<Card className="mb-8 h-[140px] animate-pulse" />}>
        <SubscriptionManagement />
      </Suspense>

      {/* Recent Activity */}
      <Suspense fallback={<Card className="h-[200px] animate-pulse" />}>
        <RecentActivity />
      </Suspense>

      {/* Team Management - Commented out but preserved
      <Suspense fallback={<TeamMembersSkeleton />}>
        <TeamMembers />
      </Suspense>
      <Suspense fallback={<InviteTeamMemberSkeleton />}>
        <InviteTeamMember />
      </Suspense>
      */}
    </section>
  );
}