'use client'
import { useState } from 'react'
import type { BoardElement, TextData, SwatchData, ImageData } from '../types'

interface NotesSectionProps {
  elements: BoardElement[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdate: (id: string, partial: Partial<BoardElement>) => void
  onRemove: (id: string) => void
}

interface TextNoteProps {
  element: BoardElement
  isSelected: boolean
  onSelect: (id: string) => void
  onUpdate: (id: string, partial: Partial<BoardElement>) => void
}

function TextNote({ element, isSelected, onSelect, onUpdate }: TextNoteProps) {
  const [editing, setEditing] = useState(false)
  const textData = element.data as TextData

  function handleBlur(value: string) {
    setEditing(false)
    onUpdate(element.id, { data: { ...textData, content: value } })
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Text note"
      onClick={() => {
        if (!editing) onSelect(element.id)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !editing) setEditing(true)
      }}
      onDoubleClick={() => setEditing(true)}
      className={[
        'min-w-[180px] max-w-[240px] min-h-[100px] rounded-[10px] bg-[#131a23] border border-[#1e2631] border-l-4 border-l-[#F59E0B] p-3',
        'cursor-pointer relative group',
        isSelected ? 'ring-2 ring-[#3D6AF2]' : '',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2]',
      ].join(' ')}
    >
      {editing ? (
        <textarea
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          defaultValue={textData.content}
          onBlur={(e) => handleBlur(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className={[
            'w-full h-full min-h-[76px] resize-none bg-transparent',
            'text-[13px] text-[#a6abb5] outline-none leading-relaxed',
          ].join(' ')}
        />
      ) : (
        <p className="text-[13px] text-[#a6abb5] whitespace-pre-wrap break-words leading-relaxed">
          {textData.content || <span className="text-[#70767f] italic">Double-click to edit</span>}
        </p>
      )}
    </div>
  )
}

export function NotesSection({ elements, selectedId, onSelect, onUpdate, onRemove }: NotesSectionProps) {
  if (elements.length === 0) {
    return (
      <div className="py-6">
        <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#70767f] mb-3">Notes &amp; Swatches</p>
        <div className="border-2 border-dashed border-[#1e2631] rounded-[10px] p-8 text-center text-[#70767f] text-sm">
          Add notes, images, or swatches
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#70767f] mb-3">Notes &amp; Swatches</p>
      <div className="flex flex-wrap gap-3">
      {elements.map((element) => {
        const isSelected = selectedId === element.id

        if (element.type === 'text') {
          return (
            <TextNote
              key={element.id}
              element={element}
              isSelected={isSelected}
              onSelect={onSelect}
              onUpdate={onUpdate}
            />
          )
        }

        if (element.type === 'swatch') {
          const swatchData = element.data as SwatchData
          return (
            <button
              key={element.id}
              type="button"
              aria-label={`Swatch ${swatchData.color}`}
              onClick={() => onSelect(element.id)}
              className={[
                'flex flex-col items-center gap-1.5 relative group',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2] rounded-lg',
              ].join(' ')}
            >
              <span
                className={[
                  'w-[72px] h-[72px] rounded-xl block hover:scale-[1.06] transition-transform border-2 border-[#1e2631] cursor-pointer',
                  isSelected ? 'ring-2 ring-[#3D6AF2] ring-offset-2 ring-offset-[#090f16]' : '',
                ].join(' ')}
                style={{ backgroundColor: swatchData.color }}
              />
              <span className="text-[10px] text-[#70767f] font-mono">{swatchData.color.toUpperCase()}</span>
            </button>
          )
        }

        if (element.type === 'image') {
          const imageData = element.data as ImageData
          return (
            <button
              key={element.id}
              type="button"
              aria-label={imageData.alt}
              onClick={() => onSelect(element.id)}
              className={[
                'w-24 h-24 rounded-lg overflow-hidden',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2]',
                isSelected ? 'ring-2 ring-[#3D6AF2]' : '',
              ].join(' ')}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageData.imageUrl}
                alt={imageData.alt}
                className="object-cover w-full h-full"
              />
            </button>
          )
        }

        return null
      })}
      </div>
    </div>
  )
}
