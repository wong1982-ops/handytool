# Story Studio Stories Module Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Stories tab from a monolithic creation-only page into a list + create/edit flow where users see all their stories, create new ones (AI-generated or from scratch), and edit existing drafts.

**Architecture:** The current main page (`page.tsx`) combines sidebar navigation, bookshelf view, and creation flow in one 814-line file. This plan splits it into: (1) a Stories list view (merging bookshelf functionality), (2) a creation flow (AI generate or write from scratch), and (3) a story editor. The existing `useStoryBook` hook and generation pipeline remain unchanged — only the UI layer is restructured.

**Tech Stack:** React 19, Next.js App Router, TypeScript, Tailwind CSS, existing Supabase RPCs + generation pipeline

**Design doc:** `docs/plans/2026-03-13-story-studio-modular-redesign.md` — Tab 1: Stories

**Depends on:** Plan 2 (Shell Layout) — Stories tab route and `StudioShell` wrapper must exist.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `tools/story-studio/stories/story-list.tsx` | Create | Grid/list of user's stories with search, filters, quick actions |
| `tools/story-studio/stories/story-card.tsx` | Create | Individual story card in the grid (cover, title, status, actions) |
| `tools/story-studio/stories/create-story-modal.tsx` | Create | Modal for choosing creation path: "Generate with AI" or "Write from scratch" |
| `tools/story-studio/stories/story-editor.tsx` | Create | Per-page story editor with scene description, narrative, dialogue, image prompt |
| `tools/story-studio/stories/page-strip.tsx` | Create | Horizontal page navigator strip for quick page jumping |
| `tools/story-studio/stories/ai-help-menu.tsx` | Create | AI assistance dropdown (rewrite, expand, shorten, fix grammar, suggest dialogue) |
| `tools/story-studio/use-stories-list.ts` | Create | Hook for fetching, filtering, sorting user's stories |
| `app/tools/story-studio/page.tsx` | Modify | Becomes Stories tab — renders StoryList + creation flow |
| `app/api/v1/story/books/[id]/pages/route.ts` | Create | GET pages for a book (from book_pages table) |
| `app/api/v1/story/books/[id]/pages/[sequence]/route.ts` | Create | PATCH single page content |

---

## Chunk 1: Stories List & Data Layer

### Task 1: Create useStoriesList hook

**Files:**
- Create: `tools/story-studio/use-stories-list.ts`

- [ ] **Step 1: Create the hook file**

```ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'

export interface StoryItem {
  id: string
  slug: string
  title: string
  coverImageUrl: string | null
  pageCount: number
  isPublic: boolean
  status: 'draft' | 'complete'
  seriesId: string | null
  seriesTitle: string | null
  audience: string | null
  style: string | null
  createdAt: string
  updatedAt: string
}

export type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'updated'

export function useStoriesList() {
  const { user } = useAuth()
  const [stories, setStories] = useState<StoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [filterSeries, setFilterSeries] = useState<string | null>(null)

  const fetchStories = useCallback(async () => {
    if (!user) { setLoading(false); return }
    try {
      setLoading(true)
      const res = await fetch('/api/v1/story/books')
      if (!res.ok) throw new Error('Failed to load stories')
      const { data } = await res.json()
      setStories(data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchStories() }, [fetchStories])

  const deleteStory = useCallback(async (id: string) => {
    const res = await fetch(`/api/v1/story/books/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete')
    setStories(prev => prev.filter(s => s.id !== id))
  }, [])

  const toggleShare = useCallback(async (id: string, isPublic: boolean) => {
    const res = await fetch('/api/v1/story/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId: id, isPublic }),
    })
    if (!res.ok) throw new Error('Failed to update sharing')
    setStories(prev => prev.map(s => s.id === id ? { ...s, isPublic } : s))
  }, [])

  // Client-side filtering & sorting
  const filtered = stories
    .filter(s => {
      if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false
      if (filterSeries && s.seriesId !== filterSeries) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'alphabetical': return a.title.localeCompare(b.title)
        case 'updated': return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
        default: return 0
      }
    })

  return {
    stories: filtered,
    allStories: stories,
    loading, error,
    search, setSearch,
    sortBy, setSortBy,
    filterSeries, setFilterSeries,
    deleteStory, toggleShare,
    refresh: fetchStories,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/use-stories-list.ts
git commit -m "feat(story-studio): add useStoriesList hook with search, sort, and filter"
```

---

### Task 2: Create StoryCard component

**Files:**
- Create: `tools/story-studio/stories/story-card.tsx`

- [ ] **Step 1: Create the story card component**

```tsx
'use client'

import Link from 'next/link'
import type { StoryItem } from '@/tools/story-studio/use-stories-list'

interface StoryCardProps {
  story: StoryItem
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onToggleShare: (id: string, isPublic: boolean) => void
}

export function StoryCard({ story, onEdit, onDelete, onToggleShare }: StoryCardProps) {
  const dateStr = new Date(story.createdAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow">
      {/* Cover image */}
      <Link href={`/tools/story-studio/book/${story.slug}`} className="block">
        <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 overflow-hidden">
          {story.coverImageUrl ? (
            <img
              src={story.coverImageUrl}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-medium text-sm text-slate-900 dark:text-white truncate">{story.title}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {story.pageCount} pages &middot; {dateStr}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {/* Status badge */}
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
              story.status === 'complete'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
            }`}>
              {story.status === 'complete' ? 'Complete' : 'Draft'}
            </span>
          </div>
        </div>

        {story.seriesTitle && (
          <p className="text-[11px] text-indigo-500 dark:text-indigo-400 mt-1 truncate">{story.seriesTitle}</p>
        )}

        {/* Quick actions */}
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => onEdit(story.id)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium
              text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg
              transition-colors cursor-pointer"
            style={{ minHeight: '36px' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => onToggleShare(story.id, !story.isPublic)}
            className="flex items-center justify-center w-8 h-8 text-slate-400 hover:text-indigo-500
              rounded-lg transition-colors cursor-pointer"
            aria-label={story.isPublic ? 'Make private' : 'Make public'}
            title={story.isPublic ? 'Public — click to make private' : 'Private — click to share'}
          >
            {story.isPublic ? (
              <svg className="w-3.5 h-3.5 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            )}
          </button>
          <button
            onClick={() => onDelete(story.id)}
            className="flex items-center justify-center w-8 h-8 text-slate-400 hover:text-red-500
              rounded-lg transition-colors cursor-pointer"
            aria-label="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/stories/story-card.tsx
git commit -m "feat(story-studio): add StoryCard component"
```

---

### Task 3: Create StoryList component

**Files:**
- Create: `tools/story-studio/stories/story-list.tsx`

- [ ] **Step 1: Create the story list component**

```tsx
'use client'

import { useState } from 'react'
import { StoryCard } from '@/tools/story-studio/stories/story-card'
import type { StoryItem, SortOption } from '@/tools/story-studio/use-stories-list'
import { useSeriesList } from '@/tools/story-studio/use-series'

interface StoryListProps {
  stories: StoryItem[]
  loading: boolean
  search: string
  onSearchChange: (v: string) => void
  sortBy: SortOption
  onSortChange: (v: SortOption) => void
  filterSeries: string | null
  onFilterSeriesChange: (v: string | null) => void
  onCreateNew: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onToggleShare: (id: string, isPublic: boolean) => void
}

export function StoryList({
  stories, loading, search, onSearchChange, sortBy, onSortChange,
  filterSeries, onFilterSeriesChange, onCreateNew,
  onEdit, onDelete, onToggleShare,
}: StoryListProps) {
  const { series } = useSeriesList()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  return (
    <div>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">My Stories</h2>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white
            bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Story
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search stories..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
              bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => onSortChange(e.target.value as SortOption)}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="updated">Recently updated</option>
          <option value="alphabetical">A → Z</option>
        </select>

        {/* Series filter */}
        {series.length > 0 && (
          <select
            value={filterSeries ?? ''}
            onChange={e => onFilterSeriesChange(e.target.value || null)}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
              bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All series</option>
            {series.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/5] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          <p className="text-slate-500 dark:text-slate-400">
            {search ? 'No stories match your search.' : 'No stories yet. Create your first story!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {stories.map(story => (
            <StoryCard
              key={story.id}
              story={story}
              onEdit={onEdit}
              onDelete={(id) => setDeleteConfirm(id)}
              onToggleShare={onToggleShare}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Delete Story?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              This will permanently delete the story and all its pages, illustrations, and narration. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { onDelete(deleteConfirm); setDeleteConfirm(null) }}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/stories/story-list.tsx
git commit -m "feat(story-studio): add StoryList component with search, sort, filter"
```

---

## Chunk 2: Creation Flow

### Task 4: Create the "New Story" modal

**Files:**
- Create: `tools/story-studio/stories/create-story-modal.tsx`

This modal presents two creation paths: "Generate with AI" and "Write from scratch".

- [ ] **Step 1: Create the modal component**

```tsx
'use client'

interface CreateStoryModalProps {
  open: boolean
  onClose: () => void
  onGenerateWithAI: () => void
  onWriteFromScratch: () => void
}

export function CreateStoryModal({ open, onClose, onGenerateWithAI, onWriteFromScratch }: CreateStoryModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md mx-4 shadow-xl w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create a New Story</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full
              text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {/* Generate with AI */}
          <button
            onClick={onGenerateWithAI}
            className="w-full text-left p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700
              hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors cursor-pointer group"
            style={{ minHeight: '44px' }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30
                flex items-center justify-center shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50">
                <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-sm text-slate-900 dark:text-white">Generate with AI</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Describe your plot and AI generates a full story draft with scenes, dialogue, and image prompts.
                </p>
                <p className="text-xs text-indigo-500 mt-1.5">10 credits</p>
              </div>
            </div>
          </button>

          {/* Write from scratch */}
          <button
            onClick={onWriteFromScratch}
            className="w-full text-left p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700
              hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors cursor-pointer group"
            style={{ minHeight: '44px' }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-700
                flex items-center justify-center shrink-0 group-hover:bg-slate-100 dark:group-hover:bg-slate-600">
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-sm text-slate-900 dark:text-white">Write from scratch</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Start with a blank story. Add pages and write your own scenes, dialogue, and prompts.
                </p>
                <p className="text-xs text-green-500 mt-1.5">Free</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/stories/create-story-modal.tsx
git commit -m "feat(story-studio): add CreateStoryModal with AI and manual paths"
```

---

### Task 5: Create PageStrip navigation

**Files:**
- Create: `tools/story-studio/stories/page-strip.tsx`

- [ ] **Step 1: Create the page strip component**

```tsx
'use client'

interface PageStripProps {
  totalPages: number
  activePage: number
  onSelectPage: (page: number) => void
  onAddPage: () => void
}

export function PageStrip({ totalPages, activePage, onSelectPage, onAddPage }: PageStripProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2
      [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {Array.from({ length: totalPages }).map((_, i) => {
        const page = i + 1
        const isActive = page === activePage
        return (
          <button
            key={page}
            onClick={() => onSelectPage(page)}
            className={`shrink-0 w-9 h-9 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isActive
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {page}
          </button>
        )
      })}
      <button
        onClick={onAddPage}
        className="shrink-0 w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800/50
          text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-700
          transition-colors cursor-pointer flex items-center justify-center"
        title="Add page (2 credits)"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/stories/page-strip.tsx
