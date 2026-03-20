# Regex Tester Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a client-side Regex Tester with a curated ~30-pattern preset library, real-time match highlighting, capture groups, find & replace, shareable URLs, and localStorage history.

**Architecture:** Two-panel layout — collapsible preset sidebar (left) + main workspace (right). All regex execution is client-side via JavaScript `RegExp`. State encoded in URL hash for sharing. History persisted in localStorage (max 20 entries).

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, no external dependencies.

**Design doc:** `docs/plans/2026-03-19-regex-tester-design.md`

---

### Task 1: Types & Preset Data

**Files:**
- Create: `tools/regex-tester/types.ts`
- Create: `tools/regex-tester/presets.ts`

**Step 1: Create types file**

```typescript
// tools/regex-tester/types.ts

export type RegexMode = 'match' | 'replace'

export interface RegexMatch {
  index: number
  value: string
  start: number
  end: number
  groups: Record<string, string | undefined>
}

export interface RegexState {
  regex: string
  flags: string
  testInput: string
  replaceInput: string
  mode: RegexMode
}

export interface PresetPattern {
  id: string
  name: string
  flag?: string        // country flag emoji, e.g. "\u{1F1E6}\u{1F1FA}"
  category: PresetCategory
  regex: string
  sampleInput: string
  description: string
  defaultFlags?: string // e.g. "gi"
}

export type PresetCategory = 'phone' | 'network' | 'identity' | 'financial' | 'datetime' | 'common'

export const PRESET_CATEGORY_LABELS: Record<PresetCategory, string> = {
  phone: 'Phone Numbers',
  network: 'Network',
  identity: 'Identity',
  financial: 'Financial',
  datetime: 'Date & Time',
  common: 'Common',
}

export interface HistoryEntry {
  regex: string
  flags: string
  testInput: string
  mode: RegexMode
  timestamp: number
}
```

**Step 2: Create presets file with all ~30 patterns**

