import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { Team } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { creditsForPriceId } from '@/lib/stripe-price-ids';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil'
});

export async function createCheckoutSession({
  team,
  priceId
}: {
  team: Team | null;
  priceId: string;
}) {
  // An empty price ID means a stale or malformed checkout link (e.g. a client
  // bundle that could not resolve server-only env vars) — send the buyer to
  // pricing instead of a Stripe 500.
  if (!priceId) {
    redirect('/pricing');
  }

  const user = await getUser();

  if (!team || !user) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  // One-time credit-pack purchases only. The metadata here is the contract the
  // webhook reads to grant credits: type identifies the purchase, and credits is
  // the amount to grant (derived from the pack config so it can never drift from
  // the price the buyer actually paid).
  const credits = creditsForPriceId(priceId);

  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer: team.stripeCustomerId || undefined,
    client_reference_id: user.id.toString(),
    allow_promotion_codes: true,
    metadata: {
      type: 'credit_pack',
      userId: user.id.toString(),
      teamId: team.id.toString(),
      priceId: priceId,
      credits: String(credits ?? '')
    }
  };

  const session = await stripe.checkout.sessions.create(sessionConfig);

  redirect(session.url!);
}
