/**
 * Credit-pack configuration — the single source of truth for the two one-time
 * packs offered at launch. Price IDs come from the environment (never hardcoded)
 * so test and live Stripe products can differ per deployment; credits-per-pack
 * lives here keyed by price ID and is what the webhook grants.
 */

// Determine Stripe mode the same way the rest of the app does.
const stripeMode = process.env.STRIPE_MODE || (process.env.NODE_ENV === 'production' ? 'live' : 'test');
const isTestMode = stripeMode === 'test';

export const STRIPE_MODE = isTestMode ? 'test' : 'live';

// Resolve a price ID from the environment, preferring a mode-suffixed variable
// (e.g. STRIPE_PRICE_ENTRY_TEST / STRIPE_PRICE_ENTRY_LIVE) and falling back to
// the un-suffixed base. Returns '' when unset so a missing live ID surfaces at
// checkout rather than silently using a test price.
function resolvePriceId(base: string): string {
  const suffix = isTestMode ? 'TEST' : 'LIVE';
  return process.env[`${base}_${suffix}`] ?? process.env[base] ?? '';
}

export interface CreditPack {
  id: 'entry' | 'standard';
  name: string;
  price: number;
  credits: number;
  priceId: string;
  description: string;
  featured?: boolean;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: 'entry',
    name: 'Entry Pack',
    price: 2.99,
    credits: 5,
    priceId: resolvePriceId('STRIPE_PRICE_ENTRY'),
    description: 'A low-risk way to try your first previews.',
  },
  {
    id: 'standard',
    name: 'Standard Pack',
    price: 6.99,
    credits: 20,
    priceId: resolvePriceId('STRIPE_PRICE_STANDARD'),
    description: 'Best value — the most previews per dollar.',
    featured: true,
  },
];

export function packForPriceId(priceId: string): CreditPack | undefined {
  return CREDIT_PACKS.find((pack) => pack.priceId === priceId);
}

// Credits granted for a given price ID, or null when the ID is not a known pack.
export function creditsForPriceId(priceId: string): number | null {
  return packForPriceId(priceId)?.credits ?? null;
}
