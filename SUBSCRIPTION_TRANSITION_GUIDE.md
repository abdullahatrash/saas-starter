# Subscription Transition Guide

## Current Implementation Status

### What Works Now:
- Users can purchase credit packs (pay-as-you-go)
- Users can subscribe to monthly/yearly plans
- Credits persist when subscribing (they stack)
- Dashboard shows correct status based on active subscription or credits

### Current Behavior:
When a pay-as-you-go user subscribes:
1. Their existing credits remain unchanged
2. Subscription becomes active immediately (or after trial)
3. User sees both: remaining credits + subscription status

## Recommended Improvements

### 1. Credit Handling Strategy

**Option A: Stack Credits (Current - Simple)**
```typescript
// User has 50 credits from pay-as-you-go
// Subscribes to plan with 100 credits/month
// Total: 150 credits available
```
✅ Pros: Simple, user-friendly, no lost value
❌ Cons: May complicate credit tracking

**Option B: Convert to Subscription Credits**
```typescript
// Convert remaining credits to subscription bonus
// Add as one-time bonus on first month
await addSubscriptionBonus(userId, existingCredits);
```

**Option C: Credit Bank System**
```typescript
// Keep pay-as-you-go credits separate
// Use subscription credits first, then pay-as-you-go
interface UserCredits {
  subscriptionCredits: number;  // Monthly allocation
  purchasedCredits: number;     // Pay-as-you-go balance
  bonusCredits: number;         // Promotional credits
}
```

### 2. Implementation Changes Needed

#### A. Update Database Schema
```sql
-- Add to user_credits table
ALTER TABLE user_credits ADD COLUMN credit_type VARCHAR(20) DEFAULT 'purchased';
ALTER TABLE user_credits ADD COLUMN expires_at TIMESTAMP;
```

#### B. Modify Credit Consumption Logic
```typescript
// lib/entitlements.ts
export async function consumeCredits(userId: number, amount = 1): Promise<boolean> {
  // Priority: subscription > purchased > bonus
  const credits = await getUserCreditsByType(userId);
  
  if (credits.subscription >= amount) {
    await deductSubscriptionCredits(userId, amount);
  } else if (credits.purchased >= amount) {
    await deductPurchasedCredits(userId, amount);
  } else {
    return false; // Insufficient credits
  }
  
  return true;
}
```

#### C. Handle Subscription Activation
```typescript
// app/api/stripe/webhook/route.ts
case 'customer.subscription.created':
  const subscription = event.data.object as Stripe.Subscription;
  const userId = parseInt(subscription.metadata.userId);
  
  // Check existing credits
  const existingCredits = await getUserCredits(userId);
  
  if (existingCredits > 0) {
    // Option 1: Keep as is (current)
    // Option 2: Convert to bonus
    await convertToBonus(userId, existingCredits);
    // Option 3: Prorate/refund
    await handleCreditRefund(userId, existingCredits);
  }
  
  // Activate subscription
  await activateSubscription(userId, subscription);
  break;
```

### 3. UI/UX Improvements

#### A. Show Clear Credit Breakdown
```tsx
// components/credits-display.tsx
<div className="space-y-2">
  <div className="flex justify-between">
    <span>Subscription Credits:</span>
    <span>{subscriptionCredits}/100</span>
  </div>
  {purchasedCredits > 0 && (
    <div className="flex justify-between text-sm text-muted">
      <span>Purchased Credits:</span>
      <span>{purchasedCredits}</span>
    </div>
  )}
</div>
```

#### B. Add Transition Warnings
```tsx
// app/pricing/page.tsx
{userHasCredits && (
  <Alert>
    <InfoIcon />
    <AlertDescription>
      You have {credits} credits remaining. These will be preserved 
      when you subscribe and can be used in addition to your monthly allocation.
    </AlertDescription>
  </Alert>
)}
```

### 4. Subscription Downgrade/Cancellation

When subscription ends:
```typescript
// Handle subscription cancellation
case 'customer.subscription.deleted':
  // User keeps any unused purchased credits
  // Subscription credits are lost
  await removeSubscriptionCredits(userId);
  
  // Notify user
  await sendEmail(userId, 'subscription_ended', {
    remainingCredits: purchasedCredits
  });
  break;
```

## Quick Implementation (Minimal Changes)

If you want to keep it simple with minimal changes:

1. **Keep current behavior** - Credits stack naturally
2. **Add clear messaging** in the UI about credit preservation
3. **Track credit source** for better analytics

```typescript
// Quick fix for better tracking
// lib/entitlements.ts
export async function addCredits(
  userId: number, 
  amount: number,
  source: 'purchase' | 'subscription' | 'bonus' = 'purchase'
): Promise<void> {
  // Record source in payment metadata
  await recordPayment({
    userId,
    amount,
    purpose: source === 'subscription' ? 'subscription' : 'credit-pack',
    metadata: { source, credits: amount }
  });
  
  // Add credits as before
  const currentCredits = await getUserCredits(userId);
  await db.insert(userCredits)...
}
```

## Decision Matrix

| Approach | Complexity | User Experience | Business Logic |
|----------|------------|-----------------|----------------|
| Stack Credits (Current) | ⭐ Low | ⭐⭐⭐ Best | Simple |
| Separate Pools | ⭐⭐ Medium | ⭐⭐ Good | Clear tracking |
| Convert/Refund | ⭐⭐⭐ High | ⭐ Complex | Most flexible |

## Recommendation

**For MVP/Current Stage:** Keep the current stacking behavior but add:
1. Clear UI messaging about credit preservation
2. Credit source tracking in metadata
3. Dashboard showing credit breakdown

**For Scale:** Implement separate credit pools with clear consumption priority and expiration dates for subscription credits.