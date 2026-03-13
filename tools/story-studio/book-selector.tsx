'use client'

import { useState, useRef, useEffect } from 'react'
import { useBookContext } from '@/tools/story-studio/use-book-context'

export function BookSelector() {
  const { activeBook, setActiveBookId, books, loading } = useBookContext()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-800/30 text-purple-300 text-sm">
        <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
        Loading...
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <span className="text-purple-300/60 text-sm italic">
        No books yet
      </span>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-800/40 hover:bg-indigo-800/60
          text-white text-sm font-medium transition-colors cursor-pointer
          border border-indigo-700/50 max-w-[240px]"
        style={{ minHeight: '36px' }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
        <span className="truncate">
          {activeBook ? activeBook.title : 'Select a book...'}
        </span>
        <svg className={`w-4 h-4 text-purple-300 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-72 max-h-64 overflow-y-auto
            rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 z-50"
          role="listbox"
        >
          {/* Clear selection option */}
          {activeBook && (
            <button
              onClick={() => { setActiveBookId(null); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-400 dark:text-slate-500
                hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer
                border-b border-slate-100 dark:border-slate-700"
            >
              Clear selection
            </button>
          )}

          {books.map((book) => {
            const isSelected = activeBook?.id === book.id
            return (
              <button
                key={book.id}
                onClick={() => { setActiveBookId(book.id); setOpen(false) }}
                role="option"
                aria-selected={isSelected}
                className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
                style={{ minHeight: '44px' }}
              >
                {/* Cover thumbnail */}
                <div className="w-8 h-10 rounded bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                  {book.coverImageUrl ? (
                    <img
                      src={book.coverImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-4 h-4 text-slate-300 dark:text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{book.title}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    {book.pageCount} pages
                  </div>
                </div>

                {isSelected && (
                  <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
