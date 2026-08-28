import { createApp } from './http/app.js';
import { createRepository } from './repository/factory.js';

/**
 * Local development server. On Netlify the app runs as a serverless function
 * instead (see netlify/functions/api.ts), so this file is dev-only.
 */
async function main(): Promise<void> {
  const repo = await createRepository();
  const app = createApp(repo);
  const port = Number(process.env.PORT ?? 3001);

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.warn(`API listening on http://localhost:${port}/api`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});
