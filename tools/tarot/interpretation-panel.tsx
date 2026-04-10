'use client'

import type { CardInterpretation, Language } from './tarot-types'
import type { I18nStrings } from './i18n/en'

interface InterpretationPanelProps {
  cardInterpretations: CardInterpretation[]
  narrative: string
  activeCardIndex: number | null
  language: Language
  t: I18nStrings
}

export function InterpretationPanel({
  cardInterpretations,
  narrative,
  activeCardIndex,
  language,
  t,
}: InterpretationPanelProps) {
  return (
    <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1 scrollbar-thin">
      {/* Card interpretations */}
      {cardInterpretations.map((interp, idx) => {
        const isActive = activeCardIndex === idx
        const label = language === 'zh' ? interp.positionLabel.zh : interp.positionLabel.en

        return (
          <div
            key={`${interp.cardId}-${idx}`}
            className={`rounded-xl p-4 transition-all duration-300 ${
              isActive
                ? 'bg-purple-500/20 border border-purple-400/40 shadow-lg shadow-purple-500/10'
                : 'bg-slate-100 dark:bg-slate-800/60 border border-transparent'
            }`}
            style={{
              opacity: 0,
              animation: `fadeInUp 0.4s ease-out ${idx * 0.15}s forwards`,
            }}
          >
            <p className="text-xs font-semibold text-purple-400 mb-1">{label}</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {interp.text}
            </p>
          </div>
        )
      })}

      {/* Holistic narrative */}
      {narrative && (
        <div
          className="rounded-xl p-4 border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-pink-500/10"
          style={{
            opacity: 0,
            animation: `fadeInUp 0.5s ease-out ${cardInterpretations.length * 0.15}s forwards`,
          }}
        >
          <p className="text-xs font-semibold text-purple-400 mb-2">
            {t.theater.holisticNarrative}
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {narrative}
          </p>
        </div>
      )}

      {/* Fade-in keyframes injected via style tag */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
