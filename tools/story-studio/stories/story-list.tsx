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
