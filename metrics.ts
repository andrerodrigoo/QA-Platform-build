import type { Execution, Bug, DashboardMetrics } from './types.js';
import type { BugStatus, Severity } from './enums.js';

/**
 * Pure business-logic functions for QA metrics.
 *
 * These are deliberately free of I/O so they can be unit-tested exhaustively
 * (see metrics.unit.test.ts). All calculations here implement the business
 * rules BR-010 and BR-011 from requirements.md.
 */

/** A bug is "open" unless it has been Closed or marked Won't Fix. */
export function isOpenBug(status: BugStatus): boolean {
  return status !== 'Closed' && status !== "Won't Fix";
}

/**
 * Given all executions, keep only the latest execution per test case.
 * BR-010: pass rate is computed from the latest execution of each test case.
 */
export function latestExecutionPerTestCase(executions: Execution[]): Execution[] {
  const latestByTestCase = new Map<number, Execution>();
  for (const execution of executions) {
    const current = latestByTestCase.get(execution.testCaseId);
    if (!current || execution.executedAt > current.executedAt) {
      latestByTestCase.set(execution.testCaseId, execution);
    }
  }
  return [...latestByTestCase.values()];
}

/** Rounds a ratio (0..1) to a whole percentage (0..100). */
function toPercent(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

/**
 * Compute the pass/fail/blocked breakdown from the LATEST execution per test case.
 * Returns 0 for all rates when there are no executions (avoids division by zero — RISK-003).
 */
export function computeExecutionBreakdown(
  executions: Execution[],
): DashboardMetrics['executionBreakdown'] {
  const latest = latestExecutionPerTestCase(executions);
  const total = latest.length;

  const pass = latest.filter((e) => e.result === 'Pass').length;
  const fail = latest.filter((e) => e.result === 'Fail').length;
  const blocked = latest.filter((e) => e.result === 'Blocked').length;

  return {
    pass,
    fail,
    blocked,
    passRate: toPercent(pass, total),
    failRate: toPercent(fail, total),
    blockedRate: toPercent(blocked, total),
  };
}

/**
 * Pass rate for a single project's executions.
 * Returns null when there are no executions (so the UI can show an empty state).
 */
export function computePassRate(executions: Execution[]): number | null {
  const latest = latestExecutionPerTestCase(executions);
  if (latest.length === 0) return null;
  const pass = latest.filter((e) => e.result === 'Pass').length;
  return toPercent(pass, latest.length);
}

/** Count bugs grouped by severity (FR-036). Only considers the bugs passed in. */
export function countBugsBySeverity(bugs: Bug[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  for (const bug of bugs) {
    counts[bug.severity] += 1;
  }
  return counts;
}

/** Count only open bugs (used in project summaries). */
export function countOpenBugs(bugs: Bug[]): number {
  return bugs.filter((b) => isOpenBug(b.status)).length;
}
