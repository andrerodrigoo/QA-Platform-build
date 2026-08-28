import express, { type Express } from 'express';
import type { Repository } from '../repository/repository.js';
import { createServices } from '../services/container.js';
import { createApiRouter } from './routes.js';
import { errorMiddleware } from './handlers.js';

/**
 * Creates the Express application around a given repository.
 * The same factory is used by the local dev server, the Netlify Function,
 * and the integration tests — guaranteeing they all exercise identical code.
 */
export function createApp(repo: Repository): Express {
  const app = express();

  app.use(express.json({ limit: '1mb' }));

  // Basic permissive CORS for local dev + same-origin Netlify deploy.
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.use('/api', createApiRouter(createServices(repo)));

  // 404 for unknown API routes.
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  app.use(errorMiddleware);

  return app;
}
