'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CreditCard, ChevronRight } from "lucide-react"
import { User } from "@/lib/db/schema"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface CTASectionProps {
  variant?: 'primary' | 'secondary'
}

export default function CTASection({ variant = 'primary' }: CTASectionProps) {
  const { data: user } = useSWR<User>("/api/user", fetcher)

  if (variant === 'secondary') {
    return (
      <section
        className="py-20 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black"
        aria-label="Call to action"
      >
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            {user 
              ? "Create Your Next Tattoo Preview"
              : "Ready to See Your Tattoo Before You Commit?"}
          </h2>
          <p className="text-xl mb-8">
            {user
              ? "Continue exploring with our AI-powered tattoo preview studio"
              : "Join 10,000+ happy users and 500+ tattoo artists. Risk-free with 3 free previews."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={user ? "/studio" : "/sign-up"}>
              <Button
                size="lg"
                className="bg-black text-yellow-400 hover:bg-gray-900 min-w-[200px]"
              >
                {user ? "Go to Studio" : "Try It Free Now"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="min-w-[200px] bg-transparent text-black border-black hover:bg-black hover:text-yellow-400"
              >
                View Pricing
                <CreditCard className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  // Primary variant (first CTA after before/after comparison)
  return (
    <section
      className="py-20 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black"
      aria-label="Call to action"
    >
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold mb-4">
          {user 
            ? "Ready to Visualize Your Next Tattoo?"
            : "Ready to See Your Tattoo Before You Commit?"}
        </h2>
        <p className="text-xl mb-8">
          {user
            ? "Use our AI-powered studio to preview any tattoo design on your body"
            : "Join 10,000+ happy users and 500+ tattoo artists. Risk-free with 3 free previews."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={user ? "/studio" : "/sign-up"}>
            <Button
              size="lg"
              className="bg-black text-yellow-400 hover:bg-gray-900 min-w-[200px]"
            >
              {user ? "Open Studio" : "Try It Free Now"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button
              size="lg"
              variant="outline"
              className="min-w-[200px] bg-transparent text-black border-black hover:bg-black hover:text-yellow-400"
            >
              View Pricing
              <CreditCard className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}