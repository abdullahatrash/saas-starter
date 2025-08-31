# Stripe Go Live Checklist

## ✅ Completed
- [x] Updated `/lib/stripe-price-ids.ts` with live price IDs

## 📋 Steps to Complete

### 1. Update Local Environment Variables (.env.local)
Replace your test keys with live keys from Stripe Dashboard:

```bash
# OLD (Test mode)
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# NEW (Live mode) - Get from https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

### 2. Set Up Production Webhook in Stripe Dashboard

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter your production URL:
   ```
   https://tattoostry.com/api/stripe/webhook
   ```
   Or if using a different domain:
   ```
   https://YOUR_DOMAIN.com/api/stripe/webhook
   ```
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Save the endpoint
6. Copy the **Signing secret** (starts with `whsec_`)
7. Update your `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx_live_xxxxx
   ```

### 3. Update Production Environment Variables (Vercel)

Go to your [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

Update these variables for **Production** environment:

```bash
# Stripe Live Keys
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx_live_xxxxx

# Your production domain
BASE_URL=https://tattoostry.com
```

### 4. Deploy to Production

```bash
# If using Vercel CLI
vercel --prod

# Or push to main branch if using Git integration
git add .
git commit -m "Switch to Stripe live mode"
git push origin main
```

### 5. Test Live Mode

⚠️ **IMPORTANT**: These will be REAL charges!

1. **Small Test Purchase** ($4.99 Starter Pack):
   - Go to https://tattoostry.com/pricing
   - Select "Starter Pack" 
   - Complete purchase with a real card
   - Verify credits are added

2. **Verify Webhook**:
   - Check Stripe Dashboard → Webhooks → Your endpoint
   - Look for successful webhook deliveries
   - Check logs for any failures

3. **Test Subscription** (Optional - can cancel immediately):
   - Purchase the cheapest subscription
   - Verify subscription is created
   - Test cancellation in customer portal

### 6. Monitor & Verify

After going live, monitor these areas:

1. **Stripe Dashboard**:
   - [Payments](https://dashboard.stripe.com/payments) - Check incoming payments
   - [Webhooks](https://dashboard.stripe.com/webhooks) - Monitor webhook health
   - [Customers](https://dashboard.stripe.com/customers) - View customer records
   - [Logs](https://dashboard.stripe.com/logs) - Check for any errors

2. **Your Application**:
   - Database: Check that payments are recorded
   - Credits: Verify credits are added after purchase
   - Error logs: Monitor for any issues

## 🔄 Switching Between Test and Live Modes

### For Development (Test Mode)
Use test keys in `.env.local`:
```bash
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

Update `/lib/stripe-price-ids.ts` to use test price IDs (copy from `/lib/stripe-price-ids-test.ts`)

### For Production (Live Mode)
Use live keys in Vercel environment variables:
```bash
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

Current file uses live price IDs.

## 🚨 Important Notes

1. **Never commit live keys** to your repository
2. **Test with small amounts** first when going live
3. **Keep test mode active** for development - you can have both running simultaneously
4. **Webhook endpoints** are different for test and live modes
5. **Price IDs** are different between test and live modes

## 📞 Support

- Stripe Support: https://support.stripe.com
- Stripe Status: https://status.stripe.com
- API Logs: https://dashboard.stripe.com/logs