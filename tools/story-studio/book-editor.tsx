'use client'

import { useState } from 'react'
import type { Page, StoryBook } from './types'
import { BookReader } from './book-reader'

interface BookEditorProps {
  book: StoryBook
  onUpdateBook: (updates: Partial<StoryBook>) => void
  onUpdatePage: (sequence: number, updates: Partial<Page>) => void
  onReset: () => void
}

export function BookEditor({ book, onUpdateBook: _onUpdateBook, onUpdatePage, onReset }: BookEditorProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [mobileView, setMobileView] = useState<'reader' | 'edit'>('reader')
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const isCover = currentPage === 0
  const contentPage = isCover ? null : book.pages[currentPage - 1]

  const handleNarrativeChange = (value: string) => {
    if (!contentPage) return
    onUpdatePage(contentPage.sequence, { narrativeText: value })
  }

  const handleDialogueChange = (index: number, field: 'speaker' | 'line', value: string) => {
    if (!contentPage?.dialogue) return
    const updated = [...contentPage.dialogue]
    updated[index] = { ...updated[index], [field]: value }
    onUpdatePage(contentPage.sequence, { dialogue: updated })
  }

  const handleAddDialogue = () => {
    if (!contentPage) return
    const dialogue = [...(contentPage.dialogue || []), { speaker: '', line: '' }]
    onUpdatePage(contentPage.sequence, { dialogue })
  }

  const handleRemoveDialogue = (index: number) => {
    if (!contentPage?.dialogue) return
    const dialogue = contentPage.dialogue.filter((_, i) => i !== index)
    onUpdatePage(contentPage.sequence, { dialogue })
  }

  const handleReset = () => {
    setShowResetConfirm(false)
    onReset()
  }

  const editPanel = (
    <div className="flex flex-col h-full overflow-auto p-4 space-y-4">
      {isCover ? (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Cover
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Navigate to a page to edit its content.
          </p>
        </div>
      ) : contentPage ? (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Page {contentPage.sequence}
            </h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {contentPage.mood}
            </span>
          </div>

          {/* Narrative text */}
          <div className="space-y-1.5">
            <label
              htmlFor="narrative-text"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Narrative Text
            </label>
            <textarea
              id="narrative-text"
              value={contentPage.narrativeText}
              onChange={(e) => handleNarrativeChange(e.target.value)}
              rows={5}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                px-3 py-2.5 text-sm resize-y
                focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]/50 focus:border-[#3D6AF2]
                transition-colors"
            />
          </div>

          {/* Dialogue list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Dialogue
              </label>
              <button
                type="button"
                onClick={handleAddDialogue}
                className="text-xs font-medium text-[#3D6AF2] hover:text-[#3D6AF2]/80
                  transition-colors min-h-[44px] px-2 flex items-center"
              >
                + Add line
              </button>
            </div>

            {contentPage.dialogue && contentPage.dialogue.length > 0 ? (
              <div className="space-y-3">
                {contentPage.dialogue.map((d, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={d.speaker}
                        onChange={(e) => handleDialogueChange(i, 'speaker', e.target.value)}
                        placeholder="Speaker"
                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600
                          bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                          px-2.5 py-2 text-sm min-h-[44px]
                          focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]/50 focus:border-[#3D6AF2]
                          transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDialogue(i)}
                        className="flex items-center justify-center w-11 h-11 rounded-lg
                          text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                          transition-colors"
                        aria-label={`Remove dialogue line ${i + 1}`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <textarea
                      value={d.line}
                      onChange={(e) => handleDialogueChange(i, 'line', e.target.value)}
                      placeholder="Dialogue line..."
                      rows={2}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                        px-2.5 py-2 text-sm resize-y
                        focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]/50 focus:border-[#3D6AF2]
                        transition-colors"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                No dialogue on this page.
              </p>
            )}
          </div>
        </>
      ) : null}

      {/* New Story button */}
      <div className="pt-4 mt-auto border-t border-gray-200 dark:border-gray-700">
        {showResetConfirm ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Start a new story? Current progress will be lost.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 min-h-[44px] rounded-xl bg-red-500 text-white text-sm font-medium
                  hover:bg-red-600 transition-colors"
              >
                Yes, start over
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 min-h-[44px] rounded-xl border border-gray-300 dark:border-gray-600
                  text-gray-700 dark:text-gray-300 text-sm font-medium
                  hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="w-full min-h-[44px] rounded-xl border border-gray-300 dark:border-gray-600
              text-gray-700 dark:text-gray-300 text-sm font-medium
              hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            New Story
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
          {book.title}
        </h2>

        {/* Mobile view toggle */}
        <div className="flex sm:hidden rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setMobileView('reader')}
            className={`min-h-[44px] px-3 text-sm font-medium transition-colors ${
              mobileView === 'reader'
                ? 'bg-[#3D6AF2] text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            Read
          </button>
          <button
            type="button"
            onClick={() => setMobileView('edit')}
            className={`min-h-[44px] px-3 text-sm font-medium transition-colors ${
              mobileView === 'edit'
                ? 'bg-[#3D6AF2] text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            Edit
          </button>
        </div>
      </div>

      {/* Desktop: split layout */}
      <div className="flex-1 min-h-0 hidden sm:flex">
        {/* Reader - 60% */}
        <div className="w-[60%] border-r border-gray-200 dark:border-gray-700">
          <BookReader
            pages={book.pages}
            title={book.title}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
        {/* Edit panel - 40% */}
        <div className="w-[40%]">{editPanel}</div>
      </div>

      {/* Mobile: toggle views */}
      <div className="flex-1 min-h-0 flex sm:hidden">
        {mobileView === 'reader' ? (
          <div className="w-full">
            <BookReader
              pages={book.pages}
              title={book.title}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        ) : (
          <div className="w-full">{editPanel}</div>
        )}
      </div>
    </div>
  )
}