```typescript
// tools/regex-tester/presets.ts

import type { PresetPattern } from './types'

export const PRESETS: PresetPattern[] = [
  // --- Phone Numbers ---
  {
    id: 'au-mobile',
    name: 'AU Mobile',
    flag: '\u{1F1E6}\u{1F1FA}',
    category: 'phone',
    regex: '(?:\\+?61|0)4\\d{2}[\\s-]?\\d{3}[\\s-]?\\d{3}',
    sampleInput: 'Valid: 0412 345 678, +61412345678\nInvalid: 0312 345 678, 12345',
    description: 'Australian mobile numbers starting with 04 or +614.',
    defaultFlags: 'gm',
  },
  {
    id: 'au-landline',
    name: 'AU Landline',
    flag: '\u{1F1E6}\u{1F1FA}',
    category: 'phone',
    regex: '(?:\\+?61|0)[2-9]\\d?[\\s-]?\\d{4}[\\s-]?\\d{4}',
    sampleInput: 'Valid: 02 9876 5432, +61398765432\nInvalid: 0412 345 678',
    description: 'Australian landline numbers starting with area code (02-09).',
    defaultFlags: 'gm',
  },
  {
    id: 'us-ca-phone',
    name: 'US/CA Phone',
    flag: '\u{1F1FA}\u{1F1F8}\u{1F1E8}\u{1F1E6}',
    category: 'phone',
    regex: '(?:\\+?1[\\s.-]?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}',
    sampleInput: 'Valid: (555) 123-4567, +1 555.123.4567, 5551234567\nInvalid: 123-456',
    description: 'US and Canadian phone numbers with optional +1 country code.',
    defaultFlags: 'gm',
  },
  {
    id: 'uk-phone',
    name: 'UK Phone',
    flag: '\u{1F1EC}\u{1F1E7}',
    category: 'phone',
    regex: '(?:\\+?44[\\s-]?|0)7\\d{3}[\\s-]?\\d{6}',
    sampleInput: 'Valid: 07911 123456, +44 7911 123456\nInvalid: 01onal 123456',
    description: 'UK mobile numbers starting with 07 or +447.',
    defaultFlags: 'gm',
  },
  {
    id: 'fr-phone',
    name: 'FR Phone',
    flag: '\u{1F1EB}\u{1F1F7}',
    category: 'phone',
    regex: '(?:\\+?33[\\s-]?|0)[67]\\d{2}[\\s-]?\\d{2}[\\s-]?\\d{2}[\\s-]?\\d{2}',
    sampleInput: 'Valid: 06 12 34 56 78, +33 7 12 34 56 78\nInvalid: 01 12 34 56 78',
    description: 'French mobile numbers starting with 06/07 or +336/+337.',
    defaultFlags: 'gm',
  },
  {
    id: 'nz-phone',
    name: 'NZ Phone',
    flag: '\u{1F1F3}\u{1F1FF}',
    category: 'phone',
    regex: '(?:\\+?64|0)2\\d[\\s-]?\\d{3,4}[\\s-]?\\d{4}',
    sampleInput: 'Valid: 021 123 4567, +64 22 1234 5678\nInvalid: 091 234 5678',
    description: 'New Zealand mobile numbers starting with 02X.',
    defaultFlags: 'gm',
  },
  {
    id: 'e164',
    name: 'International (E.164)',
    category: 'phone',
    regex: '\\+[1-9]\\d{6,14}',
    sampleInput: 'Valid: +61412345678, +14155552671\nInvalid: +0123456, 0412345678',
    description: 'International phone numbers in E.164 format: + followed by 7-15 digits.',
    defaultFlags: 'gm',
  },

  // --- Network ---
  {
    id: 'ipv4',
    name: 'IPv4 Address',
    category: 'network',
    regex: '(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)(?:\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)){3}',
    sampleInput: 'Valid: 192.168.1.1, 10.0.0.255, 0.0.0.0\nInvalid: 256.1.1.1, 192.168.1',
    description: 'IPv4 addresses from 0.0.0.0 to 255.255.255.255.',
    defaultFlags: 'gm',
  },
  {
    id: 'ipv6',
    name: 'IPv6 Address',
    category: 'network',
    regex: '(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}',
    sampleInput: 'Valid: 2001:0db8:85a3:0000:0000:8a2e:0370:7334, ::1\nInvalid: 12345::abcd::1',
    description: 'IPv6 addresses in full and abbreviated formats.',
    defaultFlags: 'gm',
  },
  {
    id: 'mac-address',
    name: 'MAC Address',
    category: 'network',
    regex: '(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}',
    sampleInput: 'Valid: 00:1A:2B:3C:4D:5E, 00-1A-2B-3C-4D-5E\nInvalid: 00:1A:2B:3C:4D',
    description: 'MAC addresses in colon or hyphen separated format.',
    defaultFlags: 'gm',
  },
  {
    id: 'url',
    name: 'URL',
    category: 'network',
    regex: 'https?://[\\w-]+(?:\\.[\\w-]+)+(?:/[\\w.,@?^=%&:/~+#-]*)?',
    sampleInput: 'Valid: https://example.com/path?q=test, http://sub.domain.io\nInvalid: ftp://server, not-a-url',
    description: 'HTTP and HTTPS URLs with optional path and query string.',
    defaultFlags: 'gm',
  },
  {
    id: 'domain',
    name: 'Domain Name',
    category: 'network',
    regex: '(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,}',
    sampleInput: 'Valid: example.com, sub.domain.co.uk\nInvalid: -invalid.com, .com',
    description: 'Valid domain names with at least one subdomain and a TLD.',
    defaultFlags: 'gm',
  },

  // --- Identity ---
  {
    id: 'email',
    name: 'Email Address',
    category: 'identity',
    regex: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    sampleInput: 'Valid: user@example.com, first.last+tag@sub.domain.io\nInvalid: @missing.com, user@.com',
    description: 'Email addresses (simplified RFC 5322).',
    defaultFlags: 'gm',
  },
  {
    id: 'au-tfn',
    name: 'AU TFN',
    flag: '\u{1F1E6}\u{1F1FA}',
    category: 'identity',
    regex: '\\d{3}[\\s-]?\\d{3}[\\s-]?\\d{2,3}',
    sampleInput: 'Valid: 123 456 789, 123-456-78\nInvalid: 12 345 6789',
    description: 'Australian Tax File Number (8-9 digits).',
    defaultFlags: 'gm',
  },
  {
    id: 'au-abn',
    name: 'AU ABN',
    flag: '\u{1F1E6}\u{1F1FA}',
    category: 'identity',
    regex: '\\d{2}[\\s-]?\\d{3}[\\s-]?\\d{3}[\\s-]?\\d{3}',
    sampleInput: 'Valid: 51 824 753 556, 51-824-753-556\nInvalid: 1234567890',
    description: 'Australian Business Number (11 digits).',
    defaultFlags: 'gm',
  },
  {
    id: 'us-ssn',
    name: 'US SSN',
    flag: '\u{1F1FA}\u{1F1F8}',
    category: 'identity',
    regex: '\\d{3}-\\d{2}-\\d{4}',
    sampleInput: 'Valid: 123-45-6789\nInvalid: 123456789, 123-4-56789',
    description: 'US Social Security Number in XXX-XX-XXXX format.',
    defaultFlags: 'gm',
  },
  {
    id: 'passport',
    name: 'Passport Number',
    category: 'identity',
    regex: '[A-Z]{1,2}\\d{6,9}',
    sampleInput: 'Valid: A12345678, PA1234567\nInvalid: 123456789, abc123',
    description: 'Generic passport number: 1-2 uppercase letters followed by 6-9 digits.',
    defaultFlags: 'gm',
  },

  // --- Financial ---
  {
    id: 'visa-card',
    name: 'Credit Card (Visa)',
    category: 'financial',
    regex: '4\\d{3}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}',
    sampleInput: 'Valid: 4111 1111 1111 1111, 4111-1111-1111-1111\nInvalid: 5111 1111 1111 1111',
    description: 'Visa card numbers starting with 4 (16 digits).',
    defaultFlags: 'gm',
  },
  {
    id: 'mastercard',
    name: 'Credit Card (Mastercard)',
    category: 'financial',
    regex: '5[1-5]\\d{2}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}',
    sampleInput: 'Valid: 5500 0000 0000 0004\nInvalid: 4111 1111 1111 1111',
    description: 'Mastercard numbers starting with 51-55 (16 digits).',
    defaultFlags: 'gm',
  },
  {
    id: 'iban',
    name: 'IBAN',
    category: 'financial',
    regex: '[A-Z]{2}\\d{2}[\\s-]?[A-Z0-9]{4}(?:[\\s-]?[A-Z0-9]{4}){2,7}(?:[\\s-]?[A-Z0-9]{1,4})?',
    sampleInput: 'Valid: GB29 NWBK 6016 1331 9268 19, DE89370400440532013000\nInvalid: US12345',
    description: 'International Bank Account Number.',
    defaultFlags: 'gm',
  },
  {
    id: 'au-bsb',
    name: 'AU BSB',
    flag: '\u{1F1E6}\u{1F1FA}',
    category: 'financial',
    regex: '\\d{3}-\\d{3}',
    sampleInput: 'Valid: 062-000, 033-123\nInvalid: 06200, 0620-00',
    description: 'Australian BSB number in XXX-XXX format.',
    defaultFlags: 'gm',
  },

  // --- Date & Time ---
  {
    id: 'iso8601',
    name: 'ISO 8601',
    category: 'datetime',
    regex: '\\d{4}-\\d{2}-\\d{2}(?:T\\d{2}:\\d{2}(?::\\d{2})?(?:\\.\\d+)?(?:Z|[+-]\\d{2}:?\\d{2})?)?',
    sampleInput: 'Valid: 2026-03-19, 2026-03-19T14:30:00Z, 2026-03-19T14:30:00+10:00\nInvalid: 19-03-2026',
    description: 'ISO 8601 date/datetime format.',
    defaultFlags: 'gm',
  },
  {
    id: 'dd-mm-yyyy',
    name: 'DD/MM/YYYY',
    category: 'datetime',
    regex: '(?:0[1-9]|[12]\\d|3[01])[/.-](?:0[1-9]|1[0-2])[/.-]\\d{4}',
    sampleInput: 'Valid: 19/03/2026, 01.12.2025\nInvalid: 32/13/2026, 2026/03/19',
    description: 'Date in DD/MM/YYYY format (common in AU/UK).',
    defaultFlags: 'gm',
  },
  {
    id: 'mm-dd-yyyy',
    name: 'MM/DD/YYYY',
    category: 'datetime',
    regex: '(?:0[1-9]|1[0-2])[/.-](?:0[1-9]|[12]\\d|3[01])[/.-]\\d{4}',
    sampleInput: 'Valid: 03/19/2026, 12.01.2025\nInvalid: 13/32/2026',
    description: 'Date in MM/DD/YYYY format (US format).',
    defaultFlags: 'gm',
  },
  {
    id: '24hr-time',
    name: '24hr Time',
    category: 'datetime',
    regex: '(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d)?',
    sampleInput: 'Valid: 14:30, 23:59:59, 00:00\nInvalid: 25:00, 12:60',
    description: '24-hour time in HH:mm or HH:mm:ss format.',
    defaultFlags: 'gm',
  },

  // --- Common ---
  {
    id: 'hex-color',
    name: 'Hex Color',
    category: 'common',
    regex: '#(?:[0-9A-Fa-f]{3}){1,2}\\b',
    sampleInput: 'Valid: #fff, #3D6AF2, #a0b1c2\nInvalid: #gg0000, 3D6AF2',
    description: 'Hex color codes in #RGB or #RRGGBB format.',
    defaultFlags: 'gm',
  },
  {
    id: 'slug',
    name: 'Slug',
    category: 'common',
    regex: '[a-z0-9]+(?:-[a-z0-9]+)*',
    sampleInput: 'Valid: my-page-slug, hello-world, test123\nInvalid: My Slug, hello--world',
    description: 'URL-friendly slugs: lowercase alphanumeric with single hyphens.',
    defaultFlags: 'gm',
  },
  {
    id: 'uuid',
    name: 'UUID v4',
    category: 'common',
    regex: '[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}',
    sampleInput: 'Valid: 550e8400-e29b-41d4-a716-446655440000\nInvalid: 550e8400-e29b-11d4-a716-446655440000',
    description: 'UUID version 4 format.',
    defaultFlags: 'gim',
  },
  {
    id: 'semver',
    name: 'Semantic Version',
    category: 'common',
    regex: '\\d+\\.\\d+\\.\\d+(?:-[\\w.]+)?(?:\\+[\\w.]+)?',
    sampleInput: 'Valid: 1.0.0, 2.3.1-beta.1, 0.1.0+build.42\nInvalid: 1.0, v1.0.0',
    description: 'Semantic versioning: MAJOR.MINOR.PATCH with optional pre-release and build metadata.',
    defaultFlags: 'gm',
  },
  {
    id: 'html-tag',
    name: 'HTML Tag',
    category: 'common',
    regex: '<\\/?[a-zA-Z][a-zA-Z0-9]*(?:\\s[^>]*)?\\/?>',
    sampleInput: 'Valid: <div>, </span>, <img src="x" />, <br/>\nInvalid: < div>, <123>',
    description: 'HTML opening, closing, and self-closing tags.',
    defaultFlags: 'gm',
  },
]
```

