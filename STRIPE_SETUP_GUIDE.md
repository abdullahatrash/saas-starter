# Stripe Dashboard Setup Guide for TattooAI

## Overview
This guide will walk you through setting up Stripe products and prices to match your pricing system. Your application already has the integration code ready - you just need to configure the products in Stripe.

---

## Prerequisites

1. **Stripe Account**: Sign up at https://stripe.com
2. **API Keys**: Get your keys from Stripe Dashboard → Developers → API keys
   - `STRIPE_SECRET_KEY` (starts with `sk_test_` for test mode)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_` for test mode)
3. **Webhook Secret**: Will be created when setting up webhooks

---

## Step 1: Environment Variables Setup

Add these to your `.env.local` file:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Your domain
BASE_URL=http://localhost:3000  # or https://tattoostry.com in production
```

---

## Step 2: Create Products (CLI or Dashboard)

### Option A: Create Products with Stripe CLI (Faster!)

You can create all products quickly using Stripe CLI commands. Run these commands in your terminal:

#### Create Credit Pack Products (One-time payments)

```bash
# 1. Starter Pack - $4.99
stripe products create \
  --name="Starter Pack" \
  --description="10 tattoo preview credits" \
  --metadata[credits]=10 \
  --metadata[type]=credit_pack

stripe prices create \
  --product="{{PRODUCT_ID_FROM_ABOVE}}" \
  --unit-amount=499 \
  --currency=usd

# 2. Professional Pack - $9.99
stripe products create \
  --name="Professional Pack" \
  --description="25 tattoo preview credits" \
  --metadata[credits]=25 \
  --metadata[type]=credit_pack

stripe prices create \
  --product="{{PRODUCT_ID_FROM_ABOVE}}" \
  --unit-amount=999 \
  --currency=usd

# 3. Studio Pack - $19.99 (Most Popular)
stripe products create \
  --name="Studio Pack" \
  --description="60 tattoo preview credits - Most Popular!" \
  --metadata[credits]=60 \
  --metadata[type]=credit_pack \
  --metadata[popular]=true

stripe prices create \
  --product="{{PRODUCT_ID_FROM_ABOVE}}" \
  --unit-amount=1999 \
  --currency=usd

# 4. Enterprise Pack - $39.99
stripe products create \
  --name="Enterprise Pack" \
  --description="150 tattoo preview credits" \
  --metadata[credits]=150 \
  --metadata[type]=credit_pack

stripe prices create \
  --product="{{PRODUCT_ID_FROM_ABOVE}}" \
  --unit-amount=3999 \
  --currency=usd

# 5. Bulk Deal - $99.99
stripe products create \
  --name="Bulk Deal" \
  --description="500 tattoo preview credits - Best Value!" \
  --metadata[credits]=500 \
  --metadata[type]=credit_pack

stripe prices create \
  --product="{{PRODUCT_ID_FROM_ABOVE}}" \
  --unit-amount=9999 \
  --currency=usd
```

#### Create Subscription Products

