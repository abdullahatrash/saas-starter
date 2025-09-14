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
import { CREDIT_PACK } from "@/lib/stripe-price-ids";

export default function PricingComponent() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started with our credit pack. Perfect for trying out tattoo designs before committing.
          </p>
        </div>

        <div className="max-w-sm mx-auto">
          <Card className="relative shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Best Value
              </div>
            </div>

            <CardHeader className="text-center pb-8 pt-10">
              <CardTitle className="text-2xl font-bold mb-2">
                {CREDIT_PACK.name}
              </CardTitle>
              <div className="mt-4">
                <span className="text-5xl font-bold">${CREDIT_PACK.price}</span>
                <div className="text-muted-foreground mt-2">
                  {CREDIT_PACK.credits} credits included
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Only $0.50 per preview
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span>{CREDIT_PACK.credits} AI-powered tattoo previews</span>
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
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span>Share previews with clients</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span>Email support included</span>
                </li>
              </ul>
            </CardContent>

            <CardFooter className="pt-6">
              <Button
                asChild
                size="lg"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Link href="/sign-up">
                  Get Started Now
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Secure payment powered by Stripe • No subscription required • Instant access
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}