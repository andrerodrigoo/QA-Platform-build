# Bug Reports
## QA Test Management Platform

**Version:** 1.0.0  
**Date:** 2026-08-27

> Formal bug reports produced from the exploratory testing sessions
> (see `exploratory-testing.md`). Format follows `bug-report-template.md`.

---

## BUG-002 — Dashboard "Open Bugs" counter includes closed bugs

```
Bug ID:     BUG-002
Date:       2026-08-27
Reporter:   QA Team
Assignee:   QA Team
```

### Title
Dashboard "Open Bugs" total counts ALL bugs instead of only bugs that are still open.

### Environment
- Browser: Chrome 126 | OS: any | App Version: 1.0.0 | Environment: Local/CI | DB: memory/Neon

### Preconditions
Application running. At least one project exists.

### Steps to Reproduce
1. Go to a project and create a bug (any severity). It defaults to status "Open".
2. Navigate to the Dashboard — note "Open Bugs" shows 1.
3. Go to Bugs, edit the bug, set status to "Closed", save.
4. Return to the Dashboard.

### Actual Result
"Open Bugs" still shows 1. Closed and "Won't Fix" bugs are counted as open.

### Expected Result
"Open Bugs" should show 0 after the only bug is Closed. Only bugs with status
Open / In Progress / Fixed should be counted (per BR: `isOpenBug`).

### Evidence
- API: `GET /api/metrics/dashboard` returns `totals.openBugs` equal to the total
  number of bugs regardless of status.

### Severity
[x] High — Core metric is incorrect; misleads QA leads about outstanding work.

### Priority
[x] High — Must fix before release (dashboard is a headline feature).

### Frequency
[x] Always

### Status
[x] Open  → (to be Fixed in Phase 9)

### Root Cause
`MetricsService.getDashboard()` computed `openBugs` as `bugs.length` instead of
using the `countOpenBugs(bugs)` helper, so bug status was ignored.

### Test Case for Regression
New integration test: "dashboard openBugs excludes Closed and Won't Fix bugs"
(added to `api.integration.test.ts`). New unit assertion already covers
`countOpenBugs`.

### Linked Test Case
TC-DB-001, TC-DB-005

---

## BUG-003 — Test case count stat is stale after deleting a test case

```
Bug ID:     BUG-003
Date:       2026-08-27
Reporter:   QA Team
Assignee:   QA Team
```

### Title
After deleting a test case, the project summary "Test Cases" stat card does not
refresh and shows the old (higher) count until a manual page reload.

### Environment
- Browser: Chrome 126 | OS: any | App Version: 1.0.0 | Environment: Local | DB: memory/Neon

### Preconditions
A project with at least 2 test cases exists. User is on the project detail page.

### Steps to Reproduce
1. Open a project that has 2 test cases. The stat card shows "Test Cases: 2".
2. Delete one test case and confirm.
3. Observe the list (now shows 1) versus the stat card at the top.

### Actual Result
The test case list updates to 1 item, but the "Test Cases" stat card still shows 2.
The numbers are inconsistent until the page is refreshed.

### Expected Result
Both the list and the stat card should show the updated count (1) immediately.

### Evidence
- Screen recording: list count and stat card disagree after delete.

### Severity
[x] Medium — Data inconsistency in the UI; no data loss, workaround is refresh.

### Priority
[x] Medium — Fix in current cycle; visible correctness issue.

### Frequency
[x] Always

### Status
[x] Open → (to be Fixed in Phase 9)

### Root Cause
`handleDeleteTestCase` in `ProjectDetailPage.tsx` calls only `testCases.reload()`
and not `project.reload()`, so the summary (which supplies the stat cards) is not
refetched after the mutation (a classic stale-state / cache-invalidation bug).

### Test Case for Regression
New E2E test: "deleting a test case updates the Test Cases stat card"
(added to `e2e/tests/regression.spec.ts`).

### Linked Test Case
TC-PM-012 (summary counts), TC-TC-... (delete)

---

## Backlog (documented, not fixed this cycle)

The following were found during exploratory testing and are triaged as backlog.
Documenting-but-deferring is a realistic QA outcome; they are recorded so they
are not lost.

### BUG-004 — Cannot choose a project when creating a bug from the Bugs page
- **Severity:** Medium | **Priority:** Medium | **Status:** Open (backlog)
- The "+ New Bug" button on the Bugs page always assigns the new bug to the first
  project. There is no project selector.
- **Suggested fix:** add a project `<select>` to the Bugs page bug-creation flow.

### BUG-005 — No error handling on delete operations
- **Severity:** Medium | **Priority:** Medium | **Status:** Open (backlog)
- `handleDeleteProject` / `handleDeleteTestCase` do not wrap the API call in
  try/catch, so a failed DELETE (network error, server 500) produces no user
  feedback and, for project delete, navigates away regardless.
- **Suggested fix:** wrap in try/catch, show an error banner, and only navigate on success.

### BUG-006 — Deprecated test cases still listed/executable in active views
- **Severity:** Low | **Priority:** Low | **Status:** Open (backlog)
- BR-009 states deprecated test cases should be excluded from active execution
  lists by default. Currently they appear and can be executed with no warning.
- **Suggested fix:** default the status filter to hide Deprecated, or show a warning on execute.
```