```bash
# 1. Starter Subscription
stripe products create \
  --name="Starter" \
  --description="50 AI tattoo previews per month" \
  --metadata[monthly_credits]=50 \
  --metadata[type]=subscription

# Create monthly price - $19/month
stripe prices create \
  --product="{{PRODUCT_ID_FROM_ABOVE}}" \
  --unit-amount=1900 \
  --currency=usd \
  --recurring[interval]=month

# Create yearly price - $120/year ($10/month)
stripe prices create \
  --product="{{SAME_PRODUCT_ID}}" \
  --unit-amount=12000 \
  --currency=usd \
  --recurring[interval]=year

# 2. Pro Subscription (Most Popular)
stripe products create \
  --name="Pro" \
  --description="200 AI tattoo previews per month" \
  --metadata[monthly_credits]=200 \
  --metadata[type]=subscription \
  --metadata[popular]=true

# Create monthly price - $49/month
stripe prices create \
  --product="{{PRODUCT_ID_FROM_ABOVE}}" \
  --unit-amount=4900 \
  --currency=usd \
  --recurring[interval]=month

# Create yearly price - $348/year ($29/month)
stripe prices create \
  --product="{{SAME_PRODUCT_ID}}" \
  --unit-amount=34800 \
  --currency=usd \
  --recurring[interval]=year

# 3. Premium Subscription
stripe products create \
  --name="Premium" \
  --description="Unlimited tattoo previews" \
  --metadata[monthly_credits]=unlimited \
  --metadata[type]=subscription

# Create monthly price - $99/month
stripe prices create \
  --product="{{PRODUCT_ID_FROM_ABOVE}}" \
  --unit-amount=9900 \
  --currency=usd \
  --recurring[interval]=month

# Create yearly price - $588/year ($49/month)
stripe prices create \
  --product="{{SAME_PRODUCT_ID}}" \
  --unit-amount=58800 \
  --currency=usd \
  --recurring[interval]=year
```

#### Automated Script (All Products at Once)

Create a file `create-stripe-products.sh` and run it:

```bash
#!/bin/bash

echo "Creating Stripe products in TEST mode..."

# Credit Packs
echo "Creating Starter Pack..."
STARTER_PACK=$(stripe products create \
  --name="Starter Pack" \
  --description="10 tattoo preview credits" \
  --metadata[credits]=10 \
  --metadata[type]=credit_pack \
  -d | grep '"id"' | head -1 | cut -d'"' -f4)

stripe prices create \
  --product="$STARTER_PACK" \
  --unit-amount=499 \
  --currency=usd

echo "Creating Professional Pack..."
PROFESSIONAL=$(stripe products create \
  --name="Professional Pack" \
  --description="25 tattoo preview credits" \
  --metadata[credits]=25 \
  --metadata[type]=credit_pack \
  -d | grep '"id"' | head -1 | cut -d'"' -f4)

stripe prices create \
  --product="$PROFESSIONAL" \
  --unit-amount=999 \
  --currency=usd

echo "Creating Studio Pack..."
STUDIO=$(stripe products create \
  --name="Studio Pack" \
  --description="60 tattoo preview credits - Most Popular!" \
  --metadata[credits]=60 \
  --metadata[type]=credit_pack \
  --metadata[popular]=true \
  -d | grep '"id"' | head -1 | cut -d'"' -f4)

stripe prices create \
  --product="$STUDIO" \
  --unit-amount=1999 \
  --currency=usd

echo "Creating Enterprise Pack..."
ENTERPRISE=$(stripe products create \
  --name="Enterprise Pack" \
  --description="150 tattoo preview credits" \
  --metadata[credits]=150 \
  --metadata[type]=credit_pack \
  -d | grep '"id"' | head -1 | cut -d'"' -f4)

stripe prices create \
  --product="$ENTERPRISE" \
  --unit-amount=3999 \
  --currency=usd

echo "Creating Bulk Deal..."
BULK=$(stripe products create \
  --name="Bulk Deal" \
  --description="500 tattoo preview credits - Best Value!" \
  --metadata[credits]=500 \
  --metadata[type]=credit_pack \
  -d | grep '"id"' | head -1 | cut -d'"' -f4)

stripe prices create \
  --product="$BULK" \
  --unit-amount=9999 \
  --currency=usd

# Subscriptions
echo "Creating Starter Subscription..."
SUB_STARTER=$(stripe products create \
  --name="Starter" \
  --description="50 AI tattoo previews per month" \
  --metadata[monthly_credits]=50 \
  --metadata[type]=subscription \
  -d | grep '"id"' | head -1 | cut -d'"' -f4)

stripe prices create \
  --product="$SUB_STARTER" \
  --unit-amount=1900 \
  --currency=usd \
  --recurring[interval]=month

stripe prices create \
  --product="$SUB_STARTER" \
  --unit-amount=12000 \
  --currency=usd \
  --recurring[interval]=year

echo "Creating Pro Subscription..."
SUB_PRO=$(stripe products create \
  --name="Pro" \
  --description="200 AI tattoo previews per month" \
  --metadata[monthly_credits]=200 \
  --metadata[type]=subscription \
  --metadata[popular]=true \
  -d | grep '"id"' | head -1 | cut -d'"' -f4)

stripe prices create \
  --product="$SUB_PRO" \
  --unit-amount=4900 \
  --currency=usd \
  --recurring[interval]=month

stripe prices create \
  --product="$SUB_PRO" \
  --unit-amount=34800 \
  --currency=usd \
  --recurring[interval]=year

echo "Creating Premium Subscription..."
SUB_PREMIUM=$(stripe products create \
  --name="Premium" \
  --description="Unlimited tattoo previews" \
  --metadata[monthly_credits]=unlimited \
  --metadata[type]=subscription \
  -d | grep '"id"' | head -1 | cut -d'"' -f4)

stripe prices create \
  --product="$SUB_PREMIUM" \
  --unit-amount=9900 \
  --currency=usd \
  --recurring[interval]=month

stripe prices create \
  --product="$SUB_PREMIUM" \
  --unit-amount=58800 \
  --currency=usd \
  --recurring[interval]=year

echo "✅ All products created! Check your Stripe Dashboard for price IDs."
echo "Run 'stripe prices list --limit=20' to see all price IDs"
```

