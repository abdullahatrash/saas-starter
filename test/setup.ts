import { beforeEach, vi } from 'vitest'
import { resetDb } from './helpers/db'

// Route handlers reach for cookies via next/headers, which only works inside a
// Next request scope. Swap it for an in-memory store the auth helper drives.
vi.mock('next/headers', () => import('./mocks/next-headers'))

beforeEach(async () => {
  await resetDb()
})
