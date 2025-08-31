import PricingComponent from '@/components/pricing';

// This is the public pricing page that doesn't require authentication
export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <PricingComponent />
    </main>
  );
}