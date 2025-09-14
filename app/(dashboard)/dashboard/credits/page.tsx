'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, ShoppingCart, CreditCard, Clock, Sparkles } from 'lucide-react';
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

  const creditsUsed = dashboard.totalCreditsUsed || 0;
  const currentCredits = dashboard.credits || 0;

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
          <div className="text-3xl font-bold">{currentCredits}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Ready to use for tattoo previews
          </p>
        </CardContent>
      </Card>

      {/* Credits Used */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            Total Used
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{creditsUsed}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Tattoo previews generated
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-green-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              <Link href="/pricing">
                Buy More Credits
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/studio">Create Preview</Link>
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
          <div className="text-center py-8">
            <div className="mb-4">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto" />
            </div>
            <p className="text-muted-foreground mb-4">No payments yet</p>
            <Button asChild>
              <Link href="/pricing">Get Your First Credits</Link>
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
                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Credit Pack</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">${payment.amount || '4.99'}</p>
                <p className="text-sm text-green-600 font-medium">
                  +10 credits
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CreditInfo() {
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          How Credits Work
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <Badge className="mt-0.5">1</Badge>
          <div>
            <p className="font-medium">One Credit = One Preview</p>
            <p className="text-sm text-muted-foreground">
              Each tattoo preview generation uses 1 credit
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Badge className="mt-0.5">2</Badge>
          <div>
            <p className="font-medium">Credits Never Expire</p>
            <p className="text-sm text-muted-foreground">
              Buy once, use anytime - no rush!
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Badge className="mt-0.5">3</Badge>
          <div>
            <p className="font-medium">Simple Pricing</p>
            <p className="text-sm text-muted-foreground">
              Just $4.99 for 10 credits - only $0.50 per preview
            </p>
          </div>
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

        <div className="grid gap-6 lg:grid-cols-2">
          <Suspense fallback={<Card className="h-64 animate-pulse" />}>
            <PaymentHistory />
          </Suspense>

          <CreditInfo />
        </div>
      </div>
    </section>
  );
}