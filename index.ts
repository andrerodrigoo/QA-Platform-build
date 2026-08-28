/**
 * Public barrel for the backend package.
 * Re-exports the pieces the Netlify function and tests need.
 */
export { createApp } from './http/app.js';
export { createRepository } from './repository/factory.js';
export { MemoryRepository } from './repository/memory-repository.js';
export { createServices } from './services/container.js';
export type { Repository } from './repository/repository.js';
export * from './domain/types.js';
export * from './domain/enums.js';
