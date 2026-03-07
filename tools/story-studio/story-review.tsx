'use client'

import type { StoryBook, Character, Page } from './types'
import { CREDIT_COSTS } from './types'
import CharacterCard from './character-card'
import PageCard from './page-card'

interface StoryReviewProps {
  book: StoryBook
  onUpdateBook: (updates: Partial<StoryBook>) => void
  onApprove: () => void
  onRegenerate: () => void
  onBack: () => void
  loading: boolean
}

export default function StoryReview({
  book,
  onUpdateBook,
  onApprove,
  onRegenerate,
  onBack,
  loading,
}: StoryReviewProps) {
  const handleCharacterChange = (index: number, character: Character) => {
    const characters = [...book.characters]
    characters[index] = character
    onUpdateBook({ characters })
  }

  const handlePageChange = (index: number, page: Page) => {
    const pages = [...book.pages]
    pages[index] = page
    onUpdateBook({ pages })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Title */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-500 dark:text-slate-400">
          Title
        </label>
        <input
          type="text"
          value={book.title}
          onChange={(e) => onUpdateBook({ title: e.target.value })}
          disabled={loading}
          className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-transparent px-4 py-3 text-xl font-bold text-slate-900 outline-none transition-colors focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 disabled:opacity-50 dark:border-slate-700 dark:text-white"
          placeholder="Story title"
        />
      </div>

      {/* Theme & Setting */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-500 dark:text-slate-400">
            Theme
          </label>
          <input
            type="text"
            value={book.theme}
            onChange={(e) => onUpdateBook({ theme: e.target.value })}
            disabled={loading}
            className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 disabled:opacity-50 dark:border-slate-700 dark:text-white"
            placeholder="e.g. friendship, courage"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-500 dark:text-slate-400">
            Setting
          </label>
          <input
            type="text"
            value={book.setting}
            onChange={(e) => onUpdateBook({ setting: e.target.value })}
            disabled={loading}
            className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 disabled:opacity-50 dark:border-slate-700 dark:text-white"
            placeholder="e.g. enchanted forest, space station"
          />
        </div>
      </div>

      {/* Characters */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
          Characters
        </h2>
        <div className="space-y-4">
          {book.characters.map((character, i) => (
            <CharacterCard
              key={i}
              character={character}
              onChange={(c) => handleCharacterChange(i, c)}
            />
          ))}
        </div>
      </section>

      {/* Pages */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
          Pages
        </h2>
        <div className="space-y-4">
          {book.pages.map((page, i) => (
            <PageCard
              key={page.sequence}
              page={page}
              onChange={(p) => handlePageChange(i, p)}
            />
          ))}
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="min-h-[44px] rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Back
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={loading}
            className="min-h-[44px] rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Regenerate Story
            <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500">
              ({CREDIT_COSTS.regenerateStory} credits)
            </span>
          </button>

          <button
            type="button"
            onClick={onApprove}
            disabled={loading}
            className="min-h-[44px] rounded-xl bg-[#3D6AF2] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3D6AF2]/90 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Approve & Generate Illustrations'}
          </button>
        </div>
      </div>
    </div>
  )
}
