# ToolFrame Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a shared `ToolFrame` layout component and migrate 3 pilot tools (Mood Board, JSON Converter, Image Editor) to validate it.

**Architecture:** Single `ToolFrame` component with `standard` and `compact` variants. Fixed header + scrollable content + optional fixed action bar. Category-based theming (creative/utility/interactive). Tools pass props; frame handles layout, scrolling, and mobile adaptation.

**Tech Stack:** React 19, Next.js 16 App Router, TypeScript, Tailwind CSS v4. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-04-03-tool-frame-design.md`

---

## File Structure

### New Files
| File | Responsibility |
|---|---|
| `components/layout/tool-categories.ts` | Category config: slug→category mapping, color theme tokens |
| `components/layout/tool-header.tsx` | Themed gradient header (standard + compact) |
| `components/layout/tool-tabs.tsx` | Sticky tab navigation bar |
| `components/layout/tool-action-bar.tsx` | Fixed bottom action bar wrapper |
| `components/layout/tool-frame.tsx` | Main ToolFrame orchestrator |

### Modified Files (Phase 1 pilots)
| File | Changes |
|---|---|
| `app/tools/mood-board/page.tsx` | Wrap in ToolFrame, remove custom layout |
| `tools/mood-board/mood-board-studio.tsx` | Remove ToolBreadcrumb, adapt to scrollable content area |
| `app/tools/json-converter/page.tsx` | Wrap in ToolFrame, remove BackButton/FavoriteButton/breadcrumb |
| `app/tools/image-editor/page.tsx` | Wrap in ToolFrame compact variant, remove BackButton/FavoriteButton |

---

## Task 1: Category Config

**Files:**
- Create: `components/layout/tool-categories.ts`

- [ ] **Step 1: Create tool-categories.ts**

```typescript
// components/layout/tool-categories.ts

export type ToolCategory = 'creative' | 'utility' | 'interactive'

export interface CategoryTheme {
  gradient: string        // header gradient classes
  border: string          // border color class
  iconAccent: string      // icon highlight color class
  bgSubtle: string        // subtle background for action bar
}

export const CATEGORY_THEMES: Record<ToolCategory, CategoryTheme> = {
  creative: {
    gradient: 'from-indigo-950 via-purple-900 to-indigo-950',
    border: 'border-purple-800/50',
    iconAccent: 'text-amber-400',
    bgSubtle: 'bg-purple-950/80',
  },
  utility: {
    gradient: 'from-slate-900 via-blue-950 to-slate-900',
    border: 'border-blue-800/50',
    iconAccent: 'text-blue-400',
    bgSubtle: 'bg-blue-950/80',
  },
  interactive: {
    gradient: 'from-slate-900 via-cyan-950 to-slate-900',
    border: 'border-cyan-800/50',
    iconAccent: 'text-cyan-400',
    bgSubtle: 'bg-cyan-950/80',
  },
}

const TOOL_CATEGORY_MAP: Record<string, ToolCategory> = {
  // Creative
  'story-studio': 'creative',
  'mood-board': 'creative',
  'sketch-to-art': 'creative',
  'logo-generator': 'creative',
  'font-generator': 'creative',
  'favicon-generator': 'creative',
  'ecard-studio': 'creative',
  'music-studio': 'creative',
  'vblog': 'creative',
  'story-video': 'creative',
  'component-lab': 'creative',
  // Utility
  'json-converter': 'utility',
  'swagger-editor': 'utility',
  'regex-tester': 'utility',
  'jwt-decoder': 'utility',
  'pdf-converter': 'utility',
  'myip': 'utility',
  'ipcheck': 'utility',
  'speedtest': 'utility',
  'currency-exchange': 'utility',
  'color-palette': 'utility',
  'svg-converter': 'utility',
  'tax-manager': 'utility',
  // Interactive
  'local-services': 'interactive',
  'human-benchmark': 'interactive',
  'slots': 'interactive',
  'openclaw': 'interactive',
  'image-editor': 'interactive',
  'id-photo': 'interactive',
  'resume': 'interactive',
  'job-radar': 'interactive',
  'ai-radar': 'interactive',
}

export function getToolCategory(slug: string): ToolCategory {
  return TOOL_CATEGORY_MAP[slug] || 'utility'
}

export function getCategoryTheme(category: ToolCategory): CategoryTheme {
  return CATEGORY_THEMES[category]
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/tool-categories.ts
git commit -m "feat(tool-frame): add category config with slug mapping and color themes"
```

---

## Task 2: Tool Header

**Files:**
- Create: `components/layout/tool-header.tsx`

- [ ] **Step 1: Create tool-header.tsx**

Two header modes: standard (gradient, breadcrumb, icon+title) and compact (thin bar, back arrow+title).

```typescript
// components/layout/tool-header.tsx
'use client'

import Link from 'next/link'
import { FavoriteButton } from '@/components/ui/favorite-button'
import type { ToolCategory } from './tool-categories'
import { getCategoryTheme } from './tool-categories'

interface ToolHeaderProps {
  toolName: string
  toolSlug: string
  category: ToolCategory
  variant: 'standard' | 'compact'
  icon?: React.ReactNode
}

export function ToolHeader({ toolName, toolSlug, category, variant, icon }: ToolHeaderProps) {
  const theme = getCategoryTheme(category)

  if (variant === 'compact') {
    return (
      <header className={`shrink-0 bg-gradient-to-r ${theme.gradient} px-4 py-2.5`}>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center justify-center w-9 h-9 rounded-full text-slate-300 hover:text-white transition-colors"
            aria-label="Home"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          {icon && <span className={theme.iconAccent}>{icon}</span>}
          <h1 className="text-base font-semibold text-white truncate">{toolName}</h1>
          <span className="flex-1" />
          <FavoriteButton slug={toolSlug} name={toolName} />
        </div>
      </header>
    )
  }

  // Standard variant
  return (
    <header className={`shrink-0 relative bg-gradient-to-r ${theme.gradient}`}>
      <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-4 md:pt-5 md:pb-5">
        {/* Desktop: breadcrumb */}
        <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-sm text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span aria-hidden>/</span>
          <span className="text-white font-medium">{toolName}</span>
        </nav>

        {/* Title row */}
        <div className="mt-2 md:mt-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile: back link */}
            <Link
              href="/"
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-slate-300 hover:text-white transition-colors"
              aria-label="Home"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>

            {icon && <span className={`text-2xl ${theme.iconAccent}`}>{icon}</span>}
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">{toolName}</h1>
          </div>

          <FavoriteButton slug={toolSlug} name={toolName} />
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/tool-header.tsx
git commit -m "feat(tool-frame): add themed tool header with standard and compact variants"
```

---

## Task 3: Tool Tabs

**Files:**
- Create: `components/layout/tool-tabs.tsx`

- [ ] **Step 1: Create tool-tabs.tsx**

Sticky tab bar that sits below the header. Uses `usePathname()` to highlight the active tab.

```typescript
// components/layout/tool-tabs.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ToolCategory } from './tool-categories'
import { getCategoryTheme } from './tool-categories'

export interface ToolTab {
  label: string
  href: string
  icon?: React.ReactNode
}

interface ToolTabsProps {
  tabs: ToolTab[]
  category: ToolCategory
}

export function ToolTabs({ tabs, category }: ToolTabsProps) {
  const pathname = usePathname()
  const theme = getCategoryTheme(category)

  return (
    <nav
      className={`shrink-0 sticky top-0 z-20 bg-slate-50 dark:bg-slate-950 border-b ${theme.border} overflow-x-auto`}
      aria-label="Tool navigation"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex gap-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href + '/'))
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? `${theme.iconAccent} border-current`
                  : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/tool-tabs.tsx
git commit -m "feat(tool-frame): add sticky tool tabs with active state"
```

---

## Task 4: Tool Action Bar

**Files:**
- Create: `components/layout/tool-action-bar.tsx`

- [ ] **Step 1: Create tool-action-bar.tsx**

Fixed bottom bar that pins action buttons. Category-themed border and backdrop blur.

```typescript
// components/layout/tool-action-bar.tsx
'use client'

import type { ToolCategory } from './tool-categories'
import { getCategoryTheme } from './tool-categories'

interface ToolActionBarProps {
  category: ToolCategory
  children: React.ReactNode
}

export function ToolActionBar({ category, children }: ToolActionBarProps) {
  const theme = getCategoryTheme(category)

  return (
    <div
      className={`shrink-0 border-t ${theme.border} ${theme.bgSubtle} backdrop-blur-sm px-4 md:px-6 py-3`}
      role="toolbar"
      aria-label="Actions"
    >
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/tool-action-bar.tsx
git commit -m "feat(tool-frame): add fixed action bar component"
```

---

## Task 5: ToolFrame Main Component

**Files:**
- Create: `components/layout/tool-frame.tsx`

- [ ] **Step 1: Create tool-frame.tsx**

The main orchestrator that composes header, tabs, content area, and action bar.

```typescript
// components/layout/tool-frame.tsx
'use client'

import { ToolHeader } from './tool-header'
import { ToolTabs, type ToolTab } from './tool-tabs'
import { ToolActionBar } from './tool-action-bar'
import { getToolCategory, type ToolCategory } from './tool-categories'

interface ToolFrameProps {
  toolName: string
  toolSlug: string
  category?: ToolCategory       // auto-detected from slug if omitted
  variant?: 'standard' | 'compact'
  icon?: React.ReactNode
  tabs?: ToolTab[]
  actions?: React.ReactNode
  children: React.ReactNode
}

export function ToolFrame({
  toolName,
  toolSlug,
  category,
  variant = 'standard',
  icon,
  tabs,
  actions,
  children,
}: ToolFrameProps) {
  const resolvedCategory = category || getToolCategory(toolSlug)

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Fixed header */}
      <ToolHeader
        toolName={toolName}
        toolSlug={toolSlug}
        category={resolvedCategory}
        variant={variant}
        icon={icon}
      />

      {/* Sticky tabs (standard variant only) */}
      {variant === 'standard' && tabs && tabs.length > 0 && (
        <ToolTabs tabs={tabs} category={resolvedCategory} />
      )}

      {/* Scrollable content — the ONLY zone that scrolls */}
      <main
        className={`flex-1 overflow-y-auto min-h-0 ${
          variant === 'standard'
            ? 'bg-slate-50 dark:bg-slate-950'
            : ''
        }`}
      >
        {variant === 'standard' ? (
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
            {children}
          </div>
        ) : (
          children
        )}
      </main>

      {/* Fixed action bar (optional) */}
      {actions && (
        <ToolActionBar category={resolvedCategory}>
          {actions}
        </ToolActionBar>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm build 2>&1 | grep -E "error|Error" | head -5
```

Expected: clean build (no tool pages import ToolFrame yet).

- [ ] **Step 3: Commit**

```bash
git add components/layout/tool-frame.tsx
git commit -m "feat(tool-frame): add main ToolFrame layout component"
```

---

## Task 6: Pilot — Mood Board (Creative, Standard)

**Files:**
- Modify: `app/tools/mood-board/page.tsx`
- Modify: `tools/mood-board/mood-board-studio.tsx`

- [ ] **Step 1: Update page.tsx to use ToolFrame**

Replace the page content. The wizard renders inside ToolFrame's content area.

```typescript
// app/tools/mood-board/page.tsx
import type { Metadata } from 'next'
import { ToolFrame } from '@/components/layout/tool-frame'
import MoodBoardStudio from '@/tools/mood-board/mood-board-studio'

export const metadata: Metadata = {
  title: 'Mood Board Studio — AI Visual Brainstorming | Toolk1t',
  description: 'Create AI-powered mood boards. Generate images, color palettes, and typography from a theme.',
}

export default function MoodBoardPage() {
  return (
    <ToolFrame
      toolName="Mood Board"
      toolSlug="mood-board"
      icon={<span>🎨</span>}
    >
      <MoodBoardStudio />
    </ToolFrame>
  )
}
```

- [ ] **Step 2: Update mood-board-studio.tsx**

Remove:
- `ToolBreadcrumb` import and usage (ToolFrame handles this)
- `min-h-screen bg-[#090f16]` wrapper divs (ToolFrame handles background)
- The `px-4 pt-4` breadcrumb wrapper

The wizard should render without its own `min-h-screen` since it's inside the scrollable content area. Update the wizard view to not set `min-h-screen` — instead use `min-h-full` or let it fill the available space.

Keep: all board functionality, side drawer, FAB button, toolbar.

- [ ] **Step 3: Verify in browser**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tools/mood-board
```

Expected: 200. Visually: themed purple/indigo header with "Mood Board" title, wizard content scrollable below.

- [ ] **Step 4: Commit**

```bash
git add app/tools/mood-board/page.tsx tools/mood-board/mood-board-studio.tsx
git commit -m "feat(tool-frame): migrate Mood Board to ToolFrame (creative)"
```

---

## Task 7: Pilot — JSON Converter (Utility, Standard)

**Files:**
- Modify: `app/tools/json-converter/page.tsx`

- [ ] **Step 1: Wrap in ToolFrame**

The JSON Converter currently renders its own `BackButton`, `FavoriteButton`, and full layout. Wrap the outer content in `ToolFrame` and remove the manual back/favorite buttons.

Read the current `app/tools/json-converter/page.tsx` fully first.

Changes:
1. Import `ToolFrame` from `@/components/layout/tool-frame`
2. Wrap the return JSX in `<ToolFrame toolName="JSON Converter" toolSlug="json-converter" icon={<span>{'{}'}</span>}>`
3. Remove `BackButton` and `FavoriteButton` imports and their JSX (ToolFrame header handles these)
4. Remove the outer `min-h-screen` or `h-screen` if present — ToolFrame provides `h-screen`
5. The editor content (split panes, toolbar, etc.) should render as `children` inside the frame's scrollable area. If the editor needs full height, use `className="h-full"` on the inner content.

- [ ] **Step 2: Verify in browser**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tools/json-converter
```

Expected: 200. Blue/slate header with "JSON Converter" title. Editor content below.

- [ ] **Step 3: Commit**

```bash
git add app/tools/json-converter/page.tsx
git commit -m "feat(tool-frame): migrate JSON Converter to ToolFrame (utility)"
```

---

## Task 8: Pilot — Image Editor (Interactive, Compact)

**Files:**
- Modify: `app/tools/image-editor/page.tsx`

- [ ] **Step 1: Wrap in ToolFrame compact variant**

Read the current `app/tools/image-editor/page.tsx` fully first.

Changes:
1. Import `ToolFrame` from `@/components/layout/tool-frame`
2. Wrap in `<ToolFrame toolName="Image Editor" toolSlug="image-editor" variant="compact" icon={<span>🖼️</span>}>`
3. Remove `BackButton` and `FavoriteButton` imports and JSX
4. Remove outer height/min-height styling — ToolFrame compact gives full-width content area
5. The editor toolbar + canvas + panels should render as `children`. Use `className="h-full flex"` (or whatever the current structure is) to fill the available space.

- [ ] **Step 2: Verify in browser**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tools/image-editor
```

Expected: 200. Thin cyan/slate header bar. Full editor below with maximum viewport.

- [ ] **Step 3: Commit**

```bash
git add app/tools/image-editor/page.tsx
git commit -m "feat(tool-frame): migrate Image Editor to ToolFrame compact (interactive)"
```

---

## Task 9: Build Verification & Cleanup

**Files:**
- None new — verification only

- [ ] **Step 1: Full build check**

```bash
pnpm build
```

Expected: clean build, no errors.

- [ ] **Step 2: Verify all 3 pilot tools load**

```bash
for tool in mood-board json-converter image-editor; do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tools/$tool)
  echo "$tool: $code"
done
```

Expected: all return 200.

- [ ] **Step 3: Verify non-migrated tools still work**

```bash
for tool in story-studio swagger-editor local-services; do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tools/$tool)
  echo "$tool: $code"
done
```

Expected: all return 200 (backward compatible — they don't use ToolFrame yet).

- [ ] **Step 4: Commit any remaining fixes**

```bash
git add -A && git status
# Only commit if there are changes
git commit -m "chore(tool-frame): build verification and cleanup"
```

---

## Task Summary

| Task | Description | Dependencies | Estimated Complexity |
|---|---|---|---|
| 1 | Category config | None | Simple |
| 2 | Tool header component | Task 1 | Medium |
| 3 | Tool tabs component | Task 1 | Simple |
| 4 | Tool action bar | Task 1 | Simple |
| 5 | ToolFrame main component | Tasks 2-4 | Medium |
| 6 | Pilot: Mood Board | Task 5 | Medium (integration) |
| 7 | Pilot: JSON Converter | Task 5 | Medium (integration) |
| 8 | Pilot: Image Editor | Task 5 | Medium (integration) |
| 9 | Build verification | Tasks 6-8 | Simple |

Tasks 1-4 can run in parallel. Task 5 depends on 1-4. Tasks 6-8 depend on 5 and can run in parallel. Task 9 depends on 6-8.
