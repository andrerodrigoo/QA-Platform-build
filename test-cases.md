# Test Cases
## QA Test Management Platform

**Version:** 1.0.0  
**Date:** 2026-08-27

> Legend — Priority: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low  
> Legend — Type: [FUNC] Functional | [NEG] Negative | [BVA] Boundary Value | [EP] Equivalence Partition | [REG] Regression | [SMOKE] Smoke

---

## Module 1 — Project Management

---

### TC-PM-001 — Create project with valid data
- **Priority:** 🔴 Critical | **Type:** [FUNC] [SMOKE]
- **Preconditions:** Application is running; no project named "E-Commerce Platform" exists
- **Test Data:** Name: `"E-Commerce Platform"`, Description: `"Main e-commerce product"`
- **Steps:**
  1. Navigate to the Projects page
  2. Click "New Project"
  3. Enter name: `"E-Commerce Platform"`
  4. Enter description: `"Main e-commerce product"`
  5. Click "Save"
- **Expected Result:** Project is created; appears in project list; redirected to project detail page; creation date is today

---

### TC-PM-002 — Create project with empty name
- **Priority:** 🔴 Critical | **Type:** [NEG]
- **Preconditions:** Application is running
- **Test Data:** Name: `""` (empty), Description: any
- **Steps:**
  1. Navigate to Projects page
  2. Click "New Project"
  3. Leave name field empty
  4. Click "Save"
- **Expected Result:** Project is NOT created; error message "Project name is required" is displayed; form remains open

---

### TC-PM-003 — Create project with name at max length (100 chars)
- **Priority:** 🟠 High | **Type:** [BVA]
- **Preconditions:** Application is running
- **Test Data:** Name: `"A"` × 100 (exactly 100 characters)
- **Steps:**
  1. Click "New Project"
  2. Enter exactly 100 characters in name field
  3. Click "Save"
- **Expected Result:** Project is created successfully

---

### TC-PM-004 — Create project with name exceeding max length (101 chars)
- **Priority:** 🟠 High | **Type:** [BVA] [NEG]
- **Preconditions:** Application is running
- **Test Data:** Name: `"A"` × 101 (101 characters)
- **Steps:**
  1. Click "New Project"
  2. Enter 101 characters in name field
  3. Click "Save"
- **Expected Result:** Project is NOT created; error message about character limit is displayed

---

### TC-PM-005 — Create project with minimum name length (1 char)
- **Priority:** 🟡 Medium | **Type:** [BVA]
- **Preconditions:** Application is running
- **Test Data:** Name: `"X"` (1 character)
- **Steps:**
  1. Click "New Project"
  2. Enter `"X"` as name
  3. Click "Save"
- **Expected Result:** Project is created successfully

---

### TC-PM-006 — Create project with duplicate name (exact match)
- **Priority:** 🔴 Critical | **Type:** [NEG]
- **Preconditions:** Project named `"Mobile App"` already exists
- **Test Data:** Name: `"Mobile App"`
- **Steps:**
  1. Click "New Project"
  2. Enter `"Mobile App"`
  3. Click "Save"
- **Expected Result:** Project is NOT created; error "A project with this name already exists"

---

### TC-PM-007 — Create project with duplicate name (case-insensitive)
- **Priority:** 🟠 High | **Type:** [NEG]
- **Preconditions:** Project named `"Mobile App"` already exists
- **Test Data:** Name: `"mobile app"` (lowercase)
- **Steps:**
  1. Click "New Project"
  2. Enter `"mobile app"`
  3. Click "Save"
- **Expected Result:** Project is NOT created; duplicate name error shown (case-insensitive check)

---

### TC-PM-008 — Edit project name and description
- **Priority:** 🟠 High | **Type:** [FUNC]
- **Preconditions:** Project named `"Old Name"` exists
- **Test Data:** New name: `"New Name"`, New description: `"Updated"`
- **Steps:**
  1. Navigate to project `"Old Name"`
  2. Click "Edit"
  3. Change name to `"New Name"`
  4. Change description to `"Updated"`
  5. Click "Save"
- **Expected Result:** Project name and description are updated; visible in project list

---

### TC-PM-009 — Delete project cascades to test cases, executions, and bugs
- **Priority:** 🔴 Critical | **Type:** [FUNC]
- **Preconditions:** Project with 2 test cases, 3 executions, and 1 bug exists
- **Test Data:** Project: `"Cascade Test Project"`
- **Steps:**
  1. Navigate to the project
  2. Click "Delete Project"
  3. Confirm deletion in dialog
