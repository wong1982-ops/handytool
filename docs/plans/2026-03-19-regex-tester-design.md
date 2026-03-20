# Regex Tester — Design Document

**Date:** 2026-03-19
**Status:** DESIGN APPROVED

---

## Understanding Summary

- **What:** A client-side Regex Tester tool with a curated preset pattern library, real-time match highlighting, capture group details, find & replace mode, shareable URLs, and local history
- **Why:** Give developers and general users a fast, zero-friction way to test regex patterns or pick from common presets (phone numbers by country, email, IP, etc.) without leaving Toolk1t
- **Who:** Developers (advanced features: flags, capture groups, replace) and general users (presets with descriptions and sample input)
- **Key constraints:** Fully client-side (JavaScript RegExp engine), no API dependency, follows existing tool pattern
- **Non-goals:** No server-side regex engines (PCRE, Python re), no user accounts/saved patterns to database, no regex builder/visual editor

## Assumptions

- JavaScript `RegExp` is sufficient (no lookbehind support on older Safari is an accepted tradeoff)
- Preset library is static/hardcoded (no API to fetch patterns)
- URL sharing encodes state in hash fragment (no short URL service)
- localStorage history stores last ~20 tests, no sync across devices

---

## Layout

### Desktop (>=1024px)

Two-panel layout with collapsible preset sidebar:

```
┌─────────────────────────────────────────────────┐
│ Breadcrumb: Home > Tools > Regex Tester         │
├──────────┬──────────────────────────────────────┤
│ Presets   │  Toolbar: [Match|Replace] Flags(g,i,m,s) History │
│ Sidebar   │──────────────────────────────────────│
│           │  Regex Input  [/pattern/]             │
│ [Search]  │──────────────────────────────────────│
│           │  Test Input (highlighted matches)     │
│ ▾ Phone   │                                      │
│   🇦🇺 AU  │                                      │
│   🇺🇸 US  │──────────────────────────────────────│
│   🇫🇷 FR  │  [Replace Input — visible in Replace mode] │
│ ▾ Network │──────────────────────────────────────│
│   IPv4    │  Match Results Panel                  │
│   IPv6    │  - Match 1: "..." (groups: ...)       │
│ ▾ Email   │  - Match 2: "..." (groups: ...)       │
│ ...       │                                      │
├──────────┴──────────────────────────────────────┤
│ Status bar: X matches | Y capture groups | flags │
└─────────────────────────────────────────────────┘
```

### Mobile (<1024px)

- Preset sidebar collapses to a "Patterns" button that opens a slide-up drawer
- Workspace goes full-width
- Match results panel collapses below test input

---

## Components

| File | Responsibility |
|---|---|
| `tools/regex-tester/preset-sidebar.tsx` | Searchable, categorized preset library. Desktop: fixed sidebar. Mobile: slide-up drawer triggered by button. Each preset has: name, flag emoji (if country-specific), regex string, sample input, description. |
| `tools/regex-tester/regex-input.tsx` | Regex pattern input with inline flag toggles (g, i, m, s). Shows validation error if regex is invalid. |
| `tools/regex-tester/test-input.tsx` | Textarea for test string. Renders an overlay layer that highlights matches with colored spans. Supports multi-line. |
| `tools/regex-tester/match-results.tsx` | Lists all matches with index, value, position, and expandable capture groups (named + numbered). Shows "No matches" state. |
| `tools/regex-tester/replace-panel.tsx` | Replacement input field + live preview of replaced output. Only visible in Replace mode. |
| `tools/regex-tester/regex-toolbar.tsx` | Mode toggle (Match/Replace), flag checkboxes, History button, Share button, Clear button. |
| `tools/regex-tester/history-drawer.tsx` | Slide-out list of last 20 tests from localStorage. Each entry shows truncated regex + timestamp. Click to restore. |
| `app/tools/regex-tester/page.tsx` | Page route. Wires all components together, manages state (regex, input, flags, mode), handles URL sharing (read/write hash fragment). |

No new shared components needed — existing `components/ui/` covers everything.

---

## Preset Pattern Library (~30 patterns across 6 categories)

### Phone Numbers
| Pattern | Flag | Description |
|---|---|---|
| AU Mobile | 🇦🇺 | `04XX XXX XXX` format |
| AU Landline | 🇦🇺 | `0X XXXX XXXX` format |
| US/CA | 🇺🇸🇨🇦 | `(XXX) XXX-XXXX` or `+1` format |
| UK | 🇬🇧 | `+44` / `07XXX` format |
| FR | 🇫🇷 | `+33` / `06/07` format |
| NZ | 🇳🇿 | `02X XXX XXXX` format |
| International (E.164) | — | `+` followed by 7-15 digits |

### Network
| Pattern | Description |
|---|---|
| IPv4 Address | `0.0.0.0` to `255.255.255.255` |
| IPv6 Address | Full and abbreviated formats |
| MAC Address | Colon and hyphen separated |
| URL | HTTP/HTTPS with optional path/query |
| Domain Name | Valid domain with TLD |