git commit -m "feat(story-studio): add PageStrip navigation component"
```

---

### Task 6: Create AI Help menu

**Files:**
- Create: `tools/story-studio/stories/ai-help-menu.tsx`

- [ ] **Step 1: Create the AI help dropdown**

```tsx
'use client'

import { useState } from 'react'

export type AIAction = 'rewrite' | 'expand' | 'shorten' | 'fix_grammar' | 'suggest_dialogue'

interface AIHelpMenuProps {
  onAction: (action: AIAction) => void
  loading?: boolean
}

const AI_ACTIONS: { action: AIAction; label: string; icon: string }[] = [
  { action: 'rewrite', label: 'Rewrite', icon: '🔄' },
  { action: 'expand', label: 'Expand', icon: '📝' },
  { action: 'shorten', label: 'Shorten', icon: '✂️' },
  { action: 'fix_grammar', label: 'Fix grammar', icon: '📋' },
  { action: 'suggest_dialogue', label: 'Suggest dialogue', icon: '💬' },
]

export function AIHelpMenu({ onAction, loading }: AIHelpMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
          text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20
          hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg
          transition-colors cursor-pointer disabled:opacity-50"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
        {loading ? 'Working...' : 'AI Help'}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && !loading && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white dark:bg-slate-800
          shadow-xl border border-slate-200 dark:border-slate-700 z-30 py-1">
          {AI_ACTIONS.map(({ action, label, icon }) => (
            <button
              key={action}
              onClick={() => { onAction(action); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300
                hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
              style={{ minHeight: '36px' }}
            >
              <span className="mr-2">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/stories/ai-help-menu.tsx
git commit -m "feat(story-studio): add AI Help dropdown menu for story editing"
```

---

## Chunk 3: Main Page & Story Editor

### Task 7: Create StoryEditor component

**Files:**
- Create: `tools/story-studio/stories/story-editor.tsx`

This is the per-page editor with scene description, narrative text, dialogue, and image prompt fields. It uses the PageStrip for navigation and AIHelpMenu for per-field assistance.

- [ ] **Step 1: Create the story editor component**

```tsx
'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { PageStrip } from '@/tools/story-studio/stories/page-strip'
import { AIHelpMenu, type AIAction } from '@/tools/story-studio/stories/ai-help-menu'

interface PageData {
  sequence: number
  sceneDescription: string
  narrativeText: string
  dialogue: { speaker: string; line: string }[]
  mood: string
  imagePrompt: string
}

interface StoryEditorProps {
  bookId: string
  title: string
  pages: PageData[]
  onSave: (pages: PageData[]) => Promise<void>
  onBack: () => void
}

export function StoryEditor({ bookId, title, pages: initialPages, onSave, onBack }: StoryEditorProps) {
  const [pages, setPages] = useState<PageData[]>(initialPages)
  const [activePage, setActivePage] = useState(1)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [dirty, setDirty] = useState(false)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentPage = pages.find(p => p.sequence === activePage) ?? pages[0]

  // Auto-save (debounced 3s)
  useEffect(() => {
    if (!dirty) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(async () => {
      setSaving(true)
      try { await onSave(pages) } catch { /* silent */ }
      finally { setSaving(false); setDirty(false) }
    }, 3000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [dirty, pages, onSave])

  const updateCurrentPage = useCallback((updates: Partial<PageData>) => {
    setPages(prev => prev.map(p =>
      p.sequence === activePage ? { ...p, ...updates } : p
    ))
    setDirty(true)
  }, [activePage])

  const addPage = useCallback(() => {
    const newSeq = pages.length + 1
    setPages(prev => [...prev, {
      sequence: newSeq,
      sceneDescription: '',
      narrativeText: '',
      dialogue: [],
      mood: '',
      imagePrompt: '',
    }])
    setActivePage(newSeq)
    setDirty(true)
  }, [pages.length])

  const handleAIAction = useCallback(async (action: AIAction) => {
    if (!currentPage.narrativeText.trim()) return
    setAiLoading(true)
    try {
      const res = await fetch(`/api/v1/story/books/${bookId}/ai-help`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          text: currentPage.narrativeText,
          pageSequence: activePage,
        }),
      })
      if (!res.ok) throw new Error('AI action failed')
      const { data } = await res.json()
      if (data.text) updateCurrentPage({ narrativeText: data.text })
      if (data.dialogue) updateCurrentPage({ dialogue: data.dialogue })
    } catch { /* show error toast */ }
    finally { setAiLoading(false) }
  }, [bookId, activePage, currentPage, updateCurrentPage])

  const handleManualSave = useCallback(async () => {
    setSaving(true)
    try { await onSave(pages) } catch { /* show error */ }
    finally { setSaving(false); setDirty(false) }
  }, [pages, onSave])

  const addDialogueLine = useCallback(() => {
    updateCurrentPage({
      dialogue: [...(currentPage?.dialogue ?? []), { speaker: '', line: '' }],
    })
  }, [currentPage, updateCurrentPage])

  const updateDialogueLine = useCallback((index: number, field: 'speaker' | 'line', value: string) => {
    const newDialogue = [...(currentPage?.dialogue ?? [])]
    newDialogue[index] = { ...newDialogue[index], [field]: value }
    updateCurrentPage({ dialogue: newDialogue })
  }, [currentPage, updateCurrentPage])

  const removeDialogueLine = useCallback((index: number) => {
    updateCurrentPage({
      dialogue: (currentPage?.dialogue ?? []).filter((_, i) => i !== index),
    })
  }, [currentPage, updateCurrentPage])

  if (!currentPage) return null

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full
              hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white truncate">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <span className="text-xs text-slate-400">
              {saving ? 'Saving...' : 'Unsaved changes'}
            </span>
          )}
          <button
            onClick={handleManualSave}
            disabled={!dirty || saving}
            className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
              disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
            style={{ minHeight: '36px' }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Page strip */}
      <PageStrip
        totalPages={pages.length}
        activePage={activePage}
        onSelectPage={setActivePage}
        onAddPage={addPage}
      />

      {/* Page editor */}
      <div className="mt-4 space-y-4">
        {/* Scene description */}
        <div>
          <label className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Scene Description</span>
          </label>
          <textarea
            value={currentPage.sceneDescription}
            onChange={e => updateCurrentPage({ sceneDescription: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
              bg-white dark:bg-slate-800 text-sm resize-none
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe what happens in this scene..."
          />
        </div>

        {/* Narrative text */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Narrative Text</label>
            <AIHelpMenu onAction={handleAIAction} loading={aiLoading} />
          </div>
          <textarea
            value={currentPage.narrativeText}
            onChange={e => updateCurrentPage({ narrativeText: e.target.value })}
            rows={5}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
              bg-white dark:bg-slate-800 text-sm resize-y
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Write the story text for this page..."
          />
        </div>

        {/* Dialogue */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Dialogue</label>
            <button
              onClick={addDialogueLine}
              className="text-xs text-indigo-500 hover:text-indigo-700 cursor-pointer"
            >
              + Add line
            </button>
          </div>
          <div className="space-y-2">
            {(currentPage.dialogue ?? []).map((d, i) => (
              <div key={i} className="flex items-start gap-2">
                <input
                  type="text"
                  value={d.speaker}
                  onChange={e => updateDialogueLine(i, 'speaker', e.target.value)}
                  placeholder="Speaker"
                  className="w-28 shrink-0 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600
                    bg-white dark:bg-slate-800 text-sm
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={d.line}
                  onChange={e => updateDialogueLine(i, 'line', e.target.value)}
                  placeholder="What they say..."
                  className="flex-1 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600
                    bg-white dark:bg-slate-800 text-sm
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => removeDialogueLine(i)}
                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-500 cursor-pointer shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Mood + Image prompt (inline) */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mood</label>
            <input
              type="text"
              value={currentPage.mood}
              onChange={e => updateCurrentPage({ mood: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                bg-white dark:bg-slate-800 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. cheerful, mysterious, tense"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image Prompt</label>
            <input
              type="text"
              value={currentPage.imagePrompt}
              onChange={e => updateCurrentPage({ imagePrompt: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                bg-white dark:bg-slate-800 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Auto-generated from scene (editable)"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/stories/story-editor.tsx
git commit -m "feat(story-studio): add StoryEditor component with per-page editing and AI help"
```

---

### Task 8: Rewrite the main Stories tab page

**Files:**
- Modify: `app/tools/story-studio/page.tsx`

This is the biggest change. The current 814-line page is replaced with a clean Stories tab that shows either: (1) the story list, (2) the AI creation flow, or (3) the story editor.

- [ ] **Step 1: Rewrite page.tsx**

Replace the entire content of `app/tools/story-studio/page.tsx` with:

```tsx
'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { useStoriesList } from '@/tools/story-studio/use-stories-list'
import { useStoryBook } from '@/tools/story-studio/use-story-book'
import { useJobProgress } from '@/tools/story-studio/use-job-progress'
import { StoryList } from '@/tools/story-studio/stories/story-list'
import { CreateStoryModal } from '@/tools/story-studio/stories/create-story-modal'
import { StoryEditor } from '@/tools/story-studio/stories/story-editor'
import { PlotInput } from '@/tools/story-studio/plot-input'
import { RefinementChat } from '@/tools/story-studio/refinement-chat'
import { GenerationProgress } from '@/tools/story-studio/generation-progress'
import { InProgressSection } from '@/tools/story-studio/job-card'
import { signInWithOAuth } from '@/lib/supabase/auth'
import type { StoryConcept } from '@/tools/story-studio/types'

type View = 'list' | 'create-ai' | 'editor'

export default function StoriesPage() {
  return (
    <Suspense>
      <StoriesContent />
    </Suspense>
  )
}

function StoriesContent() {
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const urlSeriesId = searchParams.get('seriesId')

  // Stories list
  const storiesList = useStoriesList()

  // AI creation flow (reuses existing hook)
  const storyBook = useStoryBook()

  // Job progress
  const { jobs: activeJobs, retryJob } = useJobProgress(user?.id)

  // View state
  const [view, setView] = useState<View>('list')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBookId, setEditingBookId] = useState<string | null>(null)

  // Handlers
  const handleCreateAI = useCallback(() => {
    setShowCreateModal(false)
    storyBook.reset()
    if (urlSeriesId) storyBook.setSeriesId(urlSeriesId)
    setView('create-ai')
  }, [storyBook, urlSeriesId])

  const handleWriteFromScratch = useCallback(async () => {
    setShowCreateModal(false)
    // Create a blank book via API, then open editor
    try {
      const res = await fetch('/api/v1/story/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Story',
          status: 'draft',
          seriesId: urlSeriesId || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to create')
      const { data } = await res.json()
      setEditingBookId(data.id)
      setView('editor')
      storiesList.refresh()
    } catch {
      // show error
    }
  }, [urlSeriesId, storiesList])

  const handleEdit = useCallback((id: string) => {
    setEditingBookId(id)
    setView('editor')
  }, [])

  const handleBackToList = useCallback(() => {
    setView('list')
    setEditingBookId(null)
    storyBook.reset()
    storiesList.refresh()
  }, [storyBook, storiesList])

  // Auth gate
  if (!authLoading && !user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Sign in to create stories</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">Your magical stories await.</p>
        <button
          onClick={() => signInWithOAuth('google')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  // AI Creation flow
  if (view === 'create-ai') {
    const { phase, plot, selectedConcept, book, progressEvents, loading, error,
      creditsUsed, seriesId, activeJobId, fetchConcepts, startGeneration,
      setPhase, setSelectedConcept, setError, setErrorCode, updateBook, updatePage,
      editorOpen, setEditorOpen } = storyBook

    // If generation is complete, go back to list
    if (phase === 'viewer' && book?.status === 'complete') {
      // Add to bookshelf and return to list
      handleBackToList()
      return null
    }

    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBackToList}
            className="w-9 h-9 flex items-center justify-center rounded-full
              hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Back to stories"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Generate with AI</h2>
        </div>

        {phase === 'input' && (
          <PlotInput
            onSubmit={fetchConcepts}
            loading={loading}
            initialPlot={plot}
          />
          {/* Show error from useStoryBook if present */}
          {error && (
            <div className="mt-3 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
        )}
        {phase === 'refine' && selectedConcept && (
          <RefinementChat
            concept={selectedConcept}
            onConceptUpdate={setSelectedConcept}
            onGenerate={(concept, options) => startGeneration(plot, concept, options)}
            onBack={() => setPhase('input')}
            loading={loading}
          />
        )}
        {phase === 'generating' && (
          <GenerationProgress
            events={progressEvents}
            totalPages={storyBook.book?.pages?.length ?? null}
            activeJobId={activeJobId}
          />
        )}
      </div>
    )
  }

  // Story editor
  if (view === 'editor' && editingBookId) {
    return (
      <StoryEditorWrapper
        bookId={editingBookId}
        onBack={handleBackToList}
      />
    )
  }

  // Default: Story list
  return (
    <div>
      {/* In-progress jobs */}
      {activeJobs.length > 0 && (
        <div className="mb-6">
          <InProgressSection jobs={activeJobs} onRetry={retryJob} />
        </div>
      )}

      <StoryList
        stories={storiesList.stories}
        loading={storiesList.loading}
        search={storiesList.search}
        onSearchChange={storiesList.setSearch}
        sortBy={storiesList.sortBy}
        onSortChange={storiesList.setSortBy}
        filterSeries={storiesList.filterSeries}
        onFilterSeriesChange={storiesList.setFilterSeries}
        onCreateNew={() => setShowCreateModal(true)}
        onEdit={handleEdit}
        onDelete={storiesList.deleteStory}
        onToggleShare={storiesList.toggleShare}
      />

      <CreateStoryModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGenerateWithAI={handleCreateAI}
        onWriteFromScratch={handleWriteFromScratch}
      />
    </div>
  )
}

/**
 * Wrapper that fetches book data and renders StoryEditor.
 * Separated to avoid fetching when editor is not shown.
 */
interface PageData {
  sequence: number
  sceneDescription: string
  narrativeText: string
  dialogue: { speaker: string; line: string }[]
  mood: string
  imagePrompt: string
}

function StoryEditorWrapper({ bookId, onBack }: { bookId: string; onBack: () => void }) {
  const [bookData, setBookData] = useState<{ title: string; pages: PageData[] } | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch book data on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/v1/story/books/${bookId}`)
        if (!res.ok) throw new Error('Not found')
        const { data } = await res.json()
        if (cancelled) return
        setBookData({
          title: data.title,
          pages: (data.pages ?? []).map((p: Record<string, unknown>) => ({
            sequence: p.sequence as number,
            sceneDescription: (p.sceneDescription as string) || '',
            narrativeText: (p.narrativeText as string) || '',
            dialogue: (p.dialogue as { speaker: string; line: string }[]) || [],
            mood: (p.mood as string) || '',
            imagePrompt: (p.imagePrompt as string) || '',
          })),
        })
      } catch {
        // show error
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [bookId])

  if (loading || !bookData) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    )
  }

  async function handleSave(pages: PageData[]) {
    // Save each page individually via the per-page PATCH route
    // (existing PATCH /api/v1/story/books/{id} only accepts single-page updates)
    await Promise.all(pages.map(page =>
      fetch(`/api/v1/story/books/${bookId}/pages/${page.sequence}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          narrativeText: page.narrativeText,
          sceneDescription: page.sceneDescription,
          dialogue: page.dialogue,
          mood: page.mood,
          imagePrompt: page.imagePrompt,
        }),
      })
    ))
  }

  return (
    <StoryEditor
      bookId={bookId}
      title={bookData.title}
      pages={bookData.pages}
      onSave={handleSave}
      onBack={onBack}
    />
  )
}
```

**Important implementation notes:**
- The existing `PlotInput`, `RefinementChat`, `GenerationProgress` components are reused with their actual prop interfaces (verified and corrected above)
- `RefinementChat.onGenerate` takes `(concept, options)` — the plan wraps it as `(concept, options) => startGeneration(plot, concept, options)` to bridge the signature gap with `useStoryBook.startGeneration(plotText, concept, options)`
- The existing `useStoryBook` hook is reused for the AI generation flow
- The `InProgressSection` (job cards) is reused for showing active background jobs

- [ ] **Step 2: Remove unused imports from old page**

After rewriting, verify no old imports remain (e.g., `ToolBreadcrumb`, `BookViewer`, `BookEditor`, `useBookshelf` if no longer used, sidebar-related state).

- [ ] **Step 3: Verify the page compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | grep "story-studio/page" | head -20`
Expected: No errors in the main page

- [ ] **Step 4: Commit**

```bash
git add app/tools/story-studio/page.tsx
git commit -m "feat(story-studio): rewrite Stories tab with list view, AI creation, and editor"
```

---

### Task 9: End-to-end verification

- [ ] **Step 1: Run the dev server**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm dev`

- [ ] **Step 2: Verify Stories list view**

1. Navigate to `/tools/story-studio`
2. Auth gate shows for unauthenticated users
3. After sign in, story grid shows existing books
4. Search filters by title
5. Sort dropdown works (newest, oldest, alphabetical, updated)
6. Series filter narrows results
7. Story cards show cover, title, page count, status, series tag
8. Edit button opens editor, Delete shows confirmation, Share toggles

- [ ] **Step 3: Verify AI creation flow**

1. Click "New Story" → modal shows two paths
2. Click "Generate with AI" → PlotInput appears with back button
3. Enter plot → concepts load → refinement chat works
4. Generate → progress tracking shows → back to list on completion

- [ ] **Step 4: Verify "Write from scratch" flow**

1. Click "New Story" → "Write from scratch"
2. Blank story created, editor opens
3. Page strip shows page 1
4. Can type in scene description, narrative, dialogue fields
5. Add dialogue line works, remove works
6. Add page via + button
7. Auto-save triggers after 3s of inactivity
8. Manual save button works
9. Back button returns to list, new story visible

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(story-studio): complete Stories module with list, AI generation, and editor"
```

---

## Prerequisites & Dependencies

- **Plan 2 required**: `StudioShell` layout wrapping the Stories tab at `/tools/story-studio`
- **Existing hooks reused**: `useStoryBook` (AI generation), `useJobProgress` (background jobs), `useSeriesList` (series filter)
- **Existing components reused**: `PlotInput`, `RefinementChat`, `GenerationProgress`, `InProgressSection` — check their `Props` interfaces carefully before implementation. The plan's prop usage has been corrected to match the actual component signatures:
  - `PlotInput`: accepts `onSubmit`, `loading`, `initialPlot` only (no `error` or `seriesId`)
  - `RefinementChat`: requires `onConceptUpdate` prop; `onGenerate` takes `(concept, options)` — must wrap `startGeneration(plot, concept, options)`
  - `GenerationProgress`: requires `totalPages` and optional `activeJobId` — no `onCancel` prop
- **API endpoints (existing)**: `GET /api/v1/story/books`, `DELETE /api/v1/story/books/{id}`, `POST /api/v1/story/share`. Note: the GET books response must be updated to include the `status` column added by Plan 1's migration — currently it may not return this field. The `useStoriesList` hook expects `status: 'draft' | 'complete'`.
- **New API endpoint needed**: `POST /api/v1/story/books` for creating blank books (write-from-scratch path). Currently only GET exists. Must add a POST handler that creates a book with `status: 'draft'` and one blank page in `book_pages`.
- **New API endpoint needed**: `PATCH /api/v1/story/books/{id}/pages/{sequence}` for per-page updates. Created in Tasks 5-6 of this plan.
- **AI Help API**: `POST /api/v1/story/books/{id}/ai-help` — new endpoint for rewrite/expand/shorten/grammar/dialogue actions. Can be deferred to a follow-up. The `AIHelpMenu` component should show a "coming soon" indicator if the endpoint doesn't exist yet.

## Notes for Subsequent Plans

- **Plan 5 (Media)** will use `useBookContext` from Plan 2 to know which book is selected, then load its pages for illustration/narration
- The old `/bookshelf` page can be deprecated once Stories tab is verified — add a redirect or remove the route
- The old `useBookshelf` hook can be deprecated in favor of `useStoriesList`
- The `BookViewer` and `BookEditor` components from the old page may still be useful for the book reader at `/book/[slug]` — don't delete them