- **Expected Result:** Project is deleted; its test cases, executions, and bugs no longer exist; project does NOT appear in list

---

### TC-PM-010 — Delete project — cancel confirmation dialog
- **Priority:** 🟡 Medium | **Type:** [FUNC] [NEG]
- **Preconditions:** A project exists
- **Steps:**
  1. Click "Delete Project"
  2. Click "Cancel" in confirmation dialog
- **Expected Result:** Project is NOT deleted; remains in list

---

### TC-PM-011 — Create project with special characters in name
- **Priority:** 🟡 Medium | **Type:** [NEG]
- **Test Data:** Name: `"<script>alert('xss')</script>"`
- **Steps:**
  1. Click "New Project"
  2. Enter the XSS string as name
  3. Click "Save"
- **Expected Result:** Either the project is saved with the name escaped/sanitized OR an error is shown; the script must NOT execute in the browser

---

### TC-PM-012 — Projects list shows correct summary counts
- **Priority:** 🟠 High | **Type:** [FUNC]
- **Preconditions:** Project with 3 test cases and 2 open bugs exists
- **Steps:**
  1. Navigate to Projects page
- **Expected Result:** The project card shows "3 test cases" and "2 open bugs" correctly

---

---

## Module 2 — Test Case Management

---

### TC-TC-001 — Create test case with all required fields
- **Priority:** 🔴 Critical | **Type:** [FUNC] [SMOKE]
- **Preconditions:** Project `"Login Module"` exists
- **Test Data:** Title: `"Verify successful login"`, Steps: `"1. Navigate to /login\n2. Enter valid credentials\n3. Click Login"`, Expected Result: `"User is redirected to dashboard"`, Priority: `"High"`, Type: `"Functional"`, Status: `"Active"`
- **Steps:**
  1. Navigate to project `"Login Module"`
  2. Click "New Test Case"
  3. Fill all required fields
  4. Click "Save"
- **Expected Result:** Test case created; visible in project list; status defaults to "Active"

---

### TC-TC-002 — Create test case with empty title
- **Priority:** 🔴 Critical | **Type:** [NEG]
- **Test Data:** Title: `""`, all other fields valid
- **Steps:**
  1. Click "New Test Case"
  2. Leave title empty
  3. Click "Save"
- **Expected Result:** Test case NOT created; error "Title is required"

---

### TC-TC-003 — Create test case with empty steps
- **Priority:** 🔴 Critical | **Type:** [NEG]
- **Test Data:** Title: valid, Steps: `""`, Expected Result: valid
- **Steps:**
  1. Click "New Test Case"
  2. Fill title and expected result; leave steps empty
  3. Click "Save"
- **Expected Result:** Test case NOT created; error "Steps are required"

---

### TC-TC-004 — Create test case with empty expected result
- **Priority:** 🔴 Critical | **Type:** [NEG]
- **Test Data:** Title: valid, Steps: valid, Expected Result: `""`
- **Steps:**
  1. Fill title and steps; leave expected result empty
  2. Click "Save"
- **Expected Result:** Test case NOT created; error "Expected result is required"

---

### TC-TC-005 — Create duplicate test case title within same project
- **Priority:** 🔴 Critical | **Type:** [NEG]
- **Preconditions:** Test case `"Verify login"` already exists in project
- **Test Data:** Title: `"Verify login"`
- **Steps:**
  1. Create a new test case with the same title
  2. Click "Save"
- **Expected Result:** Test case NOT created; error "A test case with this title already exists in this project"

---

### TC-TC-006 — Create test case with duplicate title in DIFFERENT project
- **Priority:** 🟡 Medium | **Type:** [FUNC]
- **Preconditions:** Test case `"Verify login"` exists in project A
- **Test Data:** Title: `"Verify login"` in project B
- **Steps:**
  1. Navigate to project B
  2. Create test case with same title
- **Expected Result:** Test case is created successfully (uniqueness is per-project)

---

### TC-TC-007 — Test case title at max boundary (200 chars)
- **Priority:** 🟠 High | **Type:** [BVA]
- **Test Data:** Title: `"T"` × 200
- **Steps:**
  1. Enter exactly 200 characters as title
  2. Click "Save"
- **Expected Result:** Test case created successfully

---

### TC-TC-008 — Test case title exceeds max (201 chars)
- **Priority:** 🟠 High | **Type:** [BVA] [NEG]
- **Test Data:** Title: `"T"` × 201
- **Steps:**
  1. Enter 201 characters as title
  2. Click "Save"
