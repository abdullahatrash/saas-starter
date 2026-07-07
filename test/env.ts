import { config } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

// Load .env.test if present, then fall back to safe defaults so the suite runs
// on a fresh checkout with no env file. These are read by lib/db/drizzle.ts and
// lib/auth/session.ts at module load, so they must be set before those import.
const envPath = resolve(process.cwd(), '.env.test')
if (existsSync(envPath)) {
  config({ path: envPath })
}

process.env.POSTGRES_URL ||= 'postgres://abdullahatrash@localhost:5432/taatoo_test'
process.env.AUTH_SECRET ||= 'test-auth-secret-not-for-production'
process.env.REPLICATE_API_TOKEN ||= 'test-replicate-token'
process.env.REPLICATE_WEBHOOK_SIGNING_SECRET ||= 'whsec_dGVzdHNlY3JldA=='
