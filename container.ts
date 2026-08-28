import type { Repository } from '../repository/repository.js';
import { ProjectService } from './project-service.js';
import { TestCaseService } from './test-case-service.js';
import { ExecutionService } from './execution-service.js';
import { BugService } from './bug-service.js';
import { MetricsService } from './metrics-service.js';

/** Bundles all services around a single repository instance. */
export interface Services {
  projects: ProjectService;
  testCases: TestCaseService;
  executions: ExecutionService;
  bugs: BugService;
  metrics: MetricsService;
}

export function createServices(repo: Repository): Services {
  return {
    projects: new ProjectService(repo),
    testCases: new TestCaseService(repo),
    executions: new ExecutionService(repo),
    bugs: new BugService(repo),
    metrics: new MetricsService(repo),
  };
}