- **Expected Result:** Test case NOT created; character limit error shown

---

### TC-TC-009 — Edit test case
- **Priority:** 🟠 High | **Type:** [FUNC]
- **Preconditions:** A test case exists
- **Steps:**
  1. Open a test case
  2. Click "Edit"
  3. Change title, steps, and expected result
  4. Click "Save"
- **Expected Result:** Changes are saved and reflected immediately

---

### TC-TC-010 — Delete test case does NOT delete linked bugs
- **Priority:** 🟠 High | **Type:** [FUNC]
- **Preconditions:** A test case exists with a linked bug
- **Steps:**
  1. Delete the test case
  2. Navigate to the Bugs section
- **Expected Result:** Bug still exists; bug's test case link is cleared (null/unlinked)

---

### TC-TC-011 — Filter test cases by priority
- **Priority:** 🟡 Medium | **Type:** [FUNC]
- **Preconditions:** Project has test cases with priorities: Low, Medium, High, Critical
- **Steps:**
  1. Open project's test case list
  2. Select filter "Priority: Critical"
- **Expected Result:** Only Critical priority test cases are shown

---

### TC-TC-012 — Filter test cases by status
- **Priority:** 🟡 Medium | **Type:** [FUNC]
- **Steps:**
  1. Select filter "Status: Draft"
- **Expected Result:** Only Draft status test cases are shown

---

### TC-TC-013 — Search test cases by keyword
- **Priority:** 🟡 Medium | **Type:** [FUNC]
- **Test Data:** Keyword: `"login"`
- **Steps:**
  1. Enter `"login"` in search field
- **Expected Result:** Only test cases with "login" in the title are shown (case-insensitive)

---

### TC-TC-014 — Search with no matching results
- **Priority:** 🟡 Medium | **Type:** [NEG]
- **Test Data:** Keyword: `"zzzyyyxxx_nonexistent"`
- **Steps:**
  1. Enter a keyword that matches no test cases
- **Expected Result:** Empty state message is shown (e.g., "No test cases found")

---

### TC-TC-015 — Filter + search combined
- **Priority:** 🟡 Medium | **Type:** [FUNC]
- **Preconditions:** Mix of test cases with various priorities and titles
- **Steps:**
  1. Filter by Priority: High
  2. Search for "login"
- **Expected Result:** Only High-priority test cases containing "login" are shown

---

### TC-TC-016 — Invalid priority value via API (equivalence partition)
- **Priority:** 🟠 High | **Type:** [EP] [NEG]
- **Test Data:** `{ "priority": "Urgent" }` (not a valid enum)
- **Steps:**
  1. Send POST /api/test-cases with invalid priority value
- **Expected Result:** API returns 422 with validation error message

---

---

## Module 3 — Test Execution

---

### TC-EX-001 — Execute test case with result Pass
- **Priority:** 🔴 Critical | **Type:** [FUNC] [SMOKE]
- **Preconditions:** Active test case exists
- **Steps:**
  1. Open test case
  2. Click "Execute"
  3. Select result: "Pass"
  4. Click "Save"
- **Expected Result:** Execution recorded; test case shows "Pass" as last result; timestamp is set to now

---

### TC-EX-002 — Execute test case with result Fail
- **Priority:** 🔴 Critical | **Type:** [FUNC]
- **Steps:**
  1. Execute test case; select result: "Fail"
  2. Add notes: `"Button not clickable in Firefox"`
  3. Click "Save"
- **Expected Result:** Execution recorded with result "Fail" and notes; system prompts to create a bug

---

### TC-EX-003 — Execute test case with result Blocked
- **Priority:** 🟠 High | **Type:** [FUNC]
- **Steps:**
  1. Execute test case; select result: "Blocked"
  2. Click "Save"
- **Expected Result:** Execution recorded with status "Blocked"; counted correctly in metrics

---

### TC-EX-004 — Execute test case without selecting a result
- **Priority:** 🟠 High | **Type:** [NEG]
- **Steps:**
  1. Open "Execute" form
  2. Do NOT select a result
  3. Click "Save"
- **Expected Result:** Execution NOT saved; error "Result is required"

---

### TC-EX-005 — View execution history (multiple executions)
- **Priority:** 🟠 High | **Type:** [FUNC]
- **Preconditions:** Test case has been executed 3 times (Pass, Fail, Pass)
- **Steps:**
  1. Open test case detail
  2. View execution history section
