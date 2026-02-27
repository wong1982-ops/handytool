'use client'

import { useState, useRef } from 'react'
import type { Layer } from './use-fabric-canvas'

const BLEND_MODES = [
  { value: 'source-over', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
]

interface LayersPanelProps {
  layers: Layer[]
  activeLayerId: string | null
  onSelectLayer: (id: string) => void
  onToggleVisibility: (id: string) => void
  onToggleLock: (id: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onOpacityChange: (id: string, opacity: number) => void
  onBlendModeChange: (id: string, mode: string) => void
  onReorder: (id: string, newIndex: number) => void
  onAddImage: () => void
  thumbnails?: Record<string, string>
}

export function LayersPanel({
  layers,
  activeLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onRename,
  onDelete,
  onOpacityChange,
  onBlendModeChange,
  onReorder,
  onAddImage,
  thumbnails,
}: LayersPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragItemId = useRef<string | null>(null)

  const activeLayer = layers.find(l => l.id === activeLayerId)

  const handleDoubleClick = (layer: Layer) => {
    if (layer.id === 'bg') return
    setEditingId(layer.id)
    setEditName(layer.name)
  }

  const handleRenameSubmit = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim())
    }
    setEditingId(null)
  }

  const handleDragStart = (id: string) => {
    dragItemId.current = id
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = (index: number) => {
    if (dragItemId.current && dragItemId.current !== 'bg') {
      onReorder(dragItemId.current, index)
    }
    dragItemId.current = null
    setDragOverIndex(null)
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Layers</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={onAddImage}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Add image layer"
            aria-label="Add image layer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={() => activeLayerId && activeLayerId !== 'bg' && onDelete(activeLayerId)}
            disabled={!activeLayerId || activeLayerId === 'bg'}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Delete selected layer"
            aria-label="Delete selected layer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Blend mode + Opacity — for active layer */}
      {activeLayer && (
        <div className="px-3 pb-2 space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-slate-500 w-10 shrink-0">Blend</label>
            <select
              value={activeLayer.blendMode}
              onChange={(e) => onBlendModeChange(activeLayer.id, e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-600 rounded px-1.5 py-0.5 text-[10px] text-slate-300 cursor-pointer"
              aria-label="Blend mode"
            >
              {BLEND_MODES.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-slate-500 w-10 shrink-0">Opacity</label>
            <input
              type="range"
              min={0}
              max={100}
              value={activeLayer.opacity}
              onChange={(e) => onOpacityChange(activeLayer.id, Number(e.target.value))}
              className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--tk-color-primary-500)]"
              aria-label="Layer opacity"
            />
            <span className="text-[10px] text-slate-400 w-7 text-right">{activeLayer.opacity}%</span>
          </div>
        </div>
      )}

      {/* Layer list */}
      <div className="max-h-48 overflow-y-auto px-1 pb-2 space-y-0.5">
        {layers.length === 0 ? (
          <p className="text-[11px] text-slate-600 px-3 py-2">Upload an image to start</p>
        ) : (
          layers.map((layer, index) => (
            <div
              key={layer.id}
              draggable={layer.id !== 'bg'}
              onDragStart={() => handleDragStart(layer.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={() => setDragOverIndex(null)}
              onDrop={() => handleDrop(index)}
              onClick={() => onSelectLayer(layer.id)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-colors group ${
                activeLayerId === layer.id
                  ? 'bg-[var(--tk-color-primary-500)]/20 border border-[var(--tk-color-primary-500)]/30'
                  : 'hover:bg-slate-800 border border-transparent'
              } ${dragOverIndex === index ? 'border-t-2 !border-t-[var(--tk-color-primary-500)]' : ''}`}
            >
              {/* Drag handle */}
              {layer.id !== 'bg' ? (
                <span className="text-slate-600 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>
                </span>
              ) : (
                <span className="w-3" />
              )}

              {/* Visibility */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id) }}
                className="text-slate-400 hover:text-white transition-colors p-0.5 cursor-pointer"
                title={layer.visible ? 'Hide layer' : 'Show layer'}
                aria-label={layer.visible ? `Hide ${layer.name}` : `Show ${layer.name}`}
              >
                {layer.visible ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                )}
              </button>

              {/* Lock */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleLock(layer.id) }}
                className={`transition-colors p-0.5 cursor-pointer ${layer.locked ? 'text-yellow-500' : 'text-slate-500 hover:text-slate-300'}`}
                title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                aria-label={layer.locked ? `Unlock ${layer.name}` : `Lock ${layer.name}`}
              >
                {layer.locked ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                )}
              </button>

              {/* Thumbnail */}
              {thumbnails?.[layer.id] ? (
                <img
                  src={thumbnails[layer.id]}
                  alt={`${layer.name} thumbnail`}
                  className="w-10 h-10 rounded border border-slate-600 object-cover shrink-0"
                />
              ) : (
                <span className="w-10 h-10 rounded border border-slate-600 bg-slate-700 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
              )}

              {/* Name */}
              {editingId === layer.id ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleRenameSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSubmit()
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="flex-1 bg-slate-800 border border-slate-600 rounded px-1 py-0.5 text-[11px] text-white outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className="flex-1 text-[11px] font-medium truncate text-slate-300"
                  onDoubleClick={() => handleDoubleClick(layer)}
                >
                  {layer.name}
                </span>
              )}

              {/* Type indicator */}
              <span className="text-[8px] text-slate-600 uppercase">{layer.type}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
