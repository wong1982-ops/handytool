# Implementation Workflow Guideline

This document defines the standard workflow for implementing features in the HandyTool workspace. Every feature — whether API or UI — follows this pipeline to ensure clarity, quality, and accountability.

---

## Roles

| Role | Responsibility |
|---|---|
| **BA** (Business Analyst) | Reviews design, breaks down tasks, creates plan doc |
| **Architect** | Designs API architecture (API work only) |
| **Dev** (Developer) | Implements the feature |
| **Tester** | Verifies the implementation against requirements |

---

## Workflow Overview

```
                    +-----------------+
                    |   Design Ready  |
                    +--------+--------+
                             |
                             v
                  +----------+----------+
                  |  BA: Review Design  |
                  |  & Breakdown Tasks  |
                  +----------+----------+
                             |
                             v
                  +----------+----------+
                  |  BA: Create Plan    |
                  |  Doc (docs/plans/)  |
                  +----------+----------+
                             |
                    +--------+--------+
                    |  What type of   |
                    |     work?       |
                    +--------+--------+
                   /                   \
                  v                     v
          +-------+-------+    +-------+-------+
          |   API Work    |    |   UI Work     |
          +-------+-------+    +-------+-------+
                  |                     |
                  v                     |
       +----------+----------+         |
       |  Architect: Create  |         |
       |  Architecture Design|         |
       +----------+----------+         |
                  |                     |
                  v                     v
       +----------+----------+  +------+--------+
       |  Dev: Implement API |  | Dev: Implement|
       |                     |  |     UI        |
       +----------+----------+  +------+--------+
                  |                     |
                  v                     v
       +----------+----------+  +------+--------+
       | Tester: Test API    |  | Tester: Test  |
       |                     |  |     UI        |
       +----------+----------+  +------+--------+
                  |                     |
                  v                     v
                  +----------+----------+
                             |
                             v
                    +--------+--------+
                    |      Done       |
                    +-----------------+
```

---

## Phase 1 — BA: Review Design & Create Plan

**Owner:** BA

**Input:** Design (Figma, wireframes, PRD, or requirements doc)

**Steps:**

1. Review the design and identify all deliverables
2. Break the work into discrete, estimable tasks
3. Classify each task as **API** or **UI**
4. Identify dependencies between tasks
5. Create a plan doc in `docs/plans/`

**Output:** Plan doc saved to `docs/plans/YYYY-MM-DD-<feature-name>.md`

### Plan Doc Template

```markdown
# Plan: <Feature Name>

**Date:** YYYY-MM-DD
**BA:** <name>
**Status:** DRAFT | IN REVIEW | APPROVED

## Overview
Brief description of the feature and its purpose.

## Design Reference
Link to Figma / wireframe / PRD.

## Task Breakdown

### API Tasks
| # | Task | Description | Depends On | Assigned To |
|---|------|-------------|------------|-------------|
| A1 | ... | ... | — | — |
| A2 | ... | ... | A1 | — |

### UI Tasks
| # | Task | Description | Depends On | Assigned To |
|---|------|-------------|------------|-------------|
| U1 | ... | ... | — | — |
| U2 | ... | ... | A1, U1 | — |

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Notes
Any assumptions, risks, or open questions.
```

---

## Phase 2a — Architect: Architecture Design (API Work Only)

**Owner:** Architect
**Trigger:** Plan doc is approved AND task is classified as API work

**Steps:**

1. Review the plan doc and API task breakdown
2. Design the API architecture covering:
   - Endpoint routes and HTTP methods
   - Request/response schemas (Zod)
   - Authentication and authorization requirements
   - Database schema changes (Supabase)
   - Error handling strategy
   - Rate limiting and caching considerations
   - Integration points with existing services
3. Document the architecture design
4. Review with BA to confirm alignment with requirements

**Output:** Architecture section added to the plan doc or a separate doc at `docs/plans/YYYY-MM-DD-<feature-name>-architecture.md`

### Architecture Design Template

