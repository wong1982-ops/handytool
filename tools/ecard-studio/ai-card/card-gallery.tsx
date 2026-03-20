'use client'

import type { GeneratedDesign } from '@/tools/ecard-studio/ai-card/types'

interface CardGalleryProps {
  designs: GeneratedDesign[]
  selectedIndex: number | null
  onSelect: (index: number) => void
  loading: boolean
}

export function CardGallery({
  designs,
  selectedIndex,
  onSelect,
  loading,
}: CardGalleryProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-center text-sm font-medium text-[var(--tk-color-text-secondary)] animate-pulse">
          Designing your cards...
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-48 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (designs.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-[var(--tk-color-text-secondary)]">
        Choose a design to refine
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {designs.map((design, index) => {
          const isSelected = selectedIndex === index
          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(index)}
              className={`group relative flex flex-col gap-2 rounded-xl p-1 transition-all
                ${
                  isSelected
                    ? 'border-2 border-[var(--tk-color-primary-500)] ring-2 ring-[var(--tk-color-primary-500)]/20'
                    : 'border-2 border-transparent hover:border-[var(--tk-color-border)]'
                }`}
            >
              {/* Card image */}
              <div className="aspect-[3.5/2] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={design.imageUrl}
                  alt={`${design.style} card design`}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Style label */}
              <span className="text-xs font-medium capitalize text-[var(--tk-color-text-secondary)]">
                {design.style}
              </span>

              {/* Selected checkmark badge */}
              {isSelected && (
                <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--tk-color-primary-500)] text-white shadow">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
