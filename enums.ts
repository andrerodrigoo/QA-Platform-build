/**
 * Domain enums shared across the platform.
 *
 * These are the single source of truth for all constrained values.
 * Validators (Zod) and the frontend both derive from these lists, which
 * prevents drift between client and server (mitigates RISK-008).
 */

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
export type Severity = (typeof SEVERITIES)[number];

export const TEST_TYPES = [
  'Functional',
  'Regression',
  'Smoke',
  'Performance',
  'Security',
  'Exploratory',
] as const;
export type TestType = (typeof TEST_TYPES)[number];

export const TEST_CASE_STATUSES = ['Active', 'Draft', 'Deprecated'] as const;
export type TestCaseStatus = (typeof TEST_CASE_STATUSES)[number];

export const EXECUTION_RESULTS = ['Pass', 'Fail', 'Blocked'] as const;
export type ExecutionResult = (typeof EXECUTION_RESULTS)[number];

export const BUG_STATUSES = [
  'Open',
  'In Progress',
  'Fixed',
  'Closed',
  "Won't Fix",
] as const;
export type BugStatus = (typeof BUG_STATUSES)[number];

/**
 * Field length limits (business rules FR-006, FR-007, FR-012, FR-033).
 * Centralized so validators and the frontend agree on the exact numbers.
 */
export const LIMITS = {
  PROJECT_NAME_MAX: 100,
  PROJECT_DESCRIPTION_MAX: 500,
  TEST_CASE_TITLE_MAX: 200,
  BUG_TITLE_MAX: 200,
} as const;
