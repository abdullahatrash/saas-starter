import Stripe from 'stripe';
import { handleSubscriptionChange, stripe } from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { addCredits, updatePaymentStatus } from '@/lib/entitlements';

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
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
      break;
    
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Handle credit pack purchases
      if (session.metadata?.type === 'credit_pack') {
        const credits = parseInt(session.metadata.credits || '0');
        const userId = parseInt(session.metadata.userId || '0');
        
        if (credits > 0 && userId > 0) {
          // Update payment status
          await updatePaymentStatus(session.id, 'succeeded');
          
          // Add credits to user
          await addCredits(userId, credits);
          
          console.log(`Added ${credits} credits to user ${userId}`);
        }
      }
      break;
      
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Handle one-time credit purchases
      if (paymentIntent.metadata?.type === 'credit_pack') {
        const credits = parseInt(paymentIntent.metadata.credits || '0');
        const userId = parseInt(paymentIntent.metadata.userId || '0');
        
        if (credits > 0 && userId > 0) {
          await addCredits(userId, credits);
          console.log(`Added ${credits} credits to user ${userId} via payment intent`);
        }
      }
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
