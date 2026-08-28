import type { TestCase } from '../types';

/** Formats an ISO timestamp as a short, locale-independent date-time. */
export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toISOString().replace('T', ' ').slice(0, 16);
}

/** Formats a nullable pass-rate number (0..100) as a percentage string. */
export function formatPassRate(rate: number | null): string {
  return rate === null ? 'N/A' : `${rate}%`;
}

/**
 * Client-side filtering of test cases by search keyword, status, priority, and type.
 * Pure function — unit tested in format.unit.test.ts to guard the search/filter rules.
 */
export interface TestCaseFilters {
  search: string;
  status: string; // '' = all
  priority: string; // '' = all
  type: string; // '' = all
}

export function filterTestCases(cases: TestCase[], filters: TestCaseFilters): TestCase[] {
  const keyword = filters.search.trim().toLowerCase();
  return cases.filter((tc) => {
    if (keyword && !tc.title.toLowerCase().includes(keyword)) return false;
    if (filters.status && tc.status !== filters.status) return false;
    if (filters.priority && tc.priority !== filters.priority) return false;
    if (filters.type && tc.type !== filters.type) return false;
    return true;
  });
}
