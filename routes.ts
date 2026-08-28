import { Router } from 'express';
import type { Services } from '../services/container.js';
import { asyncHandler, parseBody, parseId } from './handlers.js';
import {
  projectCreateSchema,
  projectUpdateSchema,
  testCaseCreateSchema,
  testCaseUpdateSchema,
  executionCreateSchema,
  bugCreateSchema,
  bugUpdateSchema,
} from '../validators/schemas.js';

/**
 * Builds the /api router. All handlers are thin: they parse input, delegate to
 * a service, and shape the response. Business rules live in the services.
 */
export function createApiRouter(services: Services): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ----- Projects -----
  router.get(
    '/projects',
    asyncHandler(async (_req, res) => {
      res.json(await services.projects.list());
    }),
  );

  router.get(
    '/projects/:id',
    asyncHandler(async (req, res) => {
      res.json(await services.projects.getSummary(parseId(req.params.id)));
    }),
  );

  router.post(
    '/projects',
    asyncHandler(async (req, res) => {
      const input = parseBody(projectCreateSchema, req.body);
      res.status(201).json(await services.projects.create(input));
    }),
  );

  router.put(
    '/projects/:id',
    asyncHandler(async (req, res) => {
      const input = parseBody(projectUpdateSchema, req.body);
      res.json(await services.projects.update(parseId(req.params.id), input));
    }),
  );

  router.delete(
    '/projects/:id',
    asyncHandler(async (req, res) => {
      await services.projects.remove(parseId(req.params.id));
      res.status(204).end();
    }),
  );

  // ----- Test cases -----
  router.get(
    '/test-cases',
    asyncHandler(async (req, res) => {
      const projectId = req.query.projectId
        ? parseId(String(req.query.projectId))
        : undefined;
      res.json(await services.testCases.list(projectId));
    }),
  );

  router.get(
    '/test-cases/:id',
    asyncHandler(async (req, res) => {
      res.json(await services.testCases.get(parseId(req.params.id)));
    }),
  );

  router.post(
    '/test-cases',
    asyncHandler(async (req, res) => {
      const input = parseBody(testCaseCreateSchema, req.body);
      res.status(201).json(await services.testCases.create(input));
    }),
  );

  router.put(
    '/test-cases/:id',
    asyncHandler(async (req, res) => {
      const input = parseBody(testCaseUpdateSchema, req.body);
      res.json(await services.testCases.update(parseId(req.params.id), input));
    }),
  );

  router.delete(
    '/test-cases/:id',
    asyncHandler(async (req, res) => {
      await services.testCases.remove(parseId(req.params.id));
      res.status(204).end();
    }),
  );

  // ----- Executions -----
  router.get(
    '/test-cases/:id/executions',
    asyncHandler(async (req, res) => {
      res.json(await services.executions.listForTestCase(parseId(req.params.id)));
    }),
  );

  router.post(
    '/executions',
    asyncHandler(async (req, res) => {
      const input = parseBody(executionCreateSchema, req.body);
      res.status(201).json(await services.executions.create(input));
    }),
  );

  // ----- Bugs -----
  router.get(
    '/bugs',
    asyncHandler(async (req, res) => {
      const projectId = req.query.projectId
        ? parseId(String(req.query.projectId))
        : undefined;
      res.json(await services.bugs.list(projectId));
    }),
  );

  router.get(
    '/bugs/:id',
    asyncHandler(async (req, res) => {
      res.json(await services.bugs.get(parseId(req.params.id)));
    }),
  );

  router.post(
    '/bugs',
    asyncHandler(async (req, res) => {
      const input = parseBody(bugCreateSchema, req.body);
      res.status(201).json(await services.bugs.create(input));
    }),
  );

  router.put(
    '/bugs/:id',
    asyncHandler(async (req, res) => {
      const input = parseBody(bugUpdateSchema, req.body);
      res.json(await services.bugs.update(parseId(req.params.id), input));
    }),
  );

  router.delete(
    '/bugs/:id',
    asyncHandler(async (req, res) => {
      await services.bugs.remove(parseId(req.params.id));
      res.status(204).end();
    }),
  );

  // ----- Metrics -----
  router.get(
    '/metrics/dashboard',
    asyncHandler(async (_req, res) => {
      res.json(await services.metrics.getDashboard());
    }),
  );

  return router;
}