### Identity
| Pattern | Flag | Description |
|---|---|---|
| Email Address | — | RFC 5322 simplified |
| AU TFN | 🇦🇺 | 8-9 digit tax file number |
| AU ABN | 🇦🇺 | 11-digit business number |
| US SSN | 🇺🇸 | `XXX-XX-XXXX` format |
| Passport Number | — | Generic alphanumeric |

### Financial
| Pattern | Description |
|---|---|
| Credit Card (Visa) | Starts with 4, 16 digits |
| Credit Card (Mastercard) | Starts with 5, 16 digits |
| IBAN | International bank account |
| AU BSB | 6-digit `XXX-XXX` format |

### Date & Time
| Pattern | Description |
|---|---|
| ISO 8601 | `YYYY-MM-DDTHH:mm:ss` |
| DD/MM/YYYY | Common AU/UK format |
| MM/DD/YYYY | US format |
| 24hr Time | `HH:mm` or `HH:mm:ss` |

### Common
| Pattern | Description |
|---|---|
| Hex Color | `#RGB` or `#RRGGBB` |
| Slug | Lowercase alphanumeric with hyphens |
| UUID | v4 format |
| Semantic Version | `MAJOR.MINOR.PATCH` |
| HTML Tag | Opening/closing/self-closing tags |

---

## State Management

### Core State (page.tsx)
```typescript
regex: string          // the pattern
flags: string          // combination of "g", "i", "m", "s"
testInput: string      // user's test string
replaceInput: string   // replacement pattern
mode: "match" | "replace"
```

### URL Sharing (hash fragment)
```
/tools/regex-tester#r=base64(regex)&f=gi&t=base64(testInput)&m=match&rp=base64(replaceInput)
```
- `r` = base64-encoded regex
- `f` = flags string
- `t` = base64-encoded test input
- `m` = mode (match/replace)
- `rp` = base64-encoded replace pattern (only in replace mode)

Share button copies full URL to clipboard.

### History (localStorage)
```
Key: "tk-regex-history"
Value: Array of { regex, flags, testInput, mode, timestamp }
Max: 20 entries, FIFO
```
Saved automatically (debounced 2s). Duplicate combos update timestamp instead of creating new entries.

### Match Computation
- Runs on every keystroke (debounced 100ms)
- Uses `RegExp` constructor with try/catch for invalid patterns
- If invalid: show inline error, no matches
- If valid: compute all matches with `matchAll`, extract groups, highlight positions

---

## Edge Cases & Error Handling

| Scenario | Behaviour |
|---|---|
| Invalid regex | Red border + inline error message, match panel shows empty state |
| Catastrophic backtracking | 100ms execution timeout, show "Pattern too complex" warning |
| No regex entered | Placeholder: "Enter a regex pattern or select a preset" |
| Valid regex, no matches | "No matches found" in match panel |
| No test input | "Enter test text to see matches" in match panel |
| Test input > 50KB | Disable live highlighting, still list matches |
| Match count > 1000 | Truncate at 1000 with "Showing first 1,000 of X matches" |
| Preset changes flags | Auto-set flags + brief toast "Flags updated to match preset" |
| Lookbehind on old Safari | Show "This pattern uses lookbehind which isn't supported in your browser" |

---

## Decision Log

| # | Decision | Alternatives | Reason |
|---|---|---|---|
| 1 | Both preset library + freeform tester | Tester only; Presets only | Presets are the differentiator, freeform is the core utility |
| 2 | Target both devs and general users | Dev-only; General-only | Clean defaults + expandable advanced options serves both |
| 3 | Client-side only (JS RegExp) | Server-side; Hybrid | Zero latency, no API dependency, sufficient for the use case |
| 4 | Categorized presets with country flags | Flat list; Categories without flags | Best discoverability and scannability |
| 5 | Preset populates regex + sample input + description | Regex only; Regex + sample | Users see it working immediately, description aids learning |
| 6 | Highlight + match list + capture groups | Highlight only; Highlight + list | Developers need capture group details, general users can ignore |
| 7 | Match + Replace toggle mode | Match only; Minimal replace | Replace is a common workflow, toggle keeps UI clean |
| 8 | Shareable URLs + localStorage history | Neither; One of them | URLs enable collaboration, history enables personal productivity |
| 9 | Two-panel with collapsible sidebar | Single panel + modal; Three-panel | Best preset discoverability, good mobile adaptation, matches existing codebase |
| 10 | Hash fragment for URL sharing | Query params | Avoids server round-trip, handles long inputs and special characters |
| 11 | 100ms debounce for match computation | No debounce; 300ms | Fast enough to feel instant, prevents lag on large inputs |
| 12 | 100ms timeout for catastrophic backtracking | No timeout; Web Worker | Simple, prevents browser freeze, Worker is over-engineered for this |
