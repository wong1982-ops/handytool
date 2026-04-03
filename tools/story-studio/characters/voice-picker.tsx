'use client'

import { useState, useRef } from 'react'
import { GEMINI_VOICES, type GeminiVoice } from '@/lib/story/voices'

interface VoicePickerProps {
  selectedVoice: string | null
  onSelect: (voiceName: string | null) => void
  characterName?: string
}

const GENDER_ICONS: Record<string, string> = {
  female: '♀',
  male: '♂',
}

const STYLE_COLORS: Record<string, string> = {
  bright: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  calm: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
  energetic: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
  serious: 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  warm: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
}

export function VoicePicker({ selectedVoice, onSelect, characterName }: VoicePickerProps) {
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all')
  const [styleFilter, setStyleFilter] = useState<string>('all')
  const [previewVoice, setPreviewVoice] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const filteredVoices = GEMINI_VOICES.filter(v => {
    if (genderFilter !== 'all' && v.gender !== genderFilter) return false
    if (styleFilter !== 'all' && v.style !== styleFilter) return false
    return true
  })

  // Group by age for visual sections
  const grouped = {
    young: filteredVoices.filter(v => v.age === 'young'),
    adult: filteredVoices.filter(v => v.age === 'adult'),
    mature: filteredVoices.filter(v => v.age === 'mature'),
  }

  async function handlePreview(voice: GeminiVoice) {
    if (previewLoading) return
    if (previewVoice === voice.name) {
      audioRef.current?.pause()
      setPreviewVoice(null)
      return
    }

    setPreviewLoading(true)
    setPreviewVoice(voice.name)
    try {
      const res = await fetch('/api/v1/story/voice-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceName: voice.name,
          characterName: characterName || 'this character',
        }),
      })
      if (!res.ok) throw new Error('Preview failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      if (audioRef.current) {
        audioRef.current.pause()
        URL.revokeObjectURL(audioRef.current.src)
      }
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => setPreviewVoice(null)
      await audio.play()
    } catch {
      setPreviewVoice(null)
    } finally {
      setPreviewLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Gender toggle */}
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {(['all', 'female', 'male'] as const).map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setGenderFilter(g)}
              className={`px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                genderFilter === g
                  ? 'bg-[#3D6AF2] text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {g === 'all' ? 'All' : `${GENDER_ICONS[g]} ${g.charAt(0).toUpperCase() + g.slice(1)}`}
            </button>
          ))}
        </div>

        {/* Style pills */}
        <div className="flex flex-wrap gap-1">
          {['all', 'bright', 'calm', 'energetic', 'serious', 'warm'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStyleFilter(s)}
              className={`px-2 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                styleFilter === s
                  ? s === 'all'
                    ? 'bg-[#3D6AF2]/15 bg-[#3D6AF2]/15 text-[#3D6AF2] dark:text-[#93aaff]'
                    : STYLE_COLORS[s]
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {s === 'all' ? 'All styles' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Auto-assign option */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer border ${
          selectedVoice === null
            ? 'bg-[#3D6AF2]/10 dark:bg-[#3D6AF2]/15 text-[#3D6AF2] dark:text-[#93aaff] border-[#1e2631] dark:border-[#1e2631]'
            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        style={{ minHeight: '44px' }}
      >
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
        Auto-assign based on character traits
      </button>

      {/* Voice cards grouped by age */}
      <div className="max-h-64 overflow-y-auto space-y-4 pr-1">
        {(['young', 'adult', 'mature'] as const).map(age => {
          const voices = grouped[age]
          if (voices.length === 0) return null
          return (
            <div key={age}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {age === 'young' ? 'Young' : age === 'adult' ? 'Adult' : 'Mature'}
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {voices.map(voice => (
                  <VoiceCard
                    key={voice.name}
                    voice={voice}
                    isSelected={selectedVoice === voice.name}
                    isPreviewing={previewVoice === voice.name}
                    isLoading={previewLoading && previewVoice === voice.name}
                    onSelect={() => onSelect(voice.name)}
                    onPreview={() => handlePreview(voice)}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {filteredVoices.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-6">No voices match your filters</p>
        )}
      </div>
    </div>
  )
}

function VoiceCard({
  voice, isSelected, isPreviewing, isLoading, onSelect, onPreview,
}: {
  voice: GeminiVoice
  isSelected: boolean
  isPreviewing: boolean
  isLoading: boolean
  onSelect: () => void
  onPreview: () => void
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer ${
        isSelected
          ? 'bg-[#3D6AF2]/10 dark:bg-[#3D6AF2]/15 ring-1 ring-indigo-300 dark:ring-indigo-700'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
      }`}
      onClick={onSelect}
    >
      {/* Gender icon */}
      <span className={`text-base leading-none ${
        voice.gender === 'female'
          ? 'text-pink-400 dark:text-pink-500'
          : 'text-blue-400 dark:text-blue-500'
      }`}>
        {GENDER_ICONS[voice.gender]}
      </span>

      {/* Name + tone */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${
            isSelected
              ? 'text-[#3D6AF2] dark:text-[#93aaff]'
              : 'text-slate-700 dark:text-slate-300'
          }`}>
            {voice.name}
          </span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${STYLE_COLORS[voice.style]}`}>
            {voice.style}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">{voice.tone} voice</p>
      </div>

      {/* Preview button */}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onPreview() }}
        disabled={isLoading}
        className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
          isPreviewing
            ? 'bg-[#3D6AF2]/15 bg-[#3D6AF2]/15 text-[#3D6AF2] dark:text-[#93aaff]'
            : 'text-slate-400 hover:text-[#3D6AF2] hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        aria-label={`Preview ${voice.name}`}
      >
        {isLoading ? (
          <div className="w-3.5 h-3.5 border-2 border-[#3D6AF2] border-t-transparent rounded-full animate-spin" />
        ) : isPreviewing ? (
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </div>
  )
}
