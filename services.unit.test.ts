import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRepository } from '../repository/memory-repository.js';
import { createServices, type Services } from './container.js';
import { AppError } from './errors.js';

/**
 * Unit tests for the service layer business rules, using the in-memory
 * repository. Covers uniqueness (BR-004/BR-005), existence (404s), and the
 * cascade rules (BR-001/BR-002).
 */

let repo: MemoryRepository;
let services: Services;

beforeEach(async () => {
  repo = new MemoryRepository();
  await repo.reset();
  services = createServices(repo);
});

const validTestCase = (projectId: number, title = 'Verify login') => ({
  projectId,
  title,
  steps: '1. open\n2. login',
  expectedResult: 'dashboard',
  priority: 'High' as const,
  type: 'Functional' as const,
});

describe('ProjectService', () => {
  it('creates a project', async () => {
    const project = await services.projects.create({ name: 'Alpha' });
    expect(project.id).toBeGreaterThan(0);
    expect(project.name).toBe('Alpha');
  });

  it('rejects a duplicate name, case-insensitive (BR-004, TC-PM-007)', async () => {
    await services.projects.create({ name: 'Mobile App' });
    await expect(services.projects.create({ name: 'mobile app' })).rejects.toMatchObject({
      status: 409,
    });
  });

  it('allows renaming a project to its own current name', async () => {
    const project = await services.projects.create({ name: 'Alpha' });
    await expect(
      services.projects.update(project.id, { name: 'Alpha', description: 'updated' }),
    ).resolves.toMatchObject({ description: 'updated' });
  });

  it('throws 404 when getting a non-existent project (TC-API-001)', async () => {
    await expect(services.projects.get(999)).rejects.toBeInstanceOf(AppError);
    await expect(services.projects.get(999)).rejects.toMatchObject({ status: 404 });
  });

  it('cascades delete to test cases, executions, and bugs (BR-001, TC-PM-009)', async () => {
    const project = await services.projects.create({ name: 'Cascade' });
    const tc = await services.testCases.create(validTestCase(project.id));
    await services.executions.create({ testCaseId: tc.id, result: 'Pass' });
    await services.bugs.create({
      projectId: project.id,
      title: 'bug',
      severity: 'High',
      priority: 'High',
    });

    await services.projects.remove(project.id);

    expect(await repo.listTestCases(project.id)).toHaveLength(0);
    expect(await repo.listExecutions(tc.id)).toHaveLength(0);
    expect(await repo.listBugs(project.id)).toHaveLength(0);
  });
});

describe('TestCaseService', () => {
  it('rejects creating a test case for a non-existent project', async () => {
    await expect(services.testCases.create(validTestCase(999))).rejects.toMatchObject({
      status: 404,
    });
  });

  it('rejects duplicate title within the same project (BR-005, TC-TC-005)', async () => {
    const project = await services.projects.create({ name: 'P' });
    await services.testCases.create(validTestCase(project.id, 'Verify login'));
    await expect(
      services.testCases.create(validTestCase(project.id, 'verify login')),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('allows the same title in different projects (TC-TC-006)', async () => {
    const a = await services.projects.create({ name: 'A' });
    const b = await services.projects.create({ name: 'B' });
    await services.testCases.create(validTestCase(a.id, 'Verify login'));
    await expect(
      services.testCases.create(validTestCase(b.id, 'Verify login')),
    ).resolves.toBeTruthy();
  });
});

describe('ExecutionService', () => {
  it('rejects execution for a non-existent test case (TC-EX-008)', async () => {
    await expect(
      services.executions.create({ testCaseId: 999, result: 'Pass' }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('records an execution with a timestamp', async () => {
    const project = await services.projects.create({ name: 'P' });
    const tc = await services.testCases.create(validTestCase(project.id));
    const execution = await services.executions.create({ testCaseId: tc.id, result: 'Pass' });
    expect(execution.result).toBe('Pass');
    expect(execution.executedAt).toBeTruthy();
  });
});

describe('BugService', () => {
  it('unlinks bugs (does not delete) when the test case is deleted (BR-002, TC-TC-010)', async () => {
    const project = await services.projects.create({ name: 'P' });
    const tc = await services.testCases.create(validTestCase(project.id));
    const bug = await services.bugs.create({
      projectId: project.id,
      testCaseId: tc.id,
      title: 'linked bug',
      severity: 'High',
      priority: 'High',
    });

    await services.testCases.remove(tc.id);

    const stillThere = await services.bugs.get(bug.id);
    expect(stillThere.testCaseId).toBeNull();
  });

  it('progresses a bug through its status lifecycle (TC-BG-004)', async () => {
    const project = await services.projects.create({ name: 'P' });
    const bug = await services.bugs.create({
      projectId: project.id,
      title: 'lifecycle',
      severity: 'High',
      priority: 'High',
    });
    for (const status of ['In Progress', 'Fixed', 'Closed'] as const) {
      const updated = await services.bugs.update(bug.id, {
        title: 'lifecycle',
        severity: 'High',
        priority: 'High',
        status,
      });
      expect(updated.status).toBe(status);
    }
  });
});
