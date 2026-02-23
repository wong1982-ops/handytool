# ECard Studio UX Overhaul — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the 2-view discovery/editor flow with a single-page layout where users can edit all card content fields (name, title, message, company, tagline) with live preview.

**Architecture:** Simplify `page.tsx` to render a single editor component. Convert the 3-panel editor into a 2-column layout (preview + edit panel) with a compact template strip at top. Add content editing fields to the customization panel.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4

**Design doc:** `docs/plans/2026-02-24-ecard-studio-ux-overhaul-design.md`

---

### Task 1: Add Content Section to CustomizationPanel

**Files:**
- Modify: `tools/ecard-studio/customization-panel.tsx`

**Step 1: Add Content section at the top of the panel**

Insert a new `<section>` as the FIRST section inside the panel (after the header, before Typography). This section contains 5 text inputs for the card content fields.

Add this JSX right after the header `<div>` (line 44) and before the Typography `<section>` (line 47):

```tsx
{/* CONTENT Section */}
<section className="flex flex-col gap-3">
  <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
    Content
  </h3>

  {/* Name */}
  <div className="flex flex-col gap-1.5">
    <label htmlFor="card-heading" className="text-xs text-slate-500 uppercase tracking-wider">
      Name
    </label>
    <input
      id="card-heading"
      type="text"
      value={cardData.heading}
      onChange={(e) => onChange({ heading: e.target.value })}
      placeholder="Your Name"
      className="w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  </div>

  {/* Title / Role */}
  <div className="flex flex-col gap-1.5">
    <label htmlFor="card-subheading" className="text-xs text-slate-500 uppercase tracking-wider">
      Title
    </label>
    <input
      id="card-subheading"
      type="text"
      value={cardData.subheading}
      onChange={(e) => onChange({ subheading: e.target.value })}
      placeholder="Chief Executive Officer"
      className="w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  </div>

  {/* Message */}
  <div className="flex flex-col gap-1.5">
    <label htmlFor="card-body" className="text-xs text-slate-500 uppercase tracking-wider">
      Message
    </label>
    <textarea
      id="card-body"
      value={cardData.body}
      onChange={(e) => onChange({ body: e.target.value })}
      placeholder="Leading innovation with vision and purpose."
      rows={2}
      className="w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
    />
  </div>

  {/* Company + Tagline in a grid */}
  <div className="flex flex-col gap-1.5">
    <label htmlFor="card-company" className="text-xs text-slate-500 uppercase tracking-wider">
      Company
    </label>
    <input
      id="card-company"
      type="text"
      value={cardData.companyName}
      onChange={(e) => onChange({ companyName: e.target.value })}
      placeholder="Acme Corporation"
      className="w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  </div>

  <div className="flex flex-col gap-1.5">
    <label htmlFor="card-tagline" className="text-xs text-slate-500 uppercase tracking-wider">
      Tagline
    </label>
    <input
      id="card-tagline"
      type="text"
      value={cardData.companyTagline}
      onChange={(e) => onChange({ companyTagline: e.target.value })}
      placeholder="Excellence in every detail"
      className="w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  </div>
</section>
```

**Step 2: Rename header label**

Change the header text from "Customization" to "Editor" (line 42):

```tsx
<span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
  Editor
</span>
```

**Step 3: Verify build**

Run: `pnpm build`
Expected: PASS

**Step 4: Commit**

```bash
git add tools/ecard-studio/customization-panel.tsx
git commit -m "feat(ecard-studio): add content editing fields (name, title, message, company, tagline)"
```

---

### Task 2: Create TemplateStrip Component

**Files:**
- Create: `tools/ecard-studio/template-strip.tsx`

**Step 1: Create the compact template strip**

This replaces the full DesignLibrary sidebar with a horizontal scrollable row of template thumbnails.

Create `tools/ecard-studio/template-strip.tsx`:

