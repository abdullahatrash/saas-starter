# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

B2B SaaS MVP for tattoo & piercing preview using Replicate's google/nano-banana model. Artists upload body-part photos + design sketches; app returns photorealistic previews with placement controls and variant styles. Built with Next.js 15.4 (App Router), PostgreSQL, Drizzle ORM, Stripe, Replicate API, and Tailwind CSS.

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
- **Tables**: users, teams, team_members, activity_logs, invitations
- **Queries**: `lib/db/queries.ts` - centralized database operations
- **Migrations**: `lib/db/migrations/`

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
├── api/              # API routes (stripe, team, user)
├── pricing/          # Pricing page with Stripe integration
└── layout.tsx        # Root layout

lib/
├── auth/             # Authentication logic
├── db/               # Database config, schema, queries
└── payments/         # Stripe integration
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
- **Studio Page** (`/studio`): Main interface for tattoo preview generation
  - Upload body photo and design image
  - Select body part and tattoo style (black & gray, color, fine line, watercolor)
  - Adjust scale, rotation, and opacity
  - Uses credits system (1 credit per preview)
- **Preview API** (`/api/preview`): Handles preview generation with Replicate
- **Shareable Pages** (`/p/[id]`): Public preview pages for sharing with clients
- **Credit System**: Users start with 3 free credits, can purchase more via Stripe

### Environment Variables Required
- `POSTGRES_URL`: PostgreSQL connection string
- `AUTH_SECRET`: JWT signing secret
- `STRIPE_SECRET_KEY`: Stripe API key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook endpoint secret
- `BASE_URL`: Application URL (e.g., http://localhost:3000)
- `REPLICATE_API_TOKEN`: Replicate API token for nano-banana model
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob storage token (production only)

### Testing Payments
Use Stripe test card: 4242 4242 4242 4242 (any future expiry, any CVC)