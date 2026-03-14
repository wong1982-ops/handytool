# Story Add-Ons Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add post-generation add-on flows for selectively adding illustrations (page-by-page review) and narration (batch) to text-only storybooks.

**Architecture:** Two new views rendered inside `StoryEditor` via a `view` state toggle. The illustration flow collects per-page decisions then batch-submits via existing `/illustrate/batch` route. The narration flow uses voice selection + existing `/narrate/batch` route. All data fetched via existing `useIllustrations()` and `useNarration()` hooks which query `book_pages` table (has UUIDs). No backend changes needed.

**Tech Stack:** React 19, Next.js App Router, TypeScript, Tailwind CSS, existing Supabase hooks

**Spec:** `docs/superpowers/specs/2026-03-14-story-add-ons-design.md`

---

## Chunk 1: Entry Points (Banner + Add-Ons Section)

### Task 1: Add-Ons Banner Component

**Files:**
- Create: `tools/story-studio/add-ons/add-ons-banner.tsx`

- [ ] **Step 1: Create the banner component**

```tsx
// tools/story-studio/add-ons/add-ons-banner.tsx
'use client'

import { useState } from 'react'

interface AddOnsBannerProps {
  bookId: string
  illustrationCount: number
  onAddIllustrations: () => void
}

export function AddOnsBanner({ bookId, illustrationCount, onAddIllustrations }: AddOnsBannerProps) {
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem(`addons-banner-${bookId}`) === '1' } catch { return false }
  })

  if (dismissed || illustrationCount > 0) return null

  const handleDismiss = () => {
    setDismissed(true)
    try { sessionStorage.setItem(`addons-banner-${bookId}`, '1') } catch {}
  }

  return (
    <div className="relative rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 mb-6">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="flex items-center gap-3 pr-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Your story is ready!</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Add illustrations to bring it to life.</p>
        </div>
        <button
          onClick={onAddIllustrations}
          className="flex-shrink-0 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          Add Illustrations
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/add-ons/add-ons-banner.tsx
git commit -m "feat(story-studio): add AddOnsBanner component"
```

### Task 2: Add-Ons Section Component

**Files:**
- Create: `tools/story-studio/add-ons/add-ons-section.tsx`

- [ ] **Step 1: Create the section component with two status cards**

```tsx
// tools/story-studio/add-ons/add-ons-section.tsx
'use client'

interface AddOnsSectionProps {
  illustrationsDone: number
  narratedDone: number
  totalPages: number
  onOpenIllustrations: () => void
  onOpenNarration: () => void
}

function getLabel(done: number, total: number, noun: string): { text: string; button: string } {
  if (done === 0) return { text: `0 of ${total} pages ${noun}`, button: `Add ${noun === 'illustrated' ? 'Illustrations' : 'Narration'}` }
  if (done >= total) return { text: `All ${total} pages ${noun}`, button: 'Review' }
  return { text: `${done} of ${total} pages ${noun}`, button: 'Continue' }
}

export function AddOnsSection({ illustrationsDone, narratedDone, totalPages, onOpenIllustrations, onOpenNarration }: AddOnsSectionProps) {
  const ill = getLabel(illustrationsDone, totalPages, 'illustrated')
  const nar = getLabel(narratedDone, totalPages, 'narrated')

  return (
    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
        Add-ons
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Illustrations card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Illustrations</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{ill.text}</p>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: totalPages > 0 ? `${(illustrationsDone / totalPages) * 100}%` : '0%' }}
            />
          </div>
          <button
            onClick={onOpenIllustrations}
            className="w-full py-2 rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            {ill.button}
          </button>
        </div>

        {/* Narration card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Narration</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{nar.text}</p>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-purple-500 transition-all duration-300"
              style={{ width: totalPages > 0 ? `${(narratedDone / totalPages) * 100}%` : '0%' }}
            />
          </div>
          <button
            onClick={onOpenNarration}
            className="w-full py-2 rounded-lg border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 text-sm font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            {nar.button}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/add-ons/add-ons-section.tsx
git commit -m "feat(story-studio): add AddOnsSection component with illustration/narration status cards"
```

### Task 3: Integrate Entry Points into StoryEditor

**Files:**
- Modify: `tools/story-studio/stories/story-editor.tsx`
- Modify: `app/tools/story-studio/page.tsx` (StoryEditorWrapper — pass bookId through)

