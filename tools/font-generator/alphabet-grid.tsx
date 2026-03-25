'use client'

import Image from 'next/image'
import { FULL_CHARS, FontCharacter } from './types'

interface AlphabetGridProps {
  characters: FontCharacter[]
  loading: boolean
  totalExpected: number
  onNext: () => void
  onBack: () => void
}

export function AlphabetGrid({ characters, loading, totalExpected, onNext, onBack }: AlphabetGridProps) {
  const charMap = new Map(characters.map((c) => [c.char, c]))
  const generated = characters.length

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="text-center">
        <p className="text-sm text-[#a6abb5]">
          {loading ? (
            <>
              Generated{' '}
              <span className="text-white font-semibold">{generated}</span>
              <span className="text-[#70767f]">/{totalExpected}</span>{' '}
              characters...
            </>
          ) : (
            <>
              <span className="text-white font-semibold">{generated}</span>
              <span className="text-[#70767f]">/{totalExpected}</span>{' '}
              characters generated
            </>
          )}
        </p>

        {loading && (
          <div className="mt-2 w-full max-w-xs mx-auto h-1.5 bg-[#1e2631] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] rounded-full transition-all duration-500"
              style={{ width: `${(generated / totalExpected) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {FULL_CHARS.map((char) => {
          const found = charMap.get(char)

          if (found) {
            return (
              <div key={char} className="flex flex-col items-center gap-1.5">
                <span className="text-xs font-medium text-[#a6abb5]">{char}</span>
                <div className="w-full aspect-square rounded-xl bg-white flex items-center justify-center overflow-hidden">
                  <Image
                    src={found.imageUrl}
                    alt={`Character ${char}`}
                    width={120}
                    height={120}
                    className="object-contain w-full h-full p-1"
                  />
                </div>
              </div>
            )
          }

          if (loading) {
            return (
              <div key={char} className="flex flex-col items-center gap-1.5">
                <span className="text-xs font-medium text-[#70767f]">{char}</span>
                <div className="w-full aspect-square rounded-xl bg-[#1e2631] animate-pulse" />
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
          disabled={loading || generated < totalExpected}
          className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white text-sm font-semibold shadow-lg hover:shadow-[#3D6AF2]/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Next: Refine
        </button>
      </div>
    </div>
  )
}
