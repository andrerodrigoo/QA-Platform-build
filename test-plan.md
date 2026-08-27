# Test Plan
## QA Test Management Platform — v1.0.0

**Document Type:** Test Plan  
**Version:** 1.0.0  
**Date:** 2026-08-27  
**Status:** Active  
**Author:** QA Team

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Test Objectives](#2-test-objectives)
3. [Test Scope](#3-test-scope)
4. [Test Schedule](#4-test-schedule)
5. [Resources](#5-resources)
6. [Test Approach](#6-test-approach)
7. [Test Deliverables](#7-test-deliverables)
8. [Test Data](#8-test-data)
9. [Environment Setup](#9-environment-setup)
10. [Risk Management](#10-risk-management)
11. [Metrics and Reporting](#11-metrics-and-reporting)
12. [Approval Criteria](#12-approval-criteria)

---

## 1. Introduction

### 1.1 Purpose
This Test Plan describes the complete testing approach for the **QA Test Management Platform v1.0.0**. It covers all testing activities from requirement analysis through deployment verification, including unit tests, integration tests, end-to-end tests, exploratory testing, and regression testing.

### 1.2 Project Summary
The QA Test Management Platform is a full-stack web application enabling QA teams to manage projects, test cases, test executions, and bug reports through a REST API and React frontend.

### 1.3 References
- [requirements.md](./requirements.md) — Functional and non-functional requirements
- [test-strategy.md](./test-strategy.md) — Overall test strategy
- [test-cases.md](./test-cases.md) — Detailed test cases

---

## 2. Test Objectives

1. **Verify** all functional requirements (FR-001 through FR-037) are implemented correctly
2. **Validate** all non-functional requirements (NFR-001 through NFR-014) are met
3. **Confirm** business rules (BR-001 through BR-011) are enforced
4. **Ensure** the application handles edge cases, negative scenarios, and invalid inputs gracefully
5. **Demonstrate** a complete professional QA workflow for portfolio purposes
6. **Establish** an automated regression safety net that catches regressions on every CI run

---

## 3. Test Scope

### 3.1 In Scope

| Module | Testing Types |
|--------|--------------|
| Project CRUD | Unit, Integration, E2E, Negative, BVA |
| Test Case CRUD | Unit, Integration, E2E, Negative, BVA |
| Test Execution | Unit, Integration, E2E, Negative |
| Bug Management | Unit, Integration, E2E, Negative, BVA |
| Dashboard/Metrics | Unit, Integration, E2E |
| Search & Filter | Integration, E2E, Negative |
| API Validation | Integration, Negative, EP |
| Error Handling | Unit, Integration, E2E |
| Cascade Operations | Integration, E2E |
| Data Persistence | Integration |

### 3.2 Out of Scope
- User authentication and authorization
- Multi-tenant data isolation
- Performance/load testing at scale
- Security penetration testing
- Browser compatibility beyond Chrome/Firefox/Edge latest

---

## 4. Test Schedule

| Phase | Activity | Duration |
|-------|---------|---------|
| Phase 1 | Requirements analysis & documentation | Day 1 |
| Phase 2 | Test strategy & test cases | Day 1 |
| Phase 3 | Architecture decisions | Day 1 |
| Phase 4 | Project setup & scaffolding | Day 2 |
| Phase 5 | Core implementation | Days 2-3 |
| Phase 6 | Unit tests | Concurrent with Phase 5 |
| Phase 6 | Integration tests | Day 3-4 |
| Phase 6 | E2E tests | Day 4 |
| Phase 7 | Exploratory testing | Day 4 |
| Phase 8 | Bug hunting & documentation | Day 4-5 |
| Phase 9 | Bug fixes + regression tests | Day 5 |
| Phase 10 | CI/CD & Quality Gate setup | Day 5 |
| Phase 11 | Documentation | Day 5-6 |
| Phase 12 | Portfolio preparation | Day 6 |

---

## 5. Resources

### 5.1 Tools

| Tool | Purpose | Location |
|------|---------|---------|
| Vitest | Unit & integration testing | `package.json` test scripts |
| Playwright | E2E testing | `e2e/` directory |
| ESLint | Static analysis | `.eslintrc` |
| Prettier | Formatting | `.prettierrc` |
| TypeScript | Type safety | `tsconfig.json` |
| GitHub Actions | CI/CD | `.github/workflows/` |

### 5.2 Environments

| Environment | URL | Purpose |
|------------|-----|---------|
| Local Dev | http://localhost:5173 | Development & manual testing |
| Local API | http://localhost:3001 | API testing |
| CI | ephemeral | Automated pipeline |

---

## 6. Test Approach

### 6.1 Phase-by-Phase Approach

#### Unit Testing Approach
- Test business logic in isolation (mocked dependencies)
- Use describe/it blocks with clear naming: `describe("when creating a project")`
- Follow Arrange-Act-Assert pattern
- Target: ≥ 70% coverage on `src/` business logic

#### Integration Testing Approach
- Spin up test server with in-memory SQLite database
- Reset database between test suites using `beforeEach`
- Test full HTTP request → DB → response cycle
- Cover: 200/201 success cases, 400/404/422 error cases

#### E2E Testing Approach
- Use Playwright with Page Object Model (POM) pattern
- Test complete user journeys (not individual clicks)
- Include smoke tests tagged `@smoke`
- Include negative scenarios (invalid data, empty states)
- Run against locally started application

#### Exploratory Testing Approach
- Use charter-based exploration: define a CHARTER (goal), TIME-BOX (30 min), and NOTES
- Document all findings (bugs, UX issues, questions)
- Follow up with automated test cases for any bugs found

### 6.2 Test Case Priority Execution Order
1. 🔴 Critical — Execute first; failures block progression
2. 🟠 High — Execute after Critical passes
3. 🟡 Medium — Execute in regression runs
4. 🟢 Low — Execute when time permits

### 6.3 Bug Handling During Testing
1. New bug found → fill bug report template immediately
2. Assign severity and priority
3. If Critical/High → block current test phase, escalate
4. If Medium/Low → log and continue testing
5. After fix → write regression test → re-run affected suite

---

## 7. Test Deliverables

| Deliverable | Description | Location |
|------------|-------------|---------|
| `requirements.md` | Full requirements specification | `docs/qa/` |
| `test-strategy.md` | Testing approach and strategy | `docs/qa/` |
| `test-cases.md` | All test cases (positive + negative) | `docs/qa/` |
| `test-plan.md` | This document | `docs/qa/` |
| `bug-report-template.md` | Standard bug report format | `docs/qa/` |
| `learning-log.md` | QA learning documentation | `docs/qa/` |
| Unit test files | `*.test.ts` co-located or in `__tests__/` | `src/` |
| Integration test files | API endpoint tests | `src/__tests__/integration/` |
| E2E test files | Playwright test suites | `e2e/` |
| CI pipeline | GitHub Actions workflow | `.github/workflows/` |
| Coverage report | Vitest coverage output | `coverage/` |

---

## 8. Test Data

### 8.1 Test Data Strategy
- **Unit tests:** Inline data (no external files)
- **Integration tests:** Factory functions that create DB records
- **E2E tests:** Playwright fixtures that seed the database before tests
- **Exploratory:** Manual data entry during sessions

### 8.2 Test Data Requirements

#### Minimum Dataset for Metrics Testing
```
Projects:      3
Test Cases:    10 (across 3 projects)
Executions:    10 (mix of Pass/Fail/Blocked)
Bugs:          7 (mix of severities and statuses)
```

#### Edge Case Data
```
- Project name with exactly 100 characters
- Test case title with exactly 200 characters
- Unicode characters in text fields (emojis, accents)
- Very long description (500 chars)
- Empty optional fields (description = null)
```

### 8.3 Data Isolation
- Each test suite uses a fresh database state
- Test data is never shared across independent test files
- Seed functions are idempotent

---

## 9. Environment Setup

### 9.1 Prerequisites
```bash
Node.js >= 20.x
npm >= 10.x
```

### 9.2 Local Setup
```bash
cd qa-platform
npm install
npm run db:migrate   # Initialize database
npm run dev          # Start both frontend and backend
```

### 9.3 Running Tests
```bash
npm test             # All tests
npm run test:unit    # Unit tests only
npm run test:api     # Integration/API tests only
npm run test:e2e     # E2E tests (requires running app)
npm run lint         # ESLint check
npm run build        # Production build check
```

### 9.4 CI Environment
- Runner: ubuntu-latest
- Node: 20.x
- Database: SQLite in-memory (test.db)
- Steps: install → lint → test:unit → test:api → build → test:e2e

---

## 10. Risk Management

### 10.1 Testing Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Flaky E2E tests | High | Medium | Use Playwright auto-wait; avoid `waitForTimeout` |
| Test database pollution | High | Medium | Reset DB in `beforeEach`; use transactions |
| False positives from race conditions | Medium | Low | Deterministic async handling |
| Coverage gaps in edge cases | Medium | Medium | Explicit test case review against requirements |
| E2E tests too slow for CI | Medium | Low | Run E2E in parallel; tag-based selective runs |

### 10.2 Contingency Plans
- If E2E are too slow: separate CI job, run on schedule not every PR
- If integration tests are flaky: add retry logic (max 2 retries)
- If coverage drops: add coverage threshold enforcement in CI

---

## 11. Metrics and Reporting

### 11.1 Quality Metrics to Track

| Metric | Target | Tool |
|--------|--------|------|
| Unit test coverage | ≥ 70% | Vitest coverage |
| All Critical test cases passing | 100% | Manual tracking |
| All High test cases passing | 100% | Manual tracking |
| Zero Critical/High open bugs | 100% before release | Bug tracker (platform itself) |
| ESLint errors | 0 | ESLint |
| TypeScript errors | 0 | tsc |
| CI build | Green | GitHub Actions |

### 11.2 Test Execution Tracking

Track in `learning-log.md`:
- Date of test run
- Tests passed / failed / skipped
- New bugs found
- Bugs closed
- Coverage percentage

---

## 12. Approval Criteria

### 12.1 Release Criteria (Quality Gate)
The application is ready for portfolio/public release when ALL of the following are met:

- [ ] All 🔴 Critical test cases pass
- [ ] All 🟠 High test cases pass
- [ ] Zero Critical or High open bugs
- [ ] Unit test coverage ≥ 70% on business logic
- [ ] All integration tests pass
- [ ] All E2E smoke tests pass
- [ ] ESLint: 0 errors
- [ ] TypeScript: 0 errors (strict mode)
- [ ] Production build succeeds
- [ ] CI pipeline is green
- [ ] README is complete and professional
- [ ] All QA documentation is present and up to date

### 12.2 Regression Approval Criteria
After any bug fix or feature change:

- [ ] New regression test passes (green)
- [ ] Previously passing tests still pass
- [ ] No new ESLint errors introduced
- [ ] No new TypeScript errors introduced
