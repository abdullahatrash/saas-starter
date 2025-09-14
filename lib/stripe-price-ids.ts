/**
 * Stripe Price IDs Configuration - Simplified
 * Single credit pack option: $4.99 for 10 credits
 */

// Test mode price ID
const TEST_PRICE_ID = 'price_1S26Ua3FRtYXutpDgJHs2kXU'; // $4.99 - 10 credits
const TEST_PRODUCT_ID = 'prod_Sy2ZTce3mmuqBt';

// Production price ID
const PRODUCTION_PRICE_ID = 'price_1S25HRKKwdMMZS6nnHtl8Jw7'; // $4.99 - 10 credits
const PRODUCTION_PRODUCT_ID = 'prod_Sy2ZTce3mmuqBt';

// Determine Stripe mode based on environment
const stripeMode = process.env.STRIPE_MODE || (process.env.NODE_ENV === 'production' ? 'live' : 'test');
const isTestMode = stripeMode === 'test';

// Export the single price and product ID based on environment
export const STRIPE_PRICE_ID = isTestMode ? TEST_PRICE_ID : PRODUCTION_PRICE_ID;
export const STRIPE_PRODUCT_ID = isTestMode ? TEST_PRODUCT_ID : PRODUCTION_PRODUCT_ID;

// Export the mode for use in other parts of the app
export const STRIPE_MODE = isTestMode ? 'test' : 'live';

// Single credit pack configuration
export const CREDIT_PACK = {
  name: '10 Credits Pack',
  price: 4.99,
  credits: 10,
  priceId: STRIPE_PRICE_ID,
  productId: STRIPE_PRODUCT_ID,
  description: 'Perfect for trying out tattoo designs'
};

// Log configuration in non-production environments
if (process.env.NODE_ENV !== 'production') {
  console.log(`🔧 Stripe configuration:`);
  console.log(`   Mode: ${STRIPE_MODE}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   STRIPE_MODE env: ${process.env.STRIPE_MODE || 'not set (using NODE_ENV)'}`);
}

// Simplified helper - just returns the single price ID
export function getPriceId(): string {
  return STRIPE_PRICE_ID;
}

// Credit amount for the single pack
export const CREDIT_AMOUNT = 10;