import { z } from 'zod';
import {
  PRIORITIES,
  SEVERITIES,
  TEST_TYPES,
  TEST_CASE_STATUSES,
  EXECUTION_RESULTS,
  BUG_STATUSES,
  LIMITS,
} from '../domain/enums.js';

/**
 * Zod validation schemas — the server-side enforcement of every business rule
 * (see .kiro/steering/qa-rules.md validation table).
 *
 * Names are trimmed before length/emptiness checks so whitespace-only values
 * are rejected (regression guard for the BUG-001 class of defects).
 */

const requiredTrimmedString = (max: number, field: string) =>
  z
    .string({ required_error: `${field} is required` })
    .trim()
    .min(1, `${field} is required`)
    .max(max, `${field} must be at most ${max} characters`);

const optionalString = (max: number, field: string) =>
  z
    .string()
    .trim()
    .max(max, `${field} must be at most ${max} characters`)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : (v ?? null)));

export const projectCreateSchema = z.object({
  name: requiredTrimmedString(LIMITS.PROJECT_NAME_MAX, 'Project name'),
  description: optionalString(LIMITS.PROJECT_DESCRIPTION_MAX, 'Description'),
});

export const projectUpdateSchema = projectCreateSchema;

export const testCaseCreateSchema = z.object({
  projectId: z.number().int().positive('projectId must be a positive integer'),
  title: requiredTrimmedString(LIMITS.TEST_CASE_TITLE_MAX, 'Title'),
  description: optionalString(2000, 'Description'),
  preconditions: optionalString(2000, 'Preconditions'),
  steps: requiredTrimmedString(5000, 'Steps'),
  expectedResult: requiredTrimmedString(2000, 'Expected result'),
  priority: z.enum(PRIORITIES, { errorMap: () => ({ message: 'Invalid priority' }) }),
  type: z.enum(TEST_TYPES, { errorMap: () => ({ message: 'Invalid test type' }) }),
  status: z
    .enum(TEST_CASE_STATUSES, { errorMap: () => ({ message: 'Invalid status' }) })
    .default('Active'),
});

export const testCaseUpdateSchema = testCaseCreateSchema.omit({ projectId: true });

export const executionCreateSchema = z.object({
  testCaseId: z.number().int().positive('testCaseId must be a positive integer'),
  result: z.enum(EXECUTION_RESULTS, {
    errorMap: () => ({ message: 'Result is required and must be Pass, Fail, or Blocked' }),
  }),
  notes: optionalString(2000, 'Notes'),
});

export const bugCreateSchema = z.object({
  projectId: z.number().int().positive('projectId must be a positive integer'),
  testCaseId: z.number().int().positive().optional().nullable(),
  title: requiredTrimmedString(LIMITS.BUG_TITLE_MAX, 'Bug title'),
  description: optionalString(2000, 'Description'),
  stepsToReproduce: optionalString(5000, 'Steps to reproduce'),
  expectedResult: optionalString(2000, 'Expected result'),
  actualResult: optionalString(2000, 'Actual result'),
  severity: z.enum(SEVERITIES, { errorMap: () => ({ message: 'Invalid severity' }) }),
  priority: z.enum(PRIORITIES, { errorMap: () => ({ message: 'Invalid priority' }) }),
  status: z
    .enum(BUG_STATUSES, { errorMap: () => ({ message: 'Invalid bug status' }) })
    .default('Open'),
});

export const bugUpdateSchema = bugCreateSchema.omit({ projectId: true });

/** Parse and validate a numeric route param (e.g. /projects/:id). */
export const idParamSchema = z.coerce
  .number({ invalid_type_error: 'Invalid id' })
  .int('Invalid id')
  .positive('Invalid id');
