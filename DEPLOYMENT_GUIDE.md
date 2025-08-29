# Deployment Guide to Vercel with Neon Database

## Pre-Deployment Checklist

- [ ] Git repository ready
- [ ] All changes committed
- [ ] Environment variables documented
- [ ] Database schema ready

## Step-by-Step Deployment

### Step 1: Create Neon Database (5 minutes)

1. **Go to Neon Console**
   - Visit: https://console.neon.tech
   - Sign up/Login (free tier is fine)

2. **Create New Project**
   - Click "Create a project"
   - Project name: `saas-starter` (or your preference)
   - Region: Choose closest to your users
   - Click "Create project"

3. **Save Your Connection String**
   - You'll see a connection string like:
   ```
   postgresql://username:password@ep-xxx.region.neon.tech/neondb?sslmode=require
   ```
   - **IMPORTANT**: Save this, we'll need it!

### Step 2: Create Vercel Project (5 minutes)

1. **Install Vercel CLI** (if not already)
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Link Your Project**
   ```bash
   vercel link
   ```
   - Choose your scope (personal or team)
   - Link to existing project? **No** (create new)
   - Project name: `saas-starter-tattoo` (or your preference)
   - Directory: `./` (current directory)

### Step 3: Configure Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project
   - Go to "Settings" → "Environment Variables"

2. **Add These Variables** (copy from your .env.local):

   **Database (from Neon)**:
   - `DATABASE_URL` = Your Neon connection string

   **Authentication**:
   - `AUTH_SECRET` = (generate new one with: `openssl rand -base64 32`)

   **Stripe** (if using):
   - `STRIPE_SECRET_KEY` = Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` = Your Stripe webhook secret
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = Your Stripe publishable key

   **Replicate**:
   - `REPLICATE_API_TOKEN` = Your Replicate API token

   **Vercel Blob** (already set if you ran `vercel blob add`):
   - `BLOB_READ_WRITE_TOKEN` = Your blob token

   **App Settings**:
   - `NEXT_PUBLIC_URL` = Will be set automatically by Vercel
   - `INITIAL_USER_CREDITS` = 50 (or your preference)
   - `DEV_UNLIMITED_CREDITS` = false (for production)

### Step 4: Update Database Configuration

1. **Check your database config** in `lib/db/drizzle.ts`:
   ```typescript
   // Should already work with DATABASE_URL env variable
   ```

2. **Update schema if needed** for Neon compatibility

### Step 5: Prepare Database Migrations

1. **Generate migration files** (if not already):
   ```bash
   npm run db:generate
   ```

2. **We'll run migrations after deployment**

### Step 6: Commit Your Changes

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 7: Deploy to Vercel

```bash
vercel --prod
```

Or push to GitHub and Vercel will auto-deploy

### Step 8: Run Database Migrations on Neon

After deployment, run migrations:

```bash
# Set the production DATABASE_URL locally temporarily
export DATABASE_URL="your-neon-connection-string"

# Run migrations
npm run db:migrate

# Or use Vercel CLI to run in production
vercel env pull .env.production.local
npm run db:migrate
```

### Step 9: Verify Deployment

1. **Check your site**: https://your-project.vercel.app
2. **Test features**:
   - Sign up/Login
   - Upload images
   - Generate preview
   - Check database connectivity

### Step 10: Configure Stripe Webhook (if using)

1. Go to Stripe Dashboard
2. Add webhook endpoint: `https://your-project.vercel.app/api/stripe/webhook`
3. Update `STRIPE_WEBHOOK_SECRET` in Vercel

## Post-Deployment

### Monitor Your App:
- Vercel Dashboard: Logs, Analytics
- Neon Dashboard: Database metrics
- Stripe Dashboard: Payments

### Troubleshooting:

**Database Connection Issues**:
- Check DATABASE_URL in Vercel env vars
- Ensure ?sslmode=require is in connection string
- Check Neon dashboard for connection limits

**Build Failures**:
- Check Vercel build logs
- Ensure all dependencies are in package.json
- Check for TypeScript errors

**Runtime Errors**:
- Check Vercel Functions logs
- Verify all environment variables are set
- Check browser console for client-side errors

## Environment Variables Summary

```env
# Database
DATABASE_URL=postgresql://...@neon.tech/neondb?sslmode=require

# Auth
AUTH_SECRET=generate-with-openssl

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Replicate
REPLICATE_API_TOKEN=r8_...

# Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# App Config  
INITIAL_USER_CREDITS=50
DEV_UNLIMITED_CREDITS=false
```