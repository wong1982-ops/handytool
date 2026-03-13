'use client'

import { useState, useRef } from 'react'
import { GEMINI_VOICES, type GeminiVoice } from '@/lib/story/voices'

interface VoicePickerProps {
  selectedVoice: string | null
  onSelect: (voiceName: string | null) => void
  characterName?: string
}

export function VoicePicker({ selectedVoice, onSelect, characterName }: VoicePickerProps) {
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all')
  const [ageFilter, setAgeFilter] = useState<string>('all')
  const [styleFilter, setStyleFilter] = useState<string>('all')
  const [previewVoice, setPreviewVoice] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const filteredVoices = GEMINI_VOICES.filter(v => {
    if (genderFilter !== 'all' && v.gender !== genderFilter) return false
    if (ageFilter !== 'all' && v.age !== ageFilter) return false
    if (styleFilter !== 'all' && v.style !== styleFilter) return false
    return true
  })

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
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterGroup
          label="Gender"
          options={['all', 'female', 'male']}
          value={genderFilter}
          onChange={v => setGenderFilter(v as typeof genderFilter)}
        />
        <FilterGroup
          label="Age"
          options={['all', 'young', 'adult', 'mature']}
          value={ageFilter}
          onChange={setAgeFilter}
        />
        <FilterGroup
          label="Style"
          options={['all', 'bright', 'calm', 'energetic', 'serious', 'warm']}
          value={styleFilter}
          onChange={setStyleFilter}
        />
      </div>

      {/* Auto-assign option */}
      <button
        onClick={() => onSelect(null)}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
          selectedVoice === null
            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
        style={{ minHeight: '44px' }}
      >
        Auto-assign voice
      </button>

      {/* Voice list */}
      <div className="max-h-48 overflow-y-auto space-y-1">
        {filteredVoices.map(voice => {
          const isSelected = selectedVoice === voice.name
          const isPreviewing = previewVoice === voice.name
          return (
            <div
              key={voice.name}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                isSelected
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <button
                onClick={() => onSelect(voice.name)}
                className="flex-1 text-left cursor-pointer"
                style={{ minHeight: '36px' }}
              >
                <span className={isSelected ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-slate-700 dark:text-slate-300'}>
                  {voice.name}
                </span>
                <span className="ml-2 text-xs text-slate-400">
                  {voice.gender} · {voice.age} · {voice.style}
                </span>
              </button>
              <button
                onClick={() => handlePreview(voice)}
                className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer"
                aria-label={`Preview ${voice.name}`}
              >
                {isPreviewing ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>
          )
        })}
        {filteredVoices.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">No voices match filters</p>
        )}
      </div>
    </div>
  )
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-slate-400 mr-1">{label}:</span>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
            value === opt
              ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {opt === 'all' ? 'All' : opt.charAt(0).toUpperCase() + opt.slice(1)}
        </button>
      ))}
    </div>
  )
}
