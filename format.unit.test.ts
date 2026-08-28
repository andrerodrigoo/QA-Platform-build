import { describe, it, expect } from 'vitest';
import { formatDateTime, formatPassRate, filterTestCases } from './format';
import type { TestCase } from '../types';

/** Unit tests for frontend formatting and the client-side test-case filter. */

function testCase(overrides: Partial<TestCase> & Pick<TestCase, 'title'>): TestCase {
  return {
    id: 1,
    projectId: 1,
    description: null,
    preconditions: null,
    steps: 's',
    expectedResult: 'r',
    priority: 'Medium',
    type: 'Functional',
    status: 'Active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('formatDateTime', () => {
  it('returns a dash for null', () => {
    expect(formatDateTime(null)).toBe('—');
  });
  it('returns a dash for an invalid date', () => {
    expect(formatDateTime('not-a-date')).toBe('—');
  });
  it('formats an ISO timestamp as YYYY-MM-DD HH:mm', () => {
    expect(formatDateTime('2026-08-27T14:30:00.000Z')).toBe('2026-08-27 14:30');
  });
});

describe('formatPassRate', () => {
  it('returns N/A for null', () => {
    expect(formatPassRate(null)).toBe('N/A');
  });
  it('appends a percent sign', () => {
    expect(formatPassRate(75)).toBe('75%');
    expect(formatPassRate(0)).toBe('0%');
  });
});

describe('filterTestCases', () => {
  const cases: TestCase[] = [
    testCase({ id: 1, title: 'Verify login', priority: 'High', status: 'Active', type: 'Functional' }),
    testCase({ id: 2, title: 'Verify logout', priority: 'Low', status: 'Draft', type: 'Smoke' }),
    testCase({ id: 3, title: 'Reset password', priority: 'High', status: 'Active', type: 'Regression' }),
  ];

  const noFilter = { search: '', status: '', priority: '', type: '' };

  it('returns everything when no filters are applied', () => {
    expect(filterTestCases(cases, noFilter)).toHaveLength(3);
  });

  it('searches by title, case-insensitive (TC-TC-013)', () => {
    const result = filterTestCases(cases, { ...noFilter, search: 'LOGIN' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('returns an empty array for a non-matching search (TC-TC-014)', () => {
    expect(filterTestCases(cases, { ...noFilter, search: 'zzz' })).toHaveLength(0);
  });

  it('filters by priority (TC-TC-011)', () => {
    expect(filterTestCases(cases, { ...noFilter, priority: 'High' })).toHaveLength(2);
  });

  it('filters by status (TC-TC-012)', () => {
    expect(filterTestCases(cases, { ...noFilter, status: 'Draft' })).toHaveLength(1);
  });

  it('combines search and filters (TC-TC-015)', () => {
    const result = filterTestCases(cases, {
      ...noFilter,
      search: 'verify',
      priority: 'High',
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });
});
