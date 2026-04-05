'use client'

import { useState } from 'react'
import { LANDLORD_RIGHTS, TENANT_RIGHTS } from './tenancy-data'

// ─── Know Your Rights ─────────────────────────────────────────────────────────

export default function KnowYourRights() {
  const [view, setView] = useState<'landlord' | 'tenant'>('landlord')
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const rights = view === 'landlord' ? LANDLORD_RIGHTS : TENANT_RIGHTS

  function toggleSection(index: number) {
    setExpandedIndex(prev => (prev === index ? null : index))
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      {/* Disclaimer Banner */}
      <div className="rounded-xl border-l-4 border-amber-500 bg-[#0e1520] border border-[#1e2631] border-l-amber-500 px-4 py-4">
        <p className="text-amber-400 text-sm font-semibold mb-1">General guide only</p>
        <p className="text-[#a6abb5] text-sm leading-relaxed">
          This information is a general guide and does not constitute legal advice. For specific
          situations contact{' '}
          <span className="text-white font-medium">Tenancy Services</span> on{' '}
          <a
            href="tel:0800836262"
            className="text-[#3D9DF2] hover:underline font-medium"
          >
            0800 836 262
          </a>
          .
        </p>
      </div>

      {/* Toggle Pills */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setView('landlord')
            setExpandedIndex(null)
          }}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold min-h-[44px] transition-colors border ${
            view === 'landlord'
              ? 'bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] border-transparent text-white'
              : 'bg-[#0e1520] border-[#1e2631] text-[#a6abb5] hover:text-white hover:border-[#3D6AF2]/50'
          }`}
        >
          For Landlords
        </button>
        <button
          onClick={() => {
            setView('tenant')
            setExpandedIndex(null)
          }}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold min-h-[44px] transition-colors border ${
            view === 'tenant'
              ? 'bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] border-transparent text-white'
              : 'bg-[#0e1520] border-[#1e2631] text-[#a6abb5] hover:text-white hover:border-[#3D6AF2]/50'
          }`}
        >
          For Tenants
        </button>
      </div>

      {/* Accordion */}
      <div className="space-y-2">
        {rights.map((section, index) => {
          const isExpanded = expandedIndex === index
          return (
            <div
              key={section.title}
              className="rounded-xl bg-[#0e1520] border border-[#1e2631] overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => toggleSection(index)}
                aria-expanded={isExpanded}
                className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] text-left hover:bg-[#131a23] transition-colors"
              >
                <span className="text-sm font-semibold text-white pr-4">
                  {section.title}
                </span>
                <svg
                  className={`w-4 h-4 text-[#a6abb5] flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Content */}
              {isExpanded && (
                <div className="px-4 pb-4">
                  <p className="text-[#a6abb5] text-sm whitespace-pre-wrap leading-relaxed">
                    {section.content}
                  </p>
                  {section.link && (
                    <a
                      href={section.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-4 text-sm text-[#3D9DF2] hover:text-[#3D6AF2] transition-colors"
                    >
                      Learn more on Tenancy Services
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