The `StoryEditor` needs:
1. A `view` state: `'editor' | 'illustration-review' | 'narration'`
2. Import and use `useIllustrations()` and `useNarration()` to get counts
3. Render `AddOnsBanner` and `AddOnsSection` in editor view
4. Conditionally render add-on flows (placeholder divs for now, implemented in Chunk 2 & 3)

**Important:** `useIllustrations()` and `useNarration()` use `useBookContext()` internally to get the active book ID. Check if `StoryEditor` is wrapped in a `BookContextProvider`. If not, the hooks need the bookId passed differently.

- [ ] **Step 1: Check how useBookContext works and if StoryEditor has access**

Read `tools/story-studio/use-book-context.tsx` to understand the provider. If `StoryEditor` is not wrapped in it, we'll need to either wrap it or create standalone versions of the hooks that accept `bookId` as a parameter.

- [ ] **Step 2: Add view state and entry point rendering to StoryEditor**

Add to `story-editor.tsx`:
- Import `AddOnsBanner`, `AddOnsSection`
- Import `useIllustrations`, `useNarration` (or create inline fetch logic if context isn't available)
- Add `view` state
- Render banner before page content when `view === 'editor'`
- Render add-ons section after page content when `view === 'editor'`
- Conditionally render placeholder for `view === 'illustration-review'` and `view === 'narration'`

Key integration pattern:
```tsx
// At top of StoryEditor
const [view, setView] = useState<'editor' | 'illustration-review' | 'narration'>('editor')

// Fetch illustration/narration counts (lightweight — just need done counts)
const [illustrationsDone, setIllustrationsDone] = useState(0)
const [narratedDone, setNarratedDone] = useState(0)

useEffect(() => {
  // Fetch from /api/v1/story/books/${bookId}/illustrations
  // Count pages where illustration?.status === 'done'
  fetch(`/api/v1/story/books/${bookId}/illustrations`)
    .then(r => r.json())
    .then(({ data }) => {
      const done = (data?.pages ?? []).filter((p: any) => p.illustration?.status === 'done').length
      setIllustrationsDone(done)
    })
    .catch(() => {})
  // Fetch from /api/v1/story/books/${bookId}/audio
  fetch(`/api/v1/story/books/${bookId}/audio`)
    .then(r => r.json())
    .then(({ data }) => {
      const done = (data?.pages ?? []).filter((p: any) => p.audio?.status === 'done').length
      setNarratedDone(done)
    })
    .catch(() => {})
}, [bookId])

// In render:
if (view === 'illustration-review') {
  return <IllustrationReviewFlow bookId={bookId} onBack={() => { setView('editor'); /* refresh counts */ }} onNarration={() => setView('narration')} />
}
if (view === 'narration') {
  return <NarrationFlow bookId={bookId} onBack={() => { setView('editor'); /* refresh counts */ }} />
}

// In editor view, add:
<AddOnsBanner bookId={bookId} illustrationCount={illustrationsDone} onAddIllustrations={() => setView('illustration-review')} />
{/* ... existing editor content ... */}
<AddOnsSection
  illustrationsDone={illustrationsDone}
  narratedDone={narratedDone}
  totalPages={pages.length}
  onOpenIllustrations={() => setView('illustration-review')}
  onOpenNarration={() => setView('narration')}
/>
```

- [ ] **Step 3: Commit**

```bash
git add tools/story-studio/stories/story-editor.tsx tools/story-studio/add-ons/
git commit -m "feat(story-studio): integrate add-ons banner and section into StoryEditor"
```

---

## Chunk 2: Illustration Review Flow

### Task 4: Illustration Review Page Component (Single Page View)

**Files:**
- Create: `tools/story-studio/add-ons/illustration-review-page.tsx`

This is the per-page view showing content left, controls right.

- [ ] **Step 1: Create the component**

Props interface:
```tsx
interface IllustrationReviewPageProps {
  page: {
    id: string
    sequence: number
    narrativeText: string
    sceneDescription: string
    dialogue: { speaker: string; line: string }[] | null
    mood: string | null
    imagePrompt: string | null
    illustration: {
      imageUrl: string | null
      status: 'pending' | 'generating' | 'done' | 'error'
    } | null
  }
  characters: { id: string; name: string; referenceImageUrl?: string }[]
  qualityMode: 'fast' | 'quality'
  decision: 'generate' | 'skip' | 'pending'
  editedPrompt: string
  selectedCharacterIds: string[]
  onPromptChange: (prompt: string) => void
  onCharacterToggle: (id: string) => void
  onGenerate: () => void
  onSkip: () => void
}
```

Layout:
- Desktop: `grid grid-cols-1 md:grid-cols-5 gap-6` (3 cols left, 2 cols right)
- Left panel (`md:col-span-3`): narrative text with serif font, dialogue blocks with speaker labels, mood tag pill
- Right panel (`md:col-span-2`):
  - Existing illustration thumbnail if available (with status overlay for generating/error)
  - Image prompt textarea (controlled via `editedPrompt` prop)
  - Character chips (toggleable)
  - Two buttons: "Generate & Next" (indigo), "Skip" (gray outline)
  - If decision is already 'generate', show green check + "Queued" label instead of buttons
  - If decision is 'skip', show gray "Skipped" label

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/add-ons/illustration-review-page.tsx
git commit -m "feat(story-studio): add IllustrationReviewPage component"
```

### Task 5: Illustration Summary Component

**Files:**
- Create: `tools/story-studio/add-ons/illustration-summary.tsx`

- [ ] **Step 1: Create the summary screen**

Props:
```tsx
interface IllustrationSummaryProps {
  pages: {
    sequence: number
    decision: 'generate' | 'skip'
    imageUrl?: string | null
    status?: 'pending' | 'generating' | 'done' | 'error'
  }[]
  qualityMode: 'fast' | 'quality'
  generating: boolean
  onGenerate: () => void
  onRetryFailed: () => void
  onAddNarration: () => void
  onDone: () => void
}
```

Layout:
- Summary stats: "N pages to illustrate, M skipped"
- Credit cost: `N * CREDIT_COST[qualityMode]` credits
- "Generate All" button (disabled if generating or no pages to generate)
- After generation: thumbnail grid (3-4 cols) showing each page with status:
  - done: green border, thumbnail
  - generating: spinner overlay
  - error: red border, "Retry" button
  - skipped: gray, dashed border
- "Retry Failed" button if any pages have error status
- Narration prompt section: "Add narration too?" with two buttons

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/add-ons/illustration-summary.tsx
git commit -m "feat(story-studio): add IllustrationSummary component"
```

### Task 6: Illustration Review Flow Container

**Files:**
- Create: `tools/story-studio/add-ons/illustration-review-flow.tsx`

This is the main container that orchestrates the page-by-page review.

- [ ] **Step 1: Create the flow container**

Props:
```tsx
interface IllustrationReviewFlowProps {
  bookId: string
  onBack: () => void
  onNarration: () => void
}
```

State:
```tsx
const [currentIndex, setCurrentIndex] = useState(0)
const [showSummary, setShowSummary] = useState(false)
const [decisions, setDecisions] = useState<Map<string, 'generate' | 'skip'>>(new Map())
const [editedPrompts, setEditedPrompts] = useState<Map<string, string>>(new Map())
const [selectedChars, setSelectedChars] = useState<Map<string, string[]>>(new Map())
const [qualityMode, setQualityMode] = useState<'fast' | 'quality'>('quality')
const [generating, setGenerating] = useState(false)
```

Data fetching:
- Fetch pages from `GET /api/v1/story/books/${bookId}/illustrations` on mount
- Fetch approved characters from `GET /api/v1/story/characters` (filter status=approved)
- Poll illustrations every 5s ONLY after batch submission (not during review)

Key logic:
- `handleGenerate()`: sets decision for current page to 'generate', stores edited prompt, advances to next page. On last page, shows summary.
- `handleSkip()`: sets decision to 'skip', advances.
- `handleBatchSubmit()`: collects all 'generate' decisions into array, chunks into batches of 20, calls `POST /books/${bookId}/illustrate/batch` for each chunk sequentially. Sets `generating=true`, starts polling.
- Navigation: prev/next move `currentIndex`. Progress dots show decision status per page.

Top bar:
- Back arrow + "Add Illustrations — Page {n} of {total}"
- Quality toggle (fast/quality) — applies to whole batch
- Credit running total: count of 'generate' decisions * cost

Render:
- `showSummary === false`: render `IllustrationReviewPage` for current page
- `showSummary === true`: render `IllustrationSummary`

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/add-ons/illustration-review-flow.tsx
git commit -m "feat(story-studio): add IllustrationReviewFlow container"
```

### Task 7: Wire Illustration Flow into StoryEditor

**Files:**
- Modify: `tools/story-studio/stories/story-editor.tsx`

- [ ] **Step 1: Import and render IllustrationReviewFlow**

Replace the placeholder div for `view === 'illustration-review'` with:
```tsx
import { IllustrationReviewFlow } from '@/tools/story-studio/add-ons/illustration-review-flow'

// In render:
if (view === 'illustration-review') {
  return (
    <IllustrationReviewFlow
      bookId={bookId}
      onBack={() => { setView('editor'); refreshCounts() }}
      onNarration={() => setView('narration')}
    />
  )
}
```

Add `refreshCounts()` function that re-fetches illustration/narration counts.

- [ ] **Step 2: Verify the flow end-to-end in dev**

Run: `pnpm dev`
Navigate to story editor for a text-only book. Verify:
- Banner appears
- Click "Add Illustrations" → review flow opens
- Can navigate pages, edit prompts, click Generate & Next / Skip
- Summary shows at the end
- Back returns to editor

- [ ] **Step 3: Commit**

```bash
git add tools/story-studio/stories/story-editor.tsx
git commit -m "feat(story-studio): wire illustration review flow into editor"
```

---

## Chunk 3: Narration Flow

### Task 8: Narration Flow Component

**Files:**
- Create: `tools/story-studio/add-ons/narration-flow.tsx`

- [ ] **Step 1: Create the narration flow**

Props:
```tsx
interface NarrationFlowProps {
  bookId: string
  onBack: () => void
}
```

Sections:
1. **Top bar:** Back arrow + "Add Narration"
2. **Voice selection:**
   - Narrator voice: reuse `NarratorVoiceSelector` component for main narrator voice
   - Character voices: extract unique speakers from all page dialogues. For each speaker, render a row with the speaker name + a small `VoicePicker` dropdown. Store in `voiceMap: Record<string, string>`.
3. **Page list:** Scrollable list of pages with:
   - Checkbox (checked by default)
   - Page number
   - Narrative text preview (truncated to ~80 chars)
   - Speaker names from dialogue
   - Status badge if audio already exists
4. **Bottom bar:**
   - Credit summary: `selectedCount * 3 credits`
   - "Generate All" button

State:
```tsx
const [narratorVoice, setNarratorVoice] = useState('Kore')
const [voiceMap, setVoiceMap] = useState<Record<string, string>>({})
const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set())
const [generating, setGenerating] = useState(false)
```

Data fetching:
- Fetch pages from `GET /api/v1/story/books/${bookId}/audio` on mount
- Initialize `selectedPageIds` with all page IDs where audio status !== 'done'
- Extract unique speakers from all dialogues for voice mapping

Generation:
- On "Generate All": chunk selectedPageIds into batches of 20
- Call `POST /books/${bookId}/narrate/batch` for each chunk with `{ pageIds, narratorVoice, voiceMap }`
- Set `generating=true`, poll `/audio` endpoint every 5s
- Update page list in-place with status badges and inline audio players as they complete

Completion:
- When all selected pages have status 'done' or 'error', show "All done!" with [Back to Editor]
- "Retry Failed" button if any errors

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/add-ons/narration-flow.tsx
git commit -m "feat(story-studio): add NarrationFlow component"
```

