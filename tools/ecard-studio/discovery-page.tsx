'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ALL_TEMPLATES } from '@/tools/ecard-studio/templates'
import type { OccasionTag, CardType } from '@/tools/ecard-studio/types'

const OCCASION_BUTTONS: { tag: OccasionTag; label: string; icon: string; color: string }[] = [
  { tag: 'product-launch', label: 'Product Launch', icon: '🚀', color: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20' },
  { tag: 'client-anniversary', label: 'Client Anniversary', icon: '🎉', color: 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20' },
  { tag: 'employee-welcome', label: 'Employee Welcome', icon: '👋', color: 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20' },
  { tag: 'quarterly-milestone', label: 'Quarterly Milestone', icon: '📊', color: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20' },
  { tag: 'holiday-greetings', label: 'Holiday Greetings', icon: '🎄', color: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20' },
  { tag: 'thank-you', label: 'Thank You Note', icon: '💝', color: 'bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border-pink-500/20' },
]

type CategoryTab = 'all' | CardType

export function DiscoveryPage() {
  const router = useRouter()
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState<CategoryTab>('all')
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionTag | null>(null)

  const filteredTemplates = useMemo(() => {
    return ALL_TEMPLATES.filter((t) => {
      // Filter by search text
      if (searchText && !t.name.toLowerCase().includes(searchText.toLowerCase())) {
        return false
      }
      // Filter by card type tab
      if (activeTab !== 'all' && t.cardType !== activeTab) {
        return false
      }
      // Filter by occasion
      if (selectedOccasion && (!t.occasions || !t.occasions.includes(selectedOccasion))) {
        return false
      }
      return true
    })
  }, [searchText, activeTab, selectedOccasion])

  function handleOccasionClick(tag: OccasionTag) {
    setSelectedOccasion((prev) => (prev === tag ? null : tag))
    setActiveTab('ecard')
  }

  function handlePersonalize(templateId: string) {
    router.push(`/tools/ecard-studio?template=${templateId}`)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="px-4 pt-12 pb-8 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          What&apos;s the occasion?
        </h1>
        <p className="text-slate-400 text-lg mb-10">
          Choose a template to get started
        </p>

        {/* Occasion Intent Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {OCCASION_BUTTONS.map((btn) => (
            <button
              key={btn.tag}
              type="button"
              onClick={() => handleOccasionClick(btn.tag)}
              className={`flex items-center gap-2.5 px-4 py-3.5 rounded-lg border transition-all text-left text-sm font-medium ${
                selectedOccasion === btn.tag
                  ? 'ring-2 ring-blue-500 border-blue-500/50 bg-blue-500/10 text-white'
                  : btn.color
              }`}
            >
              <span className="text-lg" aria-hidden="true">{btn.icon}</span>
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-64 flex-shrink-0">
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
              placeholder="Search templates..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1">
            {([
              { key: 'all', label: 'All' },
              { key: 'ecard', label: 'E-Cards' },
              { key: 'business-card', label: 'Business Cards' },
            ] as { key: CategoryTab; label: string }[]).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key)
                  if (tab.key !== 'ecard') setSelectedOccasion(null)
                }}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Occasion Chips (E-Cards tab only) */}
          {activeTab === 'ecard' && (
            <div className="flex flex-wrap gap-1.5">
              {OCCASION_BUTTONS.map((btn) => (
                <button
                  key={btn.tag}
                  type="button"
                  onClick={() => setSelectedOccasion((prev) => (prev === btn.tag ? null : btn.tag))}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    selectedOccasion === btn.tag
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Template Grid */}
      <section className="px-4 py-8 max-w-6xl mx-auto">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg">No templates match your filters.</p>
            <button
              type="button"
              onClick={() => {
                setSearchText('')
                setActiveTab('all')
                setSelectedOccasion(null)
              }}
              className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="group bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-600 transition-all"
              >
                {/* Preview Box */}
                <div
                  className="h-[200px] relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${template.defaults.backgroundColor} 0%, ${template.defaults.accentColor}22 100%)`,
                  }}
                >
                  {/* Accent bar */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1"
                    style={{ backgroundColor: template.defaults.accentColor }}
                  />
                  {/* Template name overlay */}
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <span
                      className="text-lg font-semibold opacity-40 text-center leading-tight"
                      style={{ color: template.defaults.accentColor }}
                    >
                      {template.name}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm text-white truncate">{template.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${
                      template.cardType === 'business-card'
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {template.cardType === 'business-card' ? 'Business' : 'E-Card'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{template.description}</p>
                  <button
                    type="button"
                    onClick={() => handlePersonalize(template.id)}
                    className="w-full py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  >
                    Personalize
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results count */}
        <p className="text-center text-slate-600 text-xs mt-6">
          {filteredTemplates.length} of {ALL_TEMPLATES.length} templates
        </p>
      </section>
    </div>
  )
}
