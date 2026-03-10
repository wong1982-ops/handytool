'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ALL_TEMPLATES } from '@/tools/ecard-studio/templates'
import type { OccasionTag, CardType } from '@/tools/ecard-studio/types'

const OCCASIONS: { tag: OccasionTag; label: string; icon: string }[] = [
  { tag: 'product-launch', label: 'Product Launch', icon: '🚀' },
  { tag: 'client-anniversary', label: 'Client Anniversary', icon: '🎉' },
  { tag: 'employee-welcome', label: 'Employee Welcome', icon: '👋' },
  { tag: 'quarterly-milestone', label: 'Quarterly Milestone', icon: '📊' },
  { tag: 'holiday-greetings', label: 'Holiday Greetings', icon: '🎄' },
  { tag: 'thank-you', label: 'Thank You Note', icon: '💝' },
]

type CategoryTab = 'all' | CardType

export function DiscoveryPage() {
  const router = useRouter()
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState<CategoryTab>('all')
  const [selectedOccasions, setSelectedOccasions] = useState<OccasionTag[]>([])

  // Count templates per category (unfiltered by tab/occasion)
  const tabCounts = useMemo(() => {
    const base = ALL_TEMPLATES.filter(
      (t) => !searchText || t.name.toLowerCase().includes(searchText.toLowerCase()),
    )
    return {
      all: base.length,
      ecard: base.filter((t) => t.cardType === 'ecard').length,
      'business-card': base.filter((t) => t.cardType === 'business-card').length,
    }
  }, [searchText])

  const filteredTemplates = useMemo(() => {
    return ALL_TEMPLATES.filter((t) => {
      if (searchText && !t.name.toLowerCase().includes(searchText.toLowerCase())) return false
      if (activeTab !== 'all' && t.cardType !== activeTab) return false
      if (selectedOccasions.length > 0 && (!t.occasions || !selectedOccasions.some((o) => t.occasions!.includes(o)))) return false
      return true
    })
  }, [searchText, activeTab, selectedOccasions])

  const hasActiveFilters = searchText || activeTab !== 'all' || selectedOccasions.length > 0

  function toggleOccasion(tag: OccasionTag) {
    setSelectedOccasions((prev) =>
      prev.includes(tag) ? prev.filter((o) => o !== tag) : [...prev, tag],
    )
  }

  function clearAllFilters() {
    setSearchText('')
    setActiveTab('all')
    setSelectedOccasions([])
  }

  function removeOccasion(tag: OccasionTag) {
    setSelectedOccasions((prev) => prev.filter((o) => o !== tag))
  }

  function handlePersonalize(templateId: string) {
    router.push(`/tools/ecard-studio?template=${templateId}`)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero — simplified, no duplicate buttons */}
      <section className="px-4 pt-10 pb-6 text-center max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          What&apos;s the occasion?
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Choose a template to get started
        </p>
      </section>

      {/* Unified Sticky Filter Bar */}
      <section className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-2.5">
          {/* Row 1: Search + Category Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, style, or occasion..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchText && (
                <button
                  type="button"
                  onClick={() => setSearchText('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Category Tabs with counts */}
            <div className="flex items-center gap-0.5 bg-slate-900 rounded-lg p-1 shrink-0">
              {([
                { key: 'all' as CategoryTab, label: 'All' },
                { key: 'ecard' as CategoryTab, label: 'E-Cards' },
                { key: 'business-card' as CategoryTab, label: 'Business' },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-all duration-200 cursor-pointer ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                  <span className={`text-[10px] font-medium tabular-nums ${
                    activeTab === tab.key ? 'text-blue-200' : 'text-slate-600'
                  }`}>
                    {tabCounts[tab.key]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Occasion Tags — always visible */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 -mb-0.5 scrollbar-none">
            {OCCASIONS.map((occ) => {
              const isActive = selectedOccasions.includes(occ.tag)
              return (
                <button
                  key={occ.tag}
                  type="button"
                  onClick={() => toggleOccasion(occ.tag)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/15 border-blue-500 text-white ring-1 ring-blue-500/50'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                  }`}
                >
                  <span aria-hidden="true">{occ.icon}</span>
                  {occ.label}
                </button>
              )
            })}
          </div>

          {/* Row 3: Active Filters Summary — only when filters active */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-500">
                Showing <span className="text-slate-300 font-medium tabular-nums">{filteredTemplates.length}</span> of{' '}
                <span className="tabular-nums">{ALL_TEMPLATES.length}</span> templates
              </span>

              {/* Active filter pills */}
              {activeTab !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                  {activeTab === 'ecard' ? 'E-Cards' : 'Business'}
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className="hover:text-white cursor-pointer"
                    aria-label={`Remove ${activeTab} filter`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {selectedOccasions.map((occ) => {
                const label = OCCASIONS.find((o) => o.tag === occ)?.label ?? occ
                return (
                  <span key={occ} className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                    {label}
                    <button
                      type="button"
                      onClick={() => removeOccasion(occ)}
                      className="hover:text-white cursor-pointer"
                      aria-label={`Remove ${label} filter`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )
              })}
              {searchText && (
                <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                  &ldquo;{searchText}&rdquo;
                  <button
                    type="button"
                    onClick={() => setSearchText('')}
                    className="hover:text-white cursor-pointer"
                    aria-label="Remove search filter"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={clearAllFilters}
                className="text-blue-400 hover:text-blue-300 ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Template Grid */}
      <section className="px-4 py-6 max-w-6xl mx-auto">
        {filteredTemplates.length === 0 ? (
          /* Empty State — H9 Error Recovery */
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-slate-400 text-lg font-medium mb-1">No templates match your filters</p>
            <p className="text-slate-600 text-sm mb-4">Try removing some filters or searching with different terms</p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handlePersonalize(template.id)}
                className="group bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-600 hover:shadow-lg hover:shadow-blue-500/5 hover:scale-[1.02] transition-all duration-200 text-left cursor-pointer"
              >
                {/* Preview Box with overlay badge */}
                <div
                  className="h-[140px] sm:h-[200px] relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${template.defaults.backgroundColor} 0%, ${template.defaults.accentColor}22 100%)`,
                  }}
                >
                  {/* Type badge — top-right overlay */}
                  <span className={`absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-full font-medium backdrop-blur-sm z-10 ${
                    template.cardType === 'business-card'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {template.cardType === 'business-card' ? 'Business' : 'E-Card'}
                  </span>
                  {/* Accent bar */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1"
                    style={{ backgroundColor: template.defaults.accentColor }}
                  />
                  {/* Template name overlay */}
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <span
                      className="text-base sm:text-lg font-semibold opacity-40 text-center leading-tight"
                      style={{ color: template.defaults.accentColor }}
                    >
                      {template.name}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-xs sm:text-sm text-white truncate mb-1 sm:mb-2">{template.name}</h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 mb-2 sm:mb-3 line-clamp-2">{template.description}</p>
                  <span className="block w-full py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg bg-blue-600 group-hover:bg-blue-500 text-white transition-colors text-center">
                    Personalize
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Results count footer */}
        {filteredTemplates.length > 0 && (
          <p className="text-center text-slate-600 text-xs mt-6">
            {filteredTemplates.length} of {ALL_TEMPLATES.length} templates
          </p>
        )}
      </section>
    </div>
  )
}
