'use client'

import { useEffect, useRef } from 'react'
import type { NewsItem } from './types'
import { SOURCE_LABELS, CATEGORY_LABELS } from './types'

interface NewsDetailModalProps {
  item: NewsItem | null
  onClose: () => void
}

export function NewsDetailModal({ item, onClose }: NewsDetailModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (item) {
      dialog.showModal()
      document.body.style.overflow = 'hidden'
    } else {
      dialog.close()
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [item])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
      }}
      className={`fixed inset-0 z-50 m-0 p-0 w-full h-full max-w-none max-h-none bg-transparent backdrop:bg-black/60 backdrop:backdrop-blur-[4px] lg:flex lg:items-center lg:justify-center ${!item ? 'pointer-events-none hidden' : ''}`}
    >
      {item && (
      <div className="absolute bottom-0 left-0 right-0 lg:static lg:w-full lg:max-w-2xl max-h-[85vh] overflow-y-auto rounded-t-2xl lg:rounded-2xl bg-[#131a23] border border-[#1e2631] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-5 bg-[#131a23] border-b border-[#1e2631]">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white mb-1">
              {item.title}
            </h2>
            <p className="text-sm text-[#70767f]">
              {SOURCE_LABELS[item.source]} · {new Date(item.posted_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[#1e2631] transition-colors shrink-0 cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-[#a6abb5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Thumbnail */}
          {item.image_url && (
            <div className="w-full rounded-lg overflow-hidden bg-[#1e2631]">
              <img
                src={item.image_url}
                alt=""
                className="w-full h-auto max-h-64 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {item.model_name && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-[#3D6AF2]/10 text-[#3D6AF2]">
                {item.model_name}
              </span>
            )}
            {item.provider && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-900/30 text-purple-300">
                {item.provider}
              </span>
            )}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#1e2631] text-[#a6abb5]">
              {CATEGORY_LABELS[item.category]}
            </span>
          </div>

          {/* Summary */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Summary</h3>
            <p className="text-sm text-[#a6abb5] leading-relaxed whitespace-pre-line">
              {item.summary}
            </p>
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Topics</h3>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#1e2631] text-[#a6abb5]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 p-5 bg-[#131a23] border-t border-[#1e2631]">
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-[#3D6AF2] hover:bg-[#3560d8] text-white font-medium text-sm transition-colors cursor-pointer"
          >
            Read original on {SOURCE_LABELS[item.source]}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(item.source_url)
            }}
            className="h-12 px-4 rounded-xl border border-[#1e2631] bg-[#1e2631] hover:bg-[#2a3545] text-sm font-medium text-[#a6abb5] hover:text-white transition-colors cursor-pointer min-h-[44px]"
            aria-label="Copy article link"
          >
            Share
          </button>
        </div>
      </div>
      )}
    </dialog>
  )
}