**Step 3: Verify no TypeScript errors**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && npx tsc --noEmit --strict tools/regex-tester/types.ts tools/regex-tester/presets.ts 2>&1 || echo "Check errors"`

(Since these are standalone files, basic type consistency check. Full build verification comes later.)

**Step 4: Commit**

```bash
git add tools/regex-tester/types.ts tools/regex-tester/presets.ts
git commit -m "feat(regex-tester): add types and preset pattern library (~30 patterns)"
```

---

### Task 2: Regex Execution Engine & URL/History Helpers

**Files:**
- Create: `tools/regex-tester/use-regex-engine.ts`
- Create: `tools/regex-tester/url-sharing.ts`
- Create: `tools/regex-tester/history.ts`

**Step 1: Create the regex execution hook**

This hook takes regex string, flags, and test input — returns matches, errors, and replace result.

```typescript
// tools/regex-tester/use-regex-engine.ts
'use client'

import { useMemo } from 'react'
import type { RegexMatch } from './types'

interface EngineResult {
  matches: RegexMatch[]
  error: string | null
  replaceResult: string | null
  matchCount: number
  groupCount: number
}

const MAX_MATCHES = 1000
const EXEC_TIMEOUT_MS = 100

export function useRegexEngine(
  regex: string,
  flags: string,
  testInput: string,
  replaceInput: string,
  mode: 'match' | 'replace',
): EngineResult {
  return useMemo(() => {
    if (!regex || !testInput) {
      return { matches: [], error: null, replaceResult: null, matchCount: 0, groupCount: 0 }
    }

    let re: RegExp
    try {
      re = new RegExp(regex, flags)
    } catch (err) {
      return {
        matches: [],
        error: err instanceof Error ? err.message : 'Invalid regex',
        replaceResult: null,
        matchCount: 0,
        groupCount: 0,
      }
    }

    // Guard: must have 'g' flag for matchAll
    const globalRe = flags.includes('g') ? re : new RegExp(regex, flags + 'g')

    const matches: RegexMatch[] = []
    const start = performance.now()
    let totalCount = 0

    try {
      for (const m of testInput.matchAll(globalRe)) {
        if (performance.now() - start > EXEC_TIMEOUT_MS) {
          return {
            matches,
            error: 'Pattern too complex — execution timed out. Try simplifying your regex.',
            replaceResult: null,
            matchCount: totalCount,
            groupCount: 0,
          }
        }

        totalCount++
        if (matches.length < MAX_MATCHES) {
          const groups: Record<string, string | undefined> = {}
          if (m.groups) {
            for (const [k, v] of Object.entries(m.groups)) {
              groups[k] = v
            }
          }
          // Also include numbered groups
          for (let i = 1; i < m.length; i++) {
            groups[`$${i}`] = m[i]
          }

          matches.push({
            index: matches.length,
            value: m[0],
            start: m.index!,
            end: m.index! + m[0].length,
            groups,
          })
        }
      }
    } catch (err) {
      return {
        matches: [],
        error: err instanceof Error ? err.message : 'Regex execution error',
        replaceResult: null,
        matchCount: 0,
        groupCount: 0,
      }
    }

    let replaceResult: string | null = null
    if (mode === 'replace') {
      try {
        replaceResult = testInput.replace(re, replaceInput)
      } catch {
        replaceResult = null
      }
    }

    const groupCount = matches.length > 0
      ? Object.keys(matches[0].groups).length
      : 0

    return { matches, error: null, replaceResult, matchCount: totalCount, groupCount }
  }, [regex, flags, testInput, replaceInput, mode])
}
```

**Step 2: Create URL sharing helpers**

```typescript
// tools/regex-tester/url-sharing.ts

