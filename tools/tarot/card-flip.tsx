'use client'

import { useEffect, useRef, useState } from 'react'
import type { TarotCard, Language } from './tarot-types'

function getSuitSymbol(card: TarotCard): string {
  if (card.arcana === 'major') return '✦'
  switch (card.suit) {
    case 'wands': return '🜂'
    case 'cups': return '🜄'
    case 'swords': return '🜁'
    case 'pentacles': return '🜃'
    default: return '✦'
  }
}

interface Props {
  card: TarotCard
  reversed: boolean
  revealed: boolean
  active: boolean
  language?: Language
  revealDelay?: number
  onClick?: () => void
}

export function CardFlip({
  card,
  reversed,
  revealed,
  active,
  language = 'en',
  revealDelay = 0,
  onClick,
}: Props) {
  const [flipped, setFlipped] = useState(false)
  const [imageError, setImageError] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (revealed && !flipped) {
      timerRef.current = setTimeout(() => {
        setFlipped(true)
      }, revealDelay)
    }

    if (!revealed && flipped) {
      setFlipped(false)
    }

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [revealed, revealDelay]) // eslint-disable-line react-hooks/exhaustive-deps

  const ariaLabel = `${card.name[language]}${reversed ? ' (reversed)' : ''}${flipped ? '' : ' — face down'}`

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg"
      style={{
        width: 'clamp(64px, 12cqi, 130px)',
        height: 'clamp(96px, 18cqi, 195px)',
        perspective: 1000,
      }}
    >
      {/* Glow effect for active state */}
      {active && (
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-lg opacity-60 blur-md"
          style={{
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            transform: 'scale(1.15)',
          }}
        />
      )}

      {/* Card container with 3D flip */}
      <span
        className="block w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s ease-in-out',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          position: 'relative',
        }}
      >
        {/* Card back (face-down) */}
        <span
          className={`absolute inset-0 rounded-lg border overflow-hidden flex items-center justify-center
            bg-gradient-to-b from-purple-700 via-indigo-800 to-purple-900 border-purple-500/30
            ${active ? 'scale-105 z-10' : ''}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Decorative element */}
          <span
            className="flex items-center justify-center border border-purple-400/40 rounded"
            style={{ width: 100, height: 150 }}
          >
            <span className="text-purple-300 text-3xl select-none">✦</span>
          </span>
        </span>

        {/* Card front (face-up) */}
        <span
          className={`absolute inset-0 rounded-lg border overflow-hidden border-purple-500/30
            ${active ? 'scale-105 z-10' : ''}`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Image — rotated if reversed */}
          <span
            className="block w-full h-full"
            style={{
              transform: reversed ? 'rotate(180deg)' : 'none',
            }}
          >
            {imageError ? (
              <span className="flex items-center justify-center w-full h-full bg-gradient-to-br from-purple-100 via-pink-100 to-purple-200 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-purple-800/40">
                <span className="text-5xl text-purple-500/70 dark:text-purple-300/70 select-none">
                  {getSuitSymbol(card)}
                </span>
              </span>
            ) : (
              <img
                src={card.imageUrl}
                alt={card.name[language]}
                loading="lazy"
                className="w-full h-full object-cover"
                draggable={false}
                onError={() => setImageError(true)}
              />
            )}
          </span>

          {/* Card name */}
          <span
            className="absolute bottom-0 left-0 right-0 px-2 py-1.5 text-center text-white bg-black/70 leading-tight select-none font-semibold"
            style={{ fontSize: 13 }}
          >
            {card.name[language]}
          </span>

          {/* Reversed badge */}
          {reversed && (
            <span
              className="absolute top-2 right-2 flex items-center justify-center rounded-full bg-red-600 text-white font-bold leading-none select-none"
              style={{ width: 24, height: 24, fontSize: 13 }}
              aria-hidden="true"
            >
              R
            </span>
          )}
        </span>
      </span>
    </button>
  )
}
