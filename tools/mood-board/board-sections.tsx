'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { ImageGrid } from './sections/image-grid'
import { PaletteRow } from './sections/palette-row'
import { NotesSection } from './sections/notes-section'
import type { Board, BoardElement } from './types'

interface BoardSectionsProps {
  board: Board
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdateElement: (id: string, partial: Partial<BoardElement>) => void
  onRemoveElement: (id: string) => void
  onReorderImages: (activeId: string, overId: string) => void
  onTitleChange: (title: string) => void
}

export function BoardSections({
  board,
  selectedId,
  onSelect,
  onUpdateElement,
  onRemoveElement,
  onReorderImages,
  onTitleChange,
}: BoardSectionsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Keyboard: Delete/Backspace removes the selected element (unless a text input is focused)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!selectedId) return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        onRemoveElement(selectedId)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, onRemoveElement])

  // Partition elements into sections
  const imageElements = board.elements.filter((e) => e.type === 'image')
  const paletteElement = board.elements.find((e) => e.type === 'palette') ?? null
  const fontElements = board.elements.filter((e) => e.type === 'font')
  const noteElements = board.elements.filter((e) => e.type === 'text' || e.type === 'swatch')

  function handleBackgroundClick(e: React.MouseEvent<HTMLDivElement>) {
    // Deselect only when clicking the background container directly
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.background === 'true') {
      onSelect(null)
    }
  }

  return (
    <div
      ref={containerRef}
      className="max-w-[960px] mx-auto px-4 md:px-6 md:pr-20 py-8 pb-20"
      onClick={handleBackgroundClick}
    >
      {/* Board title */}
      <div data-background="true" className="mb-1.5">
        <input
          type="text"
          value={board.title}
          onChange={(e) => onTitleChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          aria-label="Board title"
          placeholder="Untitled Board"
          className={[
            'text-2xl font-bold text-white bg-transparent border-none outline-none w-full',
            'placeholder:text-white/20',
            'focus:text-white',
          ].join(' ')}
        />
      </div>

      {/* Theme subtitle */}
      {board.theme && (
        <p className="text-[13px] text-[#70767f] mb-8">{board.theme}</p>
      )}

      {/* Image grid section */}
      <section aria-label="Images" className="mb-2">
        <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#70767f] mb-3">Images</p>
        <ImageGrid
          images={imageElements}
          selectedId={selectedId}
          onSelect={onSelect}
          onReorder={onReorderImages}
          onRemove={onRemoveElement}
        />
      </section>

      {/* Palette + typography row */}
      <section aria-label="Palette and typography">
        <PaletteRow
          palette={paletteElement}
          fonts={fontElements}
          selectedId={selectedId}
          onSelect={onSelect}
          onRemove={onRemoveElement}
        />
      </section>

      {/* Notes and swatches section */}
      <section aria-label="Notes and swatches">
        <NotesSection
          elements={noteElements}
          selectedId={selectedId}
          onSelect={onSelect}
          onUpdate={onUpdateElement}
          onRemove={onRemoveElement}
        />
      </section>
    </div>
  )
}
