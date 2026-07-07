import { client } from '@/lib/db/drizzle'

// Empties every table between tests so each case starts from a known state.
export async function resetDb() {
  const rows = await client<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `
  if (rows.length === 0) return
  const names = rows.map((r) => `"${r.tablename}"`).join(', ')
  await client.unsafe(`TRUNCATE TABLE ${names} RESTART IDENTITY CASCADE`)
}
