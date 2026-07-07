'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Check, Sparkles } from 'lucide-react'
import { CREDIT_PACK } from '@/lib/stripe-price-ids'
import { checkoutAction } from '@/lib/payments/actions'

interface PurchaseCreditsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Opened at the moment of highest intent: the user clicked Generate with zero
// credits. Submitting the form hands off to the existing Stripe checkout action.
// Issue #4 replaces this single pack with two packs (Entry / Standard) driven by
// the pricing config — extend the pack list rendered here rather than the wiring.
export function PurchaseCreditsDialog({ open, onOpenChange }: PurchaseCreditsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            You're out of credits
          </DialogTitle>
          <DialogDescription>
            Grab a credit pack to generate your preview. Credits never expire.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">{CREDIT_PACK.name}</span>
            <span className="text-2xl font-bold">${CREDIT_PACK.price}</span>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-green-500" />
              {CREDIT_PACK.credits} AI-powered tattoo previews
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-green-500" />
              Credits never expire
            </li>
          </ul>
        </div>

        <form action={checkoutAction} className="w-full">
          <input type="hidden" name="priceId" value={CREDIT_PACK.priceId} />
          <Button
            type="submit"
            size="lg"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
          >
            Buy credits
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
