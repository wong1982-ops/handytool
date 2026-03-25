'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type {
  BoardElement,
  ImageData,
  PaletteData,
  SwatchData,
  FontData,
  TextData,
} from './types'

interface BoardElementProps {
  element: BoardElement
  selected: boolean
  onSelect: () => void
  onUpdate: (partial: Partial<BoardElement>) => void
  onRemove: () => void
}

/* ─── Sub-renderers ─── */

function ImageElement({ data, width, height }: { data: ImageData; width: number; height: number }) {
  return (
    <img
      src={data.imageUrl}
      alt={data.alt}
      width={width}
      height={height}
      className="rounded-lg border-2 border-white object-cover shadow-lg"
      style={{ width, height }}
      draggable={false}
    />
  )
}

function PaletteElement({ data }: { data: PaletteData }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-[#131a23] px-3 py-2">
      {data.colors.slice(0, 5).map((color, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <div
            className="h-8 w-8 rounded-full border border-white/10"
            style={{ backgroundColor: color }}
          />
          <span className="text-[9px] text-[#70767f]">{color}</span>
        </div>
      ))}
    </div>
  )
}

function SwatchElement({ data, width, height }: { data: SwatchData; width: number; height: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="rounded-lg border border-white/10"
        style={{ backgroundColor: data.color, width, height }}
      />
      <span className="text-[10px] text-[#70767f]">{data.color}</span>
    </div>
  )
}

function FontElement({ data }: { data: FontData }) {
  return (
    <div className="rounded-xl bg-[#131a23] px-4 py-3">
      <span className="text-[10px] uppercase tracking-wider text-[#70767f]">
        {data.category}
      </span>
      <p className="text-sm font-medium text-white" style={{ fontFamily: data.fontFamily }}>
        {data.fontFamily}
      </p>
      <p
        className="mt-1 text-xs text-[#a0a6b1]"
        style={{ fontFamily: data.fontFamily }}
      >
        {data.sampleText}
      </p>
    </div>
  )
}

function TextElement({
  data,
  onUpdate,
}: {
  data: TextData
  onUpdate: (partial: Partial<BoardElement>) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(data.content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setValue(data.content)
  }, [data.content])

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [editing])

  const handleBlur = useCallback(() => {
    setEditing(false)
    if (value !== data.content) {
      onUpdate({ data: { ...data, content: value } })
    }
  }, [value, data, onUpdate])

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        className="h-full w-full resize-none rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-100 outline-none"
        style={{ fontSize: data.fontSize }}
      />
    )
  }

  return (
    <div
      className="h-full w-full rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2"
      onDoubleClick={() => setEditing(true)}
    >
      <p className="whitespace-pre-wrap text-sm text-yellow-100" style={{ fontSize: data.fontSize }}>
        {data.content}
      </p>
    </div>
  )
}

/* ─── Main component ─── */

export default function BoardElementRenderer({
  element,
  selected,
  onSelect,
  onUpdate,
  onRemove,
}: BoardElementProps) {
  const renderContent = () => {
    switch (element.type) {
      case 'image':
        return (
          <ImageElement
            data={element.data as ImageData}
            width={element.width}
            height={element.height}
          />
        )
      case 'palette':
        return <PaletteElement data={element.data as PaletteData} />
      case 'swatch':
        return (
          <SwatchElement
            data={element.data as SwatchData}
            width={element.width}
            height={element.height}
          />
        )
      case 'font':
        return <FontElement data={element.data as FontData} />
      case 'text':
        return <TextElement data={element.data as TextData} onUpdate={onUpdate} />
      default:
        return null
    }
  }

  return (
    <div
      className={`relative inline-block ${selected ? 'ring-2 ring-[#3D6AF2] rounded-lg' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      {renderContent()}

      {/* Delete button — visible only when selected */}
      {selected && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="absolute -right-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-opacity hover:bg-red-600"
          aria-label="Remove element"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
