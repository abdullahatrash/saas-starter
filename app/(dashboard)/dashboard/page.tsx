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
          Manage your personal account and credits
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
              <p className="text-sm text-muted-foreground">Account Status</p>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                {dashboard?.credits > 0 ? (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">No Credits</Badge>
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
          Credits & Billing
        </CardTitle>
        <CardDescription>
          Manage your credits and view purchase history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <p className="font-medium">
                Credit Balance: {dashboard?.credits || 0} credits
              </p>
              <p className="text-sm text-muted-foreground">
                {dashboard?.credits > 0
                  ? `Ready for ${dashboard.credits} tattoo previews`
                  : 'Purchase credits to get started'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                <Link href="/pricing">
                  <Coins className="mr-2 h-4 w-4" />
                  Buy More Credits
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/credits">
                  View History
                </Link>
              </Button>
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
          Your recent credit purchases
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
    </section>
  );
}