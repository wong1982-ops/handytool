'use client'

import { useState, useRef, useCallback } from 'react'
import { toBlob, toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'

interface BoardToolbarProps {
  title: string
  saving: boolean
  onShare: () => Promise<void> | void
  onViewBoards: () => void
  onNewBoard: () => void
  canvasRef: React.RefObject<HTMLDivElement | null>
}

export function BoardToolbar({
  title,
  saving,
  onShare,
  onViewBoards,
  onNewBoard,
  canvasRef,
}: BoardToolbarProps) {
  const [downloadOpen, setDownloadOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleDownloadPng = useCallback(async () => {
    if (!canvasRef.current) return
    try {
      const blob = await toBlob(canvasRef.current, { backgroundColor: '#0d1117' })
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title || 'mood-board'}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('[mood-board] PNG export failed:', err)
    }
  }, [canvasRef, title])

  const handleDownloadPdf = useCallback(async () => {
    if (!canvasRef.current) return
    try {
      const dataUrl = await toPng(canvasRef.current, { backgroundColor: '#0d1117' })
      const img = new Image()
      img.src = dataUrl
      await new Promise<void>((resolve) => {
        img.onload = () => resolve()
      })
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [img.width, img.height],
      })
      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height)
      pdf.save(`${title || 'mood-board'}.pdf`)
    } catch (err) {
      console.error('[mood-board] PDF export failed:', err)
    }
  }, [canvasRef, title])

  return (
    <div className="flex items-center justify-between px-4 md:px-8 py-3 max-w-5xl mx-auto">
      {/* Left: New Board button */}
      <button
        onClick={onNewBoard}
        className="min-h-[44px] bg-[#131a23] hover:bg-[#1e2631] rounded-lg px-3 py-2 text-sm text-[#a6abb5] transition-colors flex items-center gap-1.5"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span className="hidden sm:inline">New Board</span>
      </button>

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
          onClick={onViewBoards}
          className="min-h-[44px] bg-[#131a23] hover:bg-[#1e2631] rounded-lg px-3 py-2 text-sm text-[#a6abb5] transition-colors flex items-center gap-1.5"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          <span className="hidden sm:inline">My Boards</span>
        </button>

        {/* Share button */}
        <button
          onClick={onShare}
          className="min-h-[44px] bg-[#131a23] hover:bg-[#1e2631] rounded-lg px-3 py-2 text-sm text-[#a6abb5] transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Download dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDownloadOpen((prev) => !prev)}
            className="min-h-[44px] bg-[#131a23] hover:bg-[#1e2631] rounded-lg px-3 py-2 text-sm text-[#a6abb5] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span className="hidden sm:inline">Download</span>
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform ${downloadOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {downloadOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 rounded-lg bg-[#131a23] border border-[#1e2631] shadow-xl z-50 overflow-hidden">
              <button
                onClick={() => { setDownloadOpen(false); handleDownloadPng() }}
                className="w-full min-h-[44px] px-3 py-2 text-sm text-[#a6abb5] hover:bg-[#1e2631] text-left transition-colors"
              >
                Export as PNG
              </button>
              <button
                onClick={() => { setDownloadOpen(false); handleDownloadPdf() }}
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
