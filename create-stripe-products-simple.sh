#!/bin/bash

echo "Creating Stripe products in TEST mode (simplified version)..."
echo ""

# Create products and capture their IDs, then create prices

# Starter Pack
echo "1. Creating Starter Pack..."
STARTER_ID=$(stripe products create --name "Starter Pack" --description "10 tattoo preview credits" | grep '"id"' | cut -d'"' -f4)
echo "   Product ID: $STARTER_ID"
stripe prices create --product "$STARTER_ID" --unit-amount 499 --currency usd
echo ""

# Professional Pack
echo "2. Creating Professional Pack..."
PROFESSIONAL_ID=$(stripe products create --name "Professional Pack" --description "25 tattoo preview credits" | grep '"id"' | cut -d'"' -f4)
echo "   Product ID: $PROFESSIONAL_ID"
stripe prices create --product "$PROFESSIONAL_ID" --unit-amount 999 --currency usd
echo ""

# Studio Pack
echo "3. Creating Studio Pack..."
STUDIO_ID=$(stripe products create --name "Studio Pack" --description "60 tattoo preview credits - Most Popular!" | grep '"id"' | cut -d'"' -f4)
echo "   Product ID: $STUDIO_ID"
stripe prices create --product "$STUDIO_ID" --unit-amount 1999 --currency usd
echo ""

# Enterprise Pack
echo "4. Creating Enterprise Pack..."
ENTERPRISE_ID=$(stripe products create --name "Enterprise Pack" --description "150 tattoo preview credits" | grep '"id"' | cut -d'"' -f4)
echo "   Product ID: $ENTERPRISE_ID"
stripe prices create --product "$ENTERPRISE_ID" --unit-amount 3999 --currency usd
echo ""

# Bulk Deal
echo "5. Creating Bulk Deal..."
BULK_ID=$(stripe products create --name "Bulk Deal" --description "500 tattoo preview credits - Best Value!" | grep '"id"' | cut -d'"' -f4)
echo "   Product ID: $BULK_ID"
stripe prices create --product "$BULK_ID" --unit-amount 9999 --currency usd
echo ""

# Starter Subscription
echo "6. Creating Starter Subscription..."
SUB_STARTER_ID=$(stripe products create --name "Starter Subscription" --description "50 AI tattoo previews per month" | grep '"id"' | cut -d'"' -f4)
echo "   Product ID: $SUB_STARTER_ID"
echo "   Creating monthly price ($19/month)..."
stripe prices create --product "$SUB_STARTER_ID" --unit-amount 1900 --currency usd --recurring interval=month
echo "   Creating yearly price ($120/year)..."
stripe prices create --product "$SUB_STARTER_ID" --unit-amount 12000 --currency usd --recurring interval=year
echo ""

# Pro Subscription
echo "7. Creating Pro Subscription..."
SUB_PRO_ID=$(stripe products create --name "Pro Subscription" --description "200 AI tattoo previews per month - Most Popular!" | grep '"id"' | cut -d'"' -f4)
echo "   Product ID: $SUB_PRO_ID"
echo "   Creating monthly price ($49/month)..."
stripe prices create --product "$SUB_PRO_ID" --unit-amount 4900 --currency usd --recurring interval=month
echo "   Creating yearly price ($348/year)..."
stripe prices create --product "$SUB_PRO_ID" --unit-amount 34800 --currency usd --recurring interval=year
echo ""

# Premium Subscription
echo "8. Creating Premium Subscription..."
SUB_PREMIUM_ID=$(stripe products create --name "Premium Subscription" --description "Unlimited tattoo previews" | grep '"id"' | cut -d'"' -f4)
echo "   Product ID: $SUB_PREMIUM_ID"
echo "   Creating monthly price ($99/month)..."
stripe prices create --product "$SUB_PREMIUM_ID" --unit-amount 9900 --currency usd --recurring interval=month
echo "   Creating yearly price ($588/year)..."
stripe prices create --product "$SUB_PREMIUM_ID" --unit-amount 58800 --currency usd --recurring interval=year

echo ""
echo "================================================"
echo "✅ All products created!"
echo "================================================"
echo ""
echo "Listing all prices with their IDs:"
echo ""
stripe prices list --limit 20

echo ""
echo "================================================"
echo "Save this output! Update your /lib/stripe-price-ids.ts file"
echo "with the price IDs shown above."
echo "================================================"