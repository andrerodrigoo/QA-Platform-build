import type {
  Project,
  TestCase,
  Execution,
  Bug,
  ProjectCreateInput,
  TestCaseCreateInput,
  ExecutionCreateInput,
  BugCreateInput,
} from '../domain/types.js';

/**
 * Repository interface — the boundary between business logic and storage.
 *
 * Having this abstraction means the services never know whether data lives in
 * memory (tests / local dev) or in Neon Postgres (production). This is the
 * separation-of-concerns seam that keeps the domain testable.
 */
export interface Repository {
  // Projects
  listProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | null>;
  findProjectByName(name: string): Promise<Project | null>;
  createProject(input: ProjectCreateInput): Promise<Project>;
  updateProject(id: number, input: ProjectCreateInput): Promise<Project | null>;
  deleteProject(id: number): Promise<boolean>;

  // Test cases
  listTestCases(projectId?: number): Promise<TestCase[]>;
  getTestCase(id: number): Promise<TestCase | null>;
  findTestCaseByTitle(projectId: number, title: string): Promise<TestCase | null>;
  createTestCase(input: TestCaseCreateInput): Promise<TestCase>;
  updateTestCase(
    id: number,
    input: Omit<TestCaseCreateInput, 'projectId'>,
  ): Promise<TestCase | null>;
  deleteTestCase(id: number): Promise<boolean>;

  // Executions
  listExecutions(testCaseId?: number): Promise<Execution[]>;
  createExecution(input: ExecutionCreateInput): Promise<Execution>;

  // Bugs
  listBugs(projectId?: number): Promise<Bug[]>;
  getBug(id: number): Promise<Bug | null>;
  createBug(input: BugCreateInput): Promise<Bug>;
  updateBug(id: number, input: Omit<BugCreateInput, 'projectId'>): Promise<Bug | null>;
  deleteBug(id: number): Promise<boolean>;

  /** Test helper: wipe all data. */
  reset(): Promise<void>;
}