Make the script executable and run it:
```bash
chmod +x create-stripe-products.sh
./create-stripe-products.sh
```

### Option B: Create Products in Stripe Dashboard (Manual)

Navigate to: Stripe Dashboard → Products → Add Product

You need to create **TWO TYPES** of products:

### A. Credit Pack Products (One-time payments)

Create 5 products for credit packs:

#### 1. **Starter Pack**
- **Name**: Starter Pack
- **Description**: 10 tattoo preview credits
- **Pricing**: 
  - Type: **One-time**
  - Amount: **$4.99**
  - Currency: USD
- **Product ID**: Note this down for later
- **Metadata** (optional):
  ```
  credits: 10
  type: credit_pack
  ```

#### 2. **Professional Pack**
- **Name**: Professional Pack
- **Description**: 25 tattoo preview credits
- **Pricing**: 
  - Type: **One-time**
  - Amount: **$9.99**
  - Currency: USD
- **Metadata**:
  ```
  credits: 25
  type: credit_pack
  ```

#### 3. **Studio Pack** ⭐ (Mark as featured)
- **Name**: Studio Pack
- **Description**: 60 tattoo preview credits - Most Popular!
- **Pricing**: 
  - Type: **One-time**
  - Amount: **$19.99**
  - Currency: USD
- **Metadata**:
  ```
  credits: 60
  type: credit_pack
  popular: true
  ```

#### 4. **Enterprise Pack**
- **Name**: Enterprise Pack
- **Description**: 150 tattoo preview credits
- **Pricing**: 
  - Type: **One-time**
  - Amount: **$39.99**
  - Currency: USD
- **Metadata**:
  ```
  credits: 150
  type: credit_pack
  ```

#### 5. **Bulk Deal**
- **Name**: Bulk Deal
- **Description**: 500 tattoo preview credits - Best Value!
- **Pricing**: 
  - Type: **One-time**
  - Amount: **$99.99**
  - Currency: USD
- **Metadata**:
  ```
  credits: 500
  type: credit_pack
  ```

### B. Subscription Products (Recurring payments)

Create 3 subscription products:

#### 1. **Starter Subscription**
- **Name**: Starter
- **Description**: 50 AI tattoo previews per month
- **Pricing**: 
  - Type: **Recurring**
  - Monthly: **$19.00/month**
  - Yearly: **$120.00/year** ($10/month)
  - Trial Period: **7 days free**
