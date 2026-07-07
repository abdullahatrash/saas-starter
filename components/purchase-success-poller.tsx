'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

interface PurchaseSuccessPollerProps {
  // Called with the confirmed balance once the webhook has granted, so the
  // surrounding page (the studio) can update its credit display in place.
  onConfirmed?: (credits: number) => void
}

// Rendered after the post-checkout redirect (URL carries ?purchase=success).
// Credits are granted by the Stripe webhook, not this browser round-trip, so we
// poll the user's own dashboard until the payment for this session shows up as
// succeeded, then confirm the new balance. Closing the tab mid-poll loses
// nothing — the webhook has already done the granting.
export function PurchaseSuccessPoller({ onConfirmed }: PurchaseSuccessPollerProps) {
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return

    const params = new URLSearchParams(window.location.search)
    if (params.get('purchase') !== 'success') return
    started.current = true

    const sessionId = params.get('session_id')

    // Strip the purchase flags so a manual refresh doesn't re-trigger polling.
    params.delete('purchase')
    params.delete('session_id')
    const query = params.toString()
    window.history.replaceState(
      null,
      '',
      window.location.pathname + (query ? `?${query}` : '')
    )

    let cancelled = false
    let attempts = 0
    const maxAttempts = 20
    const intervalMs = 2000
    const toastId = toast.loading('Confirming your purchase…')

    const confirmed = (credits: number) => {
      onConfirmed?.(credits)
      toast.success(`Purchase confirmed! You now have ${credits} credits.`, {
        id: toastId,
      })
    }

    async function poll() {
      if (cancelled) return
      attempts += 1

      try {
        const res = await fetch('/api/user/dashboard', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          const credits: number = data.credits ?? 0
          const paid = (data.recentPayments ?? []).some(
            (p: { stripeSessionId?: string | null; status?: string }) =>
              (sessionId ? p.stripeSessionId === sessionId : true) &&
              p.status === 'succeeded'
          )
          if (paid) {
            confirmed(credits)
            return
          }
        }
      } catch {
        // Network hiccup — fall through and retry until we run out of attempts.
      }

      if (attempts >= maxAttempts) {
        toast.info('Payment received. Your credits will appear shortly.', {
          id: toastId,
        })
        return
      }

      window.setTimeout(poll, intervalMs)
    }

    poll()

    return () => {
      cancelled = true
    }
  }, [onConfirmed])

  return null
}
