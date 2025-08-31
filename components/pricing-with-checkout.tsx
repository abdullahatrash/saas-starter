"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check, Sparkles, Clock, Zap } from "lucide-react";
import { STRIPE_PRICE_IDS } from "@/lib/stripe-price-ids";

interface PricingWithCheckoutProps {
  checkoutAction?: (formData: FormData) => Promise<void>;
}

export default function PricingWithCheckout({ checkoutAction }: PricingWithCheckoutProps) {
  const [billingCycle, setBillingCycle] = useState<"yearly" | "monthly" | "credits">(
    "yearly"
  );

  // Credit Packs with actual Stripe price IDs
  const creditPacks = [
    {
      name: "Starter Pack",
      credits: 10,
      price: 4.99,
      priceId: STRIPE_PRICE_IDS.creditPacks.starterPack,
      features: [
        "10 tattoo previews",
        "Never expires",
        "All basic features",
        "Email support",
      ],
      popular: false,
      cta: "Buy Now",
      variant: "outline" as const,
    },
    {
      name: "Professional",
      credits: 25,
      price: 9.99,
      priceId: STRIPE_PRICE_IDS.creditPacks.professional,
      features: [
        "25 tattoo previews",
        "Never expires",
        "Priority processing",
        "All features included",
      ],
      popular: false,
      cta: "Buy Now",
      variant: "outline" as const,
    },
    {
      name: "Studio Pack",
      credits: 60,
      price: 19.99,
      priceId: STRIPE_PRICE_IDS.creditPacks.studioPack,
      features: [
        "60 tattoo previews",
        "Never expires",
        "Priority support",
        "Bulk download",
        "Gallery storage",
      ],
      popular: true,
      cta: "Most Popular",
      variant: "default" as const,
    },
    {
      name: "Enterprise",
      credits: 150,
      price: 39.99,
      priceId: STRIPE_PRICE_IDS.creditPacks.enterprise,
      features: [
        "150 tattoo previews",
        "Never expires",
        "Dedicated support",
        "API access",
        "Advanced features",
      ],
      popular: false,
      cta: "Buy Now",
      variant: "outline" as const,
    },
    {
      name: "Bulk Deal",
      credits: 500,
      price: 99.99,
      priceId: STRIPE_PRICE_IDS.creditPacks.bulkDeal,
      features: [
        "500 tattoo previews",
        "Never expires",
        "White label options",
        "Custom integrations",
        "24/7 priority support",
      ],
      popular: false,
      cta: "Best Value",
      variant: "outline" as const,
    },
  ];

  // Subscription Plans with actual Stripe price IDs
  const plans = [
    {
      name: "Starter",
      monthlyPrice: 19,
      yearlyPrice: 10,
      monthlyPriceId: STRIPE_PRICE_IDS.subscriptions.monthly.starter,
      yearlyPriceId: STRIPE_PRICE_IDS.subscriptions.yearly.starter,
      features: [
        "50 AI tattoo previews/month",
        "Basic tattoo styles",
        "Standard processing",
        "Download your tattoo preview",
      ],
      popular: false,
      cta: "Get Started",
      variant: "outline" as const,
    },
    {
      name: "Pro",
      monthlyPrice: 49,
      yearlyPrice: 29,
      monthlyPriceId: STRIPE_PRICE_IDS.subscriptions.monthly.pro,
      yearlyPriceId: STRIPE_PRICE_IDS.subscriptions.yearly.pro,
      features: [
        "200 AI tattoo previews/month",
        "All tattoo styles",
        "Priority processing",
        "Download your tattoo preview",
        "Remove watermarks",
        "Priority support",
        "Access to new features first",
      ],
      popular: true,
      cta: "Start Free Trial",
      variant: "default" as const,
    },
    {
      name: "Premium",
      monthlyPrice: 99,
      yearlyPrice: 49,
      monthlyPriceId: STRIPE_PRICE_IDS.subscriptions.monthly.premium,
      yearlyPriceId: STRIPE_PRICE_IDS.subscriptions.yearly.premium,
      features: [
        "Unlimited previews",
        "Priority in queue",
        "Instant processing",
        "Save your tattoo preview",
        "Dedicated support",
        "Access to new features first",
      ],
      popular: false,
      cta: "Contact Sales",
      variant: "outline" as const,
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Badge className="bg-red-500 text-white hover:bg-red-600">
              <Clock className="mr-1 h-3 w-3" />
              Limited Offer
            </Badge>
            <Badge variant="secondary">
              <Sparkles className="mr-1 h-3 w-3" />6 Months Free
            </Badge>
          </div>
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Perfect for tattoo enthusiasts and professional artists. Try any
            design on your skin before committing.
          </p>
        </div>

        <Tabs
          value={billingCycle}
          onValueChange={(v) => setBillingCycle(v as "yearly" | "monthly" | "credits")}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="credits">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Credit Packs
              </div>
            </TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">
              <div className="flex items-center gap-2">
                Yearly
                <Badge variant="secondary" className="ml-1 py-0 px-1 text-xs">
                  Save 50%
                </Badge>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="credits">
            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
              {creditPacks.map((pack) => (
                <Card
                  key={pack.name}
                  className={`relative flex flex-col ${
                    pack.popular ? "border-yellow-400 shadow-lg scale-105" : ""
                  }`}
                >
                  {pack.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black hover:bg-yellow-500">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="pb-3">
                    <CardTitle className="font-bold text-lg text-center">
                      {pack.name}
                    </CardTitle>
                    <div className="mt-4 text-center">
                      <span className="text-3xl font-bold">
                        ${pack.price}
                      </span>
                      <div className="text-sm text-muted-foreground mt-1">
                        {pack.credits} credits
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <ul className="space-y-2 text-sm">
                      {pack.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-xs">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="pt-3">
                    {checkoutAction ? (
                      <form action={checkoutAction} className="w-full">
                        <input
                          type="hidden"
                          name="priceId"
                          value={pack.priceId}
                        />
                        <Button
                          type="submit"
                          variant={pack.popular ? "default" : "outline"}
                          className={`w-full ${
                            pack.popular
                              ? "bg-yellow-400 text-black hover:bg-yellow-500"
                              : ""
                          }`}
                        >
                          {pack.cta}
                        </Button>
                      </form>
                    ) : (
                      <Button
                        asChild
                        variant={pack.popular ? "default" : "outline"}
                        className={`w-full ${
                          pack.popular
                            ? "bg-yellow-400 text-black hover:bg-yellow-500"
                            : ""
                        }`}
                      >
                        <Link href="/sign-up">
                          {pack.cta}
                        </Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="monthly">
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <Card
                key={plan.name}
                className={`relative flex flex-col ${
                  plan.popular ? "border-yellow-400 shadow-lg scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black hover:bg-yellow-500">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="font-bold text-xl">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">
                      $
                      {billingCycle === "yearly"
                        ? plan.yearlyPrice
                        : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                    {billingCycle === "yearly" && (
                      <div className="mt-2">
                        <span className="text-sm line-through text-muted-foreground">
                          ${plan.monthlyPrice * 12}
                        </span>
                        <span className="text-sm text-green-600 ml-2">
                          ${plan.yearlyPrice * 12}/year
                        </span>
                      </div>
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
                  {plan.name === "Premium" ? (
                    <Button
                      asChild
                      variant={plan.variant}
                      className="w-full"
                    >
                      <Link href="/contact">
                        {plan.cta}
                      </Link>
                    </Button>
                  ) : checkoutAction ? (
                    <form action={checkoutAction} className="w-full">
                      <input
                        type="hidden"
                        name="priceId"
                        value={billingCycle === "yearly" ? plan.yearlyPriceId : plan.monthlyPriceId}
                      />
                      <Button
                        type="submit"
                        variant={plan.popular ? "default" : "outline"}
                        className={`w-full ${
                          plan.popular
                            ? "bg-yellow-400 text-black hover:bg-yellow-500"
                            : ""
                        }`}
                      >
                        {plan.cta}
                      </Button>
                    </form>
                  ) : (
                    <Button
                      asChild
                      variant={plan.popular ? "default" : "outline"}
                      className={`w-full ${
                        plan.popular
                          ? "bg-yellow-400 text-black hover:bg-yellow-500"
                          : ""
                      }`}
                    >
                      <Link href="/sign-up">
                        {plan.cta}
                      </Link>
                    </Button>
                  )}
                </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="yearly">
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`relative flex flex-col ${
                    plan.popular ? "border-yellow-400 shadow-lg scale-105" : ""
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black hover:bg-yellow-500">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="font-bold text-xl">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">
                        ${plan.yearlyPrice}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                      <div className="mt-2">
                        <span className="text-sm line-through text-muted-foreground">
                          ${plan.monthlyPrice * 12}
                        </span>
                        <span className="text-sm text-green-600 ml-2">
                          ${plan.yearlyPrice * 12}/year
                        </span>
                      </div>
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
                    {plan.name === "Premium" ? (
                      <Button
                        asChild
                        variant={plan.variant}
                        className="w-full"
                      >
                        <Link href="/contact">
                          {plan.cta}
                        </Link>
                      </Button>
                    ) : checkoutAction ? (
                      <form action={checkoutAction} className="w-full">
                        <input
                          type="hidden"
                          name="priceId"
                          value={plan.yearlyPriceId}
                        />
                        <Button
                          type="submit"
                          variant={plan.popular ? "default" : "outline"}
                          className={`w-full ${
                            plan.popular
                              ? "bg-yellow-400 text-black hover:bg-yellow-500"
                              : ""
                          }`}
                        >
                          {plan.cta}
                        </Button>
                      </form>
                    ) : (
                      <Button
                        asChild
                        variant={plan.popular ? "default" : "outline"}
                        className={`w-full ${
                          plan.popular
                            ? "bg-yellow-400 text-black hover:bg-yellow-500"
                            : ""
                        }`}
                      >
                        <Link href="/sign-up">
                          {plan.cta}
                        </Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-16 bg-yellow-50 rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold mb-4">🎉 Special Launch Offer</h3>
          <p className="text-lg mb-4">
            Sign up for yearly and get{" "}
            <span className="font-bold text-yellow-600">
              6 months absolutely free!
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Limited time offer • No credit card required • Cancel anytime
          </p>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include: SSL encryption • GDPR compliance • 99.9% uptime •
            Regular updates
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Questions?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact our team
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}