import type { RegexState } from './types'

function toBase64(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)))
  } catch {
    return ''
  }
}

function fromBase64(b64: string): string {
  try {
    return decodeURIComponent(escape(atob(b64)))
  } catch {
    return ''
  }
}

export function encodeStateToHash(state: RegexState): string {
  const parts: string[] = []
  if (state.regex) parts.push(`r=${toBase64(state.regex)}`)
  if (state.flags) parts.push(`f=${state.flags}`)
  if (state.testInput) parts.push(`t=${toBase64(state.testInput)}`)
  if (state.mode !== 'match') parts.push(`m=${state.mode}`)
  if (state.mode === 'replace' && state.replaceInput) {
    parts.push(`rp=${toBase64(state.replaceInput)}`)
  }
  return parts.length > 0 ? `#${parts.join('&')}` : ''
}

export function decodeStateFromHash(hash: string): Partial<RegexState> | null {
  if (!hash || hash.length < 2) return null

  const params = new URLSearchParams(hash.slice(1))
  const state: Partial<RegexState> = {}

  const r = params.get('r')
  if (r) state.regex = fromBase64(r)

  const f = params.get('f')
  if (f) state.flags = f

  const t = params.get('t')
  if (t) state.testInput = fromBase64(t)

  const m = params.get('m')
  if (m === 'replace') state.mode = 'replace'

  const rp = params.get('rp')
  if (rp) state.replaceInput = fromBase64(rp)

  return Object.keys(state).length > 0 ? state : null
}

export function copyShareUrl(state: RegexState): Promise<void> {
  const hash = encodeStateToHash(state)
  const url = `${window.location.origin}${window.location.pathname}${hash}`
  return navigator.clipboard.writeText(url)
}
```

**Step 3: Create history helpers**

```typescript
// tools/regex-tester/history.ts

import type { HistoryEntry } from './types'

