'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession } from './stripe';
import { withTeam } from '@/lib/auth/middleware';
import { CREDIT_PACKS } from '@/lib/stripe-price-ids';

// The client submits a pack id ('entry' | 'standard'), never a Stripe price
// ID: price IDs are resolved from server-only env vars, so any priceId a
// client component rendered would be an empty string in the browser bundle.
export const checkoutAction = withTeam(async (formData, team) => {
  const packId = formData.get('packId');
  const pack = CREDIT_PACKS.find((p) => p.id === packId);

  if (!pack || !pack.priceId) {
    redirect('/pricing');
  }

  await createCheckoutSession({ team: team, priceId: pack.priceId });
});
