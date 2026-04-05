'use client'

import { useState } from 'react'
import { tools } from '@/lib/tools'
import { getToolCategory } from '@/components/layout/tool-categories'

export interface AddWidgetDrawerProps {
  open: boolean
  onClose: () => void
  onAdd: (toolSlug: string) => void
  isToolOnDashboard: (slug: string) => boolean
  widgetCount: number
  maxWidgets: number
}

type CategoryFilter = 'all' | 'creative' | 'utility' | 'interactive'

// --- Icon components ---

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// --- Category pills ---

const CATEGORY_PILLS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'creative', label: 'Creative' },
  { id: 'utility', label: 'Utility' },
  { id: 'interactive', label: 'Interactive' },
]

// --- Tool list content ---

function ToolList({
  search,
  categoryFilter,
  onAdd,
  isToolOnDashboard,
  widgetCount,
  maxWidgets,
}: {
  search: string
  categoryFilter: CategoryFilter
  onAdd: (slug: string) => void
  isToolOnDashboard: (slug: string) => boolean
  widgetCount: number
  maxWidgets: number
}) {
  const filtered = tools.filter((tool) => {
    const slug = tool.href.replace('/tools/', '')
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || getToolCategory(slug) === categoryFilter
    return matchesSearch && matchesCategory
  })

  if (filtered.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-[#70767f] text-sm" role="status">
        No tools match your search.
      </div>
    )
  }

  return (
    <ul role="list">
      {filtered.map((tool) => {
        const slug = tool.href.replace('/tools/', '')
        const added = isToolOnDashboard(slug)
        const isFull = widgetCount >= maxWidgets && !added

        return (
          <li
            key={slug}
            className="flex items-center gap-3 px-4 py-3 border-b border-[#1e2631] last:border-0 hover:bg-[#1e2631] transition-colors"
          >
            {/* Tool icon */}
            <span
              className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${tool.color} text-white`}
              aria-hidden="true"
            >
              {tool.icon}
            </span>

            {/* Tool name */}
            <span className="flex-1 text-[14px] text-white font-medium leading-snug truncate">
              {tool.name}
            </span>

            {/* Action */}
            {added ? (
              <span
                className="shrink-0 flex items-center gap-1 text-[12px] text-[#70767f] font-medium"
                aria-label={`${tool.name} already added`}
              >
                <CheckIcon />
                Added
              </span>
            ) : (
              <button
                onClick={() => onAdd(slug)}
                disabled={isFull}
                className={`shrink-0 h-8 px-3 rounded-lg text-[12px] font-semibold transition-colors ${
                  isFull
                    ? 'bg-[#131a23] border border-[#1e2631] text-[#70767f] cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white hover:opacity-90'
                }`}
                aria-label={isFull ? `Dashboard full — cannot add ${tool.name}` : `Add ${tool.name} to dashboard`}
                title={isFull ? 'Dashboard is full' : undefined}
              >
                {isFull ? 'Full' : 'Add'}
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

// --- Drawer content (shared between desktop panel and mobile sheet) ---

function DrawerContent({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  onAdd,
  isToolOnDashboard,
  widgetCount,
  maxWidgets,
  onClose,
}: {
  search: string
  setSearch: (v: string) => void
  categoryFilter: CategoryFilter
  setCategoryFilter: (v: CategoryFilter) => void
  onAdd: (slug: string) => void
  isToolOnDashboard: (slug: string) => boolean
  widgetCount: number
  maxWidgets: number
  onClose: () => void
}) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2631] shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-white">Add Widget</h2>
          <span className="text-[12px] text-[#70767f] tabular-nums">
            {widgetCount}/{maxWidgets}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-[#a6abb5] hover:bg-[#1e2631] hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close widget picker"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#70767f] pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools..."
            className="w-full h-11 pl-9 pr-3 rounded-xl bg-[#131a23] border border-[#1e2631] text-white placeholder-[#70767f] text-[13px] outline-none focus:border-[#3D6AF2] transition-colors"
            aria-label="Search tools"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="px-4 pb-2 flex items-center gap-2 flex-wrap shrink-0" role="group" aria-label="Filter by category">
        {CATEGORY_PILLS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setCategoryFilter(id)}
            className={`h-8 px-3 rounded-full text-[12px] font-medium transition-colors ${
              categoryFilter === id
                ? 'bg-[#3D6AF2] text-white'
                : 'bg-[#131a23] border border-[#1e2631] text-[#a6abb5] hover:text-white hover:border-[#3D6AF2]'
            }`}
            aria-pressed={categoryFilter === id}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tool list */}
      <div className="flex-1 overflow-y-auto">
        <ToolList
          search={search}
          categoryFilter={categoryFilter}
          onAdd={onAdd}
          isToolOnDashboard={isToolOnDashboard}
          widgetCount={widgetCount}
          maxWidgets={maxWidgets}
        />
      </div>
    </>
  )
}

// --- Main component ---

export function AddWidgetDrawer({
  open,
  onClose,
  onAdd,
  isToolOnDashboard,
  widgetCount,
  maxWidgets,
}: AddWidgetDrawerProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')

  if (!open) return null

  const sharedContentProps = {
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    onAdd,
    isToolOnDashboard,
    widgetCount,
    maxWidgets,
    onClose,
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[35] bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Desktop panel — slides in from right (md+) */}
      <aside
        className="hidden md:flex fixed right-0 top-0 bottom-0 z-40 w-80 flex-col bg-[#0d1117] border-l border-[#1e2631] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Add widget"
      >
        <DrawerContent {...sharedContentProps} />
      </aside>

      {/* Mobile bottom sheet (<md) */}
      <div
        className="md:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col bg-[#0d1117] rounded-t-2xl max-h-[70vh] overflow-y-auto border-t border-[#1e2631] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Add widget"
      >
        {/* Drag handle */}
        <div className="pt-3 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#1e2631] mx-auto" aria-hidden="true" />
        </div>

        <DrawerContent {...sharedContentProps} />
      </div>
    </>
  )
}
