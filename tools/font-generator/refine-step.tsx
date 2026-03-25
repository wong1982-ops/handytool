'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FULL_CHARS, FontCharacter } from './types'

interface RefineStepProps {
  characters: FontCharacter[]
  regeneratingChar: string | null
  onRegenerate: (char: string) => void
  onNext: () => void
  onBack: () => void
}

export function RefineStep({ characters, regeneratingChar, onRegenerate, onNext, onBack }: RefineStepProps) {
  const [regeneratedCount, setRegeneratedCount] = useState(0)
  const charMap = new Map(characters.map((c) => [c.char, c]))

  const handleRegenerate = (char: string) => {
    if (regeneratingChar) return
    setRegeneratedCount((n) => n + 1)
    onRegenerate(char)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <p className="text-sm text-[#a6abb5]">
          Click any character to regenerate it
        </p>
        {regeneratedCount > 0 && (
          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-[#3D6AF2]/15 text-[#93aaff] text-xs font-medium">
            {regeneratedCount} regenerated
          </span>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {FULL_CHARS.map((char) => {
          const found = charMap.get(char)
          const isRegenerating = regeneratingChar === char

          if (found) {
            return (
              <div key={char} className="flex flex-col items-center gap-1.5">
                <span className="text-xs font-medium text-[#a6abb5]">{char}</span>
                <button
                  type="button"
                  onClick={() => handleRegenerate(char)}
                  disabled={!!regeneratingChar}
                  className="relative w-full aspect-square rounded-xl bg-white flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#3D6AF2]/50 transition-all group disabled:cursor-not-allowed"
                >
                  <Image
                    src={found.imageUrl}
                    alt={`Character ${char}`}
                    width={120}
                    height={120}
                    className="object-contain w-full h-full p-1"
                  />

                  {/* Hover refresh icon overlay */}
                  {!isRegenerating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Spinner overlay */}
                  {isRegenerating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </button>
              </div>
            )
          }

          return (
            <div key={char} className="flex flex-col items-center gap-1.5">
              <span className="text-xs font-medium text-[#70767f]">{char}</span>
              <div className="w-full aspect-square rounded-xl border-2 border-dashed border-[#1e2631] flex items-center justify-center">
                <span className="text-[#70767f] text-lg">?</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-6 py-2.5 rounded-xl border border-[#1e2631] text-[#a6abb5] text-sm font-medium hover:bg-[#1e2631]/50 transition-colors cursor-pointer"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!!regeneratingChar}
          className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white text-sm font-semibold shadow-lg hover:shadow-[#3D6AF2]/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Next: Download
        </button>
      </div>
    </div>
  )
}
