'use client'

import { useState, useRef, useCallback } from 'react'
import { toBlob, toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import { useBoard } from './use-board'
import { MAX_ELEMENTS } from './types'
import type { PaletteData } from './types'
import { PromptPanel } from './prompt-panel'
import BoardCanvas from './board-canvas'
import { BoardToolbar } from './board-toolbar'
import { MyBoards } from './my-boards'

export default function MoodBoardStudio() {
  const board = useBoard()
  const [activeTab, setActiveTab] = useState<'studio' | 'boards'>('studio')
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [showPromptPanel, setShowPromptPanel] = useState(false)
  const canvasRef = useRef<HTMLDivElement | null>(null)

  // Extract palette colors from first palette element
  const paletteColors: string[] = (() => {
    const paletteEl = board.board.elements.find((el) => el.type === 'palette')
    if (!paletteEl) return []
    return (paletteEl.data as PaletteData).colors ?? []
  })()

  // --- Export handlers ---

  const handleDownloadPng = useCallback(async () => {
    if (!canvasRef.current) return
    try {
      const blob = await toBlob(canvasRef.current, { backgroundColor: '#0d1117' })
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${board.board.title || 'mood-board'}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('[mood-board] PNG export failed:', err)
    }
  }, [board.board.title])

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
      pdf.save(`${board.board.title || 'mood-board'}.pdf`)
    } catch (err) {
      console.error('[mood-board] PDF export failed:', err)
    }
  }, [board.board.title])

  const handleShare = useCallback(async () => {
    const shareUrl = await board.share()
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl)
      } catch {
        // Clipboard not available — ignore
      }
    }
  }, [board])

  // --- Title change ---

  const handleTitleChange = useCallback(
    (title: string) => {
      board.setBoard({ ...board.board, title })
    },
    [board],
  )

  // --- PromptPanel handlers ---

  const handleAddText = useCallback(() => {
    board.addElement('text', { content: 'Double-click to edit', fontSize: 16 })
  }, [board])

  const handleAddSwatch = useCallback(
    (color: string) => {
      board.addElement('swatch', { color })
    },
    [board],
  )

  const handleUploadImage = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        board.addElement('image', { imageUrl: dataUrl, alt: file.name })
      }
      reader.readAsDataURL(file)
    },
    [board],
  )

  // --- Tab / history handlers ---

  const handleShowHistory = useCallback(() => {
    setActiveTab('boards')
  }, [])

  const handleLoadBoard = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (entry: any) => {
      board.loadBoard(entry)
      setActiveTab('studio')
      setSelectedElementId(null)
    },
    [board],
  )

  const handleBackToStudio = useCallback(() => {
    setActiveTab('studio')
  }, [])

  // --- Render ---

  if (activeTab === 'boards') {
    return (
      <div className="flex flex-col h-full">
        <BoardToolbar
          title={board.board.title}
          saving={board.saving}
          onTitleChange={handleTitleChange}
          onShare={handleShare}
          onDownloadPng={handleDownloadPng}
          onDownloadPdf={handleDownloadPdf}
          onShowHistory={handleShowHistory}
        />
        {/* Tab pills */}
        <div className="flex gap-1 px-4 py-2 border-b border-[#1e2631] bg-[#090f16]">
          <button
            onClick={handleBackToStudio}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors text-[#70767f] hover:text-white"
          >
            Studio
          </button>
          <button
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors bg-[#3D6AF2] text-white"
          >
            My Boards
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <MyBoards onLoadBoard={handleLoadBoard} onBack={handleBackToStudio} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <BoardToolbar
        title={board.board.title}
        saving={board.saving}
        onTitleChange={handleTitleChange}
        onShare={handleShare}
        onDownloadPng={handleDownloadPng}
        onDownloadPdf={handleDownloadPdf}
        onShowHistory={handleShowHistory}
      />
      {/* Tab pills */}
      <div className="flex gap-1 px-4 py-2 border-b border-[#1e2631] bg-[#090f16]">
        <button
          className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors bg-[#3D6AF2] text-white"
        >
          Studio
        </button>
        <button
          onClick={handleShowHistory}
          className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors text-[#70767f] hover:text-white"
        >
          My Boards
        </button>
      </div>

      {/* Desktop: side-by-side — Mobile: canvas only + FAB */}
      <div className="flex flex-1 min-h-0">
        {/* PromptPanel — desktop only */}
        <div className="hidden md:block w-80 shrink-0 overflow-y-auto border-r border-[#1e2631]">
          <PromptPanel
            theme={board.board.theme}
            generating={board.generating}
            addingMore={board.addingMore}
            elementCount={board.board.elements.length}
            maxElements={MAX_ELEMENTS}
            hasElements={board.board.elements.length > 0}
            paletteColors={paletteColors}
            error={board.error}
            onGenerate={board.generate}
            onAddMore={board.addMore}
            onAddText={handleAddText}
            onAddSwatch={handleAddSwatch}
            onUploadImage={handleUploadImage}
          />
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-4">
          <BoardCanvas
            elements={board.board.elements}
            selectedId={selectedElementId}
            onSelect={setSelectedElementId}
            onUpdate={board.updateElement}
            onRemove={board.removeElement}
            onBringToFront={board.bringToFront}
            canvasRef={canvasRef}
          />
        </div>
      </div>

      {/* Mobile FAB — toggles prompt panel bottom sheet */}
      <button
        onClick={() => setShowPromptPanel((prev) => !prev)}
        className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white shadow-lg flex items-center justify-center hover:brightness-110 transition-all"
        aria-label="Toggle prompt panel"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${showPromptPanel ? 'rotate-45' : ''}`}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Mobile bottom sheet overlay */}
      {showPromptPanel && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setShowPromptPanel(false)}
          />
          {/* Sheet */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] bg-[#090f16] border-t border-[#1e2631] rounded-t-2xl overflow-y-auto">
            {/* Drag handle */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 rounded-full bg-[#1e2631]" />
            </div>
            <PromptPanel
              theme={board.board.theme}
              generating={board.generating}
              addingMore={board.addingMore}
              elementCount={board.board.elements.length}
              maxElements={MAX_ELEMENTS}
              hasElements={board.board.elements.length > 0}
              paletteColors={paletteColors}
              error={board.error}
              onGenerate={board.generate}
              onAddMore={board.addMore}
              onAddText={handleAddText}
              onAddSwatch={handleAddSwatch}
              onUploadImage={handleUploadImage}
            />
          </div>
        </>
      )}
    </div>
  )
}
