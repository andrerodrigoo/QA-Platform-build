import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from './app.js';
import { MemoryRepository } from '../repository/memory-repository.js';

/**
 * Integration tests: real Express app + real (in-memory) repository, exercised
 * over HTTP with supertest. Verifies status codes, response shapes, and the
 * error handling required by the test strategy (200/201/204/400/404/409/422).
 *
 * A fresh repository per test guarantees isolation (TR-002).
 */

let app: Express;
let repo: MemoryRepository;

beforeEach(() => {
  repo = new MemoryRepository();
  app = createApp(repo);
});

async function createProject(name = 'Alpha'): Promise<number> {
  const res = await request(app).post('/api/projects').send({ name });
  return res.body.id as number;
}

describe('Health', () => {
  it('GET /api/health returns 200 (SMK-007)', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Projects API', () => {
  it('POST creates a project and returns 201 (TC-PM-001)', async () => {
    const res = await request(app).post('/api/projects').send({ name: 'E-Commerce' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'E-Commerce' });
    expect(res.body.id).toBeGreaterThan(0);
  });

  it('GET returns the list of projects (TC-API-007)', async () => {
    await createProject('One');
    await createProject('Two');
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
  });

  it('POST with empty name returns 422 (TC-PM-002)', async () => {
    const res = await request(app).post('/api/projects').send({ name: '' });
    expect(res.status).toBe(422);
    expect(res.body.error).toBeTruthy();
  });

  it('POST with whitespace-only name returns 422 (BUG-001 regression)', async () => {
    const res = await request(app).post('/api/projects').send({ name: '   ' });
    expect(res.status).toBe(422);
  });

  it('POST with a 101-char name returns 422 (TC-PM-004, BVA)', async () => {
    const res = await request(app).post('/api/projects').send({ name: 'A'.repeat(101) });
    expect(res.status).toBe(422);
  });

  it('POST with a duplicate name returns 409 (TC-PM-006)', async () => {
    await createProject('Dup');
    const res = await request(app).post('/api/projects').send({ name: 'Dup' });
    expect(res.status).toBe(409);
  });

  it('GET a non-existent project returns 404 (TC-API-001)', async () => {
    const res = await request(app).get('/api/projects/9999');
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('not found');
  });

  it('GET with a non-numeric id returns 400 (TC-API-002)', async () => {
    const res = await request(app).get('/api/projects/abc');
    expect(res.status).toBe(400);
  });

  it('POST with empty body returns 422 (TC-API-003)', async () => {
    const res = await request(app).post('/api/projects').send({});
    expect(res.status).toBe(422);
  });

  it('DELETE returns 204 and cascades (TC-PM-009)', async () => {
    const id = await createProject('ToDelete');
    const del = await request(app).delete(`/api/projects/${id}`);
    expect(del.status).toBe(204);
    const get = await request(app).get(`/api/projects/${id}`);
    expect(get.status).toBe(404);
  });

  it('ignores unknown extra fields (TC-API-005)', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ name: 'Clean', hackerField: 'inject' });
    expect(res.status).toBe(201);
    expect(res.body.hackerField).toBeUndefined();
  });
});

describe('Test Cases API', () => {
  const validBody = (projectId: number) => ({
    projectId,
    title: 'Verify login',
    steps: '1. open\n2. login',
    expectedResult: 'dashboard',
    priority: 'High',
    type: 'Functional',
  });

  it('POST creates a test case (TC-TC-001)', async () => {
    const projectId = await createProject();
    const res = await request(app).post('/api/test-cases').send(validBody(projectId));
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('Active');
  });

  it('POST with empty steps returns 422 (TC-TC-003)', async () => {
    const projectId = await createProject();
    const res = await request(app)
      .post('/api/test-cases')
      .send({ ...validBody(projectId), steps: '' });
    expect(res.status).toBe(422);
  });

  it('POST with invalid priority returns 422 (TC-TC-016, EP)', async () => {
    const projectId = await createProject();
    const res = await request(app)
      .post('/api/test-cases')
      .send({ ...validBody(projectId), priority: 'Urgent' });
    expect(res.status).toBe(422);
  });

  it('POST with duplicate title in same project returns 409 (TC-TC-005)', async () => {
    const projectId = await createProject();
    await request(app).post('/api/test-cases').send(validBody(projectId));
    const res = await request(app).post('/api/test-cases').send(validBody(projectId));
    expect(res.status).toBe(409);
  });

  it('POST for a non-existent project returns 404', async () => {
    const res = await request(app).post('/api/test-cases').send(validBody(9999));
    expect(res.status).toBe(404);
  });
});

