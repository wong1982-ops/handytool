'use client'

import { useRef, useState } from 'react'
import { ART_STYLES, getArtStyleLabel } from '@/tools/story-studio/use-characters'
import { useLanguage } from '@/tools/story-studio/use-language-context'
import { GEMINI_VOICES } from '@/lib/story/voices'

const NARRATOR_VOICES = GEMINI_VOICES.filter(v =>
  ['Enceladus', 'Aoede', 'Leda', 'Kore', 'Charon', 'Fenrir'].includes(v.name)
)

export interface MobileSettingsPanelProps {
  open: boolean
  artStyle: string | null
  onArtStyleChange: (style: string | null) => void
  pageCount: number
  onPageCountChange: (count: number) => void
  narratorVoice: string
  onNarratorVoiceChange: (voice: string) => void
  generateIllustrations: boolean
  onGenerateIllustrationsChange: (v: boolean) => void
  generateAudio: boolean
  onGenerateAudioChange: (v: boolean) => void
}

const PAGE_COUNT_OPTIONS = [4, 6, 8, 10]

export default function MobileSettingsPanel({
  open,
  artStyle,
  onArtStyleChange,
  pageCount,
  onPageCountChange,
  narratorVoice,
  onNarratorVoiceChange,
  generateIllustrations,
  onGenerateIllustrationsChange,
  generateAudio,
  onGenerateAudioChange,
}: MobileSettingsPanelProps) {
  const { t, language } = useLanguage()
  const [previewVoice, setPreviewVoice] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  async function handlePreview(voiceName: string) {
    if (previewLoading) return
    if (previewVoice === voiceName) {
      audioRef.current?.pause()
      setPreviewVoice(null)
      return
    }
    setPreviewLoading(true)
    setPreviewVoice(voiceName)
    try {
      const res = await fetch('/api/v1/story/voice-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceName, characterName: 'the narrator' }),
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      if (audioRef.current) { audioRef.current.pause(); URL.revokeObjectURL(audioRef.current.src) }
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => setPreviewVoice(null)
      await audio.play()
    } catch { setPreviewVoice(null) }
    finally { setPreviewLoading(false) }
  }

  if (!open) return null

  return (
    <div
      className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3 space-y-3 animate-in slide-in-from-bottom duration-200"
      role="region"
      aria-label="Settings panel"
    >
      {/* Art Style Section */}
      <div>
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
          {t.plotInput.artStyle}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ART_STYLES.map(style => {
            const isSelected = artStyle === style.value
            return (
              <button
                key={style.value}
                onClick={() => onArtStyleChange(isSelected ? null : style.value)}
                aria-pressed={isSelected}
                className={[
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  isSelected
                    ? 'bg-purple-600 text-white focus-visible:ring-purple-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 focus-visible:ring-slate-400',
                ].join(' ')}
              >
                {getArtStyleLabel(style, language)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Page Count Section */}
      <div>
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
          {t.common.pages}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PAGE_COUNT_OPTIONS.map(count => {
            const isSelected = pageCount === count
            return (
              <button
                key={count}
                onClick={() => onPageCountChange(count)}
                aria-pressed={isSelected}
                className={[
                  'px-3 py-2 rounded-full text-xs font-medium transition-all min-h-8 flex items-center',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  isSelected
                    ? 'bg-[#3D6AF2] text-white focus-visible:ring-[#3D6AF2]/50'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 focus-visible:ring-slate-400',
                ].join(' ')}
              >
                {count}
              </button>
            )
          })}
        </div>
      </div>

      {/* Generate toggles */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <button
            role="switch"
            aria-checked={generateIllustrations}
            onClick={() => onGenerateIllustrationsChange(!generateIllustrations)}
            className={[
              'relative w-10 h-6 rounded-full transition-colors shrink-0',
              generateIllustrations ? 'bg-[#3D6AF2]' : 'bg-slate-300 dark:bg-slate-600',
            ].join(' ')}
          >
            <span className={[
              'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
              generateIllustrations ? 'translate-x-4' : 'translate-x-0',
            ].join(' ')} />
          </button>
          <span className="text-xs text-slate-600 dark:text-slate-300">
            {language === 'zh' ? '生成插画' : 'Illustrations'}
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <button
            role="switch"
            aria-checked={generateAudio}
            onClick={() => onGenerateAudioChange(!generateAudio)}
            className={[
              'relative w-10 h-6 rounded-full transition-colors shrink-0',
              generateAudio ? 'bg-[#3D6AF2]' : 'bg-slate-300 dark:bg-slate-600',
            ].join(' ')}
          >
            <span className={[
              'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
              generateAudio ? 'translate-x-4' : 'translate-x-0',
            ].join(' ')} />
          </button>
          <span className="text-xs text-slate-600 dark:text-slate-300">
            {language === 'zh' ? '生成语音' : 'Narration'}
          </span>
        </label>
      </div>

      {/* Narrator Voice Section */}
      <div>
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
          {language === 'zh' ? '旁白声音' : 'Narrator Voice'}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {NARRATOR_VOICES.map(voice => {
            const isSelected = narratorVoice === voice.name
            const isPreviewing = previewVoice === voice.name
            return (
              <div key={voice.name} className="flex items-center gap-0.5">
                <button
                  onClick={() => onNarratorVoiceChange(voice.name)}
                  aria-pressed={isSelected}
                  className={[
                    'px-3 py-1.5 rounded-l-full text-xs font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    isSelected
                      ? 'bg-[#3D6AF2] text-white focus-visible:ring-[#3D6AF2]/50'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 focus-visible:ring-slate-400',
                  ].join(' ')}
                >
                  {voice.name}
                  <span className="ml-1 opacity-60 text-[10px]">{voice.gender === 'female' ? '♀' : '♂'}</span>
                </button>
                <button
                  onClick={() => handlePreview(voice.name)}
                  className={[
                    'w-7 h-7 flex items-center justify-center rounded-r-full transition-colors',
                    isSelected
                      ? 'bg-[#3D6AF2]/80 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-[#3D6AF2]',
                  ].join(' ')}
                  aria-label={`${language === 'zh' ? '试听' : 'Preview'} ${voice.name}`}
                >
                  {isPreviewing ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                  ) : (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
