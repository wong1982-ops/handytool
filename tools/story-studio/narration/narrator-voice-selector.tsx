'use client'

import { useRef, useState } from 'react'
import { GEMINI_VOICES, type GeminiVoice } from '@/lib/story/voices'

const NARRATOR_VOICES = GEMINI_VOICES.filter(v =>
  ['Enceladus', 'Aoede', 'Leda', 'Kore', 'Charon', 'Fenrir'].includes(v.name)
)

interface NarratorVoiceSelectorProps {
  selectedVoice: string
  onSelect: (voiceName: string) => void
}

export function NarratorVoiceSelector({ selectedVoice, onSelect }: NarratorVoiceSelectorProps) {
  const [previewVoice, setPreviewVoice] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

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
        body: JSON.stringify({ voiceName: voice.name, characterName: 'the narrator' }),
      })
      if (!res.ok) throw new Error()
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
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Narrator Voice</label>
      <div className="flex flex-wrap gap-2">
        {NARRATOR_VOICES.map(voice => {
          const isSelected = selectedVoice === voice.name
          const isPreviewing = previewVoice === voice.name
          return (
            <div
              key={voice.name}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                isSelected
                  ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <button
                onClick={() => onSelect(voice.name)}
                className="text-sm font-medium cursor-pointer"
                style={{ minHeight: '36px' }}
              >
                <span className={isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}>
                  {voice.name}
                </span>
                <span className="ml-1 text-[10px] text-slate-400">
                  {voice.gender} · {voice.style}
                </span>
              </button>
              <button
                onClick={() => handlePreview(voice)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-indigo-500 cursor-pointer"
                aria-label={`Preview ${voice.name}`}
              >
                {isPreviewing ? (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
