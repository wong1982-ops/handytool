# Tester Test Guideline

This document defines the standard testing checklist for all features in the HandyTool workspace. Every deliverable must pass these checks before it can be marked as **DONE**.

---

## UI Testing

### 1. Responsive Design

Test on all breakpoints. Use browser DevTools device emulation or real devices.

| Breakpoint | Width | What to check |
|---|---|---|
| Mobile | 320px – 639px | Single column layout, touch targets ≥ 44px, no horizontal scroll, text readable without zoom |
| Small | 640px – 767px | Layouts start adapting, grids may go 2-col |
| Tablet | 768px – 1023px | Multi-column grids, side panels may appear |
| Desktop | 1024px – 1279px | Full layout, sidebars visible, optimal reading width |
| Wide | 1280px+ | Content stays centered, no excessive stretching |

**Checklist:**

- [ ] No horizontal overflow at any breakpoint
- [ ] Text is readable without zooming (minimum 14px body text)
- [ ] Touch targets are ≥ 44x44px with ≥ 8px spacing between them
- [ ] Images and maps resize correctly without distortion
- [ ] Navigation is usable on mobile (hamburger menu, collapsible panels)
- [ ] Grid layouts stack correctly on narrow screens
- [ ] Modals and dialogs are centered and scrollable on mobile
- [ ] Content fits within `max-width` container on wide screens

---

### 2. Accessibility (WCAG 2.1 AA)

Test with keyboard, screen reader (VoiceOver / NVDA), and automated tools (axe DevTools, Lighthouse).

**Color & Contrast:**

- [ ] Normal text (< 18px): contrast ratio ≥ 4.5:1
- [ ] Large text (≥ 18px bold or ≥ 24px): contrast ratio ≥ 3:1
- [ ] UI components and icons: contrast ratio ≥ 3:1
- [ ] Color is never the sole indicator of status — always paired with text, icon, or pattern
- [ ] Dark mode meets the same contrast ratios

**Keyboard Navigation:**

- [ ] All interactive elements reachable via Tab key
- [ ] Focus order matches visual order (no jumping around)
- [ ] Visible focus ring on all focusable elements (≥ 2px, ≥ 3:1 contrast)
- [ ] Modals trap focus and return focus on close
- [ ] Escape key closes overlays, menus, and modals
- [ ] No keyboard traps (user can always Tab out)

**Semantic HTML & ARIA:**

- [ ] One `<h1>` per page
- [ ] Heading hierarchy is sequential (h1 → h2 → h3, no skipping)
- [ ] Buttons use `<button>`, links use `<a>`
- [ ] Form inputs have associated `<label>` elements
- [ ] Images have descriptive `alt` text (or `alt=""` for decorative)
- [ ] Dynamic content uses `aria-live="polite"` for updates
- [ ] Loading states use `aria-busy="true"`
- [ ] Icons are hidden from screen readers with `aria-hidden="true"`

**Screen Reader:**

- [ ] Page content reads in logical order
- [ ] Interactive elements announce their purpose
- [ ] Status changes (loading, error, success) are announced
- [ ] Breadcrumb navigation reads correctly with current page indicated

---

### 3. SEO

Test using Lighthouse SEO audit and manual inspection.

- [ ] Unique `<title>` tag (< 60 characters)
- [ ] Unique `<meta name="description">` (< 155 characters)
- [ ] Open Graph tags present (`og:title`, `og:description`, `og:image`, `og:url`)
- [ ] Twitter Card tags present (`twitter:card`, `twitter:title`, `twitter:description`)
- [ ] Canonical URL set (`<link rel="canonical">`)
- [ ] One `<h1>` per page, relevant to content
- [ ] Clean URL structure (e.g., `/tools/myip`, not `/tools/myip?id=123`)
- [ ] Structured data (JSON-LD) present on tool pages
- [ ] No broken links (internal or external)
- [ ] Images have alt text for search indexing
- [ ] Page loads within 3 seconds (LCP < 2.5s)

---

### 4. Theme (Dark Mode / Light Mode)

Test both themes manually. Toggle using the header dark mode switch.

- [ ] All text is readable in both themes
- [ ] Background colors switch correctly (light gray → dark navy)
- [ ] Card backgrounds switch (white → dark slate)
- [ ] Borders adapt to theme (slate-100 → slate-800)
- [ ] Icons and SVGs remain visible in both themes
- [ ] Brand colors (primary blue) maintain contrast in both themes
- [ ] Form inputs and placeholders are visible in both themes
- [ ] Maps/third-party embeds render correctly in dark mode
- [ ] Status colors (success green, error red, warning yellow) work in both themes
- [ ] No flash of wrong theme on page load (persisted via localStorage)
- [ ] System preference is respected when no explicit theme is set

---

### 5. UI Consistency

Compare the implementation against the design reference (Figma / screenshots / HTML mockups).

**Visual Match:**

- [ ] Layout matches the design (column ratios, spacing, alignment)
- [ ] Typography matches (font sizes, weights, line heights, letter spacing)
- [ ] Colors match the design (using brand CSS custom properties)
- [ ] Border radius values match (rounded-lg, rounded-xl, etc.)
- [ ] Shadows match the design (shadow-sm, shadow-md, etc.)
- [ ] Icons are correct type and size
- [ ] Spacing between elements matches (padding, margins, gaps)

**Component Behavior:**

- [ ] Hover states match the design (color changes, scale, underlines)
- [ ] Active/pressed states provide visual feedback
- [ ] Loading skeletons match the content layout they replace
- [ ] Error states display correctly with retry option
- [ ] Empty states have appropriate messaging
- [ ] Transitions and animations are smooth (no jank)
- [ ] Copy-to-clipboard shows feedback ("Copied!")

