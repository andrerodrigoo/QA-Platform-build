import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit config for generating and pushing migrations to Neon.
 * Requires DATABASE_URL in the environment (see .env.example).
 */
export default defineConfig({
  schema: './packages/backend/src/db/schema.ts',
  out: './packages/backend/src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
});
