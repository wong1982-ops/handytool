# DiffMaster — Design Document

> **For Claude:** Use superpowers:writing-plans to create implementation plans from this design.

**Date:** 2026-02-12
**Status:** Design Approved

---

## Overview

DiffMaster is a fully client-side text/code diff comparison tool. Two CodeMirror 6 editors with real-time diff highlighting, synchronized scrolling, language detection, and merge capabilities. No API dependency.

---

## Dependencies

| Package | Purpose |
|---|---|
| `@codemirror/view`, `@codemirror/state` | Core editor framework |
| `@codemirror/lang-javascript`, `lang-python`, `lang-html`, `lang-css`, `lang-json`, `lang-markdown`, `lang-java`, `lang-xml`, `lang-sql`, `lang-php`, `lang-rust`, `lang-go`, `lang-cpp` | Language support (dynamically imported) |
| `@codemirror/theme-one-dark` | Dark theme matching HandyTool palette |
| `diff` (jsdiff) | Line-level and character-level diff computation |

All client-side. No server component needed.

---

## File Structure

```
app/tools/diff-master/
  page.tsx              — main page, state management, layout
  layout.tsx            — SEO metadata

tools/diff-master/
  types.ts              — DiffLine, DiffResult, ViewMode, ComparisonSettings
  use-diff-engine.ts    — hook wrapping jsdiff: takes two strings, returns DiffResult
  editor-pane.tsx       — CodeMirror 6 editor with diff line decorations
  unified-view.tsx      — unified diff display (single CodeMirror, read-only)
  center-gutter.tsx     — SVG connector lines between changed blocks
  comparison-settings.tsx — dropdown: ignore whitespace, ignore case, context lines
  status-bar.tsx        — language, stats, encoding, cursor position
  language-detect.ts    — detect language from extension or content sniffing
```

---

## State (page.tsx)

| State | Type | Purpose |
|---|---|---|
| `originalText` | `string` | Left editor content |
| `modifiedText` | `string` | Right editor content |
| `originalFilename` | `string` | Left pane filename (for language detect + download) |
| `modifiedFilename` | `string` | Right pane filename |
| `viewMode` | `'side-by-side' \| 'unified'` | Current view toggle |
| `diffResult` | `DiffResult` | Computed diff (memoized, debounced 300ms) |
| `syncScroll` | `boolean` | Sync scroll toggle (default: true) |
| `settings` | `ComparisonSettings` | Ignore whitespace, ignore case, context lines |
| `language` | `string` | Detected or manually set language |

---

## Diff Engine (`use-diff-engine.ts`)

### Types

```typescript
interface DiffLine {
  type: 'equal' | 'add' | 'remove'
  content: string
  originalLine?: number
  modifiedLine?: number
}

interface DiffResult {
  lines: DiffLine[]
  stats: {
    additions: number
    deletions: number
    changedBlocks: number
  }
}

interface ComparisonSettings {
  ignoreWhitespace: boolean
  ignoreCase: boolean
  contextLines: number   // 0-10, default 3
}
```

### Algorithm

1. Call `Diff.diffLines(original, modified, { ignoreWhitespace, ignoreCase })`
2. Map result chunks into `DiffLine[]` with computed line numbers for both sides
3. Count stats: additions, deletions, contiguous changed blocks
4. Character-level highlighting: run `Diff.diffWords()` on paired add/remove lines to highlight specific word changes with stronger color
5. Debounced via 300ms delay — re-computes only when inputs stabilize
6. "Compare Now" button forces immediate re-computation

---

## Side-by-Side View

### Left Pane ("Original")

- Full CodeMirror 6 editor, editable
- Diff decorations via CodeMirror `ViewPlugin`:
  - `remove` lines → red background (`rgba(249, 38, 114, 0.15)`) + 4px red left border
  - `equal` lines → no decoration
- Header: filename input + "ORIGINAL" badge + Download button

### Right Pane ("Modified")

- Same CodeMirror setup
- Diff decorations:
  - `add` lines → green background (`rgba(166, 226, 46, 0.15)`) + 4px green left border
  - `equal` lines → no decoration
- Header: filename input + "MODIFIED" badge + Clear + Download button

### Center Gutter (`center-gutter.tsx`)

- ~40px column between the two editors
- SVG with curved connector lines linking changed blocks left-to-right
- Red-to-green gradient on connector paths
- Small arrow icons at connection points — click to merge that block from one side to the other
- Recalculated on diff change and scroll position change

### Sync Scroll

