'use client'

import { useState } from 'react'
import {
  ART_STYLES,
  estimateCredits,
  type ArtStyle,
  type DurationPreset,
} from '@/tools/story-video/types'

const DURATION_OPTIONS: { id: DurationPreset; label: string; credits?: string }[] = [
  { id: 'auto', label: 'Auto' },
  { id: 'short', label: 'Short', credits: '5 cr' },
  { id: 'medium', label: 'Medium', credits: '10 cr' },
  { id: 'long', label: 'Long', credits: '20 cr' },
]

interface SettingsFormProps {
  selectedBook: { id: string; title: string; pageCount: number } | null
  onGenerate: (settings: { artStyle: ArtStyle; targetDuration: DurationPreset }) => void
  generating: boolean
}

export default function SettingsForm({ selectedBook, onGenerate, generating }: SettingsFormProps) {
  const [artStyle, setArtStyle] = useState<ArtStyle>('cartoon')
  const [duration, setDuration] = useState<DurationPreset>('auto')

  const credits = selectedBook ? estimateCredits(selectedBook.pageCount, duration) : 0
  const disabled = !selectedBook || generating

  return (
    <section className="space-y-5">
      {/* Art Style */}
      <div>
        <h2 className="text-xs font-medium text-[#a6abb5] mb-3">Art Style</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ART_STYLES.map((style) => {
            const isSelected = artStyle === style.id
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => setArtStyle(style.id)}
                className={`
                  rounded-xl p-3 text-left transition-all cursor-pointer min-h-[44px]
                  ${isSelected
                    ? 'bg-[#131a23] border border-[#3D6AF2] shadow-[0_0_0_3px_#3D6AF2,0_0_20px_rgba(61,106,242,0.4)]'
                    : 'bg-[#131a23] border border-[#1e2631] hover:border-[#3D6AF2]/30 hover:bg-[#1e2631]'}
                `}
              >
                <div className={`text-xs font-bold bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent`}>
                  {style.name}
                </div>
                <p className="text-[#70767f] text-[10px] mt-1 leading-tight">{style.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Duration */}
      <div>
        <h2 className="text-xs font-medium text-[#a6abb5] mb-3">Duration</h2>
        <div className="flex gap-2 flex-wrap">
          {DURATION_OPTIONS.map((opt) => {
            const isSelected = duration === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDuration(opt.id)}
                className={`
                  px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer min-h-[44px]
                  ${isSelected
                    ? 'bg-[#3D6AF2] text-white'
                    : 'bg-[#131a23] text-[#a6abb5] border border-[#1e2631] hover:border-[#3D6AF2]/30'}
                `}
              >
                {opt.label}
                {opt.credits && (
                  <span className="ml-1 text-[10px] text-[#70767f] font-normal">{opt.credits}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Credit Estimate + Generate */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onGenerate({ artStyle, targetDuration: duration })}
          className="
            bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white font-semibold
            rounded-xl min-h-[44px] px-6 py-3 text-sm cursor-pointer
            disabled:opacity-40 disabled:cursor-not-allowed transition-opacity
            flex items-center gap-2
          "
        >
          {generating ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Generate Video
              {selectedBook && (
                <span className="text-xs font-medium bg-[#7C3AED]/30 text-[#c084fc] px-2 py-0.5 rounded-full">
                  {credits} credits
                </span>
              )}
            </>
          )}
        </button>

        {!selectedBook && (
          <p className="text-[#70767f] text-xs">Select a book to get started</p>
        )}
      </div>
    </section>
  )
}