```tsx
'use client'

import type { TemplateId } from '@/tools/ecard-studio/types'
import { TEMPLATES } from '@/tools/ecard-studio/templates'
import CardPreview from '@/tools/ecard-studio/card-preview'

interface TemplateStripProps {
  activeTemplate: TemplateId
  onSelectTemplate: (templateId: TemplateId) => void
}

export function TemplateStrip({ activeTemplate, onSelectTemplate }: TemplateStripProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 overflow-x-auto bg-slate-900/50 border-b border-slate-800">
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 shrink-0">
        Template
      </span>
      {TEMPLATES.map((template) => {
        const isActive = activeTemplate === template.id
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelectTemplate(template.id)}
            aria-label={template.name}
            aria-pressed={isActive}
            className={`shrink-0 rounded-lg overflow-hidden transition-all ${
              isActive
                ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950'
                : 'ring-1 ring-slate-700 hover:ring-slate-500'
            }`}
          >
            <div className="w-[100px] h-[67px] relative">
              <CardPreview data={template.defaults} scale={100 / 600} />
            </div>
          </button>
        )
      })}
    </div>
  )
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: PASS

**Step 3: Commit**

```bash
git add tools/ecard-studio/template-strip.tsx
git commit -m "feat(ecard-studio): add compact TemplateStrip component"
```

---

### Task 3: Rewrite page.tsx and CardEditor to Single-Page Layout

This is the main task — replace the discovery/editor split with a unified single-page layout.

**Files:**
- Modify: `app/tools/ecard-studio/page.tsx`
- Modify: `tools/ecard-studio/card-editor.tsx`

**Step 1: Simplify page.tsx**

Replace the entire file content. Remove the discovery/editor routing — just render CardEditor directly with a default template.

New `app/tools/ecard-studio/page.tsx`:

```tsx
'use client'

import { CardEditor } from '@/tools/ecard-studio/card-editor'

export default function ECardStudioPage() {
  return <CardEditor />
}
```

**Step 2: Rewrite CardEditor**

Replace `tools/ecard-studio/card-editor.tsx` with the new single-page layout:

- Remove: `onBack` prop, `DesignLibrary` sidebar, `showMobileLibrary` state, mobile library drawer, project name input
- Add: `TemplateStrip` at top, breadcrumb
- Keep: `CardCanvas`, `CustomizationPanel`, `PreviewModal`, mobile customization drawer, download/preview buttons
- Layout: `TemplateStrip` → two-column (canvas + panel)

New `tools/ecard-studio/card-editor.tsx`:

```tsx
'use client'

import { useCallback, useRef, useState } from 'react'
import type { ECardData, TemplateId } from '@/tools/ecard-studio/types'
import { TEMPLATES, BLANK_DEFAULTS } from '@/tools/ecard-studio/templates'
import { TemplateStrip } from '@/tools/ecard-studio/template-strip'
import { CardCanvas } from '@/tools/ecard-studio/card-canvas'
import { CustomizationPanel } from '@/tools/ecard-studio/customization-panel'
import { PreviewModal } from '@/tools/ecard-studio/preview-modal'
import { exportCardAsPng } from '@/tools/ecard-studio/export'

function getInitialCardData(templateId: TemplateId): ECardData {
  if (templateId === 'blank') return { ...BLANK_DEFAULTS }
  const template = TEMPLATES.find((t) => t.id === templateId)
  return template ? { ...template.defaults } : { ...BLANK_DEFAULTS }
}

