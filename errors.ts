/**
 * Domain error with an HTTP-friendly status code.
 * Route handlers translate these into JSON error responses, keeping
 * DB internals and stack traces out of API output (NFR-006, security).
 */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static notFound(resource: string): AppError {
    return new AppError(404, `${resource} not found`);
  }

  static conflict(message: string): AppError {
    return new AppError(409, message);
  }

  static validation(message: string, details?: unknown): AppError {
    return new AppError(422, message, details);
  }
}
