# Exploratory Testing Sessions
## QA Test Management Platform

**Version:** 1.0.0  
**Date:** 2026-08-27  
**Tester:** QA Team

> This document records charter-based exploratory testing sessions. Each session
> has a **charter** (mission), a **time-box**, and **notes/findings**. Findings
> that qualify as defects are promoted to formal bug reports (see `bug-reports.md`).

---

## Method

We use **Session-Based Test Management (SBTM)**:
- **Charter:** what area/goal to explore
- **Time-box:** fixed duration (30 min) to keep sessions focused
- **Notes:** observations, questions, and issues discovered
- **Classification:** each finding tagged as `BUG`, `UX`, `QUESTION`, or `OK`

---

## Session 1 — Project & Test Case CRUD

**Charter:** Explore project and test case creation/editing/deletion, focusing on state consistency after mutations.  
**Time-box:** 30 min  
**Areas:** Projects page, Project detail page

### Findings

| # | Observation | Classification |
|---|-------------|----------------|
| 1.1 | Creating a project with a valid name works and redirects correctly | OK |
| 1.2 | After **deleting a test case**, the "Test Cases" stat card at the top of the project page does **not** update — it still shows the old count until a manual page refresh | **BUG** → BUG-003 |
| 1.3 | Deleting a project has no error handling — if the DELETE request fails (e.g., network drop), the user is navigated away with no feedback and the project may still exist | **BUG** → BUG-005 |
| 1.4 | Editing a project name to an existing name correctly shows the conflict error | OK |
| 1.5 | The confirmation dialog for delete uses the native `window.confirm` — functional but not styled; acceptable for v1 | UX (accepted) |

---

## Session 2 — Test Execution & Bug Flow

**Charter:** Explore recording executions and the failed-execution → bug creation flow.  
**Time-box:** 30 min  
**Areas:** ExecutionForm, BugForm, ProjectDetailPage

### Findings

| # | Observation | Classification |
|---|-------------|----------------|
| 2.1 | Recording a Pass/Fail/Blocked execution works and updates the pass rate | OK |
| 2.2 | Failing a test correctly prompts to create a bug, and the bug form is pre-filled with the test title, steps, and execution notes | OK |
| 2.3 | The execution history modal lists executions latest-first as expected | OK |
| 2.4 | If the user cancels the "Create a bug?" confirm, no bug form opens — correct | OK |
| 2.5 | Executing a **Deprecated** test case is allowed with no warning (see TC-EX-007). Spec BR-009 says deprecated cases should be excluded from active lists by default; current UI still lists and allows executing them | **QUESTION / minor BUG** → tracked as BUG-006 (low) |

---

## Session 3 — Dashboard & Metrics

**Charter:** Explore dashboard metrics for correctness against known data, including edge cases (no data, closed bugs).  
**Time-box:** 30 min  
**Areas:** DashboardPage, MetricsService

### Findings

| # | Observation | Classification |
|---|-------------|----------------|
| 3.1 | Empty dashboard (no data) shows zeros and empty states, no division-by-zero error | OK |
| 3.2 | Pass/Fail/Blocked breakdown matches the underlying executions | OK |
| 3.3 | The **"Open Bugs"** counter increases when a bug is created, but does **NOT** decrease when a bug is set to **Closed** or **Won't Fix** — it appears to count ALL bugs, not just open ones | **BUG** → BUG-002 |
| 3.4 | Bugs-by-severity chart counts match created bugs | OK |
| 3.5 | Metric bar widths reflect the percentages correctly | OK |

---

## Session 4 — Bugs Page & Filtering

**Charter:** Explore the standalone Bugs page: creation, filtering, and project association.  
**Time-box:** 30 min  
**Areas:** BugsPage

### Findings

| # | Observation | Classification |
|---|-------------|----------------|
| 4.1 | Severity and status filters work and combine correctly | OK |
| 4.2 | The **"+ New Bug"** button on the Bugs page always assigns the bug to the **first** project with no way to choose a different project | **UX/BUG** → BUG-004 (medium) |
| 4.3 | Empty state shows when no bugs match the filters | OK |
| 4.4 | Editing a bug's status persists correctly | OK |

---

## Session 5 — Security & Input Robustness (quick pass)

**Charter:** Probe basic input-robustness and security concerns.  
**Time-box:** 30 min  
**Areas:** API validation, XSS

### Findings

| # | Observation | Classification |
|---|-------------|----------------|
| 5.1 | XSS attempt in project name (`<script>…</script>`) is stored as text and rendered escaped by React (no script execution) — React escapes by default | OK |
| 5.2 | Oversized payloads are rejected by Express `json({ limit: '1mb' })` | OK |
| 5.3 | Unknown extra fields in request bodies are ignored by Zod (no mass-assignment) | OK |
| 5.4 | Server never returns stack traces; unexpected errors return a generic 500 | OK |
| 5.5 | No authentication exists (documented as out-of-scope for v1) | QUESTION (accepted, out of scope) |

---

## Summary of Findings

| Bug ID | Title | Severity | Source Session |
|--------|-------|----------|----------------|
| BUG-002 | Dashboard "Open Bugs" counts all bugs, not just open ones | High | Session 3 |
| BUG-003 | Test case count stat is stale after deleting a test case | Medium | Session 1 |
| BUG-004 | Cannot choose project when creating a bug from the Bugs page | Medium | Session 4 |
| BUG-005 | No error handling on project/test-case delete failures | Medium | Session 1 |
| BUG-006 | Deprecated test cases still appear/execute in active lists | Low | Session 2 |

> **Scope decision:** For Phase 9 (fix + regression testing), we will fix the two
> highest-value, clearly-reproducible functional bugs — **BUG-002** and **BUG-003** —
> each with a failing-first regression test. BUG-004, BUG-005, and BUG-006 are
> documented and logged as backlog items (a realistic QA outcome: not every finding
> is fixed in the same cycle; they are triaged and prioritized).
