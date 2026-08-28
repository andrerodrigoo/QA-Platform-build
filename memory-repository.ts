import type { Repository } from './repository.js';
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
 * In-memory implementation of the Repository.
 *
 * Used for unit/integration tests and for local development without a database.
 * Every mutation returns a fresh copy so callers cannot mutate internal state.
 */
export class MemoryRepository implements Repository {
  private projects: Project[] = [];
  private testCases: TestCase[] = [];
  private executions: Execution[] = [];
  private bugs: Bug[] = [];

  private projectSeq = 1;
  private testCaseSeq = 1;
  private executionSeq = 1;
  private bugSeq = 1;

  private now(): string {
    return new Date().toISOString();
  }

  async reset(): Promise<void> {
    this.projects = [];
    this.testCases = [];
    this.executions = [];
    this.bugs = [];
    this.projectSeq = 1;
    this.testCaseSeq = 1;
    this.executionSeq = 1;
    this.bugSeq = 1;
  }

  // ----- Projects -----

  async listProjects(): Promise<Project[]> {
    return this.projects.map((p) => ({ ...p }));
  }

  async getProject(id: number): Promise<Project | null> {
    const found = this.projects.find((p) => p.id === id);
    return found ? { ...found } : null;
  }

  async findProjectByName(name: string): Promise<Project | null> {
    const target = name.trim().toLowerCase();
    const found = this.projects.find((p) => p.name.toLowerCase() === target);
    return found ? { ...found } : null;
  }

  async createProject(input: ProjectCreateInput): Promise<Project> {
    const ts = this.now();
    const project: Project = {
      id: this.projectSeq++,
      name: input.name,
      description: input.description ?? null,
      createdAt: ts,
      updatedAt: ts,
    };
    this.projects.push(project);
    return { ...project };
  }

  async updateProject(id: number, input: ProjectCreateInput): Promise<Project | null> {
    const project = this.projects.find((p) => p.id === id);
    if (!project) return null;
    project.name = input.name;
    project.description = input.description ?? null;
    project.updatedAt = this.now();
    return { ...project };
  }

  async deleteProject(id: number): Promise<boolean> {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.projects.splice(index, 1);

    // BR-001: cascade to test cases, their executions, and the project's bugs.
    const caseIds = this.testCases.filter((tc) => tc.projectId === id).map((tc) => tc.id);
    this.testCases = this.testCases.filter((tc) => tc.projectId !== id);
    this.executions = this.executions.filter((ex) => !caseIds.includes(ex.testCaseId));
    this.bugs = this.bugs.filter((b) => b.projectId !== id);
    return true;
  }

  // ----- Test cases -----

  async listTestCases(projectId?: number): Promise<TestCase[]> {
    const list =
      projectId === undefined
        ? this.testCases
        : this.testCases.filter((tc) => tc.projectId === projectId);
    return list.map((tc) => ({ ...tc }));
  }

  async getTestCase(id: number): Promise<TestCase | null> {
    const found = this.testCases.find((tc) => tc.id === id);
    return found ? { ...found } : null;
  }

  async findTestCaseByTitle(projectId: number, title: string): Promise<TestCase | null> {
    const target = title.trim().toLowerCase();
    const found = this.testCases.find(
      (tc) => tc.projectId === projectId && tc.title.toLowerCase() === target,
    );
    return found ? { ...found } : null;
  }

  async createTestCase(input: TestCaseCreateInput): Promise<TestCase> {
    const ts = this.now();
    const testCase: TestCase = {
      id: this.testCaseSeq++,
      projectId: input.projectId,
      title: input.title,
      description: input.description ?? null,
      preconditions: input.preconditions ?? null,
      steps: input.steps,
      expectedResult: input.expectedResult,
      priority: input.priority,
      type: input.type,
      status: input.status ?? 'Active',
      createdAt: ts,
      updatedAt: ts,
    };
    this.testCases.push(testCase);
    return { ...testCase };
  }

