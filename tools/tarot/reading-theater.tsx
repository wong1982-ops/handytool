'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { TarotProject, DrawnCard, CardInterpretation } from '@/tools/tarot/tarot-types'
import type { I18nStrings } from '@/tools/tarot/i18n/en'
import { getSpread } from '@/tools/tarot/tarot-spreads'
import { getCard, drawCards } from '@/tools/tarot/tarot-cards'
import { CardFlip } from '@/tools/tarot/card-flip'
import { ShuffleAnimation } from '@/tools/tarot/shuffle-animation'
import { InterpretationPanel } from '@/tools/tarot/interpretation-panel'

interface ReadingTheaterProps {
  project: TarotProject
  setProject: React.Dispatch<React.SetStateAction<TarotProject>>
  t: I18nStrings
  onStartOver: () => void
}

export function ReadingTheater({
  project,
  setProject,
  t,
  onStartOver,
}: ReadingTheaterProps) {
  const startedRef = useRef(false)
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null)
  const [cardInterpretations, setCardInterpretations] = useState<CardInterpretation[]>([])
  const [narrative, setNarrative] = useState('')

  const spread = project.spreadId ? getSpread(project.spreadId) : null

  // Auto-start shuffle on mount
  useEffect(() => {
    if (startedRef.current) return
    if (project.theaterStage !== 'idle' && project.theaterStage !== 'shuffling') return
    startedRef.current = true
    setProject((prev) => ({ ...prev, theaterStage: 'shuffling' }))
  }, [project.theaterStage, setProject])

  const startReading = useCallback(
    async (cards: DrawnCard[]) => {
      if (!spread) return

      const payload = {
        spreadId: spread.id,
        spreadName: spread.name[project.language],
        question: project.question,
        language: project.language,
        cards: cards.map((dc) => {
          const card = getCard(dc.cardId)
          const pos = spread.positions[dc.positionIndex]
          return {
            cardId: dc.cardId,
            positionLabel: pos.label[project.language],
            cardName: card.name[project.language],
            reversed: dc.reversed,
            meaning: dc.reversed
              ? card.meanings.reversed[project.language]
              : card.meanings.upright[project.language],
          }
        }),
      }

      try {
        const res = await fetch('/api/v1/tarot/reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok || !res.body) {
          throw new Error(t.errors.generationFailed)
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data: ')) continue
            const data = trimmed.slice(6)
            if (data === '[DONE]') continue

            try {
              const event = JSON.parse(data)

              if (event.type === 'card') {
                const pos = spread.positions[event.index]
                const interp: CardInterpretation = {
                  cardId: cards[event.index].cardId,
                  positionLabel: pos.label,
                  text: event.interpretation,
                }
                setCardInterpretations((prev) => [...prev, interp])
                setActiveCardIndex(event.index)
                setProject((prev) => ({
                  ...prev,
                  revealedCount: event.index + 1,
                }))
              } else if (event.type === 'narrative') {
                setNarrative(event.text)
                setActiveCardIndex(null)
              } else if (event.type === 'done') {
                setProject((prev) => ({
                  ...prev,
                  theaterStage: 'complete',
                  interpretation: {
                    cards: [],
                    narrative: '',
                  },
                }))
              } else if (event.type === 'error') {
                setProject((prev) => ({
                  ...prev,
                  error: event.message ?? t.errors.generationFailed,
                  theaterStage: 'complete',
                }))
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : t.errors.network
        setProject((prev) => ({
          ...prev,
          error: message,
          theaterStage: 'complete',
        }))
      }
    },
    [spread, project.language, project.question, setProject, t],
  )

  const handleShuffleComplete = useCallback(() => {
    if (!spread) return

    const drawn = drawCards(spread.cardCount)
    const drawnCards: DrawnCard[] = drawn.map((d, i) => ({
      cardId: d.cardId,
      positionIndex: i,
      reversed: d.reversed,
    }))

    setProject((prev) => ({
      ...prev,
      drawnCards,
      theaterStage: 'dealing',
    }))

    const dealDelay = spread.cardCount * 200 + 500
    setTimeout(() => {
      setProject((prev) => ({ ...prev, theaterStage: 'revealing' }))
      startReading(drawnCards)
    }, dealDelay)
  }, [spread, setProject, startReading])

  // Status text
  const statusText =
    project.theaterStage === 'shuffling'
      ? t.theater.shuffling
      : project.theaterStage === 'dealing'
        ? t.theater.dealing
        : project.theaterStage === 'revealing'
          ? t.theater.revealing
          : null

  // ─── Shuffling stage ───
  if (project.theaterStage === 'shuffling') {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12">
        <ShuffleAnimation onComplete={handleShuffleComplete} />
        <p className="text-sm text-purple-400 animate-pulse">{statusText}</p>
      </div>
    )
  }

  // ─── Dealing / Revealing / Complete ───
  if (!spread) return null

  const isDealing = project.theaterStage === 'dealing'
  const isComplete = project.theaterStage === 'complete'

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left: card spread area */}
      <div className="flex-1 min-w-0">
        <div
          className="relative w-full"
          style={{ paddingBottom: '75%' /* 4:3 aspect */ }}
        >
          {project.drawnCards.map((dc, idx) => {
            const pos = spread.positions[dc.positionIndex]
            const card = getCard(dc.cardId)
            const isRevealed =
              project.theaterStage === 'revealing' || project.theaterStage === 'complete'
                ? idx < project.revealedCount
                : false

            return (
              <div
                key={`${dc.cardId}-${idx}`}
                className="absolute transition-all duration-500 ease-out"
                style={{
                  left: `calc(${pos.x}% - 40px)`,
                  top: `calc(${pos.y}% - 60px)`,
                  opacity: isDealing ? 0 : 1,
                  transform: isDealing
                    ? 'translateY(-40px)'
                    : pos.rotation
                      ? `rotate(${pos.rotation}deg)`
                      : 'translateY(0)',
                  transitionDelay: `${idx * 150}ms`,
                  zIndex: activeCardIndex === idx ? 20 : 10,
                }}
              >
                <CardFlip
                  card={card}
                  reversed={dc.reversed}
                  revealed={isRevealed}
                  active={activeCardIndex === idx}
                  revealDelay={idx * 300}
                />
                {/* Position label */}
                <p
                  className="text-center text-slate-500 dark:text-slate-400 mt-1 whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{ fontSize: 9, maxWidth: 80 }}
                >
                  {pos.label[project.language]}
                </p>
              </div>
            )
          })}
        </div>

        {/* Status text below cards */}
        {statusText && !isComplete && (
          <p className="text-center text-sm text-purple-400 animate-pulse mt-2">
            {statusText}
          </p>
        )}

        {/* Error message */}
        {project.error && (
          <p className="text-center text-sm text-red-400 mt-2">
            {project.error}
          </p>
        )}

        {/* Action buttons on complete */}
        {isComplete && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              type="button"
              onClick={onStartOver}
              className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-400 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all cursor-pointer min-h-[44px] hover:shadow-xl"
            >
              {t.theater.newReading}
            </button>
            <button
              type="button"
              onClick={() => alert(t.errors.loginToSave)}
              className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-6 py-3 text-sm font-semibold text-purple-400 transition-all cursor-pointer min-h-[44px] hover:bg-purple-500/20"
            >
              {t.theater.saveReading}
            </button>
          </div>
        )}
      </div>

      {/* Right: interpretation panel */}
      {(cardInterpretations.length > 0 || narrative) && (
        <div className="lg:w-80 shrink-0">
          <InterpretationPanel
            cardInterpretations={cardInterpretations}
            narrative={narrative}
            activeCardIndex={activeCardIndex}
            language={project.language}
            t={t}
          />
        </div>
      )}
    </div>
  )
}