```markdown
# Architecture: <Feature Name>

**Date:** YYYY-MM-DD
**Architect:** <name>
**Status:** DRAFT | APPROVED

## Endpoints

### `METHOD /api/v1/<resource>`
- **Auth:** Required / Public
- **Request:**
  ```json
  { "field": "type" }
  ```
- **Response (200):**
  ```json
  { "data": { ... } }
  ```
- **Errors:** 400 (validation), 401 (unauthorized), 404 (not found)

## Database Changes
Tables, columns, indexes, RLS policies.

## Sequence Diagram
Describe the request flow through the system.

## Security Considerations
Auth, input validation, rate limiting.

## Caching Strategy
What to cache, TTL, invalidation.
```

---

## Phase 2b — Dev: Implementation

**Owner:** Dev

### For API Work

**Trigger:** Architecture design is approved

**Steps:**

1. Read the plan doc and architecture design
2. Create/update database schema if needed
3. Implement API endpoints in `handytool-api`
   - Follow the response helper pattern (`lib/api/response.ts`)
   - Add Zod validation for all inputs
   - Handle all error cases from the architecture doc
4. Write inline code comments for non-obvious logic
5. Self-test with manual requests (curl / Postman)
6. Update the plan doc status

**Output:** Working API endpoints, ready for testing

### For UI Work

**Trigger:** Plan doc is approved (no architecture phase needed)

**Steps:**

1. Read the plan doc and design reference
2. Follow the [tool development pattern](.claude/tool-pattern.md):
   - Page route in `app/tools/<toolname>/page.tsx`
   - Tool components in `tools/<toolname>/`
   - Reusable UI in `components/ui/`
3. Follow the [UI/UX guideline](.claude/ui-ux-guideline.md):
   - WCAG 2.1 AA accessibility
   - Mobile-first responsive design
   - 4.5:1 contrast ratio for text
   - 44px minimum touch targets
4. Use mock data first, integrate API later
5. Verify build passes (`pnpm build`)
6. Update the plan doc status

**Output:** Working UI, ready for testing

---

## Phase 3 — Tester: Testing

**Owner:** Tester
**Trigger:** Dev marks implementation as complete

### For API Work

**Steps:**

1. Review the plan doc and architecture design
2. Test all endpoints against the documented schemas
3. Verify:
   - Happy path returns correct response shape
   - Validation rejects invalid input (400 errors)
   - Auth is enforced where required (401/403 errors)
   - Edge cases are handled (empty inputs, large payloads, special characters)
   - Error responses follow the standard format
4. Document test results

### For UI Work

**Steps:**

1. Review the plan doc and design reference
2. Test against the design:
   - Visual match with Figma / wireframes
   - Responsive behavior (mobile, tablet, desktop)
   - Dark mode support
3. Test accessibility:
   - Keyboard navigation (Tab, Enter, Escape)
   - Screen reader compatibility
   - Color contrast
4. Test functionality:
   - All interactive elements work
   - Loading and error states display correctly
   - Data displays correctly (or mock data is reasonable)
5. Document test results

**Output:** Test report with pass/fail and any issues found

### Test Report Template

```markdown
# Test Report: <Feature Name>

**Date:** YYYY-MM-DD
**Tester:** <name>
**Status:** PASS | FAIL | PARTIAL

## Summary
Brief result overview.

## Test Results

| # | Test Case | Expected | Actual | Status |
|---|-----------|----------|--------|--------|
| 1 | ... | ... | ... | PASS/FAIL |

## Issues Found
- [ ] Issue 1 — severity, description
- [ ] Issue 2 — severity, description

## Screenshots / Evidence
Attach relevant screenshots or logs.
```

---

## Status Tracking

Each plan doc tracks its own status. Use these values:

| Status | Meaning |
|---|---|
| `DRAFT` | BA is still writing the plan |
| `IN REVIEW` | Plan is ready for review |
| `APPROVED` | Plan is approved, work can begin |
| `ARCH IN PROGRESS` | Architect is designing (API only) |
| `ARCH APPROVED` | Architecture approved, dev can start |
| `DEV IN PROGRESS` | Dev is implementing |
| `DEV COMPLETE` | Implementation done, ready for testing |
| `TESTING` | Tester is verifying |
| `DONE` | All tests pass, feature is complete |
| `BLOCKED` | Waiting on external dependency |

---

## Quick Reference

```
Design Ready
  → BA reviews & creates plan doc (docs/plans/)
    → API? → Architect designs → Dev implements → Tester tests → Done
    → UI?  → Dev implements → Tester tests → Done
```
