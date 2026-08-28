import type { Repository } from './repository.js';
import { MemoryRepository } from './memory-repository.js';

/**
 * Selects the repository implementation based on the DATA_DRIVER env var.
 *
 *  - "memory" (default): in-memory store — used for local dev and tests.
 *  - "neon": Neon Postgres via @neondatabase/serverless — used in production.
 *
 * The Neon implementation is loaded lazily so tests never need the driver
 * or a DATABASE_URL.
 */
export async function createRepository(): Promise<Repository> {
  const driver = process.env.DATA_DRIVER ?? 'memory';

  if (driver === 'neon') {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATA_DRIVER=neon requires DATABASE_URL to be set');
    }
    const { NeonRepository } = await import('./neon-repository.js');
    return new NeonRepository(process.env.DATABASE_URL);
  }

  return new MemoryRepository();
}
