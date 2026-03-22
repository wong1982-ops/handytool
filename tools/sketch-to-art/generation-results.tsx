'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { FUN_LOADING_MESSAGES } from './types'
import type { GeneratedVariation, SketchMode } from './types'

interface GenerationResultsProps {
  variations: GeneratedVariation[]
  selectedIndex: number | null
  onSelect: (index: number) => void
  loading: boolean
  mode: SketchMode
}

export default function GenerationResults({
  variations,
  selectedIndex,
  onSelect,
  loading,
  mode,
}: GenerationResultsProps) {
  const isFun = mode === 'fun'
  const [funMessageIndex, setFunMessageIndex] = useState(0)

  // Rotate fun loading messages every 2 seconds
  useEffect(() => {
    if (!loading || !isFun) return
    const interval = setInterval(() => {
      setFunMessageIndex((prev) => (prev + 1) % FUN_LOADING_MESSAGES.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [loading, isFun])

  if (loading) {
    if (isFun) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          {/* Animated sparkle */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-12 w-12 animate-spin text-[var(--tk-color-primary-500)]"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-lg font-medium text-[var(--tk-color-text-primary)] animate-pulse">
            {FUN_LOADING_MESSAGES[funMessageIndex]}
          </p>
        </div>
      )
    }

    // Pro loading: 4 skeleton cards + spinner
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-2 py-4">
          <svg
            className="h-5 w-5 animate-spin text-[var(--tk-color-primary-500)]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-[var(--tk-color-text-secondary)]">Generating variations...</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-2xl bg-[var(--tk-color-surface-200)] dark:bg-[var(--tk-color-surface-700)]"
            />
          ))}
        </div>
      </div>
    )
  }

  if (variations.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-3">
      {variations.map((variation, index) => {
        const isSelected = selectedIndex === index
        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            className={`group relative overflow-hidden rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)] ${
              isSelected
                ? 'ring-2 ring-[var(--tk-color-primary-500)] ring-offset-2 dark:ring-offset-[var(--tk-color-surface-900)]'
                : 'ring-1 ring-[var(--tk-color-surface-300)] dark:ring-[var(--tk-color-surface-600)]'
            } ${isFun && isSelected ? 'scale-105' : ''}`}
          >
            <div className="relative aspect-square">
              <Image
                src={variation.imageUrl}
                alt={`Art variation ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              {/* Checkmark overlay for selected */}
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--tk-color-primary-500)] text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-6 w-6"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
