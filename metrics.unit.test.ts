import { describe, it, expect } from 'vitest';
import {
  isOpenBug,
  latestExecutionPerTestCase,
  computeExecutionBreakdown,
  computePassRate,
  countBugsBySeverity,
  countOpenBugs,
} from './metrics.js';
import type { Execution, Bug } from './types.js';

/**
 * Unit tests for the pure QA metric functions.
 * These implement business rules BR-010 and BR-011 and are the highest-value
 * unit tests in the project (metrics are math-heavy and error-prone — RISK-003).
 */

function execution(overrides: Partial<Execution> & Pick<Execution, 'testCaseId' | 'result'>): Execution {
  return {
    id: Math.floor(Math.random() * 100000),
    notes: null,
    executedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function bug(overrides: Partial<Bug> & Pick<Bug, 'severity' | 'status'>): Bug {
  return {
    id: Math.floor(Math.random() * 100000),
    projectId: 1,
    testCaseId: null,
    title: 'Bug',
    description: null,
    stepsToReproduce: null,
    expectedResult: null,
    actualResult: null,
    priority: 'Medium',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('isOpenBug', () => {
  it('treats Open, In Progress, and Fixed as open', () => {
    expect(isOpenBug('Open')).toBe(true);
    expect(isOpenBug('In Progress')).toBe(true);
    expect(isOpenBug('Fixed')).toBe(true);
  });

  it('treats Closed and Won\'t Fix as not open', () => {
    expect(isOpenBug('Closed')).toBe(false);
    expect(isOpenBug("Won't Fix")).toBe(false);
  });
});

describe('latestExecutionPerTestCase', () => {
  it('returns an empty array when there are no executions', () => {
    expect(latestExecutionPerTestCase([])).toEqual([]);
  });

  it('keeps only the latest execution for each test case (BR-010)', () => {
    const executions: Execution[] = [
      execution({ testCaseId: 1, result: 'Fail', executedAt: '2026-01-01T10:00:00.000Z' }),
      execution({ testCaseId: 1, result: 'Pass', executedAt: '2026-01-02T10:00:00.000Z' }),
      execution({ testCaseId: 2, result: 'Blocked', executedAt: '2026-01-01T10:00:00.000Z' }),
    ];
    const latest = latestExecutionPerTestCase(executions);
    expect(latest).toHaveLength(2);
    expect(latest.find((e) => e.testCaseId === 1)?.result).toBe('Pass');
    expect(latest.find((e) => e.testCaseId === 2)?.result).toBe('Blocked');
  });
});

describe('computeExecutionBreakdown', () => {
  it('returns all zeros when there are no executions (no division by zero — RISK-003)', () => {
    const breakdown = computeExecutionBreakdown([]);
    expect(breakdown).toEqual({
      pass: 0,
      fail: 0,
      blocked: 0,
      passRate: 0,
      failRate: 0,
      blockedRate: 0,
    });
  });

  it('computes 60/30/10 from the latest execution per test case', () => {
    // 10 test cases, each with one execution: 6 Pass, 3 Fail, 1 Blocked.
    const executions: Execution[] = [
      ...Array.from({ length: 6 }, (_, i) => execution({ testCaseId: i + 1, result: 'Pass' })),
      ...Array.from({ length: 3 }, (_, i) => execution({ testCaseId: i + 7, result: 'Fail' })),
      execution({ testCaseId: 10, result: 'Blocked' }),
    ];
    const breakdown = computeExecutionBreakdown(executions);
    expect(breakdown.pass).toBe(6);
    expect(breakdown.fail).toBe(3);
    expect(breakdown.blocked).toBe(1);
    expect(breakdown.passRate).toBe(60);
    expect(breakdown.failRate).toBe(30);
    expect(breakdown.blockedRate).toBe(10);
  });

  it('uses only the latest execution when a test case has many', () => {
    const executions: Execution[] = [
      execution({ testCaseId: 1, result: 'Fail', executedAt: '2026-01-01T00:00:00.000Z' }),
      execution({ testCaseId: 1, result: 'Pass', executedAt: '2026-01-05T00:00:00.000Z' }),
    ];
    const breakdown = computeExecutionBreakdown(executions);
    expect(breakdown.pass).toBe(1);
    expect(breakdown.fail).toBe(0);
    expect(breakdown.passRate).toBe(100);
  });
});

describe('computePassRate', () => {
  it('returns null when there are no executions (enables empty state)', () => {
    expect(computePassRate([])).toBeNull();
  });

  it('returns 100 when all latest executions pass', () => {
    const executions = [
      execution({ testCaseId: 1, result: 'Pass' }),
      execution({ testCaseId: 2, result: 'Pass' }),
    ];
    expect(computePassRate(executions)).toBe(100);
  });

  it('returns 50 for one pass and one fail', () => {
    const executions = [
      execution({ testCaseId: 1, result: 'Pass' }),
      execution({ testCaseId: 2, result: 'Fail' }),
    ];
    expect(computePassRate(executions)).toBe(50);
  });

  it('rounds to the nearest whole percent', () => {
    // 1 pass out of 3 = 33.33% -> 33
    const executions = [
      execution({ testCaseId: 1, result: 'Pass' }),
      execution({ testCaseId: 2, result: 'Fail' }),
      execution({ testCaseId: 3, result: 'Fail' }),
    ];
    expect(computePassRate(executions)).toBe(33);
  });
});

describe('countBugsBySeverity', () => {
  it('returns all zeros for no bugs', () => {
    expect(countBugsBySeverity([])).toEqual({ Low: 0, Medium: 0, High: 0, Critical: 0 });
  });

  it('counts bugs per severity (FR-036)', () => {
    const bugs: Bug[] = [
      bug({ severity: 'Critical', status: 'Open' }),
      bug({ severity: 'High', status: 'Open' }),
      bug({ severity: 'High', status: 'Closed' }),
      bug({ severity: 'Medium', status: 'Open' }),
      bug({ severity: 'Medium', status: 'Open' }),
      bug({ severity: 'Medium', status: 'Fixed' }),
      bug({ severity: 'Low', status: 'Open' }),
    ];
    expect(countBugsBySeverity(bugs)).toEqual({ Low: 1, Medium: 3, High: 2, Critical: 1 });
  });
});

describe('countOpenBugs', () => {
  it('counts only bugs that are not Closed or Won\'t Fix', () => {
    const bugs: Bug[] = [
      bug({ severity: 'High', status: 'Open' }),
      bug({ severity: 'High', status: 'In Progress' }),
      bug({ severity: 'High', status: 'Fixed' }),
      bug({ severity: 'High', status: 'Closed' }),
      bug({ severity: 'High', status: "Won't Fix" }),
    ];
    expect(countOpenBugs(bugs)).toBe(3);
  });
});