const STORAGE_KEY = 'tk-regex-history'
const MAX_ENTRIES = 20

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveToHistory(entry: Omit<HistoryEntry, 'timestamp'>): void {
  if (!entry.regex) return

  const history = getHistory()

  // Dedupe: remove existing entry with same regex+flags+input
  const filtered = history.filter(
    (h) => !(h.regex === entry.regex && h.flags === entry.flags && h.testInput === entry.testInput),
  )

  filtered.unshift({ ...entry, timestamp: Date.now() })

  // Trim to max
  const trimmed = filtered.slice(0, MAX_ENTRIES)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // localStorage full — silently ignore
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
```

**Step 4: Commit**

```bash
git add tools/regex-tester/use-regex-engine.ts tools/regex-tester/url-sharing.ts tools/regex-tester/history.ts
git commit -m "feat(regex-tester): add regex engine hook, URL sharing, and history helpers"
```

---

### Task 3: Preset Sidebar Component

**Files:**
- Create: `tools/regex-tester/preset-sidebar.tsx`

**Step 1: Build the preset sidebar**

Desktop: always-visible collapsible sidebar with search and categorized list.
Mobile: slide-up drawer triggered by a "Patterns" button.

```typescript
// tools/regex-tester/preset-sidebar.tsx
'use client'

import { useState, useMemo } from 'react'
import type { PresetPattern, PresetCategory } from './types'
import { PRESET_CATEGORY_LABELS } from './types'
import { PRESETS } from './presets'

interface PresetSidebarProps {
  onSelect: (preset: PresetPattern) => void
  activePresetId?: string
}

function PresetList({ presets, onSelect, activePresetId, search }: {
  presets: PresetPattern[]
  onSelect: (p: PresetPattern) => void
  activePresetId?: string
  search: string
}) {
  const filtered = useMemo(() => {
    if (!search) return presets
    const q = search.toLowerCase()
    return presets.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.includes(q),
    )
  }, [presets, search])

  const grouped = useMemo(() => {
    const map = new Map<PresetCategory, PresetPattern[]>()
    for (const p of filtered) {
      const arr = map.get(p.category) || []
      arr.push(p)
      map.set(p.category, arr)
    }
    return map
  }, [filtered])

  if (filtered.length === 0) {
    return <p className="text-sm text-slate-400 px-2 py-4">No patterns found.</p>
  }

  return (
    <div className="flex flex-col gap-1">
      {Array.from(grouped.entries()).map(([cat, items]) => (
        <div key={cat}>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-2 pt-3 pb-1">
            {PRESET_CATEGORY_LABELS[cat]}
          </h3>
          {items.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              className={`w-full text-left px-2 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                activePresetId === p.id
                  ? 'bg-[var(--tk-color-primary-500)]/10 text-[var(--tk-color-primary-600)] dark:text-[var(--tk-color-primary-400)]'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                {p.flag && <span className="text-base">{p.flag}</span>}
                <span className="font-medium">{p.name}</span>
              </span>
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

export function PresetSidebar({ onSelect, activePresetId }: PresetSidebarProps) {
  const [search, setSearch] = useState('')

  return (
    <aside className="w-64 shrink-0 h-fit sticky top-24 hidden lg:block">
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-3 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Pattern Library</h2>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patterns..."
            className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/50"
            aria-label="Search preset patterns"
          />
        </div>
        <div className="p-2 max-h-[calc(100vh-220px)] overflow-y-auto">
          <PresetList presets={PRESETS} onSelect={onSelect} activePresetId={activePresetId} search={search} />
        </div>
      </div>
    </aside>
  )
}

/** Mobile drawer version — opened by parent */
export function PresetDrawer({ open, onClose, onSelect, activePresetId }: PresetSidebarProps & { open: boolean; onClose: () => void }) {
  const [search, setSearch] = useState('')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      {/* Drawer */}
      <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] rounded-t-2xl bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex flex-col animate-slide-up" style={{ animationName: 'none', transform: 'translateY(0)' }}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Pattern Library</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" aria-label="Close">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-4 py-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patterns..."
            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/50"
            aria-label="Search preset patterns"
          />
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <PresetList presets={PRESETS} onSelect={(p) => { onSelect(p); onClose() }} activePresetId={activePresetId} search={search} />
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add tools/regex-tester/preset-sidebar.tsx
git commit -m "feat(regex-tester): add preset sidebar with search and mobile drawer"
```

---

### Task 4: Regex Input & Toolbar Components

**Files:**
- Create: `tools/regex-tester/regex-input.tsx`
- Create: `tools/regex-tester/regex-toolbar.tsx`

**Step 1: Build regex input with flag toggles**

```typescript
// tools/regex-tester/regex-input.tsx
'use client'

interface RegexInputProps {
  value: string
  onChange: (value: string) => void
  flags: string
  onFlagsChange: (flags: string) => void
  error: string | null
}

const FLAG_OPTIONS = [
  { flag: 'g', label: 'Global', title: 'Find all matches' },
  { flag: 'i', label: 'Case Insensitive', title: 'Case-insensitive matching' },
  { flag: 'm', label: 'Multiline', title: '^ and $ match line boundaries' },
  { flag: 's', label: 'Dotall', title: '. matches newlines' },
]

export function RegexInput({ value, onChange, flags, onFlagsChange, error }: RegexInputProps) {
  const toggleFlag = (flag: string) => {
    onFlagsChange(
      flags.includes(flag) ? flags.replace(flag, '') : flags + flag,
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className={`flex items-center rounded-xl border ${
        error
          ? 'border-red-400 dark:border-red-600 ring-2 ring-red-400/30'
          : 'border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-[var(--tk-color-primary-500)]/50'
      } bg-white dark:bg-slate-900 transition-all`}>
        <span className="pl-4 text-slate-400 font-mono text-sm select-none">/</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter regex pattern..."
          className="flex-1 h-12 px-1 bg-transparent text-sm font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          aria-label="Regular expression pattern"
          spellCheck={false}
          autoComplete="off"
        />
        <span className="pr-2 text-slate-400 font-mono text-sm select-none">/</span>
        <div className="flex items-center gap-0.5 pr-3 border-l border-slate-200 dark:border-slate-700 pl-2" role="group" aria-label="Regex flags">
          {FLAG_OPTIONS.map((opt) => (
            <button
              key={opt.flag}
              type="button"
              title={opt.title}
              onClick={() => toggleFlag(opt.flag)}
              className={`w-8 h-8 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer ${
                flags.includes(opt.flag)
                  ? 'bg-[var(--tk-color-primary-500)] text-white'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              aria-pressed={flags.includes(opt.flag)}
            >
              {opt.flag}
            </button>
          ))}
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 px-1" role="alert">{error}</p>
      )}
    </div>
  )
}
```

**Step 2: Build the toolbar**

```typescript
// tools/regex-tester/regex-toolbar.tsx
'use client'

import { useState } from 'react'
import type { RegexMode, RegexState } from './types'
import { copyShareUrl } from './url-sharing'

interface RegexToolbarProps {
  mode: RegexMode
  onModeChange: (mode: RegexMode) => void
  state: RegexState
  onHistoryOpen: () => void
  onClear: () => void
}

export function RegexToolbar({ mode, onModeChange, state, onHistoryOpen, onClear }: RegexToolbarProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    await copyShareUrl(state)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Mode toggle */}
      <div className="flex gap-0.5 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">
        {(['match', 'replace'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onModeChange(m)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer capitalize ${
              mode === m
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Action buttons */}
      <button
        type="button"
        onClick={onHistoryOpen}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="History"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="hidden sm:inline">History</span>
      </button>

      <button
        type="button"
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Copy share link"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {copied ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          )}
        </svg>
        <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
      </button>

      <button
        type="button"
        onClick={onClear}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Clear all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span className="hidden sm:inline">Clear</span>
      </button>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add tools/regex-tester/regex-input.tsx tools/regex-tester/regex-toolbar.tsx
git commit -m "feat(regex-tester): add regex input with flag toggles and toolbar"
```

---

### Task 5: Test Input with Match Highlighting

**Files:**
- Create: `tools/regex-tester/test-input.tsx`

**Step 1: Build the test input with highlight overlay**

Uses a technique where a `<div>` with highlighted spans sits behind a transparent `<textarea>`. Both scroll together.

```typescript
// tools/regex-tester/test-input.tsx
'use client'

import { useRef, useCallback } from 'react'
import type { RegexMatch } from './types'

interface TestInputProps {
  value: string
  onChange: (value: string) => void
  matches: RegexMatch[]
  disabled?: boolean
}

const MATCH_COLORS = [
  'bg-yellow-300/40 dark:bg-yellow-500/30',
  'bg-cyan-300/40 dark:bg-cyan-500/30',
  'bg-pink-300/40 dark:bg-pink-500/30',
  'bg-green-300/40 dark:bg-green-500/30',
]

function buildHighlightedHtml(text: string, matches: RegexMatch[]): string {
  if (matches.length === 0) return escapeHtml(text)

  // Sort by start position, dedupe overlaps
  const sorted = [...matches].sort((a, b) => a.start - b.start)
  const parts: string[] = []
  let lastEnd = 0

  for (let i = 0; i < sorted.length; i++) {
    const m = sorted[i]
    if (m.start < lastEnd) continue // skip overlapping

    if (m.start > lastEnd) {
      parts.push(escapeHtml(text.slice(lastEnd, m.start)))
    }

    const colorClass = MATCH_COLORS[i % MATCH_COLORS.length]
    parts.push(`<mark class="${colorClass} rounded-sm px-px">${escapeHtml(m.value)}</mark>`)
    lastEnd = m.end
  }

  if (lastEnd < text.length) {
    parts.push(escapeHtml(text.slice(lastEnd)))
  }

  return parts.join('')
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
    .replace(/ /g, '&nbsp;')
}

export function TestInput({ value, onChange, matches, disabled }: TestInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  const syncScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }, [])

  const tooLarge = value.length > 50000

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        Test String
      </label>
      <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
        {/* Highlight layer */}
        {!tooLarge && (
          <div
            ref={highlightRef}
            className="absolute inset-0 p-3 text-sm font-mono whitespace-pre-wrap break-words overflow-hidden pointer-events-none text-transparent"
            aria-hidden
            dangerouslySetInnerHTML={{ __html: buildHighlightedHtml(value, matches) }}
          />
        )}
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          placeholder="Enter test text here..."
          rows={8}
          spellCheck={false}
          disabled={disabled}
          className={`relative w-full p-3 text-sm font-mono resize-y focus:outline-none ${
            tooLarge
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
              : 'bg-transparent text-slate-900/80 dark:text-white/80 caret-slate-900 dark:caret-white'
          }`}
          aria-label="Test string input"
        />
      </div>
      {tooLarge && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Input too large for live highlighting — matches still listed below.
        </p>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add tools/regex-tester/test-input.tsx
git commit -m "feat(regex-tester): add test input with match highlighting overlay"
```

---

### Task 6: Match Results & Replace Panel

**Files:**
- Create: `tools/regex-tester/match-results.tsx`
- Create: `tools/regex-tester/replace-panel.tsx`

**Step 1: Build match results panel**

```typescript
// tools/regex-tester/match-results.tsx
'use client'

import { useState } from 'react'
import type { RegexMatch } from './types'

interface MatchResultsProps {
  matches: RegexMatch[]
  matchCount: number
  groupCount: number
  hasRegex: boolean
  hasInput: boolean
}

function MatchRow({ match }: { match: RegexMatch }) {
  const [expanded, setExpanded] = useState(false)
  const hasGroups = Object.keys(match.groups).length > 0

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => hasGroups && setExpanded(!expanded)}
        className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
          hasGroups ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : ''
        }`}
      >
        <span className="text-xs font-mono text-slate-400 shrink-0 w-8">#{match.index + 1}</span>
        <span className="font-mono text-slate-900 dark:text-white truncate">&quot;{match.value}&quot;</span>
        <span className="text-xs text-slate-400 shrink-0 ml-auto">
          {match.start}–{match.end}
        </span>
        {hasGroups && (
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
      {expanded && hasGroups && (
        <div className="px-3 pb-2 border-t border-slate-100 dark:border-slate-800">
          <table className="w-full text-xs font-mono mt-1">
            <tbody>
              {Object.entries(match.groups).map(([key, val]) => (
                <tr key={key}>
                  <td className="py-0.5 pr-3 text-slate-500 dark:text-slate-400">{key}</td>
                  <td className="py-0.5 text-slate-900 dark:text-white">{val ?? <span className="text-slate-400 italic">undefined</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function MatchResults({ matches, matchCount, groupCount, hasRegex, hasInput }: MatchResultsProps) {
  if (!hasRegex) {
    return (
      <div className="p-6 text-center text-sm text-slate-400">
        Enter a regex pattern or select a preset to get started.
      </div>
    )
  }

  if (!hasInput) {
    return (
      <div className="p-6 text-center text-sm text-slate-400">
        Enter test text to see matches.
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-slate-400">
        No matches found.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Matches
        </h3>
        <span className="text-xs text-slate-400">
          {matchCount > 1000 ? `Showing 1,000 of ${matchCount.toLocaleString()}` : `${matchCount} match${matchCount !== 1 ? 'es' : ''}`}
          {groupCount > 0 && ` \u00B7 ${groupCount} group${groupCount !== 1 ? 's' : ''}`}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 max-h-[400px] overflow-y-auto">
        {matches.map((m) => (
          <MatchRow key={`${m.start}-${m.end}`} match={m} />
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Build replace panel**

```typescript
// tools/regex-tester/replace-panel.tsx
'use client'

interface ReplacePanelProps {
  replaceInput: string
  onReplaceInputChange: (value: string) => void
  replaceResult: string | null
}

export function ReplacePanel({ replaceInput, onReplaceInputChange, replaceResult }: ReplacePanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Replace With
        </label>
        <input
          type="text"
          value={replaceInput}
          onChange={(e) => onReplaceInputChange(e.target.value)}
          placeholder="Replacement string (supports $1, $2, $&, etc.)"
          className="h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/50"
          aria-label="Replacement string"
          spellCheck={false}
        />
      </div>

      {replaceResult !== null && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Result Preview
          </label>
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white whitespace-pre-wrap break-words max-h-[200px] overflow-y-auto">
            {replaceResult || <span className="text-slate-400 italic">Empty result</span>}
          </div>
        </div>
      )}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add tools/regex-tester/match-results.tsx tools/regex-tester/replace-panel.tsx
git commit -m "feat(regex-tester): add match results panel and replace panel"
```

---

### Task 7: History Drawer Component

**Files:**
- Create: `tools/regex-tester/history-drawer.tsx`

**Step 1: Build the history drawer**

```typescript
// tools/regex-tester/history-drawer.tsx
'use client'

import { useState, useEffect } from 'react'
import type { HistoryEntry, RegexState } from './types'
import { getHistory, clearHistory } from './history'

interface HistoryDrawerProps {
  open: boolean
  onClose: () => void
  onRestore: (state: Partial<RegexState>) => void
}

export function HistoryDrawer({ open, onClose, onRestore }: HistoryDrawerProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  useEffect(() => {
    if (open) setEntries(getHistory())
  }, [open])

  if (!open) return null

  const handleClear = () => {
    clearHistory()
    setEntries([])
  }

  const handleRestore = (entry: HistoryEntry) => {
    onRestore({
      regex: entry.regex,
      flags: entry.flags,
      testInput: entry.testInput,
      mode: entry.mode,
    })
    onClose()
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h ago`
    return d.toLocaleDateString()
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">History</h2>
          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-red-500 hover:text-red-600 cursor-pointer"
              >
                Clear all
              </button>
            )}
            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" aria-label="Close">
              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {entries.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No history yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {entries.map((entry, i) => (
                <button
                  key={`${entry.timestamp}-${i}`}
                  type="button"
                  onClick={() => handleRestore(entry)}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <code className="text-xs font-mono text-[var(--tk-color-primary-600)] dark:text-[var(--tk-color-primary-400)] truncate max-w-[200px]">
                      /{entry.regex}/{entry.flags}
                    </code>
                    <span className="text-xs text-slate-400 shrink-0 ml-2">{formatTime(entry.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{entry.testInput.slice(0, 80)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add tools/regex-tester/history-drawer.tsx
git commit -m "feat(regex-tester): add history drawer with restore and clear"
```

---

### Task 8: Page Route — Wire Everything Together

**Files:**
- Create: `app/tools/regex-tester/page.tsx`

**Step 1: Build the page**

```typescript
// app/tools/regex-tester/page.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import { PresetSidebar, PresetDrawer } from '@/tools/regex-tester/preset-sidebar'
import { RegexInput } from '@/tools/regex-tester/regex-input'
import { RegexToolbar } from '@/tools/regex-tester/regex-toolbar'
import { TestInput } from '@/tools/regex-tester/test-input'
import { MatchResults } from '@/tools/regex-tester/match-results'
import { ReplacePanel } from '@/tools/regex-tester/replace-panel'
import { HistoryDrawer } from '@/tools/regex-tester/history-drawer'
import { useRegexEngine } from '@/tools/regex-tester/use-regex-engine'
import { decodeStateFromHash } from '@/tools/regex-tester/url-sharing'
import { saveToHistory } from '@/tools/regex-tester/history'
import type { RegexMode, RegexState, PresetPattern } from '@/tools/regex-tester/types'

export default function RegexTesterPage() {
  const [regex, setRegex] = useState('')
  const [flags, setFlags] = useState('gm')
  const [testInput, setTestInput] = useState('')
  const [replaceInput, setReplaceInput] = useState('')
  const [mode, setMode] = useState<RegexMode>('match')
  const [activePresetId, setActivePresetId] = useState<string | undefined>()
  const [presetDescription, setPresetDescription] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  const historySaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Regex engine
  const { matches, error, replaceResult, matchCount, groupCount } = useRegexEngine(
    regex, flags, testInput, replaceInput, mode,
  )

  // Load state from URL hash on mount
  useEffect(() => {
    const decoded = decodeStateFromHash(window.location.hash)
    if (decoded) {
      if (decoded.regex) setRegex(decoded.regex)
      if (decoded.flags) setFlags(decoded.flags)
      if (decoded.testInput) setTestInput(decoded.testInput)
      if (decoded.replaceInput) setReplaceInput(decoded.replaceInput)
      if (decoded.mode) setMode(decoded.mode)
    }
  }, [])

  // Auto-save to history (debounced 2s)
  useEffect(() => {
    clearTimeout(historySaveTimer.current)
    if (regex) {
      historySaveTimer.current = setTimeout(() => {
        saveToHistory({ regex, flags, testInput, mode })
      }, 2000)
    }
    return () => clearTimeout(historySaveTimer.current)
  }, [regex, flags, testInput, mode])

  const currentState: RegexState = { regex, flags, testInput, replaceInput, mode }

  const handlePresetSelect = useCallback((preset: PresetPattern) => {
    setRegex(preset.regex)
    if (preset.defaultFlags) setFlags(preset.defaultFlags)
    setTestInput(preset.sampleInput)
    setActivePresetId(preset.id)
    setPresetDescription(preset.description)
  }, [])

  const handleClear = useCallback(() => {
    setRegex('')
    setFlags('gm')
    setTestInput('')
    setReplaceInput('')
    setMode('match')
    setActivePresetId(undefined)
    setPresetDescription(null)
  }, [])

  const handleRestore = useCallback((state: Partial<RegexState>) => {
    if (state.regex !== undefined) setRegex(state.regex)
    if (state.flags !== undefined) setFlags(state.flags)
    if (state.testInput !== undefined) setTestInput(state.testInput)
    if (state.replaceInput !== undefined) setReplaceInput(state.replaceInput)
    if (state.mode !== undefined) setMode(state.mode)
    setActivePresetId(undefined)
    setPresetDescription(null)
  }, [])

  return (
    <main className="flex-1 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-[1200px] flex flex-col gap-6">
        <ToolBreadcrumb toolName="Regex Tester" toolSlug="regex-tester" />

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Regex Tester
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Test, match, and replace with regular expressions — 100% client-side with 30+ preset patterns.
          </p>
        </div>

        {/* Mobile: Patterns button */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Pattern Library
          </button>
        </div>

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <PresetSidebar onSelect={handlePresetSelect} activePresetId={activePresetId} />

          {/* Main workspace */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <RegexToolbar
              mode={mode}
              onModeChange={setMode}
              state={currentState}
              onHistoryOpen={() => setHistoryOpen(true)}
              onClear={handleClear}
            />

            <RegexInput
              value={regex}
              onChange={(v) => { setRegex(v); setActivePresetId(undefined); setPresetDescription(null) }}
              flags={flags}
              onFlagsChange={setFlags}
              error={error}
            />

            {/* Preset description banner */}
            {presetDescription && (
              <div className="px-3 py-2 rounded-lg bg-[var(--tk-color-primary-500)]/5 border border-[var(--tk-color-primary-500)]/20 text-sm text-[var(--tk-color-primary-700)] dark:text-[var(--tk-color-primary-300)]">
                {presetDescription}
              </div>
            )}

            <TestInput
              value={testInput}
              onChange={setTestInput}
              matches={matches}
            />

            {mode === 'replace' && (
              <ReplacePanel
                replaceInput={replaceInput}
                onReplaceInputChange={setReplaceInput}
                replaceResult={replaceResult}
              />
            )}

            <MatchResults
              matches={matches}
              matchCount={matchCount}
              groupCount={groupCount}
              hasRegex={!!regex}
              hasInput={!!testInput}
            />

            {/* Status bar */}
            <div className="flex items-center gap-3 text-xs text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-3">
              <span>{matchCount} match{matchCount !== 1 ? 'es' : ''}</span>
              <span>\u00B7</span>
              <span>{groupCount} group{groupCount !== 1 ? 's' : ''}</span>
              <span>\u00B7</span>
              <span>Flags: /{flags || 'none'}/</span>
              <span>\u00B7</span>
              <span>JavaScript RegExp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drawers */}
      <PresetDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSelect={handlePresetSelect} activePresetId={activePresetId} />
      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} onRestore={handleRestore} />
    </main>
  )
}
```

**Step 2: Run build to verify**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm build`

Expected: Build passes, new `/tools/regex-tester` route appears in output.

**Step 3: Commit**

```bash
git add app/tools/regex-tester/page.tsx
git commit -m "feat(regex-tester): add page route wiring all components together"
```

---

### Task 9: Register in Tool Library & Verify

**Files:**
- Modify: `lib/tools.tsx`

**Step 1: Add Regex Tester to tools array**

Add this entry after the JWT Decoder entry in `lib/tools.tsx`:

```typescript
{
  name: 'Regex Tester',
  href: '/tools/regex-tester',
  description: 'Test, match & replace with 30+ preset patterns',
  icon: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  color: 'from-lime-500 to-emerald-400',
},
```

**Step 2: Run full build**

Run: `pnpm build`

Expected: Build passes with the new regex-tester route listed.

**Step 3: Run dev server and smoke test**

Run: `pnpm dev`

Manual checks:
- Navigate to `/tools/regex-tester`
- Verify page loads with breadcrumb, title, toolbar, regex input, test input
- Type a regex (e.g. `\d+`) and test input (e.g. `abc 123 def 456`) — matches should highlight
- Select a preset from sidebar — regex, sample input, and description should populate
- Toggle to Replace mode — replacement input and preview should appear
- Click Share — URL should be copied with hash fragment
- Reload the shared URL — state should restore
- Check History — recent tests should appear
- Mobile viewport — verify patterns button opens drawer, layout is responsive

**Step 4: Commit**

```bash
git add lib/tools.tsx
git commit -m "feat(regex-tester): register tool in homepage grid"
```

---

### Task 10: Deploy

**Step 1: Push to remote**

```bash
git push origin main
```

**Step 2: Verify Vercel deployment**

Monitor Vercel dashboard for successful build and deployment.

**Step 3: Smoke test production URL**

Verify `/tools/regex-tester` works on the deployed site.