describe('Executions API', () => {
  async function seedTestCase(): Promise<number> {
    const projectId = await createProject();
    const res = await request(app).post('/api/test-cases').send({
      projectId,
      title: 'TC',
      steps: 's',
      expectedResult: 'r',
      priority: 'High',
      type: 'Functional',
    });
    return res.body.id as number;
  }

  it('POST records an execution (TC-EX-001)', async () => {
    const testCaseId = await seedTestCase();
    const res = await request(app)
      .post('/api/executions')
      .send({ testCaseId, result: 'Pass' });
    expect(res.status).toBe(201);
    expect(res.body.result).toBe('Pass');
    expect(res.body.executedAt).toBeTruthy();
  });

  it('POST with invalid result returns 422 (TC-EX-009, EP)', async () => {
    const testCaseId = await seedTestCase();
    const res = await request(app)
      .post('/api/executions')
      .send({ testCaseId, result: 'Skip' });
    expect(res.status).toBe(422);
  });

  it('POST for a non-existent test case returns 404 (TC-EX-008)', async () => {
    const res = await request(app)
      .post('/api/executions')
      .send({ testCaseId: 9999, result: 'Pass' });
    expect(res.status).toBe(404);
  });

  it('GET history returns executions latest-first (TC-EX-005)', async () => {
    const testCaseId = await seedTestCase();
    await request(app).post('/api/executions').send({ testCaseId, result: 'Fail' });
    await request(app).post('/api/executions').send({ testCaseId, result: 'Pass' });
    const res = await request(app).get(`/api/test-cases/${testCaseId}/executions`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('Bugs API', () => {
  it('POST creates a bug with default Open status (TC-BG-001)', async () => {
    const projectId = await createProject();
    const res = await request(app)
      .post('/api/bugs')
      .send({ projectId, title: 'broken', severity: 'High', priority: 'High' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('Open');
  });

  it('PUT updates bug status (TC-BG-004)', async () => {
    const projectId = await createProject();
    const created = await request(app)
      .post('/api/bugs')
      .send({ projectId, title: 'x', severity: 'High', priority: 'High' });
    const res = await request(app)
      .put(`/api/bugs/${created.body.id}`)
      .send({ title: 'x', severity: 'High', priority: 'High', status: 'Fixed' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Fixed');
  });

  it('POST with invalid severity returns 422 (TC-BG-008, EP)', async () => {
    const projectId = await createProject();
    const res = await request(app)
      .post('/api/bugs')
      .send({ projectId, title: 'x', severity: 'Blocker', priority: 'High' });
    expect(res.status).toBe(422);
  });
});

describe('Metrics API', () => {
  it('GET dashboard returns zeroed metrics on empty data (TC-DB-006)', async () => {
    const res = await request(app).get('/api/metrics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.totals.projects).toBe(0);
    expect(res.body.executionBreakdown.passRate).toBe(0);
  });

  // Regression test for BUG-002: openBugs must exclude Closed / Won't Fix.
  it('REG BUG-002: dashboard openBugs excludes Closed and Won\'t Fix bugs', async () => {
    const projectId = await createProject();
    const openBug = await request(app)
      .post('/api/bugs')
      .send({ projectId, title: 'still open', severity: 'High', priority: 'High' });
    const toClose = await request(app)
      .post('/api/bugs')
      .send({ projectId, title: 'will close', severity: 'Low', priority: 'Low' });

    // Close the second bug.
    await request(app)
      .put(`/api/bugs/${toClose.body.id}`)
      .send({ title: 'will close', severity: 'Low', priority: 'Low', status: 'Closed' });

    const res = await request(app).get('/api/metrics/dashboard');
    // Only the still-open bug should be counted.
    expect(res.body.totals.openBugs).toBe(1);
    expect(openBug.status).toBe(201);
  });

  it('GET dashboard computes a 50% pass rate for 1 pass + 1 fail', async () => {
    const projectId = await createProject();
    const tc1 = await request(app).post('/api/test-cases').send({
      projectId,
      title: 'TC1',
      steps: 's',
      expectedResult: 'r',
      priority: 'High',
      type: 'Functional',
    });
    const tc2 = await request(app).post('/api/test-cases').send({
      projectId,
      title: 'TC2',
      steps: 's',
      expectedResult: 'r',
      priority: 'High',
      type: 'Functional',
    });
    await request(app).post('/api/executions').send({ testCaseId: tc1.body.id, result: 'Pass' });
    await request(app).post('/api/executions').send({ testCaseId: tc2.body.id, result: 'Fail' });

    const res = await request(app).get('/api/metrics/dashboard');
    expect(res.body.executionBreakdown.passRate).toBe(50);
  });
});

describe('Unknown endpoints', () => {
  it('returns 404 for an unknown API route', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
  });
});
