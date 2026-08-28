import { describe, it, expect } from 'vitest';
import {
  projectCreateSchema,
  testCaseCreateSchema,
  executionCreateSchema,
  bugCreateSchema,
} from './schemas.js';

/**
 * Unit tests for Zod validators — the server-side enforcement of the
 * validation rules in .kiro/steering/qa-rules.md. These cover the negative,
 * boundary (BVA), and equivalence-partition (EP) test cases from test-cases.md.
 */

describe('projectCreateSchema', () => {
  it('accepts a valid project (TC-PM-001)', () => {
    const result = projectCreateSchema.safeParse({ name: 'E-Commerce', description: 'x' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty name (TC-PM-002)', () => {
    const result = projectCreateSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a whitespace-only name (regression guard for BUG-001 class)', () => {
    const result = projectCreateSchema.safeParse({ name: '   ' });
    expect(result.success).toBe(false);
  });

  it('accepts a name at the 100-char boundary (TC-PM-003)', () => {
    const result = projectCreateSchema.safeParse({ name: 'A'.repeat(100) });
    expect(result.success).toBe(true);
  });

  it('rejects a name over 100 chars (TC-PM-004, BVA)', () => {
    const result = projectCreateSchema.safeParse({ name: 'A'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('accepts a single-char name (TC-PM-005, BVA lower bound)', () => {
    const result = projectCreateSchema.safeParse({ name: 'X' });
    expect(result.success).toBe(true);
  });

  it('trims the name so surrounding whitespace does not count toward length', () => {
    const result = projectCreateSchema.safeParse({ name: '  Valid Name  ' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Valid Name');
  });

  it('normalizes an empty description to null', () => {
    const result = projectCreateSchema.safeParse({ name: 'X', description: '' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.description).toBeNull();
  });
});

describe('testCaseCreateSchema', () => {
  const valid = {
    projectId: 1,
    title: 'Verify login',
    steps: '1. open\n2. login',
    expectedResult: 'dashboard shown',
    priority: 'High',
    type: 'Functional',
  };

  it('accepts a valid test case (TC-TC-001)', () => {
    expect(testCaseCreateSchema.safeParse(valid).success).toBe(true);
  });

  it('defaults status to Active', () => {
    const result = testCaseCreateSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe('Active');
  });

  it('rejects an empty title (TC-TC-002)', () => {
    expect(testCaseCreateSchema.safeParse({ ...valid, title: '' }).success).toBe(false);
  });

  it('rejects empty steps (TC-TC-003)', () => {
    expect(testCaseCreateSchema.safeParse({ ...valid, steps: '' }).success).toBe(false);
  });

  it('rejects an empty expected result (TC-TC-004)', () => {
    expect(testCaseCreateSchema.safeParse({ ...valid, expectedResult: '' }).success).toBe(false);
  });

  it('accepts a title at the 200-char boundary (TC-TC-007, BVA)', () => {
    expect(testCaseCreateSchema.safeParse({ ...valid, title: 'T'.repeat(200) }).success).toBe(true);
  });

  it('rejects a title over 200 chars (TC-TC-008, BVA)', () => {
    expect(testCaseCreateSchema.safeParse({ ...valid, title: 'T'.repeat(201) }).success).toBe(
      false,
    );
  });

  it('rejects an invalid priority (TC-TC-016, EP)', () => {
    expect(testCaseCreateSchema.safeParse({ ...valid, priority: 'Urgent' }).success).toBe(false);
  });

  it('rejects an invalid type (EP)', () => {
    expect(testCaseCreateSchema.safeParse({ ...valid, type: 'Chaos' }).success).toBe(false);
  });

  it('rejects a non-positive projectId', () => {
    expect(testCaseCreateSchema.safeParse({ ...valid, projectId: 0 }).success).toBe(false);
  });
});

describe('executionCreateSchema', () => {
  it('accepts a valid execution (TC-EX-001)', () => {
    expect(
      executionCreateSchema.safeParse({ testCaseId: 1, result: 'Pass' }).success,
    ).toBe(true);
  });

  it('rejects a missing result (TC-EX-004)', () => {
    expect(executionCreateSchema.safeParse({ testCaseId: 1 }).success).toBe(false);
  });

  it('rejects an invalid result value (TC-EX-009, EP)', () => {
    expect(
      executionCreateSchema.safeParse({ testCaseId: 1, result: 'Skip' }).success,
    ).toBe(false);
  });
});

describe('bugCreateSchema', () => {
  const valid = {
    projectId: 1,
    title: 'Login broken',
    severity: 'High',
    priority: 'High',
  };

  it('accepts a valid bug (TC-BG-001)', () => {
    expect(bugCreateSchema.safeParse(valid).success).toBe(true);
  });

  it('defaults status to Open', () => {
    const result = bugCreateSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe('Open');
  });

  it('rejects an empty title (TC-BG-003)', () => {
    expect(bugCreateSchema.safeParse({ ...valid, title: '' }).success).toBe(false);
  });

  it('rejects an invalid severity (TC-BG-008, EP)', () => {
    expect(bugCreateSchema.safeParse({ ...valid, severity: 'Blocker' }).success).toBe(false);
  });

  it('rejects a title over 200 chars (TC-BG-010, BVA)', () => {
    expect(bugCreateSchema.safeParse({ ...valid, title: 'T'.repeat(201) }).success).toBe(false);
  });
});
