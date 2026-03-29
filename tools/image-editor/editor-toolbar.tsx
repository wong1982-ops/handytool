'use client'

import { useState } from 'react'
import { ShapeFlyout, SHAPE_ICONS } from './shape-flyout'
import type { ShapeType } from './shape-tools'

export type ToolType = 'move' | 'hand' | 'crop' | 'brush' | 'eraser' | 'text' | 'shape'

interface EditorToolbarProps {
  activeTool: ToolType
  onToolChange: (tool: ToolType) => void
  fgColor: string
  bgColor: string
  onSwapColors: () => void
  onFgColorChange: (color: string) => void
  onBgColorChange: (color: string) => void
  activeShape: ShapeType
  onShapeChange: (shape: ShapeType) => void
}

const TOOLS: { id: ToolType; label: string; icon: React.ReactNode }[] = [
  {
    id: 'move',
    label: 'Move Tool',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
  },
  {
    id: 'hand',
    label: 'Hand Tool (Pan)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v3c0 3.037 2.462 5.5 5.5 5.5h2.718a3 3 0 002.01-.77l4.244-3.811A1.5 1.5 0 1017.5 13H16m-6-1.5V3.5a1.5 1.5 0 113 0v6m0 0V3a1.5 1.5 0 113 0v8.5" />
      </svg>
    ),
  },
  {
    id: 'crop',
    label: 'Crop Tool',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0h12M7 4L3 4m14 0v12m0 0H9m12 0h-4M7 20v-4" />
      </svg>
    ),
  },
  {
    id: 'brush',
    label: 'Brush Tool',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    id: 'eraser',
    label: 'Eraser Tool',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
  },
  {
    id: 'text',
    label: 'Text Tool',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M8 6v14m4-14v14m4-14v14" />
      </svg>
    ),
  },
]

export function EditorToolbar({
  activeTool,
  onToolChange,
  fgColor,
  bgColor,
  onSwapColors,
  onFgColorChange,
  onBgColorChange,
  activeShape,
  onShapeChange,
}: EditorToolbarProps) {
  const [showFlyout, setShowFlyout] = useState(false)

  return (
    <aside className="w-14 border-r border-slate-700 dark:border-slate-700 bg-[#101622] flex flex-col items-center py-4 gap-3 shrink-0">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          title={tool.label}
          aria-label={tool.label}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTool === tool.id
              ? 'bg-[var(--tk-color-primary-500)] text-white'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          {tool.icon}
        </button>
      ))}

      {/* Shape tool with flyout */}
      <div className="relative">
        <button
          onClick={() => {
            onToolChange('shape')
            setShowFlyout((prev) => !prev)
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            setShowFlyout(true)
          }}
          title={`Shape Tool (${activeShape})`}
          aria-label="Shape Tool"
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTool === 'shape'
              ? 'bg-[var(--tk-color-primary-500)] text-white'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          {SHAPE_ICONS[activeShape]}
          {/* Small triangle indicator */}
          <svg className="absolute bottom-1.5 right-1.5 w-2 h-2 text-slate-500" viewBox="0 0 8 8" fill="currentColor">
            <polygon points="0,0 8,8 8,0" />
          </svg>
        </button>
        {showFlyout && (
          <ShapeFlyout
            activeShape={activeShape}
            onSelect={(shape) => {
              onShapeChange(shape)
              onToolChange('shape')
            }}
            onClose={() => setShowFlyout(false)}
          />
        )}
      </div>

      {/* Foreground / background colors */}
      <div className="mt-auto flex flex-col items-center gap-1">
        <div className="relative w-11 h-11">
          <label
            className="absolute top-0 left-0 w-6 h-6 rounded-sm border-2 border-slate-500 z-10 cursor-pointer"
            style={{ backgroundColor: fgColor }}
            title="Foreground color"
          >
            <input
              type="color"
              value={fgColor}
              onChange={(e) => onFgColorChange(e.target.value)}
              className="sr-only"
              aria-label="Foreground color"
            />
          </label>
          <label
            className="absolute bottom-0 right-0 w-6 h-6 rounded-sm border-2 border-slate-500 cursor-pointer"
            style={{ backgroundColor: bgColor }}
            title="Background color"
          >
            <input
              type="color"
              value={bgColor}
              onChange={(e) => onBgColorChange(e.target.value)}
              className="sr-only"
              aria-label="Background color"
            />
          </label>
        </div>
        <button
          type="button"
          className="p-1 text-slate-500 hover:text-white transition-colors cursor-pointer"
          onClick={onSwapColors}
          title="Swap colors"
          aria-label="Swap foreground and background colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
