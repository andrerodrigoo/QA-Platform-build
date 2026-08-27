# Test Strategy
## QA Test Management Platform

**Version:** 1.0.0  
**Date:** 2026-08-27  
**Status:** Approved

---

## Table of Contents

1. [Objective](#1-objective)
2. [Scope](#2-scope)
3. [Out of Scope](#3-out-of-scope)
4. [Test Levels](#4-test-levels)
5. [Test Types](#5-test-types)
6. [Automation Strategy](#6-automation-strategy)
7. [Test Environments](#7-test-environments)
8. [Risks](#8-risks)
9. [Entry Criteria](#9-entry-criteria)
10. [Exit Criteria](#10-exit-criteria)
11. [Regression Strategy](#11-regression-strategy)
12. [Smoke Testing Strategy](#12-smoke-testing-strategy)
13. [Tools](#13-tools)

---

## 1. Objective

Define the approach, techniques, levels, and types of testing to be applied to the QA Test Management Platform, ensuring all functional requirements are validated, non-functional requirements are met, and quality gates are enforced before any release.

This strategy also serves as a **learning reference** — each section maps to a real-world QA practice that will be demonstrated in this project.

---

## 2. Scope

The following areas are **in scope** for testing:

### Backend (REST API)
- All CRUD endpoints for: Projects, Test Cases, Executions, Bugs
- Business rule enforcement (uniqueness, cascading deletes, status transitions)
- Input validation and error handling (400, 404, 422, 500)
- Edge cases: empty payloads, null values, oversized inputs, invalid IDs
- Metrics calculation correctness

### Frontend (React)
- All user interactions: forms, navigation, filtering, search
- State management: loading states, error states, empty states
- UI validation (client-side) before API call
- Data display accuracy (metrics, lists, history)
- Responsiveness (mobile / tablet / desktop)

### Integration
- Frontend → API communication
- API → Database operations
- Error propagation from DB → API → UI

### End-to-End Flows
- Complete test lifecycle (project → test case → execution → bug)
- Metrics update after state changes
- Cascading deletes

---

## 3. Out of Scope

- Authentication and authorization (not implemented in v1.0)
- Multi-user/concurrent session management
- Email notifications
- File attachment upload
- Internationalization (i18n) beyond Portuguese/English
- Performance load testing (> 1000 concurrent users)
- Penetration testing / security auditing

---

## 4. Test Levels

### Level 1 — Unit Tests

**Goal:** Validate individual functions, business rules, and utility logic in isolation.

**Targets:**
- Business rule functions (uniqueness check, pass rate calculation, status transitions)
- Input validation functions
- Data transformation and formatting utilities
- API route handlers (mocked DB)

**Tool:** Vitest  
**Coverage Target:** ≥ 70% of business logic  
**Location:** `src/__tests__/unit/` and co-located `*.test.ts` files

### Level 2 — Integration Tests

**Goal:** Validate that multiple components work correctly together — API routes with real database operations.

**Targets:**
- API endpoints with a real (test) database
- CRUD operations with DB persistence
- Error handling across API + DB boundary
- Cascade operations (delete project → cascade)

**Tool:** Vitest + Supertest (or native fetch against test server)  
**Location:** `src/__tests__/integration/`

### Level 3 — End-to-End Tests

**Goal:** Simulate real user journeys through the complete application stack.

**Targets:**
- Full test lifecycle flow
- Dashboard metrics accuracy
- Bug creation from failed execution
- Search and filter functionality
- Edge cases: deleting linked entities, creating duplicates

**Tool:** Playwright  
**Location:** `e2e/`

---

## 5. Test Types

### Functional Testing
Verify each feature works according to requirements.  
Applied at: Unit, Integration, E2E levels.

### Negative Testing
Verify the system behaves correctly when given invalid, unexpected, or boundary inputs.  
Examples:
- Empty required fields
- Strings exceeding max length
- Non-existent IDs in URL params
- Invalid enum values
- Duplicate creation attempts

### Boundary Value Analysis (BVA)
Test values at and around the boundaries of acceptable ranges.

| Field | Min | Max | Boundary Cases |
|-------|-----|-----|----------------|
| Project name | 1 char | 100 chars | 0 chars (invalid), 1 char (valid), 100 chars (valid), 101 chars (invalid) |
| Test case title | 1 char | 200 chars | 0, 1, 200, 201 |
| Bug title | 1 char | 200 chars | 0, 1, 200, 201 |
| Project description | 0 chars | 500 chars | 0 (valid), 500 (valid), 501 (invalid) |

### Equivalence Partitioning (EP)

| Field | Valid Partition | Invalid Partition |
|-------|----------------|------------------|
| Priority | Low, Medium, High, Critical | "Urgent", "", null, 1 |
| Status | Open, In Progress, Fixed, Closed, Won't Fix | "Pending", "", null |
| Execution Result | Pass, Fail, Blocked | "Skip", "", null |

### Smoke Testing
Quick validation that critical paths work after a deployment or major change.  
See [Section 12](#12-smoke-testing-strategy).

### Regression Testing
Re-run affected tests after any bug fix or feature change.  
See [Section 11](#11-regression-strategy).

### Exploratory Testing
Structured but unscripted sessions to discover unexpected behaviors.  
Schedule: One session per feature area after initial implementation.  
Documentation: Charter → Observations → Bugs → Follow-up test cases.

### API Testing
Direct testing of REST endpoints using HTTP requests, independent of the frontend.  
Verifies: status codes, response body schema, error messages, edge cases.  
Tool: Vitest + node fetch / Supertest within integration tests.

---

## 6. Automation Strategy

### What to Automate

| Priority | Category | Reason |
|---------|---------|--------|
| 1 — Must | Business rule validations | Critical, run frequently, deterministic |
| 1 — Must | API endpoint contracts | Fast feedback, catches regressions |
| 1 — Must | Core E2E happy paths | High business value |
| 2 — Should | Edge cases and negative scenarios | Reduces manual regression burden |
| 2 — Should | Metrics calculations | Math-heavy, error-prone |
| 3 — Nice to Have | Visual regression | Polish, lower priority |

### What NOT to Automate
- One-time data setup scripts
- Highly exploratory flows (use manual exploratory testing)
- UI pixel-perfect comparisons (out of scope)

### Automation Pyramid

```
        /\
       /  \
      / E2E \      ← Few, high-value user journeys (Playwright)
     /--------\
    /Integration\  ← API + DB validation (Vitest + Supertest)
   /------------\
  /  Unit Tests  \ ← Many, fast, isolated (Vitest)
 /________________\
```

Target distribution: 70% Unit | 20% Integration | 10% E2E

### Automation Triggers
- **Pre-commit (local):** Lint + unit tests
- **Pull Request (CI):** Full suite (unit + integration + E2E + build)
- **Main branch merge (CI):** Full suite + build verification

---

## 7. Test Environments

| Environment | Purpose | Database | Notes |
|------------|---------|----------|-------|
| local-dev | Feature development | SQLite (dev.db) | Run by developer |
| local-test | Automated tests | SQLite (test.db, in-memory) | Isolated per test run |
| ci | CI pipeline tests | SQLite (in-memory) | Ephemeral, clean per run |

---

## 8. Risks

| ID | Risk | Probability | Impact | Mitigation |
|----|------|------------|--------|------------|
| TR-001 | Flaky E2E tests due to timing issues | Medium | High | Use Playwright's auto-wait; avoid arbitrary timeouts |
| TR-002 | Test isolation failures (shared state between tests) | Medium | High | Reset DB before each test suite; use transactions |
| TR-003 | API contract drift (frontend/backend type mismatch) | Medium | High | Shared TypeScript types; type-check in CI |
| TR-004 | Metrics tests become tightly coupled to data setup | Medium | Medium | Use factory functions for test data |
| TR-005 | Slow E2E suite blocks developer workflow | Low | Medium | Run E2E only on PR/CI, not pre-commit |

---

## 9. Entry Criteria

A test phase should only begin when:

- [ ] Feature implementation is complete
- [ ] Code has been reviewed (or self-reviewed in solo project)
- [ ] Build passes without errors
- [ ] TypeScript strict mode passes with zero errors
- [ ] ESLint passes with zero errors
- [ ] Unit tests for the feature exist

---

## 10. Exit Criteria

A feature is considered **done** when:

- [ ] All defined test cases have been executed
- [ ] All **High** and **Critical** test cases pass
- [ ] No **Critical** or **High** severity open bugs
- [ ] Unit test coverage ≥ 70% for business logic
- [ ] Integration tests pass
- [ ] Relevant E2E scenarios pass
- [ ] No regression in previously passing tests
- [ ] Lint and build pass

---

## 11. Regression Strategy

### Trigger
Regression testing is triggered when:
- A bug is fixed
- An existing feature is modified
- A new feature touches existing code

### Scope Selection
| Change Type | Regression Scope |
|------------|-----------------|
| Bug fix in isolated utility | Unit tests for that module |
| API endpoint change | Integration tests for that endpoint + related E2E |
| Frontend component change | E2E flows that use that component |
| Database schema change | All integration tests + full E2E |
| Shared type/util change | Full test suite |

### Process for Bug Fix Regression
1. Reproduce bug manually → confirm behavior
2. Write automated test that **fails** (red)
3. Implement fix
4. Run test → confirm it **passes** (green)
5. Run full suite → confirm no regressions
6. Document in `learning-log.md`

---

## 12. Smoke Testing Strategy

### Definition
A minimal set of tests to verify the application is alive and critical paths work.  
Executed after every deployment or major change.

### Smoke Test Suite (Manual + Automated)

| ID | Check | Method |
|----|-------|--------|
| SMK-001 | Application loads without error | E2E |
| SMK-002 | Can create a project | E2E |
| SMK-003 | Can create a test case | E2E |
| SMK-004 | Can execute a test case | E2E |
| SMK-005 | Can create a bug | E2E |
| SMK-006 | Dashboard loads and shows metrics | E2E |
| SMK-007 | API health endpoint responds 200 | API |
| SMK-008 | API returns project list | API |

### Smoke Test Pass/Fail
- If **any** smoke test fails → deployment is considered broken
- Do NOT proceed with full regression until smoke passes

---

## 13. Tools

| Category | Tool | Version | Purpose |
|---------|------|---------|---------|
| Unit Testing | Vitest | latest | Fast, Vite-native test runner |
| Integration Testing | Vitest + Supertest | latest | API endpoint testing with real DB |
| E2E Testing | Playwright | latest | Cross-browser user journey testing |
| Linting | ESLint | latest | Code quality enforcement |
| Formatting | Prettier | latest | Consistent code style |
| Type Checking | TypeScript (strict) | 5.x | Compile-time type safety |
| CI/CD | GitHub Actions | — | Automated pipeline |
| Coverage | Vitest coverage (v8) | — | Unit test coverage reporting |
