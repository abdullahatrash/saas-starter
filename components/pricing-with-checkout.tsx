"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";
import { CREDIT_PACKS } from "@/lib/stripe-price-ids";

interface PricingWithCheckoutProps {
  checkoutAction?: (formData: FormData) => Promise<void>;
}

export default function PricingWithCheckout({ checkoutAction }: PricingWithCheckoutProps) {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Buy credits once — no subscription. Each credit generates one preview.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto items-start">
          {CREDIT_PACKS.map((pack) => {
            const perPreview = (pack.price / pack.credits).toFixed(2);
            return (
              <Card
                key={pack.id}
                className={`relative shadow-lg ${pack.featured ? "border-purple-400 shadow-purple-100" : ""}`}
              >
                {pack.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Best Value
                    </div>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-10">
                  <CardTitle className="text-2xl font-bold mb-2">{pack.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">${pack.price}</span>
                    <div className="text-muted-foreground mt-2">
                      {pack.credits} credits included
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      ${perPreview} per preview
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <span>{pack.credits} AI-powered tattoo previews</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <span>Credits never expire</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <span>High-resolution downloads</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <span>All tattoo styles available</span>
                    </li>
                  </ul>
                </CardContent>

                <CardFooter className="pt-6">
                  {checkoutAction ? (
                    <form action={checkoutAction} className="w-full">
                      <input type="hidden" name="priceId" value={pack.priceId} />
                      <Button
                        type="submit"
                        size="lg"
                        variant={pack.featured ? "default" : "outline"}
                        className={`w-full ${pack.featured ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white" : ""}`}
                      >
                        Get {pack.credits} credits
                      </Button>
                    </form>
                  ) : (
                    <Button
                      asChild
                      size="lg"
                      variant={pack.featured ? "default" : "outline"}
                      className={`w-full ${pack.featured ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white" : ""}`}
                    >
                      <Link href="/sign-up">Get Started Now</Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Secure payment powered by Stripe • No subscription required • Instant access
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
