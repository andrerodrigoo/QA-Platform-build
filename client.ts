import type { ApiErrorShape } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/** Error thrown by the API client, carrying the HTTP status and details. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: ApiErrorShape['details'],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    // Network failure / server unreachable (NFR-011, graceful error handling).
    throw new ApiError(0, 'Unable to reach the server. Please check your connection.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const body = data as ApiErrorShape | null;
    throw new ApiError(
      response.status,
      body?.error ?? `Request failed with status ${response.status}`,
      body?.details,
    );
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
};
