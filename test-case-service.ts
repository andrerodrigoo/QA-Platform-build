import type { Repository } from '../repository/repository.js';
import type {
  TestCase,
  TestCaseCreateInput,
  TestCaseUpdateInput,
} from '../domain/types.js';
import { AppError } from './errors.js';

/**
 * Test case business logic (FR-008..FR-020, BR-003, BR-005).
 */
export class TestCaseService {
  constructor(private readonly repo: Repository) {}

  async list(projectId?: number): Promise<TestCase[]> {
    return this.repo.listTestCases(projectId);
  }

  async get(id: number): Promise<TestCase> {
    const testCase = await this.repo.getTestCase(id);
    if (!testCase) throw AppError.notFound('Test case');
    return testCase;
  }

  async create(input: TestCaseCreateInput): Promise<TestCase> {
    // The parent project must exist (BR-003).
    const project = await this.repo.getProject(input.projectId);
    if (!project) throw AppError.notFound('Project');

    await this.assertTitleAvailable(input.projectId, input.title);
    return this.repo.createTestCase(input);
  }

  async update(id: number, input: TestCaseUpdateInput): Promise<TestCase> {
    const existing = await this.get(id);
    await this.assertTitleAvailable(existing.projectId, input.title, id);
    const updated = await this.repo.updateTestCase(id, input);
    if (!updated) throw AppError.notFound('Test case');
    return updated;
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.repo.deleteTestCase(id);
    if (!deleted) throw AppError.notFound('Test case');
  }

  /** BR-005: titles unique per project (case-insensitive). */
  private async assertTitleAvailable(
    projectId: number,
    title: string,
    ignoreId?: number,
  ): Promise<void> {
    const existing = await this.repo.findTestCaseByTitle(projectId, title);
    if (existing && existing.id !== ignoreId) {
      throw AppError.conflict('A test case with this title already exists in this project');
    }
  }
}
