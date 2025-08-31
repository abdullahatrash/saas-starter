/**
 * Stripe Price IDs Configuration
 * Last updated: 2025-08-31
 * 
 * TEST MODE Price IDs - Created via Stripe CLI
 * Use these IDs when in test mode (API keys start with sk_test_ and pk_test_)
 */

export const STRIPE_PRICE_IDS = {
  // Credit Packs (One-time payments)
  creditPacks: {
    starterPack: 'price_1S26Ua3FRtYXutpDgJHs2kXU',      // $4.99 - 10 credits
    professional: 'price_1S26Uc3FRtYXutpDJubGrwiC',     // $9.99 - 25 credits
    studioPack: 'price_1S26Uf3FRtYXutpDahYKv1q0',       // $19.99 - 60 credits
    enterprise: 'price_1S26Uh3FRtYXutpD7Y6Rxd6J',       // $39.99 - 150 credits
    bulkDeal: 'price_1S26Uj3FRtYXutpDB9igEcYL',         // $99.99 - 500 credits
  },

  // Subscription Plans - Monthly
  subscriptions: {
    monthly: {
      starter: 'price_1S26VH3FRtYXutpD9DXgOBH3',        // $19/month - 50 credits
      pro: 'price_1S26VJ3FRtYXutpDolUnVNhx',            // $49/month - 200 credits
      premium: 'price_1S26VM3FRtYXutpD6AH80AFs',        // $99/month - Unlimited
    },
    yearly: {
      starter: 'price_1S26VI3FRtYXutpDofFJ5Ot6',        // $120/year ($10/month) - 50 credits
      pro: 'price_1S26VL3FRtYXutpDL9cTBysN',            // $348/year ($29/month) - 200 credits
      premium: 'price_1S26VN3FRtYXutpDUwzKT4Zx',        // $588/year ($49/month) - Unlimited
    }
  }
};

// Product IDs (for reference)
export const STRIPE_PRODUCT_IDS = {
  creditPacks: {
    starterPack: 'prod_Sy2ZTce3mmuqBt',
    professional: 'prod_Sy2ZwirnBqaiNz',
    studioPack: 'prod_Sy2ZVVVrabSBoN',
    enterprise: 'prod_Sy2Z1zcaDjwDn6',
    bulkDeal: 'prod_Sy2ZCRDIqNEn8y',
  },
  subscriptions: {
    starter: 'prod_Sy2ZPGZL2tmkib',
    pro: 'prod_Sy2ZdgxW2sOw5m',
    premium: 'prod_Sy2ZPKZqCjbSfR',
  }
};

// Helper function to get price ID based on selection
export function getPriceId(
  type: 'credit' | 'subscription',
  product: string,
  interval?: 'monthly' | 'yearly'
): string | undefined {
  if (type === 'credit') {
    return STRIPE_PRICE_IDS.creditPacks[product as keyof typeof STRIPE_PRICE_IDS.creditPacks];
  } else if (type === 'subscription' && interval) {
    return STRIPE_PRICE_IDS.subscriptions[interval][product as keyof typeof STRIPE_PRICE_IDS.subscriptions.monthly];
  }
  return undefined;
}

// Credit amounts for each product (for adding to user account after purchase)
export const CREDIT_AMOUNTS = {
  starterPack: 10,
  professional: 25,
  studioPack: 60,
  enterprise: 150,
  bulkDeal: 500,
  // Subscriptions (monthly allowance)
  starter: 50,
  pro: 200,
  premium: -1, // -1 means unlimited
};