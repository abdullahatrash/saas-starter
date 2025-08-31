/**
 * Stripe Price IDs Configuration
 * Last updated: 2025-08-31
 * 
 * LIVE MODE Price IDs - Created via Stripe Dashboard
 * Use these IDs when in live mode (API keys start with sk_live_ and pk_live_)
 */

export const STRIPE_PRICE_IDS = {
  // Credit Packs (One-time payments)
  creditPacks: {
    starterPack: 'price_1S25HRKKwdMMZS6nnHtl8Jw7',      // $4.99 - 10 credits
    professional: 'price_1S25IYKKwdMMZS6nOX8SFwRM',     // $9.99 - 25 credits
    studioPack: 'price_1S25J6KKwdMMZS6nxSAiPiM0',       // $19.99 - 60 credits
    enterprise: 'price_1S25JmKKwdMMZS6n30tUtnEI',       // $39.99 - 150 credits
    bulkDeal: 'price_1S25L9KKwdMMZS6nQZJNvsTG',         // $99.99 - 500 credits
  },

  // Subscription Plans - Monthly
  subscriptions: {
    monthly: {
      starter: 'price_1S25ORKKwdMMZS6ntoEQGsDp',        // $19/month - 50 credits
      pro: 'price_1S25QaKKwdMMZS6nKMF8Z94W',            // $49/month - 200 credits
      premium: 'price_1S25RSKKwdMMZS6nouvOOZzg',        // $99/month - Unlimited
    },
    yearly: {
      starter: 'price_1S29yfKKwdMMZS6nMMSIatIQ',        // $120/year ($10/month) - 50 credits
      pro: 'price_1S29zSKKwdMMZS6n53fhoC4Q',            // $348/year ($29/month) - 200 credits
      premium: 'price_1S2A07KKwdMMZS6niHjjK0ev',        // $588/year ($49/month) - Unlimited
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