'use client'

import { useState } from 'react'
import type { PathwayMatch, QuizAnswers, PointsBreakdown } from './types'
import { DOCUMENT_CHECKLISTS } from './document-checklists'
import { FEES } from './fees-data'
import PointsCalculator from './points-calculator'
import GreenListSearch from './green-list-search'

interface PathwayCardProps {
  pathway: PathwayMatch
  answers: QuizAnswers
  pointsBreakdown: PointsBreakdown | null
}

const MATCH_STYLES = {
  strong: {
    border: 'border-l-green-500',
    badge: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
    label: 'Strong Match',
  },
  possible: {
    border: 'border-l-amber-500',
    badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
    label: 'Possible Match',
  },
  unlikely: {
    border: 'border-l-slate-400',
    badge: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
    label: 'Unlikely',
  },
}

const STATUS_ICON: Record<string, { icon: string; color: string }> = {
  met: { icon: '✓', color: 'text-green-600 dark:text-green-400' },
  'not-met': { icon: '✗', color: 'text-red-500 dark:text-red-400' },
  unknown: { icon: '?', color: 'text-slate-400 dark:text-slate-500' },
}

const GREEN_LIST_PATHWAY_IDS = new Set(['smc', 'aewv', 'green-list-1', 'green-list-2'])

const ACCORDION_SECTIONS = [
  { id: 'requirements', label: 'Requirements' },
  { id: 'points', label: 'Points Calculator' },
  { id: 'green-list', label: 'Green List Occupations' },
  { id: 'documents', label: 'Documents' },
  { id: 'fees', label: 'Fees & Processing Time' },
]

export default function PathwayCard({ pathway, answers, pointsBreakdown }: PathwayCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const styles = MATCH_STYLES[pathway.matchLevel]
  const fee = FEES[pathway.id]
  const checklist = DOCUMENT_CHECKLISTS[pathway.id]

  const showPointsSection = pathway.id === 'smc'
  const showGreenListSection = GREEN_LIST_PATHWAY_IDS.has(pathway.id)

  const visibleSections = ACCORDION_SECTIONS.filter(({ id }) => {
    if (id === 'points') return showPointsSection
    if (id === 'green-list') return showGreenListSection
    return true
  })

  function toggleSection(id: string) {
    setActiveSection((prev) => (prev === id ? null : id))
  }

  return (
    <div
      className={`rounded-xl border-l-4 ${styles.border} border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden`}
    >
      {/* Header */}
      <div className="px-4 py-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles.badge}`}
              >
                {styles.label}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug">
              {pathway.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {pathway.description}
            </p>
          </div>
        </div>

        {/* Key stat pills */}
        <div className="mt-3 flex gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            NZ${fee.total.toLocaleString()} total
          </span>
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {fee.processingTime}
          </span>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 min-h-[44px] -ml-1 px-1 transition-colors"
          aria-expanded={expanded}
        >
          {expanded ? 'Hide Details' : 'View Details'}
          <svg
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded accordion */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-800">
          {visibleSections.map(({ id, label }) => (
            <div key={id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
              <button
                onClick={() => toggleSection(id)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors min-h-[44px]"
                aria-expanded={activeSection === id}
              >
                {label}
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform ${activeSection === id ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeSection === id && (
                <div className="px-4 pb-4 pt-1">
                  {id === 'requirements' && (
                    <ul className="space-y-2">
                      {pathway.requirements.map((req, i) => {
                        const { icon, color } = STATUS_ICON[req.status]
                        return (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className={`mt-0.5 font-bold shrink-0 ${color}`} aria-hidden="true">
                              {icon}
                            </span>
                            <span className="text-slate-600 dark:text-slate-400">{req.label}</span>
                          </li>
                        )
                      })}
                    </ul>
                  )}

                  {id === 'points' && showPointsSection && pointsBreakdown && (
                    <PointsCalculator breakdown={pointsBreakdown} />
                  )}

                  {id === 'points' && showPointsSection && !pointsBreakdown && (
                    <p className="text-sm text-slate-400">Points breakdown is not available.</p>
                  )}

                  {id === 'green-list' && showGreenListSection && (
                    <GreenListSearch />
                  )}

                  {id === 'documents' && (
                    <div className="space-y-4">
                      {checklist.required.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                            Required
                          </p>
                          <ul className="space-y-2">
                            {checklist.required.map((doc, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="mt-0.5 shrink-0 w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800" aria-hidden="true" />
                                <span>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">{doc.name}</span>
                                  {doc.note && (
                                    <span className="block text-xs text-slate-400 mt-0.5">{doc.note}</span>
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {checklist.ifApplicable.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                            If Applicable
                          </p>
                          <ul className="space-y-2">
                            {checklist.ifApplicable.map((doc, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="mt-0.5 shrink-0 w-4 h-4 rounded border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800" aria-hidden="true" />
                                <span>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">{doc.name}</span>
                                  {doc.note && (
                                    <span className="block text-xs text-slate-400 mt-0.5">{doc.note}</span>
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {id === 'fees' && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                      <table className="w-full text-sm">
                        <tbody>
                          <tr className="border-b border-slate-100 dark:border-slate-800">
                            <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">Application Fee</td>
                            <td className="px-4 py-2.5 text-right font-mono text-slate-800 dark:text-slate-200">
                              NZ${fee.applicationFee.toLocaleString()}
                            </td>
                          </tr>
                          {fee.immigrationLevy > 0 && (
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                              <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">Immigration Levy</td>
                              <td className="px-4 py-2.5 text-right font-mono text-slate-800 dark:text-slate-200">
                                NZ${fee.immigrationLevy.toLocaleString()}
                              </td>
                            </tr>
                          )}
                          <tr className="bg-slate-50 dark:bg-slate-800 border-t-2 border-slate-200 dark:border-slate-600">
                            <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">Total</td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                              NZ${fee.total.toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        Processing time: {fee.processingTime}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
