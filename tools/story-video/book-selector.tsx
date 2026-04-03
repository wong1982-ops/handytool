'use client'

import { useRef } from 'react'

export interface BookOption {
  id: string
  title: string
  pageCount: number
  coverUrl?: string
  status?: 'complete' | 'draft'
}

interface BookSelectorProps {
  books: BookOption[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function BookSelector({ books, selectedId, onSelect }: BookSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (books.length === 0) {
    return (
      <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-6 text-center">
        <p className="text-[#a6abb5] text-sm">No completed books found.</p>
        <p className="text-[#70767f] text-xs mt-1">
          Create a storybook in Story Studio first.
        </p>
      </div>
    )
  }

  return (
    <section>
      <h2 className="text-xs font-medium text-[#a6abb5] mb-3">Select a Book</h2>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {books.map((book) => {
          const isSelected = selectedId === book.id
          return (
            <button
              key={book.id}
              type="button"
              onClick={() => onSelect(book.id)}
              className={`
                shrink-0 w-36 rounded-xl bg-[#131a23] border transition-all
                cursor-pointer min-h-[44px] text-left overflow-hidden
                ${isSelected
                  ? 'border-[#3D6AF2] shadow-[0_0_0_3px_#3D6AF2,0_0_20px_rgba(61,106,242,0.4)]'
                  : 'border-[#1e2631] hover:border-[#3D6AF2]/30 hover:bg-[#1e2631]'}
              `}
            >
              <div className="aspect-[3/4] rounded-t-xl overflow-hidden bg-[#1e2631]">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#70767f]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-2">
                <div className="flex items-center gap-1">
                  <p className="text-white text-xs font-semibold truncate flex-1">{book.title}</p>
                  {book.status === 'draft' && (
                    <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 shrink-0">Draft</span>
                  )}
                </div>
                <p className="text-[#70767f] text-[10px] mt-0.5">{book.pageCount} pages</p>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
