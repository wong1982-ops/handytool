# Plan: JSON Converter Tool

**Date:** 2026-02-10
**BA:** Claude (AI)
**Status:** DEV COMPLETE

## Overview

Build a JSON Formatter & Converter tool from `designs/jsonConverter`. Two design screens provided — screen_1 (sidebar layout, light) and screen (split-view, dark). We'll implement the sidebar layout as the primary UI since it integrates better with the app layout, incorporating key elements from both designs.

This tool is **fully client-side** — no API needed. Conversion logic runs in the browser.

## Design Reference

- `designs/jsonConverter/screen.png` — Dark split-view: input + action strip + output
- `designs/jsonConverter/screen_1.png` — Light sidebar: actions sidebar + tabbed editor
- `designs/jsonConverter/code.html` / `code_1.html` — HTML references

## Design Analysis

### Features (combined from both screens)
1. **Beautify JSON** — Pretty-print with 2-space indent
2. **Minify JSON** — Compress to single line
3. **JSON → YAML** conversion
4. **YAML → JSON** conversion
5. **Live validation** — Show valid/invalid JSON badge
6. **Copy result** to clipboard
7. **Download** output as file
8. **Clear all** — Reset editor
9. **Status bar** — Encoding, line count, char count, format type

### Layout (sidebar approach from screen_1)
- Shared app header (existing)
- Left sidebar (w-64): Core Actions (Beautify, Minify), Conversion (To YAML, To JSON with kbd hints), Export (Copy, Download)
- Main area: Input/Output tabs, code editor with line numbers, status bar, floating "Convert Now" button

### Dependencies
- `js-yaml` — JSON ↔ YAML conversion (client-side library)

## Task Breakdown

### UI Tasks

| # | Task | Description | Depends On | Assigned To |
|---|------|-------------|------------|-------------|
| U1 | Install js-yaml | Add `js-yaml` + `@types/js-yaml` to toolk1t-client | — | Dev |
| U2 | Create converter-sidebar | Left sidebar: Core Actions (Beautify, Minify), Conversion (To YAML, To JSON with kbd), Export (Copy, Download). Accepts action callbacks. | — | Dev |
| U3 | Create code-editor | Textarea with line numbers gutter, monospace font, placeholder. Controlled component with onChange. | — | Dev |
| U4 | Create status-bar | Bottom bar: format type (JSON/YAML), encoding (UTF-8), line count, char count, validation badge. | — | Dev |
| U5 | Create json-converter page | Compose page: breadcrumb, sidebar + main editor area, Input/Output tabs, validation badge, floating Convert button, status bar. Implement all conversion logic (beautify, minify, toYAML, toJSON). Keyboard shortcuts. | U1–U4 | Dev |
| U6 | Add to homepage grid | Add "JSON Converter" tool to homepage. | U5 | Dev |

## Acceptance Criteria

- [ ] Page renders at `/tools/json-converter`
- [ ] Beautify JSON formats with 2-space indentation
- [ ] Minify JSON compresses to single line
- [ ] JSON → YAML conversion produces valid YAML
- [ ] YAML → JSON conversion produces valid JSON
- [ ] Live validation shows green "Valid JSON" or red "Invalid" badge
- [ ] Copy result copies output to clipboard with feedback
- [ ] Download exports output as .json or .yaml file
- [ ] Clear all resets editor content
- [ ] Status bar shows format, encoding, lines, chars
- [ ] Line numbers update as content changes
- [ ] Responsive: sidebar collapses on mobile
- [ ] Breadcrumb navigation present
- [ ] Build passes (`pnpm build`)
- [ ] Tool appears on homepage grid
