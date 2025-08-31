'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, TrendingUp, CreditCard, Clock, Package } from 'lucide-react';
import useSWR from 'swr';
import Link from 'next/link';
import { Suspense } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function CreditsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="h-32 animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-16 bg-gray-200 rounded" />
        </CardContent>
      </Card>
    </div>
  );
}

function CreditsOverview() {
  const { data: dashboard } = useSWR('/api/user/dashboard', fetcher);

  if (!dashboard) {
    return <CreditsSkeleton />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Current Credits */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Coins className="h-4 w-4 text-yellow-500" />
            Available Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{dashboard.credits || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Ready to use for tattoo previews
          </p>
        </CardContent>
      </Card>

      {/* Subscription Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4 text-purple-500" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {dashboard.subscription?.planType === 'subscription' 
              ? dashboard.subscription.type 
              : dashboard.subscription?.hasCredits 
                ? 'Pay As You Go' 
                : 'Free'}
          </div>
          {dashboard.subscription?.isActive ? (
            <Badge className="mt-2" variant="default">
              Active Subscription
            </Badge>
          ) : dashboard.subscription?.hasCredits ? (
            <Badge className="mt-2 border-yellow-400 text-yellow-600" variant="outline">
              Credits Available
            </Badge>
          ) : (
            <Badge className="mt-2" variant="secondary">
              No Active Plan
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Get More Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button asChild className="w-full bg-yellow-500 hover:bg-yellow-600">
              <Link href="/pricing">Buy Credits</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/studio">Use Credits</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentHistory() {
  const { data: dashboard } = useSWR('/api/user/dashboard', fetcher);

  if (!dashboard || !dashboard.recentPayments?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No payments yet. Buy credits to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Payments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dashboard.recentPayments.map((payment: any) => (
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
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">${payment.amount}</p>
                {payment.metadata?.credits && (
                  <p className="text-sm text-muted-foreground">
                    +{payment.metadata.credits} credits
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CreditsPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Credits & Billing</h1>
        <p className="text-muted-foreground">
          Manage your credits and view your payment history
        </p>
      </div>

      <div className="space-y-6">
        <Suspense fallback={<CreditsSkeleton />}>
          <CreditsOverview />
        </Suspense>

        <Suspense fallback={<Card className="h-64 animate-pulse" />}>
          <PaymentHistory />
        </Suspense>
      </div>
    </section>
  );
}