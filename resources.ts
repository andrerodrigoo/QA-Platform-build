import { api } from './client';
import type {
  Project,
  ProjectSummary,
  TestCase,
  Execution,
  Bug,
  DashboardMetrics,
  Priority,
  Severity,
  TestType,
  TestCaseStatus,
  ExecutionResult,
  BugStatus,
} from '../types';

/** Typed API resource functions grouped by domain entity. */

export interface ProjectInput {
  name: string;
  description?: string | null;
}

export const projectsApi = {
  list: () => api.get<ProjectSummary[]>('/projects'),
  get: (id: number) => api.get<ProjectSummary>(`/projects/${id}`),
  create: (input: ProjectInput) => api.post<Project>('/projects', input),
  update: (id: number, input: ProjectInput) => api.put<Project>(`/projects/${id}`, input),
  remove: (id: number) => api.delete(`/projects/${id}`),
};

export interface TestCaseInput {
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

export const testCasesApi = {
  list: (projectId: number) => api.get<TestCase[]>(`/test-cases?projectId=${projectId}`),
  get: (id: number) => api.get<TestCase>(`/test-cases/${id}`),
  create: (input: TestCaseInput) => api.post<TestCase>('/test-cases', input),
  update: (id: number, input: Omit<TestCaseInput, 'projectId'>) =>
    api.put<TestCase>(`/test-cases/${id}`, input),
  remove: (id: number) => api.delete(`/test-cases/${id}`),
};

export interface ExecutionInput {
  testCaseId: number;
  result: ExecutionResult;
  notes?: string | null;
}

export const executionsApi = {
  listForTestCase: (testCaseId: number) =>
    api.get<Execution[]>(`/test-cases/${testCaseId}/executions`),
  create: (input: ExecutionInput) => api.post<Execution>('/executions', input),
};

export interface BugInput {
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

export const bugsApi = {
  list: (projectId?: number) =>
    api.get<Bug[]>(projectId ? `/bugs?projectId=${projectId}` : '/bugs'),
  get: (id: number) => api.get<Bug>(`/bugs/${id}`),
  create: (input: BugInput) => api.post<Bug>('/bugs', input),
  update: (id: number, input: Omit<BugInput, 'projectId'>) =>
    api.put<Bug>(`/bugs/${id}`, input),
  remove: (id: number) => api.delete(`/bugs/${id}`),
};

export const metricsApi = {
  dashboard: () => api.get<DashboardMetrics>('/metrics/dashboard'),
};
