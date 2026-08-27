import { defineConfig } from 'vitest/config';

/**
 * Vitest workspace configuration.
 *
 * Two projects separate the test levels defined in the test strategy:
 *  - `unit`        : fast, isolated tests of services / validators / utils (no DB, no HTTP)
 *  - `integration` : API + in-memory repository tests (real request -> handler -> repo cycle)
 *
 * E2E tests are handled separately by Playwright (see playwright.config.ts).
 */
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: [
            'packages/backend/src/**/*.unit.test.ts',
            'packages/frontend/src/**/*.unit.test.ts',
          ],
        },
      },
      {
        test: {
          name: 'integration',
          environment: 'node',
          include: ['packages/backend/src/**/*.integration.test.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'packages/backend/src/services/**',
        'packages/backend/src/validators/**',
        'packages/backend/src/domain/**',
        'packages/frontend/src/utils/**',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
