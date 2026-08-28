import type { Repository } from '../repository/repository.js';
import type { DashboardMetrics } from '../domain/types.js';
import {
  computeExecutionBreakdown,
  countBugsBySeverity,
  countOpenBugs,
} from '../domain/metrics.js';

/**
 * Dashboard metrics aggregation (FR-034..FR-037).
 * Delegates the arithmetic to the pure functions in domain/metrics.ts.
 */
export class MetricsService {
  constructor(private readonly repo: Repository) {}

  async getDashboard(): Promise<DashboardMetrics> {
    const [projects, testCases, executions, bugs] = await Promise.all([
      this.repo.listProjects(),
      this.repo.listTestCases(),
      this.repo.listExecutions(),
      this.repo.listBugs(),
    ]);

    return {
      totals: {
        projects: projects.length,
        testCases: testCases.length,
        executions: executions.length,
        openBugs: countOpenBugs(bugs),
      },
      executionBreakdown: computeExecutionBreakdown(executions),
      bugsBySeverity: countBugsBySeverity(bugs),
    };
  }
}
