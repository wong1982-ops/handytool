'use client'

import { useEffect, useState } from 'react'
import type { Language, CardInterpretation } from '@/tools/tarot/tarot-types'
import { en } from '@/tools/tarot/i18n/en'
import { zh } from '@/tools/tarot/i18n/zh'
import { getSpread } from '@/tools/tarot/tarot-spreads'
import { getCard } from '@/tools/tarot/tarot-cards'
import { HistoryCard, type SavedReading } from '@/tools/tarot/history-card'
import { TrendsPanel } from '@/tools/tarot/trends-panel'

interface ReadingDetail extends SavedReading {
  interpretation?: {
    cards: CardInterpretation[]
    narrative: string
  }
}

interface HistoryTabProps {
  language: Language
}

export function HistoryTab({ language }: HistoryTabProps) {
  const t = language === 'zh' ? zh : en

  const [readings, setReadings] = useState<ReadingDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ReadingDetail | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/v1/tarot/history')
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          setReadings(json?.data?.readings ?? [])
        }
      })
      .catch(() => {
        // silent fail — show empty state
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const handleDelete = async (id: string) => {
    setDeleteTarget(null)
    try {
      await fetch(`/api/v1/tarot/history?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      setReadings((prev) => prev.filter((r) => r.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch {
      // silent fail
    }
  }

  // ─── Loading skeleton ───
  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4" aria-busy="true" aria-label="Loading readings">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-purple-500/10 animate-pulse"
          />
        ))}
      </div>
    )
  }

  // ─── Reading detail view ───
  if (selected) {
    const spread = getSpread(selected.spread_id)
    const spreadName = spread ? spread.name[language] : selected.spread_id
    const cards = selected.interpretation?.cards ?? []
    const narrative = selected.interpretation?.narrative ?? ''

    return (
      <div className="flex flex-col gap-6">
        {/* Back button */}
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors self-start min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg px-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {t.spreadStep.back}
        </button>

        {/* Header */}
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide">
            {spreadName}
          </p>
          <h2 className="text-base font-semibold text-slate-100">
            {selected.question || '—'}
          </h2>
          <p className="text-xs text-slate-500">
            {new Date(selected.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Card interpretations */}
        {cards.length > 0 && (
          <div className="flex flex-col gap-4">
            {cards.map((ci, idx) => {
              const card = getCard(ci.cardId)
              return (
                <div
                  key={`${ci.cardId}-${idx}`}
                  className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4"
                >
                  <p className="text-xs font-semibold text-purple-400 mb-1">
                    {ci.positionLabel[language]} — {card?.name[language] ?? `Card ${ci.cardId}`}
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {ci.text}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        {/* Narrative */}
        {narrative && (
          <div className="rounded-xl border border-purple-400/30 bg-purple-500/10 p-4">
            <p className="text-xs font-semibold text-purple-300 mb-2">
              {t.theater.holisticNarrative}
            </p>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {narrative}
            </p>
          </div>
        )}

        {/* Fallback when no interpretation stored */}
        {cards.length === 0 && !narrative && (
          <p className="text-sm text-slate-500 text-center py-8">
            {t.history.empty}
          </p>
        )}
      </div>
    )
  }

  // ─── Empty state ───
  if (readings.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 dark:text-[#a6abb5] mb-2">
          {t.history.empty}
        </p>
        <p className="text-xs text-slate-400 dark:text-[#70767f]">
          {t.history.emptyHint}
        </p>
      </div>
    )
  }

  // ─── Delete confirmation dialog ───
  const confirmingDelete = deleteTarget !== null

  return (
    <>
      {/* Trends panel */}
      <TrendsPanel language={language} readingCount={readings.length} t={t} />

      {/* Readings list */}
      <div className="flex flex-col gap-3 p-1">
        {readings.map((r) => (
          <HistoryCard
            key={r.id}
            reading={r}
            language={language}
            onClick={() => setSelected(r)}
            onDelete={() => setDeleteTarget(r.id)}
          />
        ))}
      </div>

      {/* Delete confirm dialog */}
      {confirmingDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.history.deleteConfirm}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteTarget(null)
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-purple-500/30 bg-[#1a1528] p-6 shadow-2xl flex flex-col gap-4">
            <p className="text-sm font-semibold text-slate-100 text-center">
              {t.history.deleteConfirm}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-slate-600 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteTarget!)}
                className="flex-1 rounded-xl bg-red-500/80 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
