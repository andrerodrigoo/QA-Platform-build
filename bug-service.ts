import type { Repository } from '../repository/repository.js';
import type { Bug, BugCreateInput, BugUpdateInput } from '../domain/types.js';
import { AppError } from './errors.js';

/**
 * Bug business logic (FR-026..FR-033, BR-002).
 */
export class BugService {
  constructor(private readonly repo: Repository) {}

  async list(projectId?: number): Promise<Bug[]> {
    return this.repo.listBugs(projectId);
  }

  async get(id: number): Promise<Bug> {
    const bug = await this.repo.getBug(id);
    if (!bug) throw AppError.notFound('Bug');
    return bug;
  }

  async create(input: BugCreateInput): Promise<Bug> {
    const project = await this.repo.getProject(input.projectId);
    if (!project) throw AppError.notFound('Project');

    // If linked to a test case, it must exist.
    if (input.testCaseId != null) {
      const testCase = await this.repo.getTestCase(input.testCaseId);
      if (!testCase) throw AppError.notFound('Test case');
    }

    return this.repo.createBug(input);
  }

  async update(id: number, input: BugUpdateInput): Promise<Bug> {
    await this.get(id);
    const updated = await this.repo.updateBug(id, input);
    if (!updated) throw AppError.notFound('Bug');
    return updated;
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.repo.deleteBug(id);
    if (!deleted) throw AppError.notFound('Bug');
  }
}
