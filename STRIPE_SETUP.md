# Stripe Test Mode Setup Guide

## Overview
The application supports both Stripe test and production modes with clear environment-based configuration.

## How It Works

### Mode Detection (Best Practice)
The app determines Stripe mode using this priority:

1. **Explicit `STRIPE_MODE` variable** (recommended):
   - Set `STRIPE_MODE=test` for test mode
   - Set `STRIPE_MODE=live` for production mode

2. **Fallback to `NODE_ENV`** (if STRIPE_MODE not set):
   - `NODE_ENV=development` → test mode
   - `NODE_ENV=production` → live mode

This approach ensures:
- Clear, explicit configuration
- No accidental production charges in development
- Easy testing in any environment
- Vercel deployments work correctly

## Setting Up Test Mode

### 1. Get Your Test Keys from Stripe
1. Log into [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle to **Test mode** (switch in top-right)
3. Go to **Developers** → **API keys**
4. Copy your test keys:
   - Secret key: `sk_test_...`
   - Publishable key: `pk_test_...`

### 2. Create Test Products and Prices
In Stripe Test mode dashboard:

1. Go to **Products** → **Add product**
2. Create these test products with matching prices:

#### Credit Packs (One-time payments)
- **Starter Pack**: $4.99 - 10 credits
- **Professional**: $9.99 - 25 credits
- **Studio Pack**: $19.99 - 60 credits
- **Enterprise**: $39.99 - 150 credits
- **Bulk Deal**: $99.99 - 500 credits

#### Subscriptions
Monthly:
- **Starter**: $19/month - 50 credits
- **Pro**: $49/month - 200 credits
- **Premium**: $99/month - Unlimited

Yearly:
- **Starter**: $120/year - 50 credits
- **Pro**: $348/year - 200 credits
- **Premium**: $588/year - Unlimited

### 3. Update Your Price IDs
After creating products in Stripe test mode:

1. Copy each price ID from Stripe dashboard
2. Update the `TEST_PRICE_IDS` in `/lib/stripe-price-ids.ts`:

```typescript
const TEST_PRICE_IDS = {
  creditPacks: {
    starterPack: 'price_1ABC...', // Your actual test price ID
    // ... etc
  }
}
```

### 4. Configure Environment Variables

#### For Local Development (.env.local):
```bash
# Explicitly set to test mode
STRIPE_MODE=test

# Test mode keys
STRIPE_SECRET_KEY=sk_test_51ABC...
STRIPE_WEBHOOK_SECRET=whsec_test_ABC...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC...
```

#### For Vercel Production:
In Vercel Dashboard → Settings → Environment Variables:
```bash
# Explicitly set to live mode (or omit, as NODE_ENV=production)
STRIPE_MODE=live

# Production keys
STRIPE_SECRET_KEY=sk_live_51ABC...
STRIPE_WEBHOOK_SECRET=whsec_live_ABC...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51ABC...
```

#### For Vercel Preview/Development:
You can also set test keys for Vercel preview deployments:
```bash
STRIPE_MODE=test
STRIPE_SECRET_KEY=sk_test_51ABC...
# ... rest of test keys
```

### 5. Set Up Webhook for Testing
For local development:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret and add to .env
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Testing Payments

### Test Card Numbers
Use these test cards in test mode:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Auth**: 4000 0025 0000 3155

Use any future expiry date and any 3-digit CVC.

### Testing Workflow
1. Ensure you're using test keys in `.env`
2. Run the app: `pnpm dev`
3. The console will show: "🔧 Stripe running in test mode"
4. Make test purchases with test cards
5. View test payments in Stripe Dashboard (test mode)

## Switching to Production

### 1. Update Environment Variables in Vercel
In Vercel Dashboard → Settings → Environment Variables:

```bash
# Set mode explicitly (or rely on NODE_ENV=production)
STRIPE_MODE=live

# Production keys
STRIPE_SECRET_KEY=sk_live_51ABC...
STRIPE_WEBHOOK_SECRET=whsec_live_ABC...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51ABC...
```

### 2. Verify Production Price IDs
Ensure `PRODUCTION_PRICE_IDS` in `/lib/stripe-price-ids.ts` match your live Stripe products.

### 3. Deploy
Deploy to production with live environment variables.

## Troubleshooting

### Mode Detection Issues
Check the mode with:
```javascript
import { STRIPE_MODE } from '@/lib/stripe-price-ids';
console.log('Stripe mode:', STRIPE_MODE);
```

### Price ID Validation
Use the validation helper:
```javascript
import { validatePriceIds } from '@/lib/stripe-price-ids';
if (!validatePriceIds()) {
  console.error('Price ID configuration error');
}
```

### Common Issues
- **Wrong mode**: Check if `STRIPE_SECRET_KEY` prefix matches expected mode
- **Price not found**: Ensure price IDs exist in the correct mode (test vs live)
- **Webhook failures**: Verify webhook secret matches the mode

## Best Practices

1. **Never commit real keys**: Keep `.env` in `.gitignore`
2. **Use test mode for development**: Always develop with test keys
3. **Separate environments**: Use different Stripe accounts for staging/production
4. **Test thoroughly**: Complete full payment flows in test mode before going live
5. **Monitor mode**: Add logging to verify correct mode in each environment