import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';

/**
 * Routing tests (jsdom).
 *
 * Validates the client-side routes render for direct navigation to each path —
 * this is the exact behavior that must also work in production once the Netlify
 * SPA fallback serves index.html for deep links (see netlify.toml / _redirects).
 *
 * The API layer is mocked so route rendering does not depend on a backend.
 */

vi.mock('./api/resources', () => ({
  projectsApi: { list: vi.fn().mockResolvedValue([]), get: vi.fn().mockResolvedValue(null) },
  testCasesApi: { list: vi.fn().mockResolvedValue([]) },
  bugsApi: { list: vi.fn().mockResolvedValue([]) },
  metricsApi: {
    dashboard: vi.fn().mockResolvedValue({
      totals: { projects: 0, testCases: 0, executions: 0, openBugs: 0 },
      executionBreakdown: {
        pass: 0,
        fail: 0,
        blocked: 0,
        passRate: 0,
        failRate: 0,
        blockedRate: 0,
      },
      bugsBySeverity: { Low: 0, Medium: 0, High: 0, Critical: 0 },
    }),
  },
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App routing', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the app shell / nav on the root path', async () => {
    renderAt('/');
    expect(screen.getByText('✓ QA Platform')).toBeInTheDocument();
    // Root redirects to /dashboard.
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument());
  });

  it('renders the Dashboard on direct navigation to /dashboard', async () => {
    renderAt('/dashboard');
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument(),
    );
  });

  it('renders the Projects page on direct navigation to /projects', async () => {
    renderAt('/projects');
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Projects' })).toBeInTheDocument(),
    );
  });

  it('renders the Bugs page on direct navigation to /bugs', async () => {
    renderAt('/bugs');
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Bugs' })).toBeInTheDocument());
  });

  it('renders the project detail route /projects/:id', async () => {
    renderAt('/projects/1');
    // The nav is always present; the detail page attempts to load project 1.
    expect(screen.getByText('✓ QA Platform')).toBeInTheDocument();
  });

  it('shows the not-found state for an unknown route', () => {
    renderAt('/this-route-does-not-exist');
    expect(screen.getByText('Page not found.')).toBeInTheDocument();
  });
});
