'use client'

import Image from 'next/image'
import type { LogoConcept } from '@/tools/logo-generator/types'
import { AILoadingSpinner } from '@/components/ui/ai-loading-spinner'

interface ConceptsGridProps {
  concepts: LogoConcept[]
  selectedIndex: number | null
  loading: boolean
  onSelect: (index: number) => void
  onRegenerate: () => void
  onNext: () => void
  onBack: () => void
}

const LOADING_MESSAGES = [
  'Sketching concepts...',
  'Mixing colors...',
  'Perfecting typography...',
  'Adding finishing touches...',
  'Almost there...',
]

export default function ConceptsGrid({
  concepts,
  selectedIndex,
  loading,
  onSelect,
  onRegenerate,
  onNext,
  onBack,
}: ConceptsGridProps) {
  if (loading) {
    return (
      <AILoadingSpinner
        messages={LOADING_MESSAGES}
        subtitle="Generating 12 logo concepts"
        icon={
          <svg className="w-8 h-8 text-[#93aaff]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" />
          </svg>
        }
        interval={2000}
      />
    )
  }

  if (concepts.length === 0) return null

  return (
    <div className="flex flex-col gap-6">
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {concepts.map((concept, index) => {
          const isSelected = selectedIndex === index
          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Select logo concept ${index + 1}: ${concept.variation}`}
              aria-pressed={isSelected}
              className={[
                'relative aspect-square rounded-2xl overflow-hidden bg-white cursor-pointer group',
                'transition-all duration-200',
                'hover:shadow-xl hover:scale-[1.02]',
                'focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] focus:ring-offset-2 focus:ring-offset-[#090f16]',
                isSelected
                  ? 'shadow-[0_0_0_3px_#3D6AF2,0_0_20px_rgba(61,106,242,0.4)]'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {/* Logo image */}
              <div className="relative w-full h-full">
                <Image
                  src={concept.imageUrl}
                  alt={`Logo concept ${index + 1}: ${concept.variation}`}
                  fill
                  className="object-contain"
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>

              {/* Selected checkmark overlay */}
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <svg
                      className="w-6 h-6 text-[#3D6AF2]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Variation label on hover */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <p className="text-white text-[10px] font-medium truncate text-center">{concept.variation}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Regenerate */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onRegenerate}
          className="inline-flex items-center gap-2 rounded-xl border border-[#1e2631] bg-transparent px-5 py-2.5 text-sm font-medium text-[#a6abb5] hover:border-[#3D6AF2] hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] focus:ring-offset-2 focus:ring-offset-[#090f16] cursor-pointer"
          aria-label="Regenerate logo concepts"
        >
          {/* Refresh icon */}
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          Regenerate
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-[#2a3344] bg-transparent px-5 py-2.5 text-sm font-medium text-[#a6abb5] hover:border-[#3D6AF2] hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] focus:ring-offset-2 focus:ring-offset-[#090f16] cursor-pointer"
        >
          {/* Back chevron */}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={selectedIndex === null}
          aria-disabled={selectedIndex === null}
          className={[
            'inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] focus:ring-offset-2 focus:ring-offset-[#090f16]',
            selectedIndex !== null
              ? 'bg-[#3D6AF2] text-white hover:bg-[#3D79F2] cursor-pointer shadow-[0_0_16px_rgba(61,106,242,0.4)]'
              : 'bg-[#1e2631] text-[#4a5568] cursor-not-allowed',
          ].join(' ')}
        >
          Customize This Logo
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  )
}
