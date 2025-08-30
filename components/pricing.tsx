'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Sparkles, TrendingUp, Zap } from 'lucide-react'

export default function Pricing() {
    const [billingCycle, setBillingCycle] = useState<'credits' | 'monthly'>('credits')

    const creditPacks = [
        {
            name: 'Starter',
            price: 4.99,
            credits: 10,
            perCredit: 0.49,
            features: [
                '10 preview credits',
                '$0.49 per preview',
                'Never expires',
                'All features included',
                'Email support'
            ],
            popular: false,
            cta: 'Get Started',
            variant: 'outline' as const
        },
        {
            name: 'Studio Pack',
            price: 19.99,
            credits: 60,
            perCredit: 0.33,
            savings: 33,
            features: [
                '60 preview credits',
                '$0.33 per preview',
                'Save 33% vs Starter',
                'Priority support',
                'Gallery storage',
                'Bulk download'
            ],
            popular: true,
            cta: 'Get Studio Pack',
            variant: 'default' as const
        },
        {
            name: 'Bulk Deal',
            price: 99.99,
            credits: 500,
            perCredit: 0.20,
            savings: 60,
            features: [
                '500 preview credits',
                '$0.20 per preview',
                'Save 60% vs Starter',
                'Dedicated support',
                'API access',
                'Custom branding',
                'Team collaboration'
            ],
            popular: false,
            cta: 'Get Bulk Deal',
            variant: 'outline' as const
        }
    ]

    const subscriptions = [
        {
            name: 'Artist Basic',
            price: 9.99,
            period: 'month',
            features: [
                '30 previews/month',
                'Gallery storage',
                'Email support',
                'Share links',
                'Basic analytics'
            ],
            popular: false,
            cta: 'Start Free Trial',
            variant: 'outline' as const
        },
        {
            name: 'Artist Pro',
            price: 24.99,
            period: 'month',
            features: [
                '100 previews/month',
                'Priority processing',
                'Custom branding',
                'Advanced analytics',
                'Team member (2)',
                'API access'
            ],
            popular: true,
            cta: 'Start Free Trial',
            variant: 'default' as const
        },
        {
            name: 'Studio Unlimited',
            price: 99.99,
            period: 'month',
            features: [
                'Unlimited previews',
                'Unlimited team members',
                'White-label options',
                'Priority support 24/7',
                'Custom integrations',
                'SLA guarantee',
                'Training included'
            ],
            popular: false,
            cta: 'Contact Sales',
            variant: 'outline' as const
        }
    ]

    return (
        <section className="py-20 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                    <Badge className="mb-4" variant="secondary">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        80% Profit Margin
                    </Badge>
                    <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Choose credit packs for flexibility or monthly plans for better value. 
                        Each preview costs us $0.04, priced for your success.
                    </p>
                </div>

                <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'credits' | 'monthly')} className="w-full">
                    <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                        <TabsTrigger value="credits">
                            <Zap className="mr-2 h-4 w-4" />
                            Credit Packs
                        </TabsTrigger>
                        <TabsTrigger value="monthly">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Monthly Plans
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="credits">
                        <div className="grid gap-6 md:grid-cols-3">
                            {creditPacks.map((plan) => (
                                <Card key={plan.name} className={`relative flex flex-col ${plan.popular ? 'border-purple-600 shadow-lg' : ''}`}>
                                    {plan.popular && (
                                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">
                                            Most Popular
                                        </Badge>
                                    )}
                                    <CardHeader>
                                        <CardTitle className="font-bold text-xl">{plan.name}</CardTitle>
                                        <div className="mt-4">
                                            <span className="text-3xl font-bold">${plan.price}</span>
                                            <CardDescription className="mt-2">
                                                {plan.credits} credits • ${plan.perCredit}/preview
                                            </CardDescription>
                                            {plan.savings && (
                                                <Badge variant="secondary" className="mt-2">
                                                    Save {plan.savings}%
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-1">
                                        <ul className="space-y-3 text-sm">
                                            {plan.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>

                                    <CardFooter>
                                        <Button
                                            asChild
                                            variant={plan.variant}
                                            className="w-full">
                                            <Link href="/sign-up">{plan.cta}</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="monthly">
                        <div className="grid gap-6 md:grid-cols-3">
                            {subscriptions.map((plan) => (
                                <Card key={plan.name} className={`relative flex flex-col ${plan.popular ? 'border-purple-600 shadow-lg' : ''}`}>
                                    {plan.popular && (
                                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">
                                            Best Value
                                        </Badge>
                                    )}
                                    <CardHeader>
                                        <CardTitle className="font-bold text-xl">{plan.name}</CardTitle>
                                        <div className="mt-4">
                                            <span className="text-3xl font-bold">${plan.price}</span>
                                            <span className="text-muted-foreground">/{plan.period}</span>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-1">
                                        <ul className="space-y-3 text-sm">
                                            {plan.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>

                                    <CardFooter>
                                        <Button
                                            asChild
                                            variant={plan.variant}
                                            className="w-full">
                                            <Link href={plan.name === 'Studio Unlimited' ? '/contact' : '/sign-up'}>
                                                {plan.cta}
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="mt-12 text-center">
                    <p className="text-sm text-muted-foreground">
                        All plans include: SSL encryption • GDPR compliance • 99.9% uptime • Regular updates
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Questions about pricing? <Link href="/contact" className="text-primary hover:underline">Contact our sales team</Link>
                    </p>
                </div>
            </div>
        </section>
    )
}