- Listen to CodeMirror `scrolldom` scroll events on both editors
- When one scrolls, compute scroll percentage (`scrollTop / scrollHeight`)
- Apply same percentage to the other editor
- Guard against feedback loops with `isScrolling` ref flag
- Toggle on/off via pill button in top bar (default: on)

---

## Unified View

### Display (`unified-view.tsx`)

- Single CodeMirror instance, read-only
- Delete lines prefixed with `-`, red background
- Add lines prefixed with `+`, green background
- Context lines (unchanged) shown with no prefix, dimmed
- Dual-column line number gutter (original + modified line counts)
- Configurable context lines around each change block

### Minimap Scrollbar

- Thin overlay on the right edge of unified view
- Color-coded blocks: red = deletions, green = additions
- Clicking jumps to that position in the diff
- Custom overlay element, not CodeMirror's built-in scrollbar

---

## Merge

| Action | Where | Behavior |
|---|---|---|
| Merge All | Top bar button (unified view) | Replaces original text with modified text |
| Per-block merge | Center gutter arrow icons (side-by-side) | Copies one block from modified → original (or reverse) |

After any merge, diff auto-recalculates.

---

## View Toggle

- Two buttons in top bar: "Unified" / "Side-by-Side"
- Active state has filled background
- Tab key toggles between views
- State preserved when switching (editor contents, scroll position)

---

## File Import

- Drag-drop files onto either pane, or click to browse
- `FileReader.readAsText()` loads content
- Filename set in pane header
- Language auto-detected from extension
- Accepted: any text file (no binary validation needed — just show raw content)

---

## Language Detection (`language-detect.ts`)

### Extension Mapping

| Extension | Language | CodeMirror Package |
|---|---|---|
| `.js`, `.jsx` | JavaScript | `@codemirror/lang-javascript` |
| `.ts`, `.tsx` | TypeScript | `@codemirror/lang-javascript` (typescript dialect) |
| `.py` | Python | `@codemirror/lang-python` |
| `.html` | HTML | `@codemirror/lang-html` |
| `.css`, `.scss` | CSS | `@codemirror/lang-css` |
| `.json` | JSON | `@codemirror/lang-json` |
| `.md` | Markdown | `@codemirror/lang-markdown` |
| `.java` | Java | `@codemirror/lang-java` |
| `.xml` | XML | `@codemirror/lang-xml` |
| `.sql` | SQL | `@codemirror/lang-sql` |
| `.php` | PHP | `@codemirror/lang-php` |
| `.rs` | Rust | `@codemirror/lang-rust` |
| `.go` | Go | `@codemirror/lang-go` |
| `.cpp`, `.c`, `.h` | C/C++ | `@codemirror/lang-cpp` |

### Content Sniffing (fallback)

- Shebang: `#!/usr/bin/python` → Python
- XML declaration: `<?xml` → XML
- HTML doctype: `<!DOCTYPE` → HTML
- Unknown → plain text (no highlighting)

### Dynamic Import

Language packages are loaded on demand — only import the grammar when detected. Keeps initial bundle small.

---

## Status Bar (`status-bar.tsx`)

| Left side | Right side |
|---|---|
| Language name (green dot) | Additions count (green) |
| Last comparison timestamp | Deletions count (red) |
| | Changed blocks count |
| | Encoding: UTF-8 |
| | Cursor: Line X, Col Y |

Updates in real-time as user edits or moves cursor.

---

## Top Bar Controls

| Control | Behavior |
|---|---|
| Sync Scroll pill | Toggle synchronized scrolling (default: on) |
| Comparison Settings dropdown | Ignore whitespace, ignore case, context lines (0-10) |
| Compare Now | Primary button, forces immediate diff computation |
| Unified / Side-by-Side toggle | Switch view mode (also Tab key) |
| Import | File picker to load text files into either pane |
| Merge All | Replace original with modified (unified view only) |

---

## Download

| Button | What it downloads |
|---|---|
| Download (left pane) | Original text as file, using original filename |
| Download (right pane) | Modified text as file, using modified filename |
| Download Modified File (unified) | Modified text as file |

Default filenames: `original.txt` / `modified.txt` if no filename set.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Tab | Toggle Side-by-Side / Unified |
| Ctrl+S | Download modified file |
| Ctrl+Shift+S | Download original file |
| Alt+Up / Alt+Down | Jump to previous / next change block |

---

## What Stays Unchanged

- HandyTool header/footer layout
- Brand colors and dark theme
- CSS custom properties (`--ht-*`)
- Tool directory pattern (`app/tools/` + `tools/`)
