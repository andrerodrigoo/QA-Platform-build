import type { Repository } from '../repository/repository.js';
import type { Project, ProjectCreateInput, ProjectSummary } from '../domain/types.js';
import { AppError } from './errors.js';
import { computePassRate, countOpenBugs } from '../domain/metrics.js';

/**
 * Project business logic (FR-001..FR-007, BR-001, BR-004).
 * Uniqueness and existence rules live here, not in the route handlers.
 */
export class ProjectService {
  constructor(private readonly repo: Repository) {}

  async list(): Promise<ProjectSummary[]> {
    const projects = await this.repo.listProjects();
    return Promise.all(projects.map((p) => this.buildSummary(p)));
  }

  async get(id: number): Promise<Project> {
    const project = await this.repo.getProject(id);
    if (!project) throw AppError.notFound('Project');
    return project;
  }

  async getSummary(id: number): Promise<ProjectSummary> {
    const project = await this.get(id);
    return this.buildSummary(project);
  }

  async create(input: ProjectCreateInput): Promise<Project> {
    await this.assertNameAvailable(input.name);
    return this.repo.createProject(input);
  }

  async update(id: number, input: ProjectCreateInput): Promise<Project> {
    await this.get(id); // ensures it exists (404 otherwise)
    await this.assertNameAvailable(input.name, id);
    const updated = await this.repo.updateProject(id, input);
    if (!updated) throw AppError.notFound('Project');
    return updated;
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.repo.deleteProject(id);
    if (!deleted) throw AppError.notFound('Project');
  }

  /** BR-004: names are unique, case-insensitive. Ignores the project being updated. */
  private async assertNameAvailable(name: string, ignoreId?: number): Promise<void> {
    const existing = await this.repo.findProjectByName(name);
    if (existing && existing.id !== ignoreId) {
      throw AppError.conflict('A project with this name already exists');
    }
  }

  private async buildSummary(project: Project): Promise<ProjectSummary> {
    const [testCases, bugs] = await Promise.all([
      this.repo.listTestCases(project.id),
      this.repo.listBugs(project.id),
    ]);

    const allExecutions = (
      await Promise.all(testCases.map((tc) => this.repo.listExecutions(tc.id)))
    ).flat();

    const lastExecutionAt =
      allExecutions.length > 0
        ? allExecutions
            .map((e) => e.executedAt)
            .sort((a, b) => b.localeCompare(a))[0]
        : null;

    return {
      ...project,
      testCaseCount: testCases.length,
      openBugCount: countOpenBugs(bugs),
      lastExecutionAt,
      passRate: computePassRate(allExecutions),
    };
  }
}