- **Expected Result:** 3 executions shown in reverse chronological order (latest first); each shows result, date, and notes

---

### TC-EX-006 — Execution timestamp is set automatically
- **Priority:** 🟠 High | **Type:** [FUNC]
- **Steps:**
  1. Execute a test case
  2. View execution history
- **Expected Result:** Execution date matches the current date/time (within 1 minute tolerance)

---

### TC-EX-007 — Execute deprecated test case
- **Priority:** 🟡 Medium | **Type:** [NEG]
- **Preconditions:** A test case with status "Deprecated" exists
- **Steps:**
  1. Navigate to deprecated test case
  2. Attempt to execute
- **Expected Result:** System either prevents execution OR shows a warning that the test case is deprecated; execution is recorded if permitted

---

### TC-EX-008 — Execute test case for non-existent test case ID (API)
- **Priority:** 🟠 High | **Type:** [NEG]
- **Steps:**
  1. Send POST /api/executions with `testCaseId: 99999` (non-existent)
- **Expected Result:** API returns 404 with message "Test case not found"

---

### TC-EX-009 — Execute with invalid result value (API)
- **Priority:** 🟠 High | **Type:** [EP] [NEG]
- **Steps:**
  1. Send POST /api/executions with `result: "Skip"` (invalid enum)
- **Expected Result:** API returns 422 with validation error

---

---

## Module 4 — Bug Management

---

### TC-BG-001 — Create bug manually with all fields
- **Priority:** 🔴 Critical | **Type:** [FUNC] [SMOKE]
- **Test Data:** Title: `"Login button unresponsive on mobile"`, Severity: `"High"`, Priority: `"High"`, Status: `"Open"`
- **Steps:**
  1. Navigate to Bugs section
  2. Click "New Bug"
  3. Fill all required fields
  4. Click "Save"
- **Expected Result:** Bug created with status "Open"; visible in bug list

---

### TC-BG-002 — Create bug from failed test execution
- **Priority:** 🔴 Critical | **Type:** [FUNC]
- **Preconditions:** A test execution with result "Fail" was just recorded
- **Steps:**
  1. After recording a Fail execution, click "Create Bug"
  2. Observe pre-filled fields
  3. Add any missing details
  4. Click "Save"
- **Expected Result:** Bug created and linked to the test case; pre-filled with test case title and execution notes

---

### TC-BG-003 — Create bug with empty title
- **Priority:** 🔴 Critical | **Type:** [NEG]
- **Steps:**
  1. Open "New Bug"
  2. Leave title empty
  3. Click "Save"
- **Expected Result:** Bug NOT created; error "Bug title is required"

---

### TC-BG-004 — Bug status transition: Open → In Progress → Fixed → Closed
- **Priority:** 🔴 Critical | **Type:** [FUNC]
- **Preconditions:** Bug with status "Open" exists
- **Steps:**
  1. Change status to "In Progress"; save
  2. Verify status shows "In Progress"
  3. Change status to "Fixed"; save
  4. Verify status shows "Fixed"
  5. Change status to "Closed"; save
  6. Verify status shows "Closed"
- **Expected Result:** Each status transition is saved correctly

---

### TC-BG-005 — Bug status transition to Won't Fix
- **Priority:** 🟠 High | **Type:** [FUNC]
- **Preconditions:** Bug with status "Open" exists
- **Steps:**
  1. Change status to "Won't Fix"
  2. Save
- **Expected Result:** Status updated to "Won't Fix"

---

### TC-BG-006 — Filter bugs by severity
- **Priority:** 🟠 High | **Type:** [FUNC]
- **Preconditions:** Bugs with all severity levels exist
- **Steps:**
  1. Navigate to Bug list
  2. Filter by "Severity: Critical"
- **Expected Result:** Only Critical severity bugs shown

---

### TC-BG-007 — Filter bugs by status
- **Priority:** 🟠 High | **Type:** [FUNC]
- **Steps:**
  1. Filter by "Status: Open"
- **Expected Result:** Only Open bugs shown

---

### TC-BG-008 — Create bug with invalid severity via API
- **Priority:** 🟠 High | **Type:** [EP] [NEG]
- **Steps:**
  1. POST /api/bugs with `severity: "Blocker"` (invalid)
- **Expected Result:** 422 validation error

---

### TC-BG-009 — Bug title at max boundary (200 chars)
- **Priority:** 🟡 Medium | **Type:** [BVA]
- **Test Data:** Title: 200 characters
- **Expected Result:** Bug created successfully

