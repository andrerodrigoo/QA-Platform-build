/**
 * Frontend domain types.
 *
 * These mirror the backend domain types (packages/backend/src/domain). They are
 * duplicated intentionally so the frontend has no build dependency on the
 * backend package, while the enum lists are kept identical to prevent drift.
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

export const BUG_STATUSES = ['Open', 'In Progress', 'Fixed', 'Closed', "Won't Fix"] as const;
export type BugStatus = (typeof BUG_STATUSES)[number];

export interface Project {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary extends Project {
  testCaseCount: number;
  openBugCount: number;
  lastExecutionAt: string | null;
  passRate: number | null;
}

export interface TestCase {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  preconditions: string | null;
  steps: string;
  expectedResult: string;
  priority: Priority;
  type: TestType;
  status: TestCaseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Execution {
  id: number;
  testCaseId: number;
  result: ExecutionResult;
  notes: string | null;
  executedAt: string;
}

export interface Bug {
  id: number;
  projectId: number;
  testCaseId: number | null;
  title: string;
  description: string | null;
  stepsToReproduce: string | null;
  expectedResult: string | null;
  actualResult: string | null;
  severity: Severity;
  priority: Priority;
  status: BugStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totals: {
    projects: number;
    testCases: number;
    executions: number;
    openBugs: number;
  };
  executionBreakdown: {
    pass: number;
    fail: number;
    blocked: number;
    passRate: number;
    failRate: number;
    blockedRate: number;
  };
  bugsBySeverity: Record<Severity, number>;
}

export interface ApiErrorShape {
  error: string;
  details?: Array<{ field: string; message: string }>;
}
