import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { AppError } from '../services/errors.js';
import { idParamSchema } from '../validators/schemas.js';

/**
 * Small HTTP helpers shared by all routes.
 */

/** Wraps an async handler so thrown errors reach the error middleware. */
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/** Validates `req.body` against a schema, throwing a 422 AppError on failure. */
export function parseBody<T>(schema: ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw AppError.validation('Validation failed', formatZodError(result.error));
  }
  return result.data;
}

/** Parses a numeric route param (throws 400 on invalid format). */
export function parseId(raw: string): number {
  const result = idParamSchema.safeParse(raw);
  if (!result.success) {
    throw new AppError(400, 'Invalid id format');
  }
  return result.data;
}

function formatZodError(error: ZodError): Array<{ field: string; message: string }> {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || '(root)',
    message: issue.message,
  }));
}

/** Central error middleware — converts AppError/ZodError into safe JSON. */
export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message, details: err.details });
    return;
  }
  if (err instanceof ZodError) {
    res.status(422).json({ error: 'Validation failed', details: formatZodError(err) });
    return;
  }
  // Unexpected error: never leak internals to the client (NFR-006).
  // eslint-disable-next-line no-console
  console.error('Unexpected error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
