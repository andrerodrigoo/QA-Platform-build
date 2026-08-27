# Bug Report Template
## QA Test Management Platform

**Version:** 1.0.0  
**Date:** 2026-08-27

---

## How to Use This Template

1. Copy the template below for each new bug
2. Fill in ALL fields — incomplete bug reports will be returned
3. Attach screenshots and/or screen recordings as evidence
4. Assign severity and priority independently (they often differ)
5. Link to the failing test case when applicable

---

## Bug Report Template

```
---
Bug ID:     [BUG-XXX]
Date:       [YYYY-MM-DD]
Reporter:   [Name]
Assignee:   [Name or Unassigned]
---

### Title
[One sentence describing WHAT is wrong and WHERE — be specific]
Example: "Project creation fails silently when name contains special characters"

---

### Environment
- Browser:       [Chrome 126 / Firefox 127 / Edge 126]
- OS:            [Windows 11 / macOS 14 / Ubuntu 22.04]
- App Version:   [1.0.0 / commit hash]
- Environment:   [Local / Staging / Production]
- Node Version:  [e.g., 20.x]
- DB:            [SQLite / dev.db]

---

### Preconditions
[State that must be true BEFORE executing the steps]
Example: "User is on the Projects page. No project named 'Test' exists."

---

### Steps to Reproduce
1. [First step]
2. [Second step]
3. [Continue...]

(Steps must be precise enough that ANYONE can reproduce the bug)

---

### Actual Result
[Describe exactly what happened — be factual, not interpretive]
Example: "The form clears and no error message is shown. No project is created."

---

### Expected Result
[Describe what SHOULD have happened according to requirements]
Example: "Project should be created OR a validation error should be shown."

---

### Evidence
- Screenshot: [link or file]
- Screen recording: [link or file]
- Console errors: [paste relevant errors]
- Network request/response: [paste if relevant]
- Logs: [relevant log lines]

---

### Severity
[ ] Critical — System crash / data loss / core feature completely broken
[ ] High     — Major feature broken, workaround is difficult or none
[ ] Medium   — Feature partially broken, workaround exists
[ ] Low      — Minor issue, cosmetic, or edge case

---

### Priority
[ ] Critical — Must fix immediately (blocks release)
[ ] High     — Must fix in current sprint
[ ] Medium   — Should fix in next sprint
[ ] Low      — Fix when time allows

---

### Frequency
[ ] Always      — Reproduces 100% of the time
[ ] Often       — Reproduces > 50% of the time
[ ] Intermittent — Reproduces < 50% of the time
[ ] Rarely      — Difficult to reproduce

---

### Status
[ ] Open
[ ] In Progress
[ ] Fixed
[ ] Closed
[ ] Won't Fix

---

### Root Cause (fill after investigation)
[To be completed by developer or QA after analysis]
Example: "Missing server-side validation for special characters in project name field."

---

### Fix Description (fill after fix)
[Brief description of what was changed to fix the bug]

---

### Test Case for Regression
[ID of the automated test created to prevent regression]
Example: "TC-PM-011; added to regression suite as REG-PM-001"

---

### Linked Test Case
[Test case ID that discovered this bug, if applicable]
Example: "TC-PM-002"

---

### Related Issues
[IDs of related bugs or GitHub issues]
```

---

## Example Filled Bug Report

```
---
Bug ID:     BUG-001
Date:       2026-08-27
Reporter:   Ana Souza
Assignee:   Unassigned
---

### Title
Project creation succeeds even when project name is only whitespace

### Environment
- Browser:       Chrome 126
- OS:            macOS 14
- App Version:   1.0.0 (commit: abc1234)
- Environment:   Local
- Node Version:  20.15.0
- DB:            SQLite dev.db

### Preconditions
User is on the Projects page. Application is running at localhost:5173.

### Steps to Reproduce
1. Navigate to the Projects page
2. Click "New Project"
3. Enter "   " (3 spaces) in the Name field
4. Leave description empty
5. Click "Save"

### Actual Result
Project is created with name "   " (whitespace only). It appears in the
project list with a blank name. No validation error is shown.

### Expected Result
Project should NOT be created. Error message "Project name is required"
should be displayed.

### Evidence
- Screenshot: [attached - shows blank project card in list]
- Console errors: None
- Network: POST /api/projects returned 201 with body { "id": 7, "name": "   " }

### Severity
[x] High — A project with a blank name creates a confusing/broken state in the UI

### Priority
[x] High — Must fix before first release

### Frequency
[x] Always — Reproduces 100% of the time

### Status
[x] Open

### Root Cause
Backend validation trims the name before checking if it's empty, but the
trim is not applied before the uniqueness/empty check. Actually, the trim
is not applied AT ALL — the raw whitespace string passes the `!name` check
because it is truthy.

### Fix Description
Added `.trim()` to name before validation: `if (!name.trim()) { return error }`

### Test Case for Regression
TC-PM-013 (new test); added to regression suite

### Linked Test Case
TC-PM-002

### Related Issues
None
```

---

## Severity vs Priority Guide

| Scenario | Severity | Priority |
|---------|---------|---------|
| App crashes on login | Critical | Critical |
| Login fails for 5% of users | High | Critical |
| Button misaligned on mobile | Low | Medium |
| Report shows wrong date format | Medium | Low |
| XSS possible in name field | Critical | Critical |
| Typo in success message | Low | Low |

> **Key distinction:** Severity describes the IMPACT of the bug.  
> Priority describes WHEN it should be fixed based on business decisions.

---

## Bug Status Workflow

```
         ┌─────────────────────────────────┐
         │              OPEN               │
         └────────┬─────────────┬──────────┘
                  │             │
                  ▼             ▼
         ┌──────────────┐  ┌─────────────┐
         │  IN PROGRESS │  │  WON'T FIX  │
         └──────┬───────┘  └─────────────┘
                │
                ▼
         ┌──────────────┐
         │    FIXED     │
         └──────┬───────┘
                │
                ▼
         ┌──────────────┐
         │    CLOSED    │
         └──────────────┘
```
