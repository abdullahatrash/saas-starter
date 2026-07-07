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
import { track } from '@vercel/analytics'
import { CREDIT_PACKS } from '@/lib/stripe-price-ids'
import { checkoutAction } from '@/lib/payments/actions'

interface PurchaseCreditsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Opened at the moment of highest intent: the user clicked Generate with zero
// credits. Both packs are rendered from the config module; submitting a pack's
// form hands off to the Stripe checkout action.
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

        <div className="grid gap-3">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.id}
              className={`rounded-xl border p-4 ${pack.featured ? 'border-purple-400 ring-1 ring-purple-200' : ''}`}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">{pack.name}</span>
                <span className="text-2xl font-bold">${pack.price}</span>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-green-500" />
                  {pack.credits} AI-powered tattoo previews
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-green-500" />
                  Credits never expire
                </li>
              </ul>
              <form
                action={checkoutAction}
                onSubmit={() => track('checkout_started', { pack: pack.id })}
                className="mt-4 w-full"
              >
                <input type="hidden" name="packId" value={pack.id} />
                <Button
                  type="submit"
                  size="lg"
                  variant={pack.featured ? 'default' : 'outline'}
                  className={`w-full ${pack.featured ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600' : ''}`}
                >
                  Buy {pack.credits} credits
                </Button>
              </form>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