  async updateTestCase(
    id: number,
    input: Omit<TestCaseCreateInput, 'projectId'>,
  ): Promise<TestCase | null> {
    const testCase = this.testCases.find((tc) => tc.id === id);
    if (!testCase) return null;
    testCase.title = input.title;
    testCase.description = input.description ?? null;
    testCase.preconditions = input.preconditions ?? null;
    testCase.steps = input.steps;
    testCase.expectedResult = input.expectedResult;
    testCase.priority = input.priority;
    testCase.type = input.type;
    testCase.status = input.status ?? testCase.status;
    testCase.updatedAt = this.now();
    return { ...testCase };
  }

  async deleteTestCase(id: number): Promise<boolean> {
    const index = this.testCases.findIndex((tc) => tc.id === id);
    if (index === -1) return false;
    this.testCases.splice(index, 1);

    // BR-002: delete executions, but keep bugs and just unlink them.
    this.executions = this.executions.filter((ex) => ex.testCaseId !== id);
    this.bugs = this.bugs.map((b) => (b.testCaseId === id ? { ...b, testCaseId: null } : b));
    return true;
  }

  // ----- Executions -----

  async listExecutions(testCaseId?: number): Promise<Execution[]> {
    const list =
      testCaseId === undefined
        ? this.executions
        : this.executions.filter((ex) => ex.testCaseId === testCaseId);
    // Latest first.
    return list
      .map((ex) => ({ ...ex }))
      .sort((a, b) => b.executedAt.localeCompare(a.executedAt));
  }

  async createExecution(input: ExecutionCreateInput): Promise<Execution> {
    const execution: Execution = {
      id: this.executionSeq++,
      testCaseId: input.testCaseId,
      result: input.result,
      notes: input.notes ?? null,
      executedAt: this.now(),
    };
    this.executions.push(execution);
    return { ...execution };
  }

  // ----- Bugs -----

  async listBugs(projectId?: number): Promise<Bug[]> {
    const list =
      projectId === undefined ? this.bugs : this.bugs.filter((b) => b.projectId === projectId);
    return list.map((b) => ({ ...b }));
  }

  async getBug(id: number): Promise<Bug | null> {
    const found = this.bugs.find((b) => b.id === id);
    return found ? { ...found } : null;
  }

  async createBug(input: BugCreateInput): Promise<Bug> {
    const ts = this.now();
    const bug: Bug = {
      id: this.bugSeq++,
      projectId: input.projectId,
      testCaseId: input.testCaseId ?? null,
      title: input.title,
      description: input.description ?? null,
      stepsToReproduce: input.stepsToReproduce ?? null,
      expectedResult: input.expectedResult ?? null,
      actualResult: input.actualResult ?? null,
      severity: input.severity,
      priority: input.priority,
      status: input.status ?? 'Open',
      createdAt: ts,
      updatedAt: ts,
    };
    this.bugs.push(bug);
    return { ...bug };
  }

  async updateBug(
    id: number,
    input: Omit<BugCreateInput, 'projectId'>,
  ): Promise<Bug | null> {
    const bug = this.bugs.find((b) => b.id === id);
    if (!bug) return null;
    bug.testCaseId = input.testCaseId ?? null;
    bug.title = input.title;
    bug.description = input.description ?? null;
    bug.stepsToReproduce = input.stepsToReproduce ?? null;
    bug.expectedResult = input.expectedResult ?? null;
    bug.actualResult = input.actualResult ?? null;
    bug.severity = input.severity;
    bug.priority = input.priority;
    bug.status = input.status ?? bug.status;
    bug.updatedAt = this.now();
    return { ...bug };
  }

  async deleteBug(id: number): Promise<boolean> {
    const index = this.bugs.findIndex((b) => b.id === id);
    if (index === -1) return false;
    this.bugs.splice(index, 1);
    return true;
  }
}
