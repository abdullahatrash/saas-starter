import PricingComponent from '@/components/pricing';
import PricingWithCheckout from '@/components/pricing-with-checkout';
import { checkoutAction } from '@/lib/payments/actions';
import { getUser } from '@/lib/db/queries';

// This pricing page handles both authenticated and unauthenticated users
export default async function PricingPage() {
  const user = await getUser();
  
  return (
    <main className="min-h-screen bg-white">
      {user ? (
        // If user is logged in, show pricing with Stripe checkout
        <PricingWithCheckout checkoutAction={checkoutAction} />
      ) : (
        // If not logged in, show regular pricing that redirects to sign-up
        <PricingComponent />
      )}
    </main>
  );
}