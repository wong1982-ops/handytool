# Multi-Format Formatter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-format formatter tool supporting 12 formats (JSON, XML, YAML, SQL, HTML, CSS, JavaScript, TypeScript, Markdown, GraphQL, TOML, INI) with format/minify/validate/convert/diff actions, auto-detection, and bilingual UI.

**Architecture:** Single-page Studio (no wizard). Hybrid execution — lightweight formats run client-side via small libraries (js-yaml, fast-xml-parser, sql-formatter, @iarna/toml, ini), heavy formats run server-side via Prettier through a single API route. Privacy-conscious — server never logs content.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS, Prettier (server), js-yaml + fast-xml-parser + @iarna/toml + ini + sql-formatter + diff (client/server), html-minifier-terser + csso + terser (server, minify).

**Design spec:** `docs/superpowers/specs/2026-04-11-formatter-design.md`

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install client + server libraries**

Run from project root:
```bash
pnpm add @iarna/toml ini diff sql-formatter
pnpm add -D @types/ini @types/diff
```

Note: `js-yaml` and `fast-xml-parser` are already installed.

- [ ] **Step 2: Install Prettier and plugins (server-side)**

```bash
pnpm add prettier @prettier/plugin-php
```

`prettier` already includes core plugins for: html, css, javascript, typescript, markdown, graphql, yaml — no extra plugin packages needed.

- [ ] **Step 3: Install minifiers (server-side)**

```bash
pnpm add html-minifier-terser csso terser
pnpm add -D @types/html-minifier-terser @types/csso
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`
Expected: SUCCESS (no output between markers).

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat(formatter): install Prettier, minifiers, and format libraries"
```

---

### Task 2: Types & Defaults

**Files:**
- Create: `tools/formatter/formatter-types.ts`
- Create: `tools/formatter/formatter-defaults.ts`

- [ ] **Step 1: Create `tools/formatter/formatter-types.ts`**

```typescript
export type Format =
  | 'json'
  | 'yaml'
  | 'xml'
  | 'toml'
  | 'ini'
  | 'sql'
  | 'html'
  | 'css'
  | 'javascript'
  | 'typescript'
  | 'markdown'
  | 'graphql'

export type FormatOrAuto = Format | 'auto'

export type Action = 'format' | 'minify' | 'validate' | 'convert' | 'diff'

export type Language = 'en' | 'zh'

export interface ValidationError {
  line?: number
  column?: number
  message: string
}

export interface ValidationResult {
  ok: boolean
  error?: ValidationError
  summary?: string  // e.g. "Object with 5 keys", "Array of 12 items"
}

export interface FormatterState {
  input: string
  inputB: string                  // diff mode second input
  output: string
  format: FormatOrAuto
  detectedFormat: Format | null
  action: Action
  convertTarget: Format | null
  validation: ValidationResult | null
  loading: boolean
  copyFeedback: boolean           // shows "Copied" toast briefly
}

export interface FormatDefinition {
  id: Format
  label: string                   // display label (English, universal)
  extension: string               // file extension for download
  mimeType: string
  execution: 'client' | 'server'
  canMinify: boolean
  convertTargets: Format[]        // formats this can be converted to
}

export const DEFAULT_STATE: FormatterState = {
  input: '',
  inputB: '',
  output: '',
  format: 'auto',
  detectedFormat: null,
  action: 'format',
  convertTarget: null,
  validation: null,
  loading: false,
  copyFeedback: false,
}
```

- [ ] **Step 2: Create `tools/formatter/formatter-defaults.ts`**

```typescript
import type { Format, FormatDefinition } from './formatter-types'

export const FORMAT_DEFINITIONS: Record<Format, FormatDefinition> = {
  json: {
    id: 'json',
    label: 'JSON',
    extension: 'json',
    mimeType: 'application/json',
    execution: 'client',
    canMinify: true,
    convertTargets: ['yaml', 'xml', 'toml'],
  },
  yaml: {
    id: 'yaml',
    label: 'YAML',
    extension: 'yaml',
    mimeType: 'text/yaml',
    execution: 'client',
    canMinify: false,
    convertTargets: ['json'],
  },
  xml: {
    id: 'xml',
    label: 'XML',
    extension: 'xml',
    mimeType: 'application/xml',
    execution: 'client',
    canMinify: true,
    convertTargets: ['json'],
  },
  toml: {
    id: 'toml',
    label: 'TOML',
    extension: 'toml',
    mimeType: 'text/x-toml',
    execution: 'client',
    canMinify: false,
    convertTargets: ['json'],
  },
  ini: {
    id: 'ini',
    label: 'INI',
    extension: 'ini',
    mimeType: 'text/x-ini',
    execution: 'client',
    canMinify: false,
    convertTargets: [],
  },
  sql: {
    id: 'sql',
    label: 'SQL',
    extension: 'sql',
    mimeType: 'application/sql',
    execution: 'client',
    canMinify: false,
    convertTargets: [],
  },
  html: {
    id: 'html',
    label: 'HTML',
    extension: 'html',
    mimeType: 'text/html',
    execution: 'server',
    canMinify: true,
    convertTargets: [],
  },
  css: {
    id: 'css',
    label: 'CSS',
    extension: 'css',
    mimeType: 'text/css',
    execution: 'server',
    canMinify: true,
    convertTargets: [],
  },
  javascript: {
    id: 'javascript',
    label: 'JavaScript',
    extension: 'js',
    mimeType: 'application/javascript',
    execution: 'server',
    canMinify: true,
    convertTargets: [],
  },
  typescript: {
    id: 'typescript',
    label: 'TypeScript',
    extension: 'ts',
    mimeType: 'application/typescript',
    execution: 'server',
    canMinify: true,
    convertTargets: [],
  },
  markdown: {
    id: 'markdown',
    label: 'Markdown',
    extension: 'md',
    mimeType: 'text/markdown',
    execution: 'server',
    canMinify: false,
    convertTargets: [],
  },
  graphql: {
    id: 'graphql',
    label: 'GraphQL',
    extension: 'graphql',
    mimeType: 'application/graphql',
    execution: 'server',
    canMinify: false,
    convertTargets: [],
  },
}

