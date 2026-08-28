import type { Repository } from '../repository/repository.js';
import type { Execution, ExecutionCreateInput } from '../domain/types.js';
import { AppError } from './errors.js';

/**
 * Execution business logic (FR-021..FR-025).
 * An execution can only be recorded against an existing test case.
 */
export class ExecutionService {
  constructor(private readonly repo: Repository) {}

  async listForTestCase(testCaseId: number): Promise<Execution[]> {
    const testCase = await this.repo.getTestCase(testCaseId);
    if (!testCase) throw AppError.notFound('Test case');
    return this.repo.listExecutions(testCaseId);
  }

  async create(input: ExecutionCreateInput): Promise<Execution> {
    const testCase = await this.repo.getTestCase(input.testCaseId);
    if (!testCase) throw AppError.notFound('Test case');
    return this.repo.createExecution(input);
  }
}
