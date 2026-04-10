'use client'

import { useEffect, useRef, useState } from 'react'
import type { TarotCard, Language } from './tarot-types'

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
      style={{ width: 80, height: 120, perspective: 600 }}
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
            style={{ width: 48, height: 72 }}
          >
            <span className="text-purple-300 text-lg select-none">✦</span>
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
            <img
              src={card.imageUrl}
              alt={card.name[language]}
              loading="lazy"
              className="w-full h-full object-cover"
              draggable={false}
            />
          </span>

          {/* Card name */}
          <span
            className="absolute bottom-0 left-0 right-0 px-1 py-0.5 text-center text-white/90 bg-black/50 leading-tight select-none"
            style={{ fontSize: 8 }}
          >
            {card.name[language]}
          </span>

          {/* Reversed badge */}
          {reversed && (
            <span
              className="absolute top-1 right-1 flex items-center justify-center rounded-full bg-red-600 text-white font-bold leading-none select-none"
              style={{ width: 14, height: 14, fontSize: 8 }}
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