export const ALL_FORMATS: Format[] = [
  'json', 'yaml', 'xml', 'toml', 'ini', 'sql',
  'html', 'css', 'javascript', 'typescript', 'markdown', 'graphql',
]

export const MAX_INPUT_BYTES = 1_048_576 // 1 MB

export function getFormatDefinition(format: Format): FormatDefinition {
  return FORMAT_DEFINITIONS[format]
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 4: Commit**

```bash
git add tools/formatter/formatter-types.ts tools/formatter/formatter-defaults.ts
git commit -m "feat(formatter): add types and format definitions"
```

---

### Task 3: i18n Strings

**Files:**
- Create: `tools/formatter/i18n/en.ts`
- Create: `tools/formatter/i18n/zh.ts`

- [ ] **Step 1: Create `tools/formatter/i18n/en.ts`**

```typescript
export const en = {
  pageTitle: 'Formatter',
  pageSubtitle: 'Format, minify, validate, convert, and diff 12 formats',

  formatLabel: 'Format',
  auto: 'Auto',
  detected: 'Detected',

  actions: {
    format: 'Format',
    minify: 'Minify',
    validate: 'Validate',
    convert: 'Convert',
    diff: 'Diff',
  },

  convertTo: 'Convert to',

  panes: {
    input: 'Input',
    inputA: 'Input A',
    inputB: 'Input B',
    output: 'Output',
    diffResult: 'Diff result',
    inputPlaceholder: 'Paste your content here…',
    outputPlaceholder: 'Formatted output will appear here',
  },

  status: {
    pasteToBegin: 'Paste content to begin',
    valid: 'Valid',
    invalid: 'Invalid',
    loading: 'Working…',
    bytes: 'bytes',
    lines: 'lines',
    privacy: 'Your content is never stored',
    addBothSides: 'Add content to both sides to compare',
    copied: 'Copied to clipboard',
    minifyUnsupported: 'Minify is not supported for this format',
    convertUnsupported: 'No compatible convert targets for this format',
  },

  errors: {
    empty: 'Input is empty',
    tooLarge: 'Input exceeds 1MB limit',
    parseError: 'Parse error',
    serverError: 'Server error — please try again',
    networkError: 'Network error — check your connection',
    unknownFormat: 'Could not detect format — please select manually',
  },

  buttons: {
    copy: 'Copy',
    download: 'Download',
    clear: 'Clear',
  },
} as const

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>
}
export type I18nStrings = DeepStringify<typeof en>
```

- [ ] **Step 2: Create `tools/formatter/i18n/zh.ts`**

```typescript
import type { I18nStrings } from './en'

export const zh: I18nStrings = {
  pageTitle: '格式化工具',
  pageSubtitle: '12 种格式的格式化、压缩、验证、转换和对比',

  formatLabel: '格式',
  auto: '自动',
  detected: '已检测',

  actions: {
    format: '格式化',
    minify: '压缩',
    validate: '验证',
    convert: '转换',
    diff: '对比',
  },

  convertTo: '转换为',

  panes: {
    input: '输入',
    inputA: '输入 A',
    inputB: '输入 B',
    output: '输出',
    diffResult: '对比结果',
    inputPlaceholder: '在此粘贴你的内容…',
    outputPlaceholder: '格式化结果将显示在此',
  },

  status: {
    pasteToBegin: '粘贴内容以开始',
    valid: '有效',
    invalid: '无效',
    loading: '处理中…',
    bytes: '字节',
    lines: '行',
    privacy: '你的内容永远不会被存储',
    addBothSides: '请在两侧添加内容以进行对比',
    copied: '已复制到剪贴板',
    minifyUnsupported: '此格式不支持压缩',
    convertUnsupported: '此格式没有可转换的目标',
  },

  errors: {
    empty: '输入为空',
    tooLarge: '输入超过 1MB 限制',
    parseError: '解析错误',
    serverError: '服务器错误——请重试',
    networkError: '网络错误——请检查你的连接',
    unknownFormat: '无法检测格式——请手动选择',
  },

  buttons: {
    copy: '复制',
    download: '下载',
    clear: '清空',
  },
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 4: Commit**

```bash
git add tools/formatter/i18n/en.ts tools/formatter/i18n/zh.ts
git commit -m "feat(formatter): add bilingual i18n strings"
```

---

### Task 4: Auto-Detection Heuristic

**Files:**
- Create: `tools/formatter/formatter-detector.ts`

- [ ] **Step 1: Create `tools/formatter/formatter-detector.ts`**

```typescript
import type { Format } from './formatter-types'

/**
 * Detect the format of a content string using heuristics.
 * Returns null if detection fails.
 */
export function detectFormat(content: string): Format | null {
  const trimmed = content.trim()
  if (!trimmed) return null

  // 1. JSON — starts with { or [
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed)
      return 'json'
    } catch {
      // not valid JSON, continue
    }
  }

  // 2. XML — starts with <?xml or <
  if (trimmed.startsWith('<?xml') || /^<[a-zA-Z][^>]*>/.test(trimmed)) {
    if (trimmed.startsWith('<!DOCTYPE html') || trimmed.toLowerCase().startsWith('<html')) {
      return 'html'
    }
    return 'xml'
  }

  // 3. HTML — DOCTYPE or html tag
  if (trimmed.toLowerCase().startsWith('<!doctype') || trimmed.toLowerCase().includes('<html')) {
    return 'html'
  }

  // 4. GraphQL — query/mutation/subscription keyword followed by {
  if (/^(query|mutation|subscription|fragment)\s+\w*\s*[({]/m.test(trimmed)) {
    return 'graphql'
  }

  // 5. SQL — starts with common SQL keywords
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|WITH)\s/i.test(trimmed)) {
    return 'sql'
  }

  // 6. TypeScript — interface, type alias, type annotations
  if (/\b(interface\s+\w+|type\s+\w+\s*=|:\s*(string|number|boolean)\b)/.test(trimmed)) {
    return 'typescript'
  }

  // 7. JavaScript — function, const/let/var, arrow functions
  if (/\b(function\s+\w+|const\s+\w+|let\s+\w+|var\s+\w+|=>)/.test(trimmed)) {
    return 'javascript'
  }

  // 8. CSS — selectors with { } and ; declarations
  if (/[#.]?[\w-]+\s*\{[^}]*[\w-]+\s*:[^;}]+;/.test(trimmed)) {
    return 'css'
  }

  // 9. Markdown — heading, bold, list markers, links
  if (/^#{1,6}\s+/m.test(trimmed) || /\*\*[^*]+\*\*/.test(trimmed) || /^[-*+]\s+/m.test(trimmed)) {
    return 'markdown'
  }

  // 10. TOML — [section] header with key = value
  if (/^\[[\w.]+\]/m.test(trimmed) && /^[\w-]+\s*=\s*/m.test(trimmed)) {
    return 'toml'
  }

  // 11. INI — [section] header without key = value (or simpler key=value)
  if (/^\[[\w.\s]+\]/m.test(trimmed) && /^[\w-]+\s*=\s*/m.test(trimmed)) {
    return 'ini'
  }

  // 12. YAML — key: value pattern (after other checks)
  if (/^[\w-]+\s*:\s*\S/m.test(trimmed) || /^---\s*$/m.test(trimmed)) {
    return 'yaml'
  }

  return null
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 3: Commit**

```bash
git add tools/formatter/formatter-detector.ts
git commit -m "feat(formatter): add format auto-detection heuristic"
```

---

### Task 5: Client-Side Format/Validate/Convert Dispatch

**Files:**
- Create: `tools/formatter/formatter-client.ts`

- [ ] **Step 1: Create `tools/formatter/formatter-client.ts`**

```typescript
import yaml from 'js-yaml'
import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import * as TOML from '@iarna/toml'
import * as INI from 'ini'
import { format as sqlFormat } from 'sql-formatter'
import type { Format, ValidationResult } from './formatter-types'

export interface FormatResult {
  ok: boolean
  output?: string
  validation: ValidationResult
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  preserveOrder: false,
})

const xmlBuilder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: true,
  indentBy: '  ',
})

function summarizeJson(value: unknown): string {
  if (Array.isArray(value)) return `Array of ${value.length} items`
  if (value !== null && typeof value === 'object') {
    return `Object with ${Object.keys(value).length} keys`
  }
  return typeof value
}

/**
 * Format a value (prettify) on the client side.
 * Only handles client-execution formats. Server formats throw.
 */
export function formatClient(format: Format, content: string): FormatResult {
  try {
    switch (format) {
      case 'json': {
        const parsed = JSON.parse(content)
        return {
          ok: true,
          output: JSON.stringify(parsed, null, 2),
          validation: { ok: true, summary: summarizeJson(parsed) },
        }
      }
      case 'yaml': {
        const parsed = yaml.load(content)
        return {
          ok: true,
          output: yaml.dump(parsed, { indent: 2, lineWidth: 80 }),
          validation: { ok: true, summary: summarizeJson(parsed) },
        }
      }
      case 'xml': {
        const parsed = xmlParser.parse(content)
        return {
          ok: true,
          output: xmlBuilder.build(parsed),
          validation: { ok: true },
        }
      }
      case 'toml': {
        const parsed = TOML.parse(content)
        return {
          ok: true,
          output: TOML.stringify(parsed),
          validation: { ok: true, summary: summarizeJson(parsed) },
        }
      }
      case 'ini': {
        const parsed = INI.parse(content)
        return {
          ok: true,
          output: INI.stringify(parsed),
          validation: { ok: true },
        }
      }
      case 'sql': {
        const formatted = sqlFormat(content, { language: 'sql', tabWidth: 2 })
        return { ok: true, output: formatted, validation: { ok: true } }
      }
      default:
        throw new Error(`Format ${format} requires server-side execution`)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      ok: false,
      validation: { ok: false, error: { message } },
    }
  }
}

/**
 * Minify content on the client side. Only JSON is minifiable client-side.
 */
export function minifyClient(format: Format, content: string): FormatResult {
  if (format !== 'json') {
    return {
      ok: false,
      validation: { ok: false, error: { message: 'Client minify only supports JSON' } },
    }
  }
  try {
    const parsed = JSON.parse(content)
    return {
      ok: true,
      output: JSON.stringify(parsed),
      validation: { ok: true, summary: summarizeJson(parsed) },
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, validation: { ok: false, error: { message } } }
  }
}

/**
 * Validate content. Returns validation result without producing output.
 */
export function validateClient(format: Format, content: string): ValidationResult {
  const result = formatClient(format, content)
  return result.validation
}

/**
 * Convert content from one format to another (client-side, data formats only).
 */
export function convertClient(from: Format, to: Format, content: string): FormatResult {
  try {
    // Step 1: parse source into a JS value
    let value: unknown
    switch (from) {
      case 'json':
        value = JSON.parse(content)
        break
      case 'yaml':
        value = yaml.load(content)
        break
      case 'xml':
        value = xmlParser.parse(content)
        break
      case 'toml':
        value = TOML.parse(content)
        break
      default:
        throw new Error(`Cannot convert from ${from}`)
    }

    // Step 2: serialize to target format
    let output: string
    switch (to) {
      case 'json':
        output = JSON.stringify(value, null, 2)
        break
      case 'yaml':
        output = yaml.dump(value, { indent: 2, lineWidth: 80 })
        break
      case 'xml':
        output = xmlBuilder.build(value)
        break
      case 'toml':
        // TOML.stringify requires an object at the top level
        if (value === null || typeof value !== 'object' || Array.isArray(value)) {
          throw new Error('TOML requires a top-level object')
        }
        output = TOML.stringify(value as TOML.JsonMap)
        break
      default:
        throw new Error(`Cannot convert to ${to}`)
    }

    return { ok: true, output, validation: { ok: true } }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, validation: { ok: false, error: { message } } }
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 3: Commit**

```bash
git add tools/formatter/formatter-client.ts
git commit -m "feat(formatter): add client-side format/minify/validate/convert dispatch"
```

---

### Task 6: Server-Side API Route (Prettier + Minifiers)

**Files:**
- Create: `app/api/v1/formatter/format/route.ts`

- [ ] **Step 1: Create `app/api/v1/formatter/format/route.ts`**

```typescript
import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { z } from 'zod'
import * as prettier from 'prettier'
import { minify as minifyHtml } from 'html-minifier-terser'
import { minify as minifyJs } from 'terser'
import csso from 'csso'

export const maxDuration = 30

const MAX_BYTES = 1_048_576 // 1 MB

const schema = z.object({
  format: z.enum(['html', 'css', 'javascript', 'typescript', 'markdown', 'graphql']),
  action: z.enum(['format', 'minify']),
  content: z.string(),
})

const PARSER_MAP: Record<string, string> = {
  html: 'html',
  css: 'css',
  javascript: 'babel',
  typescript: 'typescript',
  markdown: 'markdown',
  graphql: 'graphql',
}

export async function POST(request: NextRequest) {
  // No auth required — public utility
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return apiError('Invalid request', 'VALIDATION_ERROR', 400)
  }

  const { format, action, content } = parsed.data

  // Privacy: no logging of content; only validate size
  if (Buffer.byteLength(content, 'utf8') > MAX_BYTES) {
    return apiError('Input exceeds 1MB limit', 'TOO_LARGE', 413)
  }

  if (!content.trim()) {
    return apiError('Input is empty', 'EMPTY_INPUT', 400)
  }

  try {
    let result: string

    if (action === 'format') {
      const parser = PARSER_MAP[format]
      result = await prettier.format(content, {
        parser,
        tabWidth: 2,
        semi: true,
        singleQuote: true,
      })
    } else {
      // action === 'minify'
      switch (format) {
        case 'html':
          result = await minifyHtml(content, {
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true,
            minifyJS: true,
          })
          break
        case 'css': {
          const minified = csso.minify(content)
          result = minified.css
          break
        }
        case 'javascript':
        case 'typescript': {
          const minified = await minifyJs(content)
          result = minified.code ?? ''
          break
        }
        default:
          return apiError(`Minify not supported for ${format}`, 'UNSUPPORTED', 400)
      }
    }

    return apiSuccess({ result })
  } catch (err) {
    // Privacy: log only the error message and format, never the content
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[formatter] ${action} ${format} failed:`, message.slice(0, 200))
    return apiError(message, 'PARSE_ERROR', 400)
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

If `csso` is missing types, run: `pnpm add -D @types/csso` and re-verify.

- [ ] **Step 3: Commit**

```bash
git add app/api/v1/formatter/format/route.ts
git commit -m "feat(formatter): add server-side Prettier + minifier API route"
```

---

### Task 7: Studio Container & Page Route

**Files:**
- Create: `tools/formatter/formatter-studio.tsx`
- Create: `app/tools/formatter/page.tsx`
- Create: `app/tools/formatter/layout.tsx`

- [ ] **Step 1: Create `tools/formatter/formatter-studio.tsx` (skeleton with state)**

This is the main container. It owns state and wires sub-components together. Sub-components (toolbar, editor, status bar, diff) will be created in later tasks; for now we render placeholders.

```typescript
'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import type {
  FormatterState,
  Format,
  FormatOrAuto,
  Action,
  Language,
} from '@/tools/formatter/formatter-types'
import { DEFAULT_STATE } from '@/tools/formatter/formatter-types'
import { FORMAT_DEFINITIONS, MAX_INPUT_BYTES } from '@/tools/formatter/formatter-defaults'
import { detectFormat } from '@/tools/formatter/formatter-detector'
import {
  formatClient,
  minifyClient,
  validateClient,
  convertClient,
} from '@/tools/formatter/formatter-client'
import { en } from '@/tools/formatter/i18n/en'
import { zh } from '@/tools/formatter/i18n/zh'
import type { I18nStrings } from '@/tools/formatter/i18n/en'

export default function FormatterStudio() {
  const [state, setState] = useState<FormatterState>(DEFAULT_STATE)
  const [language, setLanguage] = useState<Language>('en')

  const t: I18nStrings = language === 'zh' ? zh : en

  // Resolve the effective format (auto → detected; explicit → as-is)
  const effectiveFormat: Format | null = useMemo(() => {
    if (state.format === 'auto') return state.detectedFormat
    return state.format
  }, [state.format, state.detectedFormat])

  // Auto-detect when input changes (debounced via state, so re-detect each render is fine)
  useEffect(() => {
    if (!state.input.trim()) {
      setState((s) => ({ ...s, detectedFormat: null }))
      return
    }
    const detected = detectFormat(state.input)
    setState((s) => ({ ...s, detectedFormat: detected }))
  }, [state.input])

  const handleInputChange = useCallback((value: string) => {
    if (Buffer.byteLength(value, 'utf8') > MAX_INPUT_BYTES) {
      setState((s) => ({
        ...s,
        validation: { ok: false, error: { message: en.errors.tooLarge } },
      }))
      return
    }
    setState((s) => ({ ...s, input: value, validation: null }))
  }, [])

  const handleInputBChange = useCallback((value: string) => {
    setState((s) => ({ ...s, inputB: value }))
  }, [])

  const handleFormatChange = useCallback((format: FormatOrAuto) => {
    setState((s) => ({ ...s, format }))
  }, [])

  const handleActionChange = useCallback((action: Action) => {
    setState((s) => ({ ...s, action, output: '', validation: null }))
  }, [])

  const handleConvertTargetChange = useCallback((target: Format) => {
    setState((s) => ({ ...s, convertTarget: target }))
  }, [])

  const handleRun = useCallback(async () => {
    if (!effectiveFormat) {
      setState((s) => ({
        ...s,
        validation: { ok: false, error: { message: t.errors.unknownFormat } },
      }))
      return
    }
    if (!state.input.trim()) {
      setState((s) => ({
        ...s,
        validation: { ok: false, error: { message: t.errors.empty } },
      }))
      return
    }

    const def = FORMAT_DEFINITIONS[effectiveFormat]

    // CONVERT
    if (state.action === 'convert') {
      if (!state.convertTarget) {
        setState((s) => ({
          ...s,
          validation: { ok: false, error: { message: t.status.convertUnsupported } },
        }))
        return
      }
      const result = convertClient(effectiveFormat, state.convertTarget, state.input)
      setState((s) => ({
        ...s,
        output: result.output ?? '',
        validation: result.validation,
      }))
      return
    }

    // VALIDATE
    if (state.action === 'validate') {
      const validation = validateClient(effectiveFormat, state.input)
      setState((s) => ({ ...s, output: '', validation }))
      return
    }

    // FORMAT or MINIFY
    if (def.execution === 'client') {
      const result =
        state.action === 'minify'
          ? minifyClient(effectiveFormat, state.input)
          : formatClient(effectiveFormat, state.input)
      setState((s) => ({
        ...s,
        output: result.output ?? '',
        validation: result.validation,
      }))
      return
    }

    // SERVER-SIDE
    setState((s) => ({ ...s, loading: true, validation: null }))
    try {
      const res = await fetch('/api/v1/formatter/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: effectiveFormat,
          action: state.action,
          content: state.input,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setState((s) => ({
          ...s,
          loading: false,
          output: json.data.result,
          validation: { ok: true },
        }))
      } else {
        setState((s) => ({
          ...s,
          loading: false,
          output: '',
          validation: { ok: false, error: { message: json.error || t.errors.serverError } },
        }))
      }
    } catch {
      setState((s) => ({
        ...s,
        loading: false,
        validation: { ok: false, error: { message: t.errors.networkError } },
      }))
    }
  }, [effectiveFormat, state.input, state.action, state.convertTarget, t])

  // PLACEHOLDERS — to be replaced by Task 8/9/10/11
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t.pageTitle}
        </h1>
        <button
          type="button"
          onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 min-h-[44px] cursor-pointer"
        >
          {language === 'en' ? '中文' : 'EN'}
        </button>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        {t.pageSubtitle}
      </p>
      {/* Sub-components added in subsequent tasks */}
      <div className="text-slate-400 text-sm">
        Studio scaffold ready. Toolbar / editor / diff / status bar coming in next tasks.
      </div>
      {/* Suppress unused warnings until subcomponents are wired */}
      <span hidden>
        {String(state.loading)}
        {String(handleInputChange)}
        {String(handleInputBChange)}
        {String(handleFormatChange)}
        {String(handleActionChange)}
        {String(handleConvertTargetChange)}
        {String(handleRun)}
      </span>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/tools/formatter/page.tsx`**

```typescript
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import FormatterStudio from '@/tools/formatter/formatter-studio'

export default function FormatterPage() {
  return (
    <main
      className="flex-1 flex flex-col items-center py-10 px-4 bg-white dark:bg-[#090f16]"
      style={{ overscrollBehaviorX: 'none' } as React.CSSProperties}
    >
      <div className="w-full max-w-6xl">
        <div className="mb-6">
          <ToolBreadcrumb toolName="Formatter" toolSlug="formatter" />
        </div>
        <FormatterStudio />
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Create `app/tools/formatter/layout.tsx`**

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Formatter — Format, Minify, Validate, Convert & Diff 12 Formats | Toolk1t',
  description:
    'Free online formatter for JSON, XML, YAML, SQL, HTML, CSS, JavaScript, TypeScript, Markdown, GraphQL, TOML and INI. Format, minify, validate, convert between formats, and diff side-by-side. Privacy-first — your content is never stored.',
  keywords: [
    'formatter', 'json formatter', 'xml formatter', 'yaml formatter',
    'sql formatter', 'html formatter', 'css formatter', 'javascript formatter',
    'minify', 'validate', 'diff', 'prettier', '格式化',
  ],
  openGraph: {
    title: 'Formatter — All-in-One Code & Data Formatter',
    description: 'Format, minify, validate, convert and diff 12 formats in one tool.',
    type: 'website',
  },
}

export default function FormatterLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

- [ ] **Step 4: Verify TypeScript compiles and dev page renders**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 5: Commit**

```bash
git add tools/formatter/formatter-studio.tsx app/tools/formatter/page.tsx app/tools/formatter/layout.tsx
git commit -m "feat(formatter): add studio container, page route, and SEO layout"
```

---

### Task 8: Toolbar Component

**Files:**
- Create: `tools/formatter/formatter-toolbar.tsx`

- [ ] **Step 1: Create `tools/formatter/formatter-toolbar.tsx`**

```typescript
'use client'

import type {
  Format,
  FormatOrAuto,
  Action,
} from '@/tools/formatter/formatter-types'
import { ALL_FORMATS, FORMAT_DEFINITIONS } from '@/tools/formatter/formatter-defaults'
import type { I18nStrings } from '@/tools/formatter/i18n/en'

interface FormatterToolbarProps {
  format: FormatOrAuto
  detectedFormat: Format | null
  effectiveFormat: Format | null
  action: Action
  convertTarget: Format | null
  loading: boolean
  onFormatChange: (format: FormatOrAuto) => void
  onActionChange: (action: Action) => void
  onConvertTargetChange: (target: Format) => void
  onRun: () => void
  t: I18nStrings
}

const ACTIONS: Action[] = ['format', 'minify', 'validate', 'convert', 'diff']

export function FormatterToolbar({
  format,
  detectedFormat,
  effectiveFormat,
  action,
  convertTarget,
  loading,
  onFormatChange,
  onActionChange,
  onConvertTargetChange,
  onRun,
  t,
}: FormatterToolbarProps) {
  const convertTargets = effectiveFormat
    ? FORMAT_DEFINITIONS[effectiveFormat].convertTargets
    : []

  const minifySupported =
    effectiveFormat !== null && FORMAT_DEFINITIONS[effectiveFormat].canMinify

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 p-3 rounded-xl bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-slate-700">
      {/* Format dropdown */}
      <div className="flex items-center gap-2">
        <label htmlFor="format-select" className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {t.formatLabel}
        </label>
        <select
          id="format-select"
          value={format}
          onChange={(e) => onFormatChange(e.target.value as FormatOrAuto)}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1620] px-3 py-2 text-sm text-slate-900 dark:text-white min-h-[44px] cursor-pointer"
        >
          <option value="auto">
            {t.auto}{detectedFormat ? ` (${t.detected}: ${FORMAT_DEFINITIONS[detectedFormat].label})` : ''}
          </option>
          {ALL_FORMATS.map((f) => (
            <option key={f} value={f}>
              {FORMAT_DEFINITIONS[f].label}
            </option>
          ))}
        </select>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        {ACTIONS.map((act) => {
          const isActive = action === act
          const isDisabled = act === 'minify' && !minifySupported
          return (
            <button
              key={act}
              type="button"
              onClick={() => onActionChange(act)}
              disabled={isDisabled}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'bg-white dark:bg-[#0f1620] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {t.actions[act]}
            </button>
          )
        })}
      </div>

      {/* Convert target dropdown — only when convert is active */}
      {action === 'convert' && (
        <div className="flex items-center gap-2">
          <label htmlFor="convert-select" className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t.convertTo}
          </label>
          <select
            id="convert-select"
            value={convertTarget ?? ''}
            onChange={(e) => onConvertTargetChange(e.target.value as Format)}
            disabled={convertTargets.length === 0}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1620] px-3 py-2 text-sm text-slate-900 dark:text-white min-h-[44px] cursor-pointer disabled:opacity-40"
          >
            <option value="">—</option>
            {convertTargets.map((f) => (
              <option key={f} value={f}>
                {FORMAT_DEFINITIONS[f].label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Run button */}
      <div className="ml-auto">
        <button
          type="button"
          onClick={onRun}
          disabled={loading}
          className="px-6 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:opacity-90 disabled:opacity-50 min-h-[44px] cursor-pointer"
        >
          {loading ? t.status.loading : t.actions[action]}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 3: Commit**

```bash
git add tools/formatter/formatter-toolbar.tsx
git commit -m "feat(formatter): add toolbar with format dropdown and action buttons"
```

---

### Task 9: Editor Component (Input/Output Panes)

**Files:**
- Create: `tools/formatter/formatter-editor.tsx`

- [ ] **Step 1: Create `tools/formatter/formatter-editor.tsx`**

```typescript
'use client'

import type { I18nStrings } from '@/tools/formatter/i18n/en'

interface FormatterEditorProps {
  input: string
  output: string
  onInputChange: (value: string) => void
  t: I18nStrings
}

export function FormatterEditor({ input, output, onInputChange, t }: FormatterEditorProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Input pane */}
      <div className="flex flex-col">
        <label htmlFor="formatter-input" className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
          {t.panes.input}
        </label>
        <textarea
          id="formatter-input"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={t.panes.inputPlaceholder}
          spellCheck={false}
          className="w-full font-mono text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1620] px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 resize-none"
          style={{ height: 'clamp(280px, 55vh, 600px)' }}
        />
      </div>

      {/* Output pane */}
      <div className="flex flex-col">
        <label htmlFor="formatter-output" className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
          {t.panes.output}
        </label>
        <textarea
          id="formatter-output"
          value={output}
          readOnly
          placeholder={t.panes.outputPlaceholder}
          spellCheck={false}
          className="w-full font-mono text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0a0f17] px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
          style={{ height: 'clamp(280px, 55vh, 600px)' }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 3: Commit**

```bash
git add tools/formatter/formatter-editor.tsx
git commit -m "feat(formatter): add editor with input/output textarea panes"
```

---

### Task 10: Diff Component

**Files:**
- Create: `tools/formatter/formatter-diff.tsx`

- [ ] **Step 1: Create `tools/formatter/formatter-diff.tsx`**

```typescript
'use client'

import { useMemo } from 'react'
import { diffLines } from 'diff'
import type { I18nStrings } from '@/tools/formatter/i18n/en'

interface FormatterDiffProps {
  inputA: string
  inputB: string
  onInputAChange: (value: string) => void
  onInputBChange: (value: string) => void
  t: I18nStrings
}

export function FormatterDiff({
  inputA,
  inputB,
  onInputAChange,
  onInputBChange,
  t,
}: FormatterDiffProps) {
  const diffResult = useMemo(() => {
    if (!inputA.trim() || !inputB.trim()) return null
    return diffLines(inputA, inputB)
  }, [inputA, inputB])

  return (
    <div className="space-y-3">
      {/* Input A and Input B side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label htmlFor="diff-input-a" className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            {t.panes.inputA}
          </label>
          <textarea
            id="diff-input-a"
            value={inputA}
            onChange={(e) => onInputAChange(e.target.value)}
            placeholder={t.panes.inputPlaceholder}
            spellCheck={false}
            className="w-full font-mono text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1620] px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 resize-none"
            style={{ height: 'clamp(220px, 35vh, 400px)' }}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="diff-input-b" className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            {t.panes.inputB}
          </label>
          <textarea
            id="diff-input-b"
            value={inputB}
            onChange={(e) => onInputBChange(e.target.value)}
            placeholder={t.panes.inputPlaceholder}
            spellCheck={false}
            className="w-full font-mono text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1620] px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 resize-none"
            style={{ height: 'clamp(220px, 35vh, 400px)' }}
          />
        </div>
      </div>

      {/* Diff result */}
      <div>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
          {t.panes.diffResult}
        </p>
        {!diffResult ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0a0f17] px-4 py-6 text-center text-sm text-slate-400">
            {t.status.addBothSides}
          </div>
        ) : (
          <pre className="font-mono text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0a0f17] px-4 py-3 overflow-auto whitespace-pre-wrap" style={{ maxHeight: 'clamp(220px, 35vh, 400px)' }}>
            {diffResult.map((part, i) => {
              const className = part.added
                ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-200'
                : part.removed
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-200 line-through'
                  : 'text-slate-700 dark:text-slate-300'
              const prefix = part.added ? '+ ' : part.removed ? '- ' : '  '
              return (
                <span key={i} className={className}>
                  {part.value
                    .split('\n')
                    .filter((line, idx, arr) => !(idx === arr.length - 1 && line === ''))
                    .map((line) => `${prefix}${line}\n`)
                    .join('')}
                </span>
              )
            })}
          </pre>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 3: Commit**

```bash
git add tools/formatter/formatter-diff.tsx
git commit -m "feat(formatter): add diff component with side-by-side inputs and color-coded result"
```

---

### Task 11: Status Bar with Copy/Download

**Files:**
- Create: `tools/formatter/formatter-status-bar.tsx`

- [ ] **Step 1: Create `tools/formatter/formatter-status-bar.tsx`**

```typescript
'use client'

import { useCallback, useState } from 'react'
import type { Format, ValidationResult } from '@/tools/formatter/formatter-types'
import { FORMAT_DEFINITIONS } from '@/tools/formatter/formatter-defaults'
import type { I18nStrings } from '@/tools/formatter/i18n/en'

interface FormatterStatusBarProps {
  output: string
  validation: ValidationResult | null
  effectiveFormat: Format | null
  t: I18nStrings
}

export function FormatterStatusBar({
  output,
  validation,
  effectiveFormat,
  t,
}: FormatterStatusBarProps) {
  const [copied, setCopied] = useState(false)

  const bytes = output ? new Blob([output]).size : 0
  const lines = output ? output.split('\n').length : 0

  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }, [output])

  const handleDownload = useCallback(() => {
    if (!output || !effectiveFormat) return
    const def = FORMAT_DEFINITIONS[effectiveFormat]
    const blob = new Blob([output], { type: def.mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formatted.${def.extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [output, effectiveFormat])

  let validationLabel: string | null = null
  let validationClass = ''
  if (validation) {
    if (validation.ok) {
      validationLabel = `✓ ${t.status.valid}${validation.summary ? ` · ${validation.summary}` : ''}`
      validationClass = 'text-green-600 dark:text-green-400'
    } else {
      const loc = validation.error?.line ? ` (line ${validation.error.line})` : ''
      validationLabel = `✗ ${t.status.invalid}${loc} — ${validation.error?.message ?? ''}`
      validationClass = 'text-red-600 dark:text-red-400'
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-slate-700 text-xs">
      {/* Validation status */}
      <div className={`flex-1 min-w-0 truncate ${validationClass || 'text-slate-500 dark:text-slate-400'}`}>
        {validationLabel ?? t.status.pasteToBegin}
      </div>

      {/* Counts */}
      {output && (
        <div className="text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {bytes} {t.status.bytes} · {lines} {t.status.lines}
        </div>
      )}

      {/* Privacy notice */}
      <div className="text-slate-400 dark:text-slate-500 italic whitespace-nowrap hidden sm:block">
        {t.status.privacy}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          disabled={!output}
          className="px-3 py-2 rounded-lg text-xs font-medium bg-white dark:bg-[#0f1620] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] cursor-pointer"
        >
          {copied ? `✓ ${t.status.copied}` : t.buttons.copy}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!output || !effectiveFormat}
          className="px-3 py-2 rounded-lg text-xs font-medium bg-white dark:bg-[#0f1620] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] cursor-pointer"
        >
          {t.buttons.download}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 3: Commit**

```bash
git add tools/formatter/formatter-status-bar.tsx
git commit -m "feat(formatter): add status bar with validation, counts, copy and download"
```

---

### Task 12: Wire Subcomponents Into Studio

**Files:**
- Modify: `tools/formatter/formatter-studio.tsx`

- [ ] **Step 1: Replace the placeholder render in `formatter-studio.tsx`**

Find the placeholder JSX (the "Studio scaffold ready" div + the hidden span) and replace the **entire return block** with:

```typescript
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Title + language toggle */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t.pageTitle}
        </h1>
        <button
          type="button"
          onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 min-h-[44px] cursor-pointer"
        >
          {language === 'en' ? '中文' : 'EN'}
        </button>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        {t.pageSubtitle}
      </p>

      {/* Toolbar */}
      <FormatterToolbar
        format={state.format}
        detectedFormat={state.detectedFormat}
        effectiveFormat={effectiveFormat}
        action={state.action}
        convertTarget={state.convertTarget}
        loading={state.loading}
        onFormatChange={handleFormatChange}
        onActionChange={handleActionChange}
        onConvertTargetChange={handleConvertTargetChange}
        onRun={handleRun}
        t={t}
      />

      {/* Main editing area — diff mode shows DiffComponent, else editor */}
      {state.action === 'diff' ? (
        <FormatterDiff
          inputA={state.input}
          inputB={state.inputB}
          onInputAChange={handleInputChange}
          onInputBChange={handleInputBChange}
          t={t}
        />
      ) : (
        <FormatterEditor
          input={state.input}
          output={state.output}
          onInputChange={handleInputChange}
          t={t}
        />
      )}

      {/* Status bar */}
      <FormatterStatusBar
        output={state.output}
        validation={state.validation}
        effectiveFormat={effectiveFormat}
        t={t}
      />
    </div>
  )
}
```

- [ ] **Step 2: Add imports at the top of the file**

Add these imports right after the existing imports:

```typescript
import { FormatterToolbar } from '@/tools/formatter/formatter-toolbar'
import { FormatterEditor } from '@/tools/formatter/formatter-editor'
import { FormatterDiff } from '@/tools/formatter/formatter-diff'
import { FormatterStatusBar } from '@/tools/formatter/formatter-status-bar'
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`

- [ ] **Step 4: Commit**

```bash
git add tools/formatter/formatter-studio.tsx
git commit -m "feat(formatter): wire toolbar, editor, diff, and status bar into studio"
```

---

### Task 13: Tool Catalog Registration

**Files:**
- Modify: `lib/tools.tsx`

- [ ] **Step 1: Add formatter entry to tools array**

Open `lib/tools.tsx` and add this entry **before the closing `]`** of the `tools` array:

```typescript
  {
    name: 'Formatter',
    href: '/tools/formatter',
    description: 'Format, minify, validate, convert & diff 12 formats',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    ),
    color: 'from-blue-500 to-indigo-500',
  },
```

- [ ] **Step 2: Verify TypeScript compiles and build runs**

Run: `echo "START" && pnpm tsc --noEmit 2>&1 && echo "SUCCESS"`
Then run: `pnpm build 2>&1 | tail -20`
Expected: Build completes, `/tools/formatter` appears in the route list.

- [ ] **Step 3: Commit**

```bash
git add lib/tools.tsx
git commit -m "feat(formatter): register in tool catalog"
```

---

### Task 14: E2E Browser Test

**Files:**
- Create: `e2e/formatter.spec.ts`

- [ ] **Step 1: Create `e2e/formatter.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Formatter Tool', () => {
  test('formats valid JSON', async ({ page }) => {
    await page.goto('/tools/formatter')

    // Fill input with unformatted JSON
    await page.locator('#formatter-input').fill('{"name":"test","items":[1,2,3]}')

    // Click the Run button (which says "Format" since action defaults to format)
    await page.getByRole('button', { name: /^Format$/ }).last().click()

    // Output should contain the formatted JSON
    const output = await page.locator('#formatter-output').inputValue()
    expect(output).toContain('"name": "test"')
    expect(output).toContain('"items"')
  })

  test('shows validation error for invalid JSON', async ({ page }) => {
    await page.goto('/tools/formatter')

    await page.locator('#formatter-input').fill('{"invalid": }')
    await page.getByRole('button', { name: /^Format$/ }).last().click()

    // Status bar should show invalid
    await expect(page.locator('text=/Invalid/i')).toBeVisible()
  })

  test('switches to Chinese language', async ({ page }) => {
    await page.goto('/tools/formatter')

    await page.getByRole('button', { name: '中文' }).click()
    await expect(page.locator('h1')).toContainText('格式化工具')
  })

  test('diff mode shows side-by-side inputs', async ({ page }) => {
    await page.goto('/tools/formatter')

    await page.getByRole('button', { name: 'Diff' }).first().click()

    await expect(page.locator('#diff-input-a')).toBeVisible()
    await expect(page.locator('#diff-input-b')).toBeVisible()

    await page.locator('#diff-input-a').fill('hello\nworld')
    await page.locator('#diff-input-b').fill('hello\nthere')

    // Diff result should show
    await expect(page.locator('text=/world/').first()).toBeVisible()
    await expect(page.locator('text=/there/').first()).toBeVisible()
  })

  test('auto-detects JSON format', async ({ page }) => {
    await page.goto('/tools/formatter')

    await page.locator('#formatter-input').fill('{"detected": true}')

    // The format dropdown should now show "Detected: JSON"
    await expect(page.locator('select#format-select option:checked')).toContainText('JSON')
  })
})
```

- [ ] **Step 2: Run the E2E test against the dev server**

In one terminal:
```bash
pnpm dev
```

In another:
```bash
pnpm exec playwright test e2e/formatter.spec.ts
```

Expected: All 5 tests pass. If any fail, fix the implementation and re-run.

- [ ] **Step 3: Commit**

```bash
git add e2e/formatter.spec.ts
git commit -m "test(formatter): add E2E browser tests for format, validate, diff, i18n, auto-detect"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ 12 formats (Task 2 defines all 12 in FORMAT_DEFINITIONS)
- ✅ Auto-detect + dropdown override (Task 4 detector + Task 8 toolbar)
- ✅ Format/Minify/Validate/Convert/Diff actions (Tasks 5, 6, 10, 12)
- ✅ Hybrid execution (Tasks 5 client + Task 6 server)
- ✅ 1MB max input (Task 6 server check + Task 7 client check)
- ✅ Privacy: no logging, visible notice (Task 6 only logs error message; Task 11 status bar shows notice)
- ✅ Bilingual EN+ZH (Task 3)
- ✅ Single-page Studio (Task 7)
- ✅ Single API endpoint (Task 6)
- ✅ Convert only between data formats (Task 2 convertTargets matrix)
- ✅ Mobile responsive (Tasks 8/9/10/11 use grid-cols-1 lg:grid-cols-2)
- ✅ E2E test (Task 14)
- ✅ Catalog registration (Task 13)

**Type consistency:**
- `Format`, `Action`, `FormatOrAuto`, `FormatterState`, `ValidationResult` defined once in Task 2, used consistently in Tasks 5-12.
- `I18nStrings` defined in Task 3, imported into all UI components.
- All component prop types are explicit; no `any`.