- **Metadata**:
  ```
  monthly_credits: 50
  type: subscription
  ```

#### 2. **Pro Subscription** ⭐ (Most Popular)
- **Name**: Pro
- **Description**: 200 AI tattoo previews per month
- **Pricing**: 
  - Type: **Recurring**
  - Monthly: **$49.00/month**
  - Yearly: **$348.00/year** ($29/month)
  - Trial Period: **14 days free**
- **Metadata**:
  ```
  monthly_credits: 200
  type: subscription
  popular: true
  ```

#### 3. **Premium Subscription**
- **Name**: Premium
- **Description**: Unlimited tattoo previews
- **Pricing**: 
  - Type: **Recurring**
  - Monthly: **$99.00/month**
  - Yearly: **$588.00/year** ($49/month)
  - Trial Period: **14 days free**
- **Metadata**:
  ```
  monthly_credits: unlimited
  type: subscription
  ```

---

## Step 3: Get Price IDs

### Option A: Get Price IDs with CLI

After creating products with CLI, get all your price IDs:

```bash
# List all prices with their product names
stripe prices list --limit=20

# Get prices in a more readable format
stripe prices list --limit=20 | grep -E '"id"|"nickname"|"unit_amount"'

# Save all price IDs to a file
stripe prices list --limit=20 > stripe-prices.json
```

### Option B: Get Price IDs from Dashboard

1. Go to **Stripe Dashboard → Products**
2. Click on each product
3. Find the **Pricing** section
4. Copy the **Price ID** (starts with `price_`)

Example format:
```
price_1XXXXXXXXXXXXXXXXXX
```

---

## Step 4: Update Your Application Code

### Update `/components/pricing-with-checkout.tsx`

Replace the placeholder price IDs with your actual Stripe price IDs:

```typescript
const creditPacks = [
  {
    name: "Starter Pack",
    priceId: "price_XXXXXX", // Replace with actual Stripe price ID
    // ... rest of config
  },
  // ... other packs
];

const plans = [
  {
    name: "Starter",
    monthlyPriceId: "price_XXXXXX", // Monthly price ID
    yearlyPriceId: "price_YYYYYY",  // Yearly price ID
    // ... rest of config
  },
  // ... other plans
];
```

---

## Step 5: Set Up Webhooks

### Navigate to: Stripe Dashboard → Developers → Webhooks

1. Click **"Add endpoint"**
2. **Endpoint URL**: 
   - Local testing: Use Stripe CLI (see below)
   - Production: `https://tattoostry.com/api/stripe/webhook`
3. **Events to listen for**:
   - `checkout.session.completed` ✅
   - `customer.subscription.created` ✅
   - `customer.subscription.updated` ✅
   - `customer.subscription.deleted` ✅
   - `invoice.payment_succeeded` ✅
   - `invoice.payment_failed` ✅
4. Click **"Add endpoint"**
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

---

## Step 6: Local Testing with Stripe CLI

