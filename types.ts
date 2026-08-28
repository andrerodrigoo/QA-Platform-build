import type {
  Priority,
  Severity,
  TestType,
  TestCaseStatus,
  ExecutionResult,
  BugStatus,
} from './enums.js';

/** A QA project that groups test cases (FR-001..FR-007). */
export interface Project {
  id: number;
  name: string;
  description: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/** A test case belonging to exactly one project (FR-008..FR-020, BR-003). */
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

/** A recorded execution of a test case (FR-021..FR-025, BR-006). */
export interface Execution {
  id: number;
  testCaseId: number;
  result: ExecutionResult;
  notes: string | null;
  executedAt: string;
}

/** A defect, optionally linked to a test case (FR-026..FR-033, BR-002). */
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

// ---------------------------------------------------------------------------
// Input DTOs (what the API accepts). IDs and timestamps are server-generated.
// ---------------------------------------------------------------------------

export interface ProjectCreateInput {
  name: string;
  description?: string | null;
}
export type ProjectUpdateInput = ProjectCreateInput;

export interface TestCaseCreateInput {
  projectId: number;
  title: string;
  description?: string | null;
  preconditions?: string | null;
  steps: string;
  expectedResult: string;
  priority: Priority;
  type: TestType;
  status?: TestCaseStatus;
}
export type TestCaseUpdateInput = Omit<TestCaseCreateInput, 'projectId'>;

export interface ExecutionCreateInput {
  testCaseId: number;
  result: ExecutionResult;
  notes?: string | null;
}

export interface BugCreateInput {
  projectId: number;
  testCaseId?: number | null;
  title: string;
  description?: string | null;
  stepsToReproduce?: string | null;
  expectedResult?: string | null;
  actualResult?: string | null;
  severity: Severity;
  priority: Priority;
  status?: BugStatus;
}
export type BugUpdateInput = Omit<BugCreateInput, 'projectId'>;

// ---------------------------------------------------------------------------
// Derived / aggregate view models.
// ---------------------------------------------------------------------------

export interface ProjectSummary extends Project {
  testCaseCount: number;
  openBugCount: number;
  lastExecutionAt: string | null;
  passRate: number | null; // 0..100, null when no executions
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
    passRate: number; // 0..100
    failRate: number;
    blockedRate: number;
  };
  bugsBySeverity: {
    Low: number;
    Medium: number;
    High: number;
    Critical: number;
  };
}