---

### TC-BG-010 — Bug title exceeds max (201 chars)
- **Priority:** 🟡 Medium | **Type:** [BVA] [NEG]
- **Test Data:** Title: 201 characters
- **Expected Result:** Bug NOT created; character limit error shown

---

---

## Module 5 — Dashboard & Metrics

---

### TC-DB-001 — Dashboard shows correct total counts
- **Priority:** 🔴 Critical | **Type:** [FUNC] [SMOKE]
- **Preconditions:** 3 projects, 10 test cases, 5 executions, 2 open bugs exist
- **Steps:**
  1. Navigate to Dashboard
- **Expected Result:** Dashboard shows: "3 Projects", "10 Test Cases", "5 Executions", "2 Open Bugs"

---

### TC-DB-002 — Pass rate percentage calculation
- **Priority:** 🔴 Critical | **Type:** [FUNC]
- **Preconditions:** 10 executions: 6 Pass, 3 Fail, 1 Blocked (using latest per test case)
- **Steps:**
  1. Navigate to Dashboard
  2. Check pass rate metric
- **Expected Result:** Pass rate = 60%; Fail = 30%; Blocked = 10%

---

### TC-DB-003 — Dashboard with zero executions (empty state)
- **Priority:** 🟠 High | **Type:** [NEG]
- **Preconditions:** Application has projects and test cases but NO executions
- **Steps:**
  1. Navigate to Dashboard
- **Expected Result:** Metrics section shows empty state ("No executions yet" or 0%); no division-by-zero error

---

### TC-DB-004 — Bugs by severity chart accuracy
- **Priority:** 🟠 High | **Type:** [FUNC]
- **Preconditions:** 1 Critical, 2 High, 3 Medium, 1 Low bug (all Open)
- **Steps:**
  1. Navigate to Dashboard
  2. Check bugs by severity chart
- **Expected Result:** Chart shows exact counts: Critical=1, High=2, Medium=3, Low=1

---

### TC-DB-005 — Dashboard updates after new execution
- **Priority:** 🟠 High | **Type:** [FUNC]
- **Steps:**
  1. Note current pass rate on Dashboard
  2. Execute a test case with "Fail"
  3. Return to Dashboard
- **Expected Result:** Dashboard reflects updated metrics (fail count increased)

---

### TC-DB-006 — Dashboard with no projects (first run)
- **Priority:** 🟡 Medium | **Type:** [NEG]
- **Preconditions:** Clean application with no data
- **Steps:**
  1. Navigate to Dashboard
- **Expected Result:** All counters show 0; empty states shown with helpful guidance text

---

---

## Module 6 — API Edge Cases

---

### TC-API-001 — Request with non-existent project ID
- **Priority:** 🟠 High | **Type:** [NEG]
- **Steps:**
  1. GET /api/projects/99999
- **Expected Result:** 404 with `{ "error": "Project not found" }`

---

### TC-API-002 — Request with invalid ID format
- **Priority:** 🟠 High | **Type:** [NEG]
- **Steps:**
  1. GET /api/projects/abc (non-numeric ID)
- **Expected Result:** 400 or 422 with appropriate error message

---

### TC-API-003 — Request body is completely empty
- **Priority:** 🟠 High | **Type:** [NEG]
- **Steps:**
  1. POST /api/projects with empty JSON body `{}`
- **Expected Result:** 422 with validation errors for all required fields

---

### TC-API-004 — Request body has null values for required fields
- **Priority:** 🟠 High | **Type:** [NEG]
- **Steps:**
  1. POST /api/projects with `{ "name": null }`
- **Expected Result:** 422 validation error

---

### TC-API-005 — Request with extra unknown fields (should be ignored)
- **Priority:** 🟢 Low | **Type:** [FUNC]
- **Steps:**
  1. POST /api/projects with `{ "name": "Valid", "hackerField": "inject" }`
- **Expected Result:** Project created successfully; unknown field is ignored

---

### TC-API-006 — Concurrent duplicate creation
- **Priority:** 🟡 Medium | **Type:** [NEG]
- **Steps:**
  1. Send two simultaneous POST /api/projects with the same name
- **Expected Result:** Only one project is created; the other receives a 409 or 422 conflict error

---

### TC-API-007 — GET endpoint returns correctly structured response
- **Priority:** 🟠 High | **Type:** [FUNC]
- **Steps:**
  1. GET /api/projects after creating a project
- **Expected Result:** Response is an array of project objects with expected fields (id, name, description, createdAt)
