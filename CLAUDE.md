# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

B2B SaaS MVP for tattoo & piercing preview using Replicate's google/nano-banana model. Artists upload body-part photos + design sketches; app returns photorealistic previews with placement controls and variant styles. Built with Next.js 15.4 (App Router), PostgreSQL (Neon), Drizzle ORM, Stripe, Replicate API, Vercel Blob Storage, and Tailwind CSS.

## Development Commands

```bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:setup         # Create .env file with database setup
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database with test data (test@test.com / admin123)
pnpm db:generate      # Generate migration files from schema changes
pnpm db:studio        # Open Drizzle Studio for database management

# Stripe (for local development)
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Architecture

### Authentication System
- JWT-based authentication stored in HTTP-only cookies
- Session management in `lib/auth/session.ts`
- Global middleware (`middleware.ts`) protects `/dashboard` routes
- Server action middleware in `lib/auth/middleware.ts` provides:
  - `validatedAction`: Validates Zod schemas
  - `validatedActionWithUser`: Validates and requires authenticated user
  - `withTeam`: Ensures user has team access

### Database Structure (Drizzle ORM)
- **Schema**: `lib/db/schema.ts`
- **Core Tables**: users, teams, team_members, activity_logs, invitations
- **Tattoo Tables**: 
  - `studios` - Tattoo studio entities
  - `designs` - Tattoo design library
  - `body_photos` - User body part photos
  - `preview_jobs` - Preview generation jobs
  - `preview_results` - Generated preview images
  - `user_credits` - Credit balance tracking
  - `payments` - Payment/credit purchase history
- **Queries**: `lib/db/queries.ts` - centralized database operations
- **Migrations**: `lib/db/migrations/`
- **Database**: Neon (PostgreSQL) in production, local PostgreSQL in development

### Payment Integration (Stripe)
- Checkout flow: `/pricing` → `/api/stripe/checkout`
- Webhook handler: `/api/stripe/webhook` - handles subscription events
- Customer portal integration for subscription management
- Stripe utilities in `lib/payments/stripe.ts`

### Application Structure
```
app/
├── (dashboard)/        # Protected dashboard routes
│   ├── dashboard/     # Dashboard pages (activity, general, security)
│   └── layout.tsx     # Dashboard layout with sidebar
├── (login)/           # Auth routes (sign-in, sign-up)
├── api/              # API routes
│   ├── stripe/       # Stripe checkout and webhook
│   ├── preview/      # Tattoo preview generation endpoints
│   ├── upload/       # Image upload to Vercel Blob
│   ├── webhooks/     # External webhooks (Replicate)
│   ├── team/         # Team management
│   └── user/         # User operations
├── studio/           # Main tattoo preview studio interface
├── p/[id]/           # Public shareable preview pages
├── pricing/          # Pricing page with Stripe integration
└── layout.tsx        # Root layout

lib/
├── auth/             # Authentication logic
├── db/               # Database config, schema, queries
├── payments/         # Stripe integration
├── replicate.ts      # Replicate API integration (nano-banana)
├── storage.ts        # Vercel Blob storage utilities
├── prompt.ts         # AI prompt generation for tattoo placement
└── entitlements.ts   # Credit system management
```

### UI Components
- Using shadcn/ui components in `components/ui/`
- Tailwind CSS v4 with PostCSS configuration
- Component variants managed with CVA (class-variance-authority)

### Key Patterns
1. **Server Actions**: Form submissions use Server Actions with validation middleware
2. **Data Fetching**: Server components fetch data directly via `lib/db/queries.ts`
3. **Protected Routes**: Middleware checks session cookies for `/dashboard/*` routes
4. **Team Context**: Most operations require team context via `getTeamForUser()`
5. **Activity Logging**: User actions logged to `activity_logs` table

### Tattoo Preview System

#### Core Features
- **Studio Page** (`/studio`): Main interface for tattoo preview generation
  - Upload body photo and design image via Vercel Blob storage
  - Select body part (arm, hand, neck, back, chest, shoulder, leg, ankle, wrist)
  - Choose tattoo style (black & gray, color, fine line, watercolor)
  - Adjust parameters: scale (50-150%), rotation (-180° to 180°), opacity (50-100%)
  - Custom or auto-generated AI prompts
  - Real-time preview generation status
  - Download and share functionality

#### Technical Implementation
- **Image Storage**: Vercel Blob for public image hosting (solves localhost issue with Replicate)
- **AI Integration**: 
  - Replicate API with google/nano-banana model
  - Direct API calls to `https://api.replicate.com/v1/models/google/nano-banana/predictions`
  - Webhook support for async prediction updates
- **Preview API** (`/api/preview`): 
  - Creates preview jobs in database
  - Handles credit consumption
  - Manages Replicate prediction lifecycle
- **Status Polling** (`/api/preview/[id]`): 
  - Checks prediction status
  - Updates job status in database
  - Returns results when ready
- **Upload API** (`/api/upload`):
  - Validates file type and size
  - Uploads to Vercel Blob
  - Returns public URLs for Replicate access
- **Shareable Pages** (`/p/[id]`): Public preview pages for sharing with clients

#### Credit System
- **Initial Credits**: Configurable via `INITIAL_USER_CREDITS` env variable
- **Development Mode**: `DEV_UNLIMITED_CREDITS=true` for unlimited testing
- **Credit Tracking**: `user_credits` table with balance management
- **Credit Consumption**: 1 credit per preview generation
- **Credit Purchase**: Integration with Stripe for credit packs

### Environment Variables Required

#### Database
- `DATABASE_URL`: Neon PostgreSQL connection string (pooled)
- `DATABASE_URL_UNPOOLED`: Direct connection for migrations
- `POSTGRES_URL`: Legacy alias for DATABASE_URL

#### Authentication
- `AUTH_SECRET`: JWT signing secret (generate with `openssl rand -base64 32`)

#### Payments (Stripe)
- `STRIPE_SECRET_KEY`: Stripe API key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook endpoint secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Public Stripe key

#### AI & Storage
- `REPLICATE_API_TOKEN`: Replicate API token for nano-banana model
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob storage token

#### Configuration
- `BASE_URL`: Application URL (e.g., http://localhost:3000)
- `NEXT_PUBLIC_URL`: Public URL for production (set by Vercel)
- `INITIAL_USER_CREDITS`: Starting credits for new users (default: 3)
- `DEV_UNLIMITED_CREDITS`: Enable unlimited credits in development (true/false)

### Deployment

#### Production Setup (Vercel + Neon)
1. **Database**: Create Neon project at console.neon.tech
2. **Vercel**: Deploy with `vercel --prod` or GitHub integration
3. **Migrations**: Run `npm run db:migrate` with production DATABASE_URL
4. **Environment**: Set all required variables in Vercel dashboard
5. **Blob Storage**: Run `vercel blob add` to create storage

#### Local Development
1. **Database**: Use Docker PostgreSQL or Neon
2. **Replicate**: Requires Vercel Blob for image hosting (localhost won't work)
3. **Stripe**: Use `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. **Test Account**: `test@test.com` / `admin123`

### Testing
- **Payments**: Use Stripe test card: 4242 4242 4242 4242 (any future expiry, any CVC)
- **Tattoo Preview**: Upload images are stored in Vercel Blob with public URLs
- **Credits**: Set `DEV_UNLIMITED_CREDITS=true` for unlimited testing