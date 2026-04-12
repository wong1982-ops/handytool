# Multi-Format Formatter Tool — Design Spec

**Date**: 2026-04-11
**Status**: APPROVED (brainstorming complete)

---

## Understanding Summary

- **What**: A multi-format formatter tool — single page with auto-detect dropdown, 12 formats, format/minify/validate/convert/diff features
- **Why**: Give developers a fast, full-featured all-in-one formatter (replaces jumping between jsonformatter.org, sqlformat.org, etc.)
- **Who**: Developers (frontend, backend, data) — quick utility for everyday work
- **Key features**:
  - 12 formats: JSON, XML, YAML, SQL, HTML, CSS, JavaScript, TypeScript, Markdown, GraphQL, TOML, INI
  - Auto-detect format from pasted content + manual dropdown override
  - 5 actions: Format, Minify, Validate, Convert (between compatible formats), Diff (side-by-side)
  - Plain textarea editor (v1) → upgrade to CodeMirror later
  - Hybrid execution: lightweight formats client-side, heavy ones server-side
  - Up to 1MB input
  - Fully responsive — works on mobile
  - Stateless — no login, no history, no logging
- **Constraints**: Privacy-conscious (server never logs content), 1MB max input
- **Non-goals**: No saved snippets, no user accounts, no AI assistance, no syntax highlighting in v1

---

## Assumptions

1. Use established libraries: `prettier` for code formats (server-side), `sql-formatter` (client), `yaml`, `fast-xml-parser`, `@iarna/toml`, `ini`, `diff`
2. Auto-detect heuristic: try parse as JSON → XML tags → YAML colons → SQL keywords → fallback "unknown"
3. Convert pairs: JSON↔YAML, JSON↔XML, JSON↔TOML — only between data-format compatibles
4. Diff uses a lightweight diff library (`diff` npm package), text-based not AST-based
5. Live in `app/tools/formatter/` and `tools/formatter/` per Toolk1t pattern
6. Bilingual (EN/ZH) following project convention

---

## Architecture

### Layout — Single-Page Studio

**Top bar (always visible):**
- Format dropdown (defaults to "Auto", auto-detects on paste, user can override)
- 5 action buttons: Format | Minify | Validate | Convert | Diff
- Convert dropdown appears when Convert is active

**Main area — two modes:**

Standard mode (Format/Minify/Validate/Convert):
```
┌─────────┬─────────┐
│ Input   │ Output  │
│         │ readonly│
└─────────┴─────────┘
```

Diff mode:
```
┌─────────┬─────────┐
│ Input A │ Input B │
└─────────┴─────────┘
┌───────────────────┐
│ Diff result       │
└───────────────────┘
```

**Bottom bar:**
- Validation status (✓ Valid / ✗ Error at line N)
- Byte/line counts
- Privacy notice: "Your content is never stored"
- Copy and Download buttons

**Mobile:**
- Top bar wraps to two rows
- Input/Output stack vertically
- Diff: A → B → result, all stacked

---

## Format Library Mapping

| Format | Library | Execution |
|---|---|---|
| JSON | `JSON.parse` / `JSON.stringify` | Client |
| YAML | `yaml` | Client |
| XML | `fast-xml-parser` + custom indenter | Client |
| TOML | `@iarna/toml` | Client |
| INI | `ini` | Client |
| SQL | `sql-formatter` | Client |
| Markdown | `prettier` markdown plugin | Server |
| HTML | `prettier` html plugin | Server |
| CSS | `prettier` css plugin | Server |
| JavaScript | `prettier` babel plugin | Server |
| TypeScript | `prettier` typescript plugin | Server |
| GraphQL | `prettier` graphql plugin | Server |

**Rationale**: Prettier + plugins is ~2MB. Server-side keeps client bundle small. Other libs are <50KB each.

---

## Auto-Detection Heuristic

Priority order (first match wins):
1. Starts with `{` or `[` → try JSON.parse → JSON
2. Starts with `<?xml` or `<` (and looks like XML) → XML
3. Contains `---` line + `key:` patterns → YAML
4. Starts with `# ` heading or contains `**bold**` → Markdown
5. Contains `SELECT|INSERT|UPDATE|DELETE|CREATE` (case-insensitive) → SQL
6. Contains `query|mutation|subscription {` → GraphQL
7. Starts with `<!DOCTYPE` or `<html` → HTML
8. Contains `interface|type X =|: string` → TypeScript
9. Contains `function|const|let|=>` → JavaScript
10. Contains `{` and `:` and `;` and CSS-like selectors → CSS
11. Contains `[section]` headers → TOML (if `=` present) or INI
12. Fallback → Unknown (user picks manually)

---

## Convert Compatibility Matrix

Only data-format conversions (not code):
- JSON ↔ YAML (round-trip safe)
- JSON ↔ XML (lossy)
- JSON ↔ TOML (round-trip safe for simple cases)
- YAML → JSON
- TOML → JSON

Code formats (HTML/CSS/JS/TS/SQL/Markdown/GraphQL) cannot be "converted" — only formatted/minified.

---

## Action Behaviors

**Format**: paste → prettified output. Auto-format on paste (debounced 500ms). Server-side formats show loading spinner.

**Minify**:
- JSON: `JSON.stringify(JSON.parse(input))`
- HTML/CSS/JS/TS: server-side via `html-minifier-terser`, `csso`, `terser`
- Other formats: button greyed out

**Validate**: parse only, no output. Status bar shows "✓ Valid" or "✗ Error at line N, col M". For valid content shows summary ("Object with 5 keys", "Array of 12 items").

**Convert**: client-side, dropdown lists compatible targets only.

**Diff**:
- Layout switches to A/B inputs + result below
- Uses `diff.diffLines`
- Color-coded: green additions, red deletions, gray unchanged
- For data formats, normalizes (parse → stringify) both inputs first

---

## API Routes

```
POST /api/v1/formatter/format
```

Single endpoint, multiple formats.

**Request body:**
```typescript
{
  format: 'html' | 'css' | 'javascript' | 'typescript' | 'markdown' | 'graphql',
  action: 'format' | 'minify',
  content: string  // max 1MB
}
```

**Response:**
```typescript
// success
{ data: { result: string } }
// error
{ error: 'Parse error', code: 'PARSE_ERROR', details: { line: 5, column: 12, message: '...' } }
```

**Privacy guarantees:**
- No `console.log` of `content` parameter
- No database writes
- No analytics events containing content
- Visible "Your content is never stored" notice in the UI

---

## Component Structure

```
tools/formatter/
  formatter-types.ts              → Format, Action, ConvertTarget types
  formatter-defaults.ts           → format definitions, convert matrix
  formatter-detector.ts           → auto-detect heuristic
  formatter-client.ts             → client-side format/minify/validate/convert dispatch
  i18n/en.ts                      → English strings
  i18n/zh.ts                      → Chinese strings

  formatter-studio.tsx            → main container (state + layout)
  formatter-toolbar.tsx           → top bar (format dropdown + action buttons)
  formatter-editor.tsx            → input/output textarea pair
  formatter-diff.tsx              → diff mode layout + diff renderer
  formatter-status-bar.tsx        → bottom bar (validation, counts, copy/download)

app/tools/formatter/
  page.tsx                        → route entry
  layout.tsx                      → SEO metadata

app/api/v1/formatter/
  format/route.ts                 → server-side prettier
```

---

## State Management

Single `useState` in `formatter-studio.tsx`:

```typescript
interface FormatterState {
  input: string
  inputB: string             // for diff mode
  output: string
  format: Format | 'auto'
  detectedFormat: Format | null
  action: Action
  convertTarget: Format | null
  validation: { ok: boolean; error?: { line?: number; column?: number; message: string } } | null
  loading: boolean
}
```

No reducer, no context — small enough for plain `useState` + callbacks.

---

## Edge Cases

| Case | Handling |
|---|---|
| Empty input | All actions disabled, "Paste content to begin" |
| Input > 1MB | Error toast, action disabled |
| Server error | "✗ Server error — try again", input preserved |
| Network failure | Same as server error |
| Auto-detect fails | Format dropdown stays at "Auto" |
| User pastes mid-edit | Auto-detect re-runs only on full replace |
| Convert source = target | Excluded from dropdown |
| Diff mode + only one input | "Add content to both sides to compare" |
| Copy button success | Toast: "Copied to clipboard" |
| Download | Triggers download with `formatted.{ext}` |

---

## i18n

```
tools/formatter/i18n/
  en.ts
  zh.ts
```

All UI strings, error messages, status messages, action button labels, privacy notice — bilingual. Format names stay in English (universal terms). Language toggle in page header.

---

## Decision Log

| # | Decision | Alternatives | Why |
|---|---|---|---|
| 1 | Multi-format formatter (one tool) | Several individual tools | Single tool with tabs |
| 2 | 12 formats | 5–6 essentials, 8 web-dev | Comprehensive |
| 3 | Format + Minify + Validate + Convert + Diff | Format-only, etc. | Full-featured |
| 4 | Auto-detect + dropdown override | Top tabs, sidebar | Frictionless paste-and-go |
| 5 | Plain textarea v1 → CodeMirror later | Monaco from start | Ship fast |
| 6 | Hybrid execution | All client, all server | Small bundle + offline JSON/SQL |
| 7 | Stateless, no auth | Login + history | Pure utility |
| 8 | 1MB max input | 100KB, 10MB | Reasonable for real-world |
| 9 | Fully responsive | Desktop-only | Universal access |
| 10 | Privacy-conscious — no logging | Free logging | User asked for it |
| 11 | Bilingual EN+ZH | English-only | Matches Toolk1t convention |
| 12 | Single-page Studio | Tabs per action, wizard | Right pattern for utility |
| 13 | Single API endpoint `/format` | Per-format/per-action | DRY |
| 14 | Auto-detect heuristic | AI-based, manual only | Fast, deterministic, free |
| 15 | Diff via `diff` npm | AST-based per format | Universal, simple |
| 16 | Convert only between data formats | Try to convert code | Code conversion undefined |
