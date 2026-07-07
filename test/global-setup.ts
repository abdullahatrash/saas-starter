import { config } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'

// Builds a clean schema in the test database once, before the whole run.
export default async function setup() {
  const envPath = resolve(process.cwd(), '.env.test')
  if (existsSync(envPath)) {
    config({ path: envPath })
  }
  const url =
    process.env.POSTGRES_URL ||
    'postgres://abdullahatrash@localhost:5432/taatoo_test'

  const sql = postgres(url, { max: 1 })
  try {
    // Drop and recreate so the schema always matches the current migrations,
    // regardless of what a previous run left behind.
    await sql.unsafe('DROP SCHEMA IF EXISTS public CASCADE')
    await sql.unsafe('CREATE SCHEMA public')
    await sql.unsafe('DROP SCHEMA IF EXISTS drizzle CASCADE')
    const db = drizzle(sql)
    await migrate(db, { migrationsFolder: './lib/db/migrations' })
  } finally {
    await sql.end()
  }
}