### Install Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from https://stripe.com/docs/stripe-cli
```

### Login and forward webhooks
```bash
# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret displayed and add to .env.local
```

---

## Step 7: Test the Integration

### Test Credit Pack Purchase:
1. Go to `/pricing`
2. Click "Credit Packs" tab
3. Select any pack and click "Buy Now"
4. Use test card: `4242 4242 4242 4242`
5. Any future expiry date, any CVC

### Test Subscription:
1. Go to `/pricing`
2. Click "Monthly" or "Yearly" tab
3. Select a plan
4. Use test card: `4242 4242 4242 4242`

### Verify Webhook is Working:
Check your terminal running `stripe listen` - you should see:
```
✅ checkout.session.completed
✅ customer.subscription.created
```

---

## Step 8: Update Webhook Handler

Your webhook handler (`/app/api/stripe/webhook/route.ts`) should handle:

1. **Credit Pack Purchase** (`checkout.session.completed`):
   ```typescript
   // When mode === 'payment' (one-time)
   // Extract credits from metadata
   // Add credits to user account
   ```

2. **Subscription Created** (`customer.subscription.created`):
   ```typescript
   // When mode === 'subscription'
   // Update user's subscription status
   // Grant monthly credits
   ```

---

## Step 9: Production Deployment

### Before going live:

1. **Switch to Live Mode** in Stripe Dashboard
2. **Update API Keys** in production environment:
   ```bash
   STRIPE_SECRET_KEY=sk_live_XXXXX
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXX
   ```
3. **Create Live Products** (repeat Step 2 in live mode)
4. **Update Webhook Endpoint** to production URL
5. **Test with real payment** (small amount)

---

## Step 10: Monitor & Maintain

### Regular Tasks:
- Check **Stripe Dashboard → Payments** for transactions
- Monitor **Stripe Dashboard → Webhooks** for failures
- Review **Stripe Dashboard → Customers** for subscriptions
- Check **Stripe Dashboard → Billing → Invoices**

### Useful Stripe Features:
- **Coupons**: Create discount codes at Stripe Dashboard → Coupons
- **Tax**: Configure tax settings at Stripe Dashboard → Tax
- **Receipts**: Automatic email receipts at Settings → Emails
- **Fraud Prevention**: Configure at Settings → Radar

---

## Troubleshooting

### Common Issues:

1. **"No such price" error**
   - Verify price IDs are correct
   - Check if using test/live mode correctly

2. **Webhook not receiving events**
   - Check webhook secret is correct
   - Verify endpoint URL
   - Check Stripe CLI is running (for local)

3. **Credits not added after purchase**
   - Check webhook handler logic
   - Verify metadata is being passed
   - Check database connection

4. **Subscription not updating**
   - Verify customer ID mapping
   - Check subscription status handling
   - Review webhook logs

---

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **Test Cards**: https://stripe.com/docs/testing
- **API Reference**: https://stripe.com/docs/api

---

## Quick Checklist

- [ ] Created Stripe account
- [ ] Added API keys to `.env.local`
- [ ] Created 5 credit pack products
- [ ] Created 3 subscription products
- [ ] Copied all price IDs
- [ ] Updated price IDs in code
- [ ] Set up webhooks
- [ ] Tested with test cards
- [ ] Webhook events working
- [ ] Credits being added correctly
- [ ] Ready for production

---

## Notes for Your Implementation

Based on your current code structure:

1. **Credit System**: You already have `getUserCredits()` and `addCredits()` in `/lib/entitlements.ts`
2. **Webhook Handler**: Update `/app/api/stripe/webhook/route.ts` to call `addCredits()` when payment succeeds
3. **Checkout Flow**: Your `/lib/payments/stripe.ts` already handles checkout session creation
4. **Success Redirect**: After payment, users go to `/api/stripe/checkout` then redirect to `/studio`

Remember to handle both:
- **One-time purchases** (credit packs) → Add credits immediately
- **Subscriptions** (monthly/yearly) → Add credits monthly, track subscription status


  2. Test the Checkout Flow

  1. Go to http://localhost:3000/pricing
  2. Click on any pricing option (try "Studio Pack" in Credit Packs - it's marked
  as Most Popular)
  3. You'll be redirected to Stripe Checkout page
  4. Use test card details:
    - Card: 4242 4242 4242 4242
    - Expiry: Any future date (like 12/25)
    - CVC: Any 3 digits (like 123)
    - Email: Any test email
    - Name: Any name

  3. Complete Purchase

  After clicking "Pay", you should:
  - See success page
  - Check the terminal running stripe listen - you should see webhook events like:
  checkout.session.completed
  payment_intent.succeeded

  4. Verify Credits Were Added

  Check if credits were added to your account (depending on your webhook handler
  implementation).

  Try it now and let me know if you encounter any issues!
