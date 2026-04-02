'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useBoard } from './use-board'
import Wizard from './wizard'
import LoadingScreen from './loading-screen'
import { BoardSections } from './board-sections'
import { BoardToolbar } from './board-toolbar'
import { SideDrawer } from './side-drawer'
import { MyBoards } from './my-boards'
import { DEFAULT_BOARD } from './types'
import type { MoodOption, ColorPreference, PaletteData, TextData, SwatchData, ImageData } from './types'

type StudioView = 'wizard' | 'loading' | 'board' | 'my-boards'

export default function MoodBoardStudio() {
  const board = useBoard()

  const [view, setView] = useState<StudioView>('wizard')
  const [loadingStep, setLoadingStep] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerSection, setDrawerSection] = useState<'ai' | 'upload' | 'text' | 'swatch' | 'links' | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)

  // If useBoard restored a draft from localStorage (has elements but no id), skip to board view
  useEffect(() => {
    if (board.board.elements.length > 0 && !board.board.id) {
      setView('board')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Generate handler ---

  const handleGenerate = useCallback(async (params: { theme: string; mood: MoodOption; colorPreference: ColorPreference }) => {
    setView('loading')
    setLoadingStep(0)
    const stepTimer = setInterval(() => setLoadingStep(s => Math.min(s + 1, 3)), 4000)
    try {
      await board.generate(params.theme, params.mood, params.colorPreference)
      setView('board')
    } catch {
      setView('wizard')
    } finally {
      clearInterval(stepTimer)
    }
  }, [board])

  // --- Helper functions ---

  const handleUploadImage = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      board.addElement('image', { imageUrl: reader.result as string, alt: file.name } as ImageData)
    }
    reader.readAsDataURL(file)
  }, [board])

  const handleAddTextNote = useCallback(() => {
    board.addElement('text', { content: 'New note...', fontSize: 14 } as TextData)
  }, [board])

  const handleAddSwatch = useCallback((color: string) => {
    board.addElement('swatch', { color } as SwatchData)
  }, [board])

  const paletteColors = board.board.elements
    .find(e => e.type === 'palette')
    ?.data
    ? ((board.board.elements.find(e => e.type === 'palette')?.data as PaletteData).colors)
    : []

  const handleShare = useCallback(async () => {
    const shareUrl = await board.share()
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl)
      } catch {
        // Clipboard not available
      }
    }
  }, [board])

  // --- View: Wizard ---

  if (view === 'wizard') {
    return (
      <Wizard
        onGenerate={handleGenerate}
        onViewBoards={() => setView('my-boards')}
      />
    )
  }

  // --- View: Loading ---

  if (view === 'loading') {
    return (
      <LoadingScreen
        step={loadingStep}
        completedImages={board.board.elements.filter(e => e.type === 'image').length}
      />
    )
  }

  // --- View: My Boards ---

  if (view === 'my-boards') {
    return (
      <div>
        <BoardToolbar
          title={board.board.title}
          saving={board.saving}
          onShare={handleShare}
          onViewBoards={() => setView('my-boards')}
          onNewBoard={() => { board.setBoard({ ...DEFAULT_BOARD }); setView('wizard') }}
          canvasRef={canvasRef}
        />
        <MyBoards
          onLoadBoard={(entry) => { board.loadBoard(entry); setView('board') }}
          onBack={() => setView('board')}
        />
      </div>
    )
  }

  // --- View: Board ---

  return (
    <div>
      <BoardToolbar
        title={board.board.title}
        saving={board.saving}
        onShare={handleShare}
        onViewBoards={() => setView('my-boards')}
        onNewBoard={() => { board.setBoard({ ...DEFAULT_BOARD }); setView('wizard') }}
        canvasRef={canvasRef}
      />

      {/* Error banner */}
      {board.error && (
        <div className="mx-4 mt-2 px-4 py-2 rounded-lg bg-red-900/30 text-red-400 text-sm">
          {board.error}
        </div>
      )}

      <div ref={canvasRef}>
        <BoardSections
          board={board.board}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onUpdateElement={board.updateElement}
          onRemoveElement={board.removeElement}
          onReorderImages={board.reorderImages}
          onTitleChange={(title) => board.setBoard({ ...board.board, title })}
        />
      </div>

      <SideDrawer
        open={drawerOpen}
        activeSection={drawerSection}
        onToggle={(section) => { setDrawerOpen(!!section); setDrawerSection(section) }}
        onClose={() => { setDrawerOpen(false); setDrawerSection(null) }}
        onAddMore={board.addMore}
        addingMore={board.addingMore}
        onUploadImage={handleUploadImage}
        onAddTextNote={handleAddTextNote}
        onAddSwatch={handleAddSwatch}
        paletteColors={paletteColors}
        elementCount={board.board.elements.length}
        maxElements={30}
      />

      {/* Mobile FAB */}
      <button
        className="md:hidden fixed right-4 bottom-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white shadow-lg flex items-center justify-center"
        onClick={() => { setDrawerOpen(true); setDrawerSection('ai') }}
        aria-label="Add elements"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>
  )
}
