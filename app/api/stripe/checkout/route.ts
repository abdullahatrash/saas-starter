import { NextRequest, NextResponse } from 'next/server';

// Post-checkout success redirect. Credit granting is owned entirely by the
// Stripe webhook (checkout.session.completed), so this endpoint writes nothing:
// it just drops the buyer into the studio's purchase-success state, which polls
// the balance until the webhook has granted. This is what makes closing the tab
// after paying safe — the money is never tied to this browser round-trip.
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  const redirectUrl = new URL('/studio', request.url);
  redirectUrl.searchParams.set('purchase', 'success');
  if (sessionId) {
    redirectUrl.searchParams.set('session_id', sessionId);
  }

  return NextResponse.redirect(redirectUrl);
}
