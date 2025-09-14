import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers, payments } from '@/lib/db/schema';
import { setSession } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { addCredits } from '@/lib/entitlements';
import { CREDIT_PACK } from '@/lib/stripe-price-ids';
import Stripe from 'stripe';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.redirect(new URL('/pricing', request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription', 'line_items.data.price.product'],
    });

    const userId = session.client_reference_id;
    if (!userId) {
      throw new Error("No user ID found in session's client_reference_id.");
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(userId)))
      .limit(1);

    if (user.length === 0) {
      throw new Error('User not found in database.');
    }

    // Handle based on payment mode
    if (session.mode === 'payment') {
      // One-time payment (credit pack)
      console.log('Processing one-time payment for credit pack');
      
      // Get the price and product info
      const lineItem = session.line_items?.data[0];
      if (!lineItem) {
        throw new Error('No line items found in session');
      }

      const price = lineItem.price;
      if (!price) {
        throw new Error('No price found in line item');
      }

      // Extract product info
      const product = price.product as Stripe.Product;

      // Since we only have one credit pack now, always add 10 credits
      const creditsToAdd = CREDIT_PACK.credits;

      if (creditsToAdd > 0) {
        // Add credits to user account
        await addCredits(Number(userId), creditsToAdd);
        console.log(`Added ${creditsToAdd} credits to user ${userId}`);

        // Track payment in database
        await db.insert(payments).values({
          userId: Number(userId),
          teamId: null,
          stripeSessionId: sessionId,
          stripePaymentIntentId: session.payment_intent as string,
          amount: String((price.unit_amount || 0) / 100), // Convert cents to dollars
          purpose: 'credit_pack',
          status: 'completed',
          metadata: {
            productName: product.name,
            credits: creditsToAdd,
            priceId: price.id,
          },
        });
      }

      // Update team with customer ID if provided
      if (session.customer) {
        const customerId = typeof session.customer === 'string' 
          ? session.customer 
          : session.customer.id;

        const userTeam = await db
          .select({
            teamId: teamMembers.teamId,
          })
          .from(teamMembers)
          .where(eq(teamMembers.userId, user[0].id))
          .limit(1);

        if (userTeam.length > 0) {
          await db
            .update(teams)
            .set({
              stripeCustomerId: customerId,
              updatedAt: new Date(),
            })
            .where(eq(teams.id, userTeam[0].teamId));
        }
      }

      // Redirect to studio after credit purchase with success message
      await setSession(user[0]);
      const redirectUrl = new URL('/studio', request.url);
      redirectUrl.searchParams.set('success', 'true');
      redirectUrl.searchParams.set('credits', String(creditsToAdd));
      return NextResponse.redirect(redirectUrl);
      
    } else if (session.mode === 'subscription') {
      // We don't support subscriptions anymore, redirect to pricing
      console.log('Subscription mode not supported, redirecting to pricing');
      return NextResponse.redirect(new URL('/pricing', request.url));
    } else {
      throw new Error(`Unsupported checkout mode: ${session.mode}`);
    }
  } catch (error) {
    console.error('Error handling successful checkout:', error);
    return NextResponse.redirect(new URL('/pricing', request.url));
  }
}