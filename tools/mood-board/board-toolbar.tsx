'use client'

import { useState, useRef } from 'react'

interface BoardToolbarProps {
  title: string
  saving: boolean
  onTitleChange: (title: string) => void
  onShare: () => void
  onDownloadPng: () => void
  onDownloadPdf: () => void
  onShowHistory: () => void
}

export function BoardToolbar({
  title,
  saving,
  onTitleChange,
  onShare,
  onDownloadPng,
  onDownloadPdf,
  onShowHistory,
}: BoardToolbarProps) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(title)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleTitleFocus = () => {
    setEditingTitle(true)
    setTitleValue(title)
    setTimeout(() => titleInputRef.current?.select(), 0)
  }

  const handleTitleBlur = () => {
    setEditingTitle(false)
    const trimmed = titleValue.trim()
    if (trimmed && trimmed !== title) {
      onTitleChange(trimmed)
    } else {
      setTitleValue(title)
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      titleInputRef.current?.blur()
    }
    if (e.key === 'Escape') {
      setTitleValue(title)
      setEditingTitle(false)
    }
  }

  const toggleDownload = () => setDownloadOpen((prev) => !prev)

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-[#1e2631] bg-[#090f16]">
      {/* Left: Editable title */}
      <div className="flex-1 min-w-0">
        <input
          ref={titleInputRef}
          type="text"
          value={editingTitle ? titleValue : title}
          onChange={(e) => setTitleValue(e.target.value)}
          onFocus={handleTitleFocus}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          className={`w-full max-w-[300px] bg-transparent text-sm font-medium text-white outline-none truncate transition-colors rounded-md px-2 py-1.5 ${
            editingTitle
              ? 'bg-[#131a23] border border-[#3D6AF2]'
              : 'border border-transparent hover:border-[#1e2631]'
          }`}
          aria-label="Board title"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Saving indicator */}
        <span className="flex items-center gap-1.5 text-xs text-[#70767f] mr-1">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              saving
                ? 'bg-amber-400 animate-pulse'
                : 'bg-emerald-400'
            }`}
          />
          {saving ? 'Saving...' : 'Saved'}
        </span>

        {/* My Boards button */}
        <button
          onClick={onShowHistory}
          className="min-h-[44px] bg-[#131a23] hover:bg-[#1e2631] rounded-lg px-3 py-2 text-sm text-[#a6abb5] transition-colors flex items-center gap-1.5"
        >
          {/* Grid/boards icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          My Boards
        </button>

        {/* Share button */}
        <button
          onClick={onShare}
          className="min-h-[44px] bg-[#131a23] hover:bg-[#1e2631] rounded-lg px-3 py-2 text-sm text-[#a6abb5] transition-colors flex items-center gap-1.5"
        >
          {/* Share icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </button>

        {/* Download dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDownload}
            className="min-h-[44px] bg-[#131a23] hover:bg-[#1e2631] rounded-lg px-3 py-2 text-sm text-[#a6abb5] transition-colors flex items-center gap-1.5"
          >
            {/* Download icon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
            {/* Chevron */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${downloadOpen ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {downloadOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 rounded-lg bg-[#131a23] border border-[#1e2631] shadow-xl z-50 overflow-hidden">
              <button
                onClick={() => {
                  setDownloadOpen(false)
                  onDownloadPng()
                }}
                className="w-full min-h-[44px] px-3 py-2 text-sm text-[#a6abb5] hover:bg-[#1e2631] text-left transition-colors"
              >
                Export as PNG
              </button>
              <button
                onClick={() => {
                  setDownloadOpen(false)
                  onDownloadPdf()
                }}
                className="w-full min-h-[44px] px-3 py-2 text-sm text-[#a6abb5] hover:bg-[#1e2631] text-left transition-colors"
              >
                Export as PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
