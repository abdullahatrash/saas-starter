import Stripe from 'stripe';
import { stripe } from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { grantCreditPackPurchase } from '@/lib/entitlements';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      // The webhook is the single source of truth for credit granting: it runs
      // even if the buyer closes the tab before the success redirect. Granting
      // is idempotent on the session ID, so Stripe replays add nothing twice.
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.metadata?.type === 'credit_pack') {
        const credits = parseInt(session.metadata.credits || '0', 10);
        const userId = parseInt(session.metadata.userId || '0', 10);

        if (credits > 0 && userId > 0) {
          const granted = await grantCreditPackPurchase({
            userId,
            credits,
            stripeSessionId: session.id,
            stripePaymentIntentId: (session.payment_intent as string) ?? null,
            amount: (session.amount_total ?? 0) / 100,
            metadata: { credits, priceId: session.metadata.priceId },
          });

          if (granted) {
            console.log(`Granted ${credits} credits to user ${userId} (session ${session.id})`);
          } else {
            console.log(`Ignored replayed checkout session ${session.id}`);
          }
        }
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
