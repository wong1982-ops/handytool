'use client'

import { useState, useEffect, useCallback } from 'react'
import type { SavedPalette } from './types'
import { getSavedPalettes, savePalette, deletePalette } from './palette-storage'

interface SavedTabProps {
  currentColors: string[]
  onLoad: (colors: string[]) => void
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

export function SavedTab({ currentColors, onLoad }: SavedTabProps) {
  const [palettes, setPalettes] = useState<SavedPalette[]>([])
  const [paletteName, setPaletteName] = useState('')

  const refreshPalettes = useCallback(() => {
    setPalettes(getSavedPalettes())
  }, [])

  useEffect(() => {
    refreshPalettes()
  }, [refreshPalettes])

  function handleSave() {
    if (currentColors.length === 0) return
    savePalette(paletteName, currentColors)
    setPaletteName('')
    refreshPalettes()
  }

  function handleDelete(id: string) {
    deletePalette(id)
    refreshPalettes()
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Save current palette */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-[var(--tk-color-text)]">
          Save Current Palette
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={paletteName}
            onChange={(e) => setPaletteName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="Palette name..."
            aria-label="Palette name"
            className="flex-1 px-4 py-2 text-sm rounded-lg border border-[var(--tk-color-border)] bg-[var(--tk-color-bg)] text-[var(--tk-color-text)] placeholder:text-[var(--tk-color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]"
          />
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 min-h-[44px] rounded-lg bg-[var(--tk-color-primary-500)] text-white font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer shrink-0"
          >
            Save
          </button>
        </div>
        {/* Preview strip of current colors */}
        <div className="flex gap-1 rounded-lg overflow-hidden h-8 border border-[var(--tk-color-border)]">
          {currentColors.map((hex, i) => (
            <div key={i} className="flex-1" style={{ backgroundColor: hex }} />
          ))}
        </div>
      </div>

      {/* Saved palettes grid */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-[var(--tk-color-text)]">
          Saved Palettes
        </h3>

        {palettes.length === 0 ? (
          <div className="flex items-center justify-center py-8 rounded-xl border border-[var(--tk-color-border)] bg-[var(--tk-color-hover)]">
            <p className="text-sm text-[var(--tk-color-text-muted)]">
              No saved palettes yet. Create a palette and save it!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {palettes.map((palette) => (
              <div
                key={palette.id}
                className="rounded-xl border border-[var(--tk-color-border)] bg-[var(--tk-color-surface)] overflow-hidden hover:border-[var(--tk-color-text-muted)] transition-colors group"
              >
                {/* Click area to load */}
                <button
                  type="button"
                  onClick={() => onLoad(palette.colors)}
                  className="w-full text-left p-3 cursor-pointer"
                  aria-label={`Load palette: ${palette.name}`}
                >
                  {/* Color strip */}
                  <div className="flex gap-0.5 rounded-lg overflow-hidden h-8 mb-2">
                    {palette.colors.map((hex, i) => (
                      <div
                        key={i}
                        className="flex-1"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                  {/* Name and time */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--tk-color-text)] truncate">
                      {palette.name}
                    </span>
                    <span className="text-xs text-[var(--tk-color-text-muted)] shrink-0 ml-2">
                      {formatRelativeTime(palette.createdAt)}
                    </span>
                  </div>
                </button>

                {/* Delete button */}
                <div className="flex justify-end px-3 pb-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(palette.id)
                    }}
                    aria-label={`Delete palette: ${palette.name}`}
                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[var(--tk-color-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
