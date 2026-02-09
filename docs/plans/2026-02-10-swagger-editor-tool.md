# Plan: Swagger Editor Tool

**Date:** 2026-02-10
**BA:** Claude (AI)
**Status:** DEV COMPLETE

## Overview

Build a Swagger/OpenAPI Editor & Previewer tool from `designs/5.swaggerEditor`. Single design screen showing a 3-panel layout: navigation tree (left), YAML code editor (center), live documentation preview (right).

This tool is **fully client-side** — parses OpenAPI YAML in the browser using `js-yaml` (already installed). No API needed.

## Design Reference

- `designs/5.swaggerEditor/screen.png` — Dark theme, 3-panel layout
- `designs/5.swaggerEditor/code.html` — HTML reference

## Design Analysis

### Layout (3-panel)
1. **Left sidebar (w-64):** Navigation tree with collapsible groups — Endpoints (color-coded HTTP methods), Schemas, Security. "New Endpoint" button at bottom.
2. **Center pane (flex-1):** YAML code editor with syntax-highlighted display, line numbers gutter, file tab header (`openapi.yaml`, `YAML 1.2`, settings icon), status bar (Valid OpenAPI, Ln/Col, Spaces, UTF-8, YAML).
3. **Right pane (w-1/3, min-w-400):** Live preview rendering parsed OpenAPI spec — API title/version/description, expandable endpoint cards with parameters & responses, schema definitions.

### Features
1. **YAML code editing** — Textarea with line numbers, monospace font
2. **Live OpenAPI parsing** — Parse YAML → render documentation in real-time
3. **Navigation tree** — Browse endpoints, schemas, security definitions
4. **Endpoint cards** — Expand/collapse, show parameters table + response JSON
5. **HTTP method badges** — Color-coded: GET (green), POST (blue), PUT (orange), DELETE (red)
6. **Schema display** — Property names + types
7. **Validation** — Show "Valid OpenAPI" / "Invalid" status in status bar
8. **Search** — Search methods in toolbar
9. **Export** — Download spec file
10. **Floating action buttons** — Quick action (bolt) + help

### Color Scheme (from design)
- Editor background: `#1a1b26` (nord-bg)
- Gutter: `#15161e` (nord-gutter)
- Text: `#c0caf5` (nord-text)
- Comments: `#565f89` (nord-comment)
- Keywords/keys: `#bb9af7` (nord-keyword) → mapped to primary cyan
- Strings: `#9ece6a` (nord-string)
- Primary accent: `#25d1f4` (cyan) → use `var(--ht-color-secondary-500)`

### Dependencies
- `js-yaml` — Already installed (from JSON Converter)
- No additional dependencies needed

## Task Breakdown

### UI Tasks

| # | Task | Description | Depends On |
|---|------|-------------|------------|
| U1 | Create editor-nav | Left sidebar: Endpoints (GET/POST/PUT color-coded), Schemas, Security nav tree. Accepts parsed spec + selected endpoint callback. + New Endpoint button. | — |
| U2 | Create yaml-editor | Center pane: textarea with line numbers, file tab header, status bar. Dark theme. Controlled value + onChange. | — |
| U3 | Create endpoint-card | Expandable endpoint card: method badge, path, summary. Expanded: parameters table + response JSON preview. | — |
| U4 | Create schema-card | Schema display: model name, property list (name + type). | — |
| U5 | Create live-preview | Right pane: API header (title + version + OAS3 + description), endpoint cards by tag, schemas. Accepts parsed spec. | U3, U4 |
| U6 | Create swagger-editor page | Compose 3-panel layout: breadcrumb, toolbar (search/test/export), nav + editor + preview. State: YAML, parsed spec, validation, selected endpoint. Sample Petstore YAML. | U1, U2, U5 |
| U7 | Add to homepage grid | Add "Swagger Editor" to `lib/tools.tsx` | U6 |

## Acceptance Criteria

- [ ] Page renders at `/tools/swagger-editor`
- [ ] 3-panel layout: navigation (left), editor (center), preview (right)
- [ ] YAML editor with line numbers and monospace font
- [ ] Live preview updates as YAML changes
- [ ] Navigation tree shows endpoints grouped with HTTP method badges
- [ ] Endpoint cards expand/collapse to show parameters + responses
- [ ] Schema section displays model properties with types
- [ ] Validation status in status bar (Valid OpenAPI / Invalid)
- [ ] HTTP methods color-coded (GET=green, POST=blue, PUT=orange, DELETE=red)
- [ ] Search input in toolbar
- [ ] Export/download button works
- [ ] Responsive: collapses sidebar + preview on smaller screens
- [ ] Breadcrumb navigation present
- [ ] Build passes (`pnpm build`)
- [ ] Tool appears on homepage grid
