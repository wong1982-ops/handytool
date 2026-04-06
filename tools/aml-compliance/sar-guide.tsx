'use client'

import { useState } from 'react'
import { SAR_CATEGORIES, SAR_INDICATORS } from './aml-data'
import type { SARCategory } from './types'

// ─── Component ───────────────────────────────────────────────────────────────

export default function SARGuide() {
  const [openCategory, setOpenCategory] = useState<SARCategory | null>('unusual-transactions')
  const [openIndicators, setOpenIndicators] = useState<Set<string>>(new Set())

  const toggleCategory = (id: SARCategory) => {
    setOpenCategory((prev) => (prev === id ? null : id))
  }

  const toggleIndicator = (id: string) => {
    setOpenIndicators((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Reporting Steps */}
      <div className="rounded-2xl border border-[#1e2631] bg-[#131a23] p-5">
        <h3 className="text-base font-bold text-white mb-4">How to Report Suspicious Activity</h3>
        <div className="space-y-4">
          {[
            {
              step: '1',
              title: "Don't tip off the client",
              description: 'It is a criminal offence to tell the client (or anyone else) that you have suspicions or that a SAR has been or will be filed.',
              color: 'text-red-400',
              bg: 'bg-red-500/10',
              border: 'border-red-500/30',
            },
            {
              step: '2',
              title: 'File a SAR with the FIU',
              description: 'Submit a Suspicious Activity Report to the NZ Police Financial Intelligence Unit (FIU) via the goAML system.',
              color: 'text-blue-400',
              bg: 'bg-blue-500/10',
              border: 'border-blue-500/30',
            },
            {
              step: '3',
              title: 'Document everything',
              description: 'Record your observations, the reasons for your suspicion, and the actions you have taken. Keep all related documentation.',
              color: 'text-amber-400',
              bg: 'bg-amber-500/10',
              border: 'border-amber-500/30',
            },
            {
              step: '4',
              title: 'Timeline: "as soon as practicable"',
              description: 'The Act requires SARs to be filed "as soon as practicable" after forming the suspicion. Do not delay. There is no specific deadline in hours, but promptness is essential.',
              color: 'text-green-400',
              bg: 'bg-green-500/10',
              border: 'border-green-500/30',
            },
          ].map((item) => (
            <div key={item.step} className={`rounded-xl border ${item.border} ${item.bg} p-4 flex items-start gap-3`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${item.color} border ${item.border}`}>
                {item.step}
              </div>
              <div>
                <h4 className={`text-sm font-semibold ${item.color}`}>{item.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FIU Link */}
        <div className="mt-4 pt-4 border-t border-[#1e2631]">
          <a
            href="https://www.police.govt.nz/advice/businesses-and-organisations/financial-intelligence-unit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#3D6AF2] text-sm font-bold text-white hover:bg-[#3D79F2] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            NZ Police Financial Intelligence Unit
          </a>
        </div>
      </div>

      {/* Suspicious Activity Indicators */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white">Suspicious Activity Indicators</h3>
        <p className="text-sm text-slate-400">
          The following indicators may suggest money laundering or terrorism financing. Click each category to view specific red flags.
        </p>

        {SAR_CATEGORIES.map((category) => {
          const isOpen = openCategory === category.id
          const indicators = SAR_INDICATORS.filter((i) => i.category === category.id)

          return (
            <div key={category.id} className="rounded-xl border border-[#1e2631] bg-[#131a23] overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full min-h-[44px] px-4 py-3 flex items-center justify-between hover:bg-[#1e2631] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg" role="img" aria-label={category.label}>
                    {category.icon}
                  </span>
                  <span className="text-sm font-semibold text-white">{category.label}</span>
                  <span className="text-xs text-slate-500">{indicators.length} indicators</span>
                </div>
                <svg
                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Indicators */}
              {isOpen && (
                <div className="border-t border-[#1e2631] px-4 py-3 space-y-2">
                  {indicators.map((indicator) => {
                    const isIndicatorOpen = openIndicators.has(indicator.id)
                    return (
                      <div key={indicator.id} className="rounded-lg border border-[#1e2631] overflow-hidden">
                        <button
                          onClick={() => toggleIndicator(indicator.id)}
                          className="w-full min-h-[44px] px-3 py-2.5 flex items-start gap-2 text-left hover:bg-[#1e2631]/50 transition-colors"
                        >
                          <svg
                            className={`w-4 h-4 text-slate-500 shrink-0 mt-0.5 transition-transform duration-200 ${isIndicatorOpen ? 'rotate-90' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                          <span className="text-sm text-white">{indicator.title}</span>
                        </button>

                        {isIndicatorOpen && (
                          <div className="px-3 pb-3 pl-9 space-y-3">
                            <div>
                              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">What to look for</h5>
                              <p className="text-sm text-slate-300 leading-relaxed">{indicator.description}</p>
                            </div>
                            <div>
                              <h5 className="text-xs font-semibold text-[#3D6AF2] uppercase tracking-wider mb-1">What to do</h5>
                              <p className="text-sm text-slate-300 leading-relaxed">{indicator.whatToDo}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <p className="text-xs text-amber-400/80">
          <strong>Disclaimer:</strong> This tool provides general guidance only. It is not legal advice and does not replace the requirement for independent AML/CFT compliance advice. Contact the DIA AML/CFT team for specific guidance.
        </p>
      </div>
    </div>
  )
}
