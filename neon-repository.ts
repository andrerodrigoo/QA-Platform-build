import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { eq, sql, and, desc } from 'drizzle-orm';
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
import type {
  Priority,
  Severity,
  TestType,
  TestCaseStatus,
  ExecutionResult,
  BugStatus,
} from '../domain/enums.js';
import * as schema from '../db/schema.js';

/**
 * Neon Postgres implementation of the Repository, using Drizzle over the
 * @neondatabase/serverless HTTP driver (works in Netlify Functions).
 *
 * Row -> domain mappers normalize Postgres timestamps to ISO strings and cast
 * the stored enum strings back to their union types.
 */
export class NeonRepository implements Repository {
  private readonly db: NeonHttpDatabase<typeof schema>;

  constructor(connectionString: string) {
    const client = neon(connectionString);
    this.db = drizzle(client, { schema });
  }

  private static iso(value: Date | string): string {
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  }

  private mapProject(row: typeof schema.projects.$inferSelect): Project {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? null,
      createdAt: NeonRepository.iso(row.createdAt),
      updatedAt: NeonRepository.iso(row.updatedAt),
    };
  }

  private mapTestCase(row: typeof schema.testCases.$inferSelect): TestCase {
    return {
      id: row.id,
      projectId: row.projectId,
      title: row.title,
      description: row.description ?? null,
      preconditions: row.preconditions ?? null,
      steps: row.steps,
      expectedResult: row.expectedResult,
      priority: row.priority as Priority,
      type: row.type as TestType,
      status: row.status as TestCaseStatus,
      createdAt: NeonRepository.iso(row.createdAt),
      updatedAt: NeonRepository.iso(row.updatedAt),
    };
  }

  private mapExecution(row: typeof schema.executions.$inferSelect): Execution {
    return {
      id: row.id,
      testCaseId: row.testCaseId,
      result: row.result as ExecutionResult,
      notes: row.notes ?? null,
      executedAt: NeonRepository.iso(row.executedAt),
    };
  }

  private mapBug(row: typeof schema.bugs.$inferSelect): Bug {
    return {
      id: row.id,
      projectId: row.projectId,
      testCaseId: row.testCaseId ?? null,
      title: row.title,
      description: row.description ?? null,
      stepsToReproduce: row.stepsToReproduce ?? null,
      expectedResult: row.expectedResult ?? null,
      actualResult: row.actualResult ?? null,
      severity: row.severity as Severity,
      priority: row.priority as Priority,
      status: row.status as BugStatus,
      createdAt: NeonRepository.iso(row.createdAt),
      updatedAt: NeonRepository.iso(row.updatedAt),
    };
  }

  // ----- Projects -----

  async listProjects(): Promise<Project[]> {
    const rows = await this.db.select().from(schema.projects);
    return rows.map((r) => this.mapProject(r));
  }

  async getProject(id: number): Promise<Project | null> {
    const rows = await this.db.select().from(schema.projects).where(eq(schema.projects.id, id));
    return rows[0] ? this.mapProject(rows[0]) : null;
  }

  async findProjectByName(name: string): Promise<Project | null> {
    const rows = await this.db
      .select()
      .from(schema.projects)
      .where(sql`lower(${schema.projects.name}) = ${name.trim().toLowerCase()}`);
    return rows[0] ? this.mapProject(rows[0]) : null;
  }

  async createProject(input: ProjectCreateInput): Promise<Project> {
    const rows = await this.db
      .insert(schema.projects)
      .values({ name: input.name, description: input.description ?? null })
      .returning();
    return this.mapProject(rows[0]);
  }

  async updateProject(id: number, input: ProjectCreateInput): Promise<Project | null> {
    const rows = await this.db
      .update(schema.projects)
      .set({ name: input.name, description: input.description ?? null, updatedAt: new Date() })
      .where(eq(schema.projects.id, id))
      .returning();
    return rows[0] ? this.mapProject(rows[0]) : null;
  }

  async deleteProject(id: number): Promise<boolean> {
    const rows = await this.db
      .delete(schema.projects)
      .where(eq(schema.projects.id, id))
      .returning({ id: schema.projects.id });
    return rows.length > 0;
  }

  // ----- Test cases -----

  async listTestCases(projectId?: number): Promise<TestCase[]> {
    const rows = projectId
      ? await this.db
          .select()
          .from(schema.testCases)
          .where(eq(schema.testCases.projectId, projectId))
      : await this.db.select().from(schema.testCases);
    return rows.map((r) => this.mapTestCase(r));
  }

  async getTestCase(id: number): Promise<TestCase | null> {
    const rows = await this.db
      .select()
      .from(schema.testCases)
      .where(eq(schema.testCases.id, id));
    return rows[0] ? this.mapTestCase(rows[0]) : null;
  }

  async findTestCaseByTitle(projectId: number, title: string): Promise<TestCase | null> {
    const rows = await this.db
      .select()
      .from(schema.testCases)
      .where(
        and(
          eq(schema.testCases.projectId, projectId),
          sql`lower(${schema.testCases.title}) = ${title.trim().toLowerCase()}`,
        ),
      );
    return rows[0] ? this.mapTestCase(rows[0]) : null;
  }

  async createTestCase(input: TestCaseCreateInput): Promise<TestCase> {
    const rows = await this.db
      .insert(schema.testCases)
      .values({
        projectId: input.projectId,
        title: input.title,
        description: input.description ?? null,
        preconditions: input.preconditions ?? null,
        steps: input.steps,
        expectedResult: input.expectedResult,
        priority: input.priority,
        type: input.type,
        status: input.status ?? 'Active',
      })
      .returning();
    return this.mapTestCase(rows[0]);
  }

  async updateTestCase(
    id: number,
    input: Omit<TestCaseCreateInput, 'projectId'>,
  ): Promise<TestCase | null> {
    const rows = await this.db
      .update(schema.testCases)
      .set({
        title: input.title,
        description: input.description ?? null,
        preconditions: input.preconditions ?? null,
        steps: input.steps,
        expectedResult: input.expectedResult,
        priority: input.priority,
        type: input.type,
        status: input.status ?? 'Active',
        updatedAt: new Date(),
      })
      .where(eq(schema.testCases.id, id))
      .returning();
    return rows[0] ? this.mapTestCase(rows[0]) : null;
  }

  async deleteTestCase(id: number): Promise<boolean> {
    const rows = await this.db
      .delete(schema.testCases)
      .where(eq(schema.testCases.id, id))
      .returning({ id: schema.testCases.id });
    return rows.length > 0;
  }

  // ----- Executions -----

  async listExecutions(testCaseId?: number): Promise<Execution[]> {
    const rows = testCaseId
      ? await this.db
          .select()
          .from(schema.executions)
          .where(eq(schema.executions.testCaseId, testCaseId))
          .orderBy(desc(schema.executions.executedAt))
      : await this.db
          .select()
          .from(schema.executions)
          .orderBy(desc(schema.executions.executedAt));
    return rows.map((r) => this.mapExecution(r));
  }

  async createExecution(input: ExecutionCreateInput): Promise<Execution> {
    const rows = await this.db
      .insert(schema.executions)
      .values({
        testCaseId: input.testCaseId,
        result: input.result,
        notes: input.notes ?? null,
      })
      .returning();
    return this.mapExecution(rows[0]);
  }

  // ----- Bugs -----

  async listBugs(projectId?: number): Promise<Bug[]> {
    const rows = projectId
      ? await this.db.select().from(schema.bugs).where(eq(schema.bugs.projectId, projectId))
      : await this.db.select().from(schema.bugs);
    return rows.map((r) => this.mapBug(r));
  }

  async getBug(id: number): Promise<Bug | null> {
    const rows = await this.db.select().from(schema.bugs).where(eq(schema.bugs.id, id));
    return rows[0] ? this.mapBug(rows[0]) : null;
  }

  async createBug(input: BugCreateInput): Promise<Bug> {
    const rows = await this.db
      .insert(schema.bugs)
      .values({
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
      })
      .returning();
    return this.mapBug(rows[0]);
  }

  async updateBug(
    id: number,
    input: Omit<BugCreateInput, 'projectId'>,
  ): Promise<Bug | null> {
    const rows = await this.db
      .update(schema.bugs)
      .set({
        testCaseId: input.testCaseId ?? null,
        title: input.title,
        description: input.description ?? null,
        stepsToReproduce: input.stepsToReproduce ?? null,
        expectedResult: input.expectedResult ?? null,
        actualResult: input.actualResult ?? null,
        severity: input.severity,
        priority: input.priority,
        status: input.status ?? 'Open',
        updatedAt: new Date(),
      })
      .where(eq(schema.bugs.id, id))
      .returning();
    return rows[0] ? this.mapBug(rows[0]) : null;
  }

  async deleteBug(id: number): Promise<boolean> {
    const rows = await this.db
      .delete(schema.bugs)
      .where(eq(schema.bugs.id, id))
      .returning({ id: schema.bugs.id });
    return rows.length > 0;
  }

  async reset(): Promise<void> {
    // Guardrail: never allow a destructive reset outside tests.
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('reset() is only available in the test environment');
    }
    await this.db.delete(schema.bugs);
    await this.db.delete(schema.executions);
    await this.db.delete(schema.testCases);
    await this.db.delete(schema.projects);
  }
}