### Task 9: Wire Narration Flow into StoryEditor

**Files:**
- Modify: `tools/story-studio/stories/story-editor.tsx`

- [ ] **Step 1: Import and render NarrationFlow**

Replace the placeholder for `view === 'narration'` with:
```tsx
import { NarrationFlow } from '@/tools/story-studio/add-ons/narration-flow'

if (view === 'narration') {
  return (
    <NarrationFlow
      bookId={bookId}
      onBack={() => { setView('editor'); refreshCounts() }}
    />
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/stories/story-editor.tsx
git commit -m "feat(story-studio): wire narration flow into editor"
```

---

## Chunk 4: Polish & Verification

### Task 10: Type Check and Fix

- [ ] **Step 1: Run type check**

```bash
npx tsc --noEmit 2>&1 | grep -v "credits/history\|sitemap.ts"
```

Fix any new type errors.

- [ ] **Step 2: Commit fixes if needed**

### Task 11: End-to-End Verification

- [ ] **Step 1: Test the full flow**

1. Create a text-only story (skip illustrations + narration)
2. Open the book in the editor
3. Verify banner shows → click "Add Illustrations"
4. Walk through pages: generate some, skip some
5. Verify summary shows correct counts
6. Click "Generate All" → verify batch API called
7. Click "Add Narration?" → verify narration flow opens
8. Select voice, generate batch
9. Go back to editor → verify counts updated
10. Verify add-ons section shows correct progress

- [ ] **Step 2: Final commit**

```bash
git add -A
git commit -m "feat(story-studio): complete add-ons flow for illustrations and narration"
```