**Cross-Browser:**

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] iOS Safari (latest)
- [ ] Android Chrome (latest)

---

## API Testing

### 1. Access Permission

- [ ] Public endpoints are accessible without authentication
- [ ] Protected endpoints return `401 Unauthorized` without auth token
- [ ] Protected endpoints return `403 Forbidden` with insufficient permissions
- [ ] Expired tokens are rejected with `401` and clear error message
- [ ] Invalid tokens (malformed, wrong secret) are rejected with `401`
- [ ] Rate limiting is enforced (correct HTTP 429 response with `Retry-After` header)
- [ ] CORS headers are set correctly (allowed origins, methods, headers)
- [ ] API keys (if used) are validated per request
- [ ] Admin-only endpoints are not accessible with regular user credentials

---

### 2. Schema Validation

- [ ] All request body fields are validated against Zod schemas
- [ ] Missing required fields return `400` with field-specific error messages
- [ ] Invalid field types return `400` (e.g., string where number expected)
- [ ] Extra/unknown fields are stripped or rejected (based on schema config)
- [ ] String length limits are enforced (min/max)
- [ ] Numeric range limits are enforced
- [ ] Enum values reject invalid options
- [ ] Nested object validation works correctly
- [ ] Array items are individually validated
- [ ] Query parameters are validated (type coercion from strings)
- [ ] Response shape matches documented schema (no extra or missing fields)

---

### 3. Error Handling

- [ ] All errors return standard format: `{ success: false, error: { code, message } }`
- [ ] `400 Bad Request` — validation errors with details
- [ ] `401 Unauthorized` — missing or invalid auth
- [ ] `403 Forbidden` — insufficient permissions
- [ ] `404 Not Found` — resource doesn't exist
- [ ] `409 Conflict` — duplicate resource
- [ ] `422 Unprocessable Entity` — valid syntax but semantic error
- [ ] `429 Too Many Requests` — rate limited
- [ ] `500 Internal Server Error` — unexpected failures (no stack traces leaked)
- [ ] Error messages are user-friendly (no raw SQL or internal details)
- [ ] Errors are logged server-side with enough context for debugging
- [ ] Validation errors list all failing fields (not just the first one)

---

### 4. API Documentation

- [ ] Every endpoint has documented: method, path, description
- [ ] Request parameters are documented (path, query, body) with types
- [ ] Response shapes are documented for all status codes (200, 400, 401, etc.)
- [ ] Authentication requirements are clearly stated per endpoint
- [ ] Example request and response are provided
- [ ] Rate limit details are documented
- [ ] Changelog documents breaking changes
- [ ] API versioning is documented (e.g., `/api/v1/`)

---

### 5. Unit Test Coverage

- [ ] All Zod validation schemas have unit tests
- [ ] Business logic functions have unit tests
- [ ] Utility/helper functions have unit tests
- [ ] Edge cases are covered (empty input, boundary values, special characters)
- [ ] Error paths are tested (not just happy paths)
- [ ] Mocks are used for external dependencies (database, third-party APIs)
- [ ] Test coverage meets minimum threshold (target: 80%+ for business logic)

---

### 6. Integration Test Coverage

- [ ] Each endpoint has at least one happy-path integration test
- [ ] Auth flows are tested end-to-end (login → access protected endpoint)
- [ ] Validation rejection is tested with real HTTP requests
- [ ] Database operations are tested (create → read → update → delete)
- [ ] Error responses are tested (invalid input, missing resource, auth failure)
- [ ] Response headers are verified (content-type, CORS, cache-control)
- [ ] Concurrent request handling is tested (no race conditions)
- [ ] Test database is used (isolated from production data)

---

## Test Report Template

After completing tests, fill out the report and attach to the plan doc.

```markdown
# Test Report: <Feature Name>

**Date:** YYYY-MM-DD
**Tester:** <name>
**Status:** PASS | FAIL | PARTIAL
**Plan Doc:** docs/plans/<filename>.md

## Summary
Brief result overview.

## UI Test Results

| # | Category | Test Case | Status | Notes |
|---|----------|-----------|--------|-------|
| 1 | Responsive | Mobile 320px layout | PASS | |
| 2 | Accessibility | Keyboard navigation | PASS | |
| 3 | SEO | Meta tags present | PASS | |
| 4 | Theme | Dark mode contrast | PASS | |
| 5 | UI Consistency | Design match | FAIL | Button color off |

## API Test Results

| # | Category | Test Case | Status | Notes |
|---|----------|-----------|--------|-------|
| 1 | Permission | Public endpoint access | PASS | |
| 2 | Validation | Missing required field | PASS | |
| 3 | Error handling | 500 no stack trace | PASS | |

## Issues Found

| # | Severity | Category | Description | Screenshot |
|---|----------|----------|-------------|-----------|
| 1 | High | Accessibility | Missing alt text on hero image | link |
| 2 | Medium | Responsive | Card overflow at 320px | link |

## Environment
- Browser(s): Chrome 122, Safari 17
- Device(s): MacBook Pro, iPhone 15
- OS: macOS, iOS 17
```

---

## Severity Levels

| Level | Definition | Action |
|---|---|---|
| **Critical** | Feature broken, data loss, security vulnerability | Block release, fix immediately |
| **High** | Major functionality impaired, accessibility violation | Must fix before release |
| **Medium** | Visual defect, minor UX issue, edge case failure | Should fix, can defer if needed |
| **Low** | Cosmetic, nice-to-have improvement | Fix when convenient |
