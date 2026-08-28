import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

/**
 * Drizzle ORM schema for Neon Postgres.
 *
 * Cascade rules are expressed at the DB level so BR-001/BR-002 are enforced
 * even outside the application layer:
 *  - deleting a project cascades to its test cases and bugs
 *  - deleting a test case cascades to its executions and sets bug.test_case_id NULL
 */
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const testCases = pgTable('test_cases', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  preconditions: text('preconditions'),
  steps: text('steps').notNull(),
  expectedResult: text('expected_result').notNull(),
  priority: varchar('priority', { length: 20 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('Active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const executions = pgTable('executions', {
  id: serial('id').primaryKey(),
  testCaseId: integer('test_case_id')
    .notNull()
    .references(() => testCases.id, { onDelete: 'cascade' }),
  result: varchar('result', { length: 10 }).notNull(),
  notes: text('notes'),
  executedAt: timestamp('executed_at', { withTimezone: true }).notNull().defaultNow(),
});

export const bugs = pgTable('bugs', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  testCaseId: integer('test_case_id').references(() => testCases.id, {
    onDelete: 'set null',
  }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  stepsToReproduce: text('steps_to_reproduce'),
  expectedResult: text('expected_result'),
  actualResult: text('actual_result'),
  severity: varchar('severity', { length: 20 }).notNull(),
  priority: varchar('priority', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('Open'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
