# Homepage Tool Categories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the homepage bento showcase into "AI-Powered Tools" and "Utility Tools" sections with mobile accordion and schema.org structured data.

**Architecture:** Add a `category` field to each bento item, split into two arrays at render time, render two `<section>` blocks with headings, add accordion toggle for utility section on mobile, and inject JSON-LD structured data.

**Tech Stack:** React 19, Next.js 16, Tailwind CSS v4

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `components/home/bento-showcase.tsx` | Add categories, split sections, accordion, schema.org |

Single-file change. No new files.

---

### Task 1: Add category field to all bento items

**Files:**
- Modify: `components/home/bento-showcase.tsx:5-575`

- [ ] **Step 1: Add `category` property to each bento item**

Add `category: 'ai'` or `category: 'utility'` to every item in the `bentoItems` array. The category goes after the `glowClass` field, before `preview`.

Items and their categories:

| Item | Category |
|------|----------|
| Image Editor | ai |
| Regex Tester | utility |
| Favicon Generator | ai |
| Color Palette | ai |
| JSON Converter | utility |
| Speed Test | utility |
| Story Studio | ai |
| IP Check | utility |
| My IP | utility |
| Swagger Editor | utility |
| JWT Decoder | utility |
| ID Photo Editor | ai |
| PDF Converter | utility |
| SVG Converter | utility |
| Currency Exchange | utility |
| ECard Studio | ai |
| Human Benchmark | utility |
| Job Radar | utility |
| AI Radar | utility |
| Sketch to Art | ai |
| Logo Generator | ai |
| Font Generator | ai |
| Music Studio | ai |
| Mood Board | ai |
| VBlog Studio | ai |
| Component Lab | ai |
| NZ Tax Manager | ai |
| Story Video | ai |

For each item, add the line after `glowClass`:

```tsx
// Example for Image Editor (ai):
{
    name: 'Image Editor',
    description: 'Edit, adjust & apply filters to images',
    href: '/tools/image-editor',
    gridClass: 'lg:col-span-2 lg:row-span-2',
    glowClass: 'from-amber-500/10',
    category: 'ai' as const,
    preview: (
      // ... unchanged
    ),
},

// Example for Regex Tester (utility):
{
    name: 'Regex Tester',
    description: 'Test, match & replace with 30+ preset patterns',
    href: '/tools/regex-tester',
    gridClass: '',
    glowClass: 'from-lime-500/10',
    category: 'utility' as const,
    preview: (
      // ... unchanged
    ),
},
```

Apply this to all 28 items using the table above.

- [ ] **Step 2: Commit**

```bash
git add components/home/bento-showcase.tsx
git commit -m "feat: add category field to bento items (ai/utility)"
```

---

### Task 2: Split rendering into two sections with headings

**Files:**
- Modify: `components/home/bento-showcase.tsx:577-618`

- [ ] **Step 1: Replace the BentoShowcase component**

Replace the entire `BentoShowcase` function (lines 577-618) with the following. This splits items into two arrays and renders two sections:

```tsx
export function BentoShowcase() {
  const aiTools = bentoItems.filter(item => item.category === 'ai')
  const utilityTools = bentoItems.filter(item => item.category === 'utility')

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#101922] dark:to-[#0c1219]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 dark:text-white mb-2">
          Powerful Tools,{' '}
          <span className="bg-gradient-to-r from-[var(--tk-color-primary-400)] to-cyan-400 bg-clip-text text-transparent">
            Zero Cost
          </span>
        </h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-12 max-w-lg mx-auto">
          All your tools — right in your browser.
        </p>

        {/* AI-Powered Tools */}
        <div className="mb-12">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--tk-color-primary-400)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12" />
            </svg>
            AI-Powered Tools
          </h3>
          <BentoGrid items={aiTools} />
        </div>

        {/* Utility Tools */}
        <UtilitySection items={utilityTools} />
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add the BentoGrid helper component**

Add this above the `BentoShowcase` function (after the `bentoItems` array closes):

```tsx
function BentoGrid({ items }: { items: typeof bentoItems }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`group relative bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-5 overflow-hidden hover:scale-[1.02] hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 cursor-pointer shadow-sm dark:shadow-none ${item.gridClass}`}
        >
          {/* Hover glow */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${item.glowClass} to-transparent rounded-2xl`} />

          {/* Mini preview */}
          <div className="relative mb-3 h-24 lg:h-32 rounded-xl bg-slate-100 dark:bg-white/5 overflow-hidden flex items-center justify-center">
            {item.preview}
          </div>

          {/* Label */}
          <h3 className="relative font-bold text-slate-900 dark:text-white text-sm">{item.name}</h3>
          <p className="relative text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{item.description}</p>
          <span className="relative text-xs text-[var(--tk-color-primary-400)] mt-2 inline-block group-hover:translate-x-1 transition-transform">
            Try it →
          </span>
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/home/bento-showcase.tsx
git commit -m "feat: split bento showcase into AI and utility sections"
```

---

### Task 3: Add mobile accordion for Utility Tools section

**Files:**
- Modify: `components/home/bento-showcase.tsx`

- [ ] **Step 1: Add useState import**

Update the import at line 1. Change:

```tsx
'use client'

import Link from 'next/link'
```

To:

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
```

- [ ] **Step 2: Add the UtilitySection component**

Add this component after the `BentoGrid` component and before `BentoShowcase`:

```tsx
function UtilitySection({ items }: { items: typeof bentoItems }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      {/* Heading — clickable on mobile to toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-6 lg:cursor-default"
        aria-expanded={expanded}
      >
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1a1.5 1.5 0 010-2.12l.88-.88a1.5 1.5 0 012.12 0L12 9.75l2.68-2.68a1.5 1.5 0 012.12 0l.88.88a1.5 1.5 0 010 2.12l-5.1 5.1a1.5 1.5 0 01-2.18 0z" />
          </svg>
          Utility Tools
        </h3>
        {/* Chevron — visible only on mobile */}
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 lg:hidden ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Grid — always visible on lg+, toggle on mobile */}
      <div className={`${expanded ? 'block' : 'hidden'} lg:block`}>
        <BentoGrid items={items} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/home/bento-showcase.tsx
git commit -m "feat: add mobile accordion for utility tools section"
```

---

### Task 4: Add schema.org structured data

**Files:**
- Modify: `components/home/bento-showcase.tsx`

- [ ] **Step 1: Add JSON-LD script block**

Inside the `BentoShowcase` component, add this as the first child inside the outer `<section>` element (before the `<div className="max-w-6xl ...">` ):

```tsx
export function BentoShowcase() {
  const aiTools = bentoItems.filter(item => item.category === 'ai')
  const utilityTools = bentoItems.filter(item => item.category === 'utility')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolk1t.com'

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    mainEntity: [
      {
        '@type': 'ItemList',
        name: 'AI-Powered Tools',
        numberOfItems: aiTools.length,
        itemListElement: aiTools.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          url: `${siteUrl}${item.href}`,
          description: item.description,
        })),
      },
      {
        '@type': 'ItemList',
        name: 'Utility Tools',
        numberOfItems: utilityTools.length,
        itemListElement: utilityTools.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          url: `${siteUrl}${item.href}`,
          description: item.description,
        })),
      },
    ],
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#101922] dark:to-[#0c1219]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="max-w-6xl mx-auto">
        {/* ... rest unchanged */}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/home/bento-showcase.tsx
git commit -m "feat: add schema.org ItemList structured data for tool sections"
```

---

### Task 5: Build verification

- [ ] **Step 1: Run build**

```bash
cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm build
```

Expected: Build completes with no TypeScript errors.

- [ ] **Step 2: Fix any issues found**

Common issues to watch for:
- Missing `useState` import
- TypeScript inference on the `category` field — use `as const` if needed
- `h3` inside `button` accessibility — the heading is inside the button which is fine for this pattern

- [ ] **Step 3: Commit fixes if needed**

```bash
git add components/home/bento-showcase.tsx
git commit -m "fix: resolve build issues in bento showcase categories"
```