export function CardEditor() {
  const [cardData, setCardData] = useState<ECardData>(() =>
    getInitialCardData('executive')
  )
  const [zoom, setZoom] = useState(100)
  const [showPreview, setShowPreview] = useState(false)
  const [showMobilePanel, setShowMobilePanel] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)

  const handleCardChange = useCallback((updates: Partial<ECardData>) => {
    setCardData((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleTemplateSelect = useCallback((templateId: TemplateId) => {
    const template = TEMPLATES.find((t) => t.id === templateId)
    if (template) setCardData({ ...template.defaults })
    else if (templateId === 'blank') setCardData({ ...BLANK_DEFAULTS })
  }, [])

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return
    await exportCardAsPng(cardRef.current, cardData.template)
  }, [cardData.template])

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-950">
      {/* Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
        {/* Left: Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm text-slate-400">
            <li>
              <a href="/tools" className="hover:text-white transition-colors">
                Tools
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-white font-medium">
              ECard Studio
            </li>
          </ol>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile: Edit panel toggle */}
          <button
            type="button"
            onClick={() => setShowMobilePanel(true)}
            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
            aria-label="Open editor panel"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="2" />
              <path
                d="M10 2V5M10 15V18M2 10H5M15 10H18M4.22 4.22L6.34 6.34M13.66 13.66L15.78 15.78M15.78 4.22L13.66 6.34M6.34 13.66L4.22 15.78"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="px-3 py-1.5 text-sm border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 rounded-md transition-colors"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M7 1V9M7 9L4 6M7 9L10 6M2 11H12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Download
          </button>
        </div>
      </div>

      {/* Template Strip */}
      <TemplateStrip
        activeTemplate={cardData.template}
        onSelectTemplate={handleTemplateSelect}
      />

      {/* 2-Column Layout: Canvas + Edit Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Card Canvas */}
        <div className="flex-1 min-w-0">
          <CardCanvas
            cardData={cardData}
            cardRef={cardRef}
            zoom={zoom}
            onZoomChange={setZoom}
          />
        </div>

        {/* Right: Edit Panel — desktop */}
        <div className="w-[320px] flex-shrink-0 border-l border-slate-800 overflow-y-auto hidden lg:block">
          <CustomizationPanel
            cardData={cardData}
            onChange={handleCardChange}
          />
        </div>
      </div>

      {/* Mobile Edit Panel Drawer */}
      {showMobilePanel && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setShowMobilePanel(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowMobilePanel(false)
            }}
            role="button"
            tabIndex={0}
            aria-label="Close editor panel"
          />
          <div className="fixed inset-y-0 right-0 w-[320px] max-w-[85vw] bg-slate-950 z-50 overflow-y-auto lg:hidden shadow-2xl">
            <div className="flex items-center justify-between p-3 border-b border-slate-800">
              <span className="text-sm font-medium text-white">Editor</span>
              <button
                type="button"
                onClick={() => setShowMobilePanel(false)}
                className="p-1 text-slate-400 hover:text-white"
                aria-label="Close editor panel"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path
                    d="M5 5L13 13M13 5L5 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <CustomizationPanel
              cardData={cardData}
              onChange={handleCardChange}
            />
          </div>
        </>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          cardData={cardData}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}
```

**Step 3: Verify build**

Run: `pnpm build`
Expected: PASS. The `TemplateDiscovery` and `DesignLibrary` components are no longer imported anywhere but still exist on disk — that's fine, unused files don't break builds.

**Step 4: Commit**

```bash
git add app/tools/ecard-studio/page.tsx tools/ecard-studio/card-editor.tsx
git commit -m "feat(ecard-studio): single-page layout replacing discovery/editor split"
```

---

### Task 4: Clean Up Unused Components

**Files:**
- Delete: `tools/ecard-studio/template-discovery.tsx` (no longer imported)
- Delete: `tools/ecard-studio/design-library.tsx` (no longer imported)

**Step 1: Verify nothing imports these files**

Run: `grep -r "template-discovery\|design-library" tools/ecard-studio/ app/tools/ecard-studio/`

Expected: No matches (they were only imported by the old page.tsx and card-editor.tsx).

**Step 2: Delete the files**

```bash
rm tools/ecard-studio/template-discovery.tsx tools/ecard-studio/design-library.tsx
```

**Step 3: Verify build still passes**

Run: `pnpm build`
Expected: PASS

**Step 4: Commit**

```bash
git add -u tools/ecard-studio/template-discovery.tsx tools/ecard-studio/design-library.tsx
git commit -m "refactor(ecard-studio): remove unused TemplateDiscovery and DesignLibrary components"
```

---

### Task 5: Verify with webapp-testing

**Step 1: Use webapp-testing skill to verify**

1. Navigate to `http://localhost:3000/tools/ecard-studio`
2. Verify: Template strip visible at top with 5+ template thumbnails
3. Verify: Edit panel visible on right with Content section (Name, Title, Message, Company, Tagline fields)
4. Type a new name in the Name field → verify live preview updates
5. Click a different template thumbnail → verify all fields reset to that template's defaults
6. Click Download → verify PNG download works
7. Resize to mobile (375px) → verify panel hides, edit button shows in top bar
8. Click edit button on mobile → verify drawer opens with all fields

---

## Dependency Graph

```
Task 1 (content fields) ──┐
Task 2 (template strip)  ──┤── Task 3 (rewrite page + editor) ── Task 4 (cleanup) ── Task 5 (verify)
```

Tasks 1 and 2 are independent. Task 3 depends on both. Task 4 depends on 3. Task 5 depends on 4.

## Summary

| # | Task | Files | Depends On |
|---|---|---|---|
| 1 | Add content fields to CustomizationPanel | `customization-panel.tsx` | — |
| 2 | Create TemplateStrip component | `template-strip.tsx` (new) | — |
| 3 | Rewrite page.tsx + CardEditor to single-page | `page.tsx`, `card-editor.tsx` | 1, 2 |
| 4 | Delete unused TemplateDiscovery + DesignLibrary | delete 2 files | 3 |
| 5 | Verify with webapp-testing | — | 4 |
