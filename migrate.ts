import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

/**
 * Applies generated Drizzle migrations to the Neon database.
 * Run with: `npm run db:migrate` (requires DATABASE_URL).
 */
async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required to run migrations');

  const db = drizzle(neon(url));
  await migrate(db, { migrationsFolder: './packages/backend/src/db/migrations' });
  // eslint-disable-next-line no-console
  console.warn('Migrations applied successfully.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Migration failed:', err);
  process.exit(1);
});
