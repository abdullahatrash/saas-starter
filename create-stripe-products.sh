#!/bin/bash

echo "Creating Stripe products in TEST mode..."
echo ""

# Credit Packs
echo "Creating Starter Pack..."
stripe products create \
  --name="Starter Pack" \
  --description="10 tattoo preview credits" \
  --metadata="credits=10" \
  --metadata="type=credit_pack"

echo "Creating price for Starter Pack..."
stripe prices create \
  --product-data[name]="Starter Pack" \
  --unit-amount=499 \
  --currency=usd

echo ""
echo "Creating Professional Pack..."
stripe products create \
  --name="Professional Pack" \
  --description="25 tattoo preview credits" \
  --metadata="credits=25" \
  --metadata="type=credit_pack"

echo "Creating price for Professional Pack..."
stripe prices create \
  --product-data[name]="Professional Pack" \
  --unit-amount=999 \
  --currency=usd

echo ""
echo "Creating Studio Pack (Most Popular)..."
stripe products create \
  --name="Studio Pack" \
  --description="60 tattoo preview credits - Most Popular!" \
  --metadata="credits=60" \
  --metadata="type=credit_pack" \
  --metadata="popular=true"

echo "Creating price for Studio Pack..."
stripe prices create \
  --product-data[name]="Studio Pack" \
  --unit-amount=1999 \
  --currency=usd

echo ""
echo "Creating Enterprise Pack..."
stripe products create \
  --name="Enterprise Pack" \
  --description="150 tattoo preview credits" \
  --metadata="credits=150" \
  --metadata="type=credit_pack"

echo "Creating price for Enterprise Pack..."
stripe prices create \
  --product-data[name]="Enterprise Pack" \
  --unit-amount=3999 \
  --currency=usd

echo ""
echo "Creating Bulk Deal..."
stripe products create \
  --name="Bulk Deal" \
  --description="500 tattoo preview credits - Best Value!" \
  --metadata="credits=500" \
  --metadata="type=credit_pack"

echo "Creating price for Bulk Deal..."
stripe prices create \
  --product-data[name]="Bulk Deal" \
  --unit-amount=9999 \
  --currency=usd

# Subscriptions
echo ""
echo "Creating Starter Subscription..."
stripe products create \
  --name="Starter Subscription" \
  --description="50 AI tattoo previews per month" \
  --metadata="monthly_credits=50" \
  --metadata="type=subscription"

echo "Creating monthly price ($19/month)..."
stripe prices create \
  --product-data[name]="Starter Subscription" \
  --unit-amount=1900 \
  --currency=usd \
  --recurring="interval=month"

echo "Creating yearly price ($120/year)..."
stripe prices create \
  --product-data[name]="Starter Subscription" \
  --unit-amount=12000 \
  --currency=usd \
  --recurring="interval=year"

echo ""
echo "Creating Pro Subscription (Most Popular)..."
stripe products create \
  --name="Pro Subscription" \
  --description="200 AI tattoo previews per month" \
  --metadata="monthly_credits=200" \
  --metadata="type=subscription" \
  --metadata="popular=true"

echo "Creating monthly price ($49/month)..."
stripe prices create \
  --product-data[name]="Pro Subscription" \
  --unit-amount=4900 \
  --currency=usd \
  --recurring="interval=month"

echo "Creating yearly price ($348/year)..."
stripe prices create \
  --product-data[name]="Pro Subscription" \
  --unit-amount=34800 \
  --currency=usd \
  --recurring="interval=year"

echo ""
echo "Creating Premium Subscription..."
stripe products create \
  --name="Premium Subscription" \
  --description="Unlimited tattoo previews" \
  --metadata="monthly_credits=unlimited" \
  --metadata="type=subscription"

echo "Creating monthly price ($99/month)..."
stripe prices create \
  --product-data[name]="Premium Subscription" \
  --unit-amount=9900 \
  --currency=usd \
  --recurring="interval=month"

echo "Creating yearly price ($588/year)..."
stripe prices create \
  --product-data[name]="Premium Subscription" \
  --unit-amount=58800 \
  --currency=usd \
  --recurring="interval=year"

echo ""
echo "================================================"
echo "✅ All products created successfully!"
echo "================================================"
echo ""
echo "Getting all price IDs..."
echo ""
stripe prices list --limit=20

echo ""
echo "================================================"
echo "To save price IDs to a file, run:"
echo "stripe prices list --limit=20 --output json > stripe-prices.json"
echo "================================================"