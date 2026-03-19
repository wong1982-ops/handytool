'use client'

import { useState, useMemo } from 'react'
import type { PresetPattern, PresetCategory } from './types'
import { PRESET_CATEGORY_LABELS } from './types'
import { PRESET_PATTERNS } from './presets'

interface PresetSidebarProps {
  onSelect: (preset: PresetPattern) => void
  activePresetId?: string
}

interface PresetDrawerProps extends PresetSidebarProps {
  open: boolean
  onClose: () => void
}

function PresetList({
  search,
  onSearchChange,
  onSelect,
  activePresetId,
}: {
  search: string
  onSearchChange: (v: string) => void
  onSelect: (preset: PresetPattern) => void
  activePresetId?: string
}) {
  const filtered = useMemo(() => {
    if (!search.trim()) return PRESET_PATTERNS
    const q = search.toLowerCase()
    return PRESET_PATTERNS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    )
  }, [search])

  const grouped = useMemo(() => {
    const map = new Map<PresetCategory, PresetPattern[]>()
    for (const p of filtered) {
      const list = map.get(p.category) || []
      list.push(p)
      map.set(p.category, list)
    }
    return map
  }, [filtered])

  return (
    <>
      {/* Search */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search presets..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/40 focus:border-[var(--tk-color-primary-500)]"
          />
        </div>
      </div>

      {/* Grouped list */}
      <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-2">
        {grouped.size === 0 && (
          <p className="text-xs text-slate-400 text-center py-6">No presets found.</p>
        )}
        {Array.from(grouped.entries()).map(([category, presets]) => (
          <div key={category} className="mb-3">
            <h3 className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {PRESET_CATEGORY_LABELS[category]}
            </h3>
            <div className="space-y-0.5">
              {presets.map((preset) => {
                const isActive = activePresetId === preset.id
                return (
                  <button
                    key={preset.id}
                    onClick={() => onSelect(preset)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer min-h-[44px] flex items-center gap-2 ${
                      isActive
                        ? 'bg-[var(--tk-color-primary-500)]/10 text-[var(--tk-color-primary-600)] dark:text-[var(--tk-color-primary-400)] font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {preset.flag && <span className="text-base shrink-0">{preset.flag}</span>}
                    <span className="truncate">{preset.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export function PresetSidebar({ onSelect, activePresetId }: PresetSidebarProps) {
  const [search, setSearch] = useState('')

  return (
    <aside className="hidden lg:block w-64 shrink-0 h-fit sticky top-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <PresetList
        search={search}
        onSearchChange={setSearch}
        onSelect={onSelect}
        activePresetId={activePresetId}
      />
    </aside>
  )
}

export function PresetDrawer({ open, onClose, onSelect, activePresetId }: PresetDrawerProps) {
  const [search, setSearch] = useState('')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] rounded-t-2xl bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Presets</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close presets"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <PresetList
            search={search}
            onSearchChange={setSearch}
            onSelect={(preset) => {
              onSelect(preset)
              onClose()
            }}
            activePresetId={activePresetId}
          />
        </div>
      </div>
    </div>
  )
}
