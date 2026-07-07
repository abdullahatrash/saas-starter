import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    // env.ts must run first so POSTGRES_URL / AUTH_SECRET exist before any
    // route handler (which read them at module load) is imported.
    setupFiles: ['./test/env.ts', './test/setup.ts'],
    globalSetup: ['./test/global-setup.ts'],
    // Tests share one Postgres database and reset it between cases, so test
    // files must not run concurrently.
    fileParallelism: false,
  },
})
