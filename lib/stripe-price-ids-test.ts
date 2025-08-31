/**
 * TEST MODE Stripe Price IDs
 * 
 * IMPORTANT: These are placeholder test price IDs.
 * You need to create products in Stripe Dashboard in TEST MODE
 * and replace these with your actual test price IDs.
 * 
 * The price IDs in stripe-price-ids.ts are for LIVE mode.
 */

export const STRIPE_TEST_PRICE_IDS = {
  // These are example test price IDs - replace with your actual test mode price IDs
  creditPacks: {
    starterPack: 'price_test_starter',      // Create in test mode: $4.99 - 10 credits
    professional: 'price_test_professional', // Create in test mode: $9.99 - 25 credits
    studioPack: 'price_test_studio',        // Create in test mode: $19.99 - 60 credits
    enterprise: 'price_test_enterprise',    // Create in test mode: $39.99 - 150 credits
    bulkDeal: 'price_test_bulk',           // Create in test mode: $99.99 - 500 credits
  },

  subscriptions: {
    monthly: {
      starter: 'price_test_monthly_starter',  // Create in test mode: $19/month
      pro: 'price_test_monthly_pro',          // Create in test mode: $49/month
      premium: 'price_test_monthly_premium',  // Create in test mode: $99/month
    },
    yearly: {
      starter: 'price_test_yearly_starter',   // Create in test mode: $120/year
      pro: 'price_test_yearly_pro',           // Create in test mode: $348/year
      premium: 'price_test_yearly_premium',   // Create in test mode: $588/year
    }
  }
};

// For testing without creating products, use Stripe's test price
// This is a real test price that always works:
export const STRIPE_TEST_PRICE = 'price_1MFHVMCD4MPSRNRg7muSRIzQ'; // Stripe's demo price ($20)