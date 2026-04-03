'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'
import { useSeriesList, useSeriesDetail, type SeriesCharacter } from '@/tools/story-studio/use-series'

import { GEMINI_VOICES, VOICE_GENDERS, VOICE_AGES, VOICE_STYLES, type VoiceGender, type VoiceAge, type VoiceStyle } from '@/lib/story/voices'
import { ART_STYLES } from '@/lib/story/styles'

const VOICE_SAMPLE_BASE_URL = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-8feef024ac6a4d26b109ddfe22f033c1.r2.dev'}/voice-samples/`

const FILTER_LABELS = {
  gender: { female: 'Female', male: 'Male' },
  age: { young: 'Young', adult: 'Adult', mature: 'Mature' },
  style: { bright: 'Bright', calm: 'Calm', energetic: 'Energetic', serious: 'Serious', warm: 'Warm' },
} as const

function VoicePicker({
  value,
  onChange,
  characterName,
  genderFilter,
  ageFilter,
  styleFilter,
  onGenderChange,
  onAgeChange,
  onStyleChange,
}: {
  value: string
  onChange: (v: string) => void
  characterName?: string
  genderFilter: VoiceGender | ''
  ageFilter: VoiceAge | ''
  styleFilter: VoiceStyle | ''
  onGenderChange: (v: VoiceGender | '') => void
  onAgeChange: (v: VoiceAge | '') => void
  onStyleChange: (v: VoiceStyle | '') => void
}) {
  const [previewing, setPreviewing] = useState<string | null>(null)
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null)

  const handlePreview = (voiceName: string) => {
    // Stop current preview
    if (previewAudio) {
      previewAudio.pause()
      previewAudio.currentTime = 0
    }

    if (previewing === voiceName) {
      setPreviewing(null)
      setPreviewAudio(null)
      return
    }

    setPreviewing(voiceName)
    const sampleUrl = `${VOICE_SAMPLE_BASE_URL}${voiceName.toLowerCase()}.wav`
    const audio = new Audio(sampleUrl)
    audio.onended = () => { setPreviewing(null); setPreviewAudio(null) }
    audio.onerror = () => { setPreviewing(null); setPreviewAudio(null) }
    setPreviewAudio(audio)
    audio.play()
  }

  const filtered = GEMINI_VOICES.filter(v =>
    (!genderFilter || v.gender === genderFilter) &&
    (!ageFilter || v.age === ageFilter) &&
    (!styleFilter || v.style === styleFilter)
  )

  const hasFilters = genderFilter || ageFilter || styleFilter

  return (
    <div className="mt-1 space-y-1.5">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-1">
        {/* Gender */}
        {VOICE_GENDERS.map(g => (
          <button
            key={g}
            type="button"
            onClick={() => onGenderChange(genderFilter === g ? '' : g)}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              genderFilter === g
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {FILTER_LABELS.gender[g]}
          </button>
        ))}
        <span className="w-px h-5 bg-slate-200 dark:bg-slate-700 self-center" />
        {/* Age */}
        {VOICE_AGES.map(a => (
          <button
            key={a}
            type="button"
            onClick={() => onAgeChange(ageFilter === a ? '' : a)}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              ageFilter === a
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {FILTER_LABELS.age[a]}
          </button>
        ))}
        <span className="w-px h-5 bg-slate-200 dark:bg-slate-700 self-center" />
        {/* Style */}
        {VOICE_STYLES.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => onStyleChange(styleFilter === s ? '' : s)}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              styleFilter === s
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {FILTER_LABELS.style[s]}
          </button>
        ))}
        {hasFilters && (
          <>
            <span className="w-px h-5 bg-slate-200 dark:bg-slate-700 self-center" />
            <button
              type="button"
              onClick={() => { onGenderChange(''); onAgeChange(''); onStyleChange('') }}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </>
        )}
      </div>

      {/* Voice list */}
      <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700/50">
        <button
          type="button"
          onClick={() => onChange('')}
          className={`w-full text-left px-3 py-1.5 text-sm transition-colors cursor-pointer ${
            !value ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-medium' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
          }`}
        >
          Auto-assign voice
        </button>
        {filtered.map(v => (
          <div
            key={v.name}
            className={`flex items-center gap-1 px-3 py-1.5 transition-colors ${
              value === v.name ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <button
              type="button"
              onClick={() => onChange(v.name)}
              className={`flex-1 text-left text-sm cursor-pointer ${
                value === v.name ? 'text-indigo-700 dark:text-indigo-400 font-medium' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {v.name} <span className="text-slate-400 dark:text-slate-500">— {v.tone}</span>
            </button>
            <button
              type="button"
              onClick={() => handlePreview(v.name)}
              disabled={previewing !== null && previewing !== v.name}
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title={`Preview ${v.name}`}
            >
              {previewing === v.name ? (
                <svg className="w-3.5 h-3.5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg>
              )}
            </button>
          </div>
        ))}
      </div>
      {hasFilters && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          {filtered.length} of {GEMINI_VOICES.length} voices
        </p>
      )}
    </div>
  )
}

function CharacterCard({
  character,
  isOwner,
  refining,
  onRefine,
  onApprove,
  onDelete,
  onUpdate,
}: {
  character: SeriesCharacter
  isOwner: boolean
  refining: boolean
  onRefine: (id: string, description: string, feedback?: string) => Promise<void>
  onApprove: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: { name?: string; description?: string; voice?: string | null }) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(character.name)
  const [editDesc, setEditDesc] = useState(character.description)
  const [editVoice, setEditVoice] = useState(character.voice || '')
  const [feedback, setFeedback] = useState(character.description)
  const [showFeedback, setShowFeedback] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [cardAudio, setCardAudio] = useState<HTMLAudioElement | null>(null)
  const [voiceGender, setVoiceGender] = useState<VoiceGender | ''>('')
  const [voiceAge, setVoiceAge] = useState<VoiceAge | ''>('')
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle | ''>('')

  const playVoiceSample = (voiceName: string) => {
    if (cardAudio) { cardAudio.pause(); cardAudio.currentTime = 0 }
    if (playingVoice === voiceName) { setPlayingVoice(null); setCardAudio(null); return }
    setPlayingVoice(voiceName)
    const audio = new Audio(`${VOICE_SAMPLE_BASE_URL}${voiceName.toLowerCase()}.wav`)
    audio.onended = () => { setPlayingVoice(null); setCardAudio(null) }
    audio.onerror = () => { setPlayingVoice(null); setCardAudio(null) }
    setCardAudio(audio)
    audio.play()
  }

  const handleGeneratePortrait = async () => {
    setLocalError(null)
    try {
      await onRefine(character.id, character.description)
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to generate portrait')
    }
  }

  const handleRefineWithFeedback = async () => {
    if (!feedback.trim()) return
    setLocalError(null)
    try {
      await onRefine(character.id, character.description, feedback)
      setFeedback(character.description)
      setShowFeedback(false)
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Refinement failed')
    }
  }

  const handleSaveEdit = () => {
    onUpdate(character.id, { name: editName, description: editDesc, voice: editVoice || null })
    setEditing(false)
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Portrait */}
          <div
            className={`relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800 ${character.referenceImageUrl && !refining ? 'cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all' : ''}`}
            onClick={() => { if (character.referenceImageUrl && !refining) setShowPreview(true) }}
          >
            {character.referenceImageUrl ? (
              <img
                src={character.referenceImageUrl}
                alt={character.name}
                className={`w-full h-full object-cover transition-opacity ${refining ? 'opacity-40' : ''}`}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center transition-opacity ${refining ? 'opacity-40' : ''}`}>
                <div className="text-center">
                  <svg className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">No portrait</span>
                </div>
              </div>
            )}
            {/* Loading overlay during generate/refine */}
            {refining && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px]">
                <svg className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-[9px] font-medium text-indigo-600 dark:text-indigo-400 mt-1">
                  {character.referenceImageUrl ? 'Refining...' : 'Generating...'}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {editing ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-base font-bold text-slate-900 dark:text-white bg-transparent border-b border-indigo-500 outline-none"
                />
              ) : (
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{character.name}</h3>
              )}
              {character.status === 'approved' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Approved
                </span>
              )}
              {character.status === 'draft' && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-semibold">
                  Draft
                </span>
              )}
            </div>

            {editing ? (
              <>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full text-sm text-slate-600 dark:text-slate-400 bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <VoicePicker
                  value={editVoice}
                  onChange={setEditVoice}
                  characterName={character.name}
                  genderFilter={voiceGender}
                  ageFilter={voiceAge}
                  styleFilter={voiceStyle}
                  onGenderChange={setVoiceGender}
                  onAgeChange={setVoiceAge}
                  onStyleChange={setVoiceStyle}
                />
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{character.description}</p>
                {character.voice && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); playVoiceSample(character.voice!) }}
                    className="text-[11px] text-indigo-500 dark:text-indigo-400 mt-1 flex items-center gap-1 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                    title={`Preview ${character.voice} voice`}
                  >
                    <svg className={`w-3 h-3 ${playingVoice === character.voice ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                    </svg>
                    {character.voice}
                  </button>
                )}
              </>
            )}

            {character.referenceImageUrl && character.refinementCount > 0 && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {character.refinementCount}/5 refinements used
              </p>
            )}
          </div>
        </div>

        {localError && (
          <div className="mt-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs">
            {localError}
            <button onClick={() => setLocalError(null)} className="ml-2 underline cursor-pointer">Dismiss</button>
          </div>
        )}

        {/* Feedback input */}
        {showFeedback && isOwner && (
          <div className="mt-3 space-y-2">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={refining}
              rows={3}
              placeholder="e.g. Make her hair longer, add freckles, change outfit to a blue dress..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex gap-2">
              <button
                onClick={handleRefineWithFeedback}
                disabled={refining || !feedback.trim()}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-purple-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                style={{ minHeight: '40px' }}
              >
                {refining ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Refining...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    Refine
                  </>
                )}
              </button>
              <button
                onClick={() => { setShowFeedback(false); setFeedback(character.description) }}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                style={{ minHeight: '40px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {isOwner && (
        <div className="px-5 pb-4 flex flex-wrap gap-2">
          {editing ? (
            <>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Save
              </button>
              <button
                onClick={() => { setEditing(false); setEditName(character.name); setEditDesc(character.description) }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {!character.referenceImageUrl ? (
                <button
                  onClick={handleGeneratePortrait}
                  disabled={refining}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  style={{ minHeight: '44px' }}
                >
                  {refining ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      Generate Portrait (10 credits)
                    </>
                  )}
                </button>
              ) : character.status !== 'approved' && character.refinementCount < 5 ? (
                <button
                  onClick={() => setShowFeedback(true)}
                  disabled={refining}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors cursor-pointer disabled:opacity-50"
                  style={{ minHeight: '44px' }}
                >
                  Refine Portrait (free)
                </button>
              ) : null}

              {character.referenceImageUrl && character.status !== 'approved' && (
                <button
                  onClick={() => onApprove(character.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
                  style={{ minHeight: '44px' }}
                >
                  Approve
                </button>
              )}

              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Edit
              </button>

              <button
                onClick={() => onDelete(character.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Remove
              </button>
            </>
          )}
        </div>
      )}

      {/* Portrait preview modal */}
      {showPreview && character.referenceImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative max-w-lg w-full rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={character.referenceImageUrl}
              alt={character.name}
              className="w-full object-contain max-h-[70vh]"
            />
            <div className="p-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">{character.name}</h3>
              {isOwner && character.status !== 'approved' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => { onApprove(character.id); setShowPreview(false) }}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition-colors cursor-pointer"
                    style={{ minHeight: '44px' }}
                  >
                    Approve
                  </button>
                  {character.refinementCount < 5 && (
                    <button
                      onClick={() => { setShowPreview(false); setShowFeedback(true) }}
                      className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors cursor-pointer"
                      style={{ minHeight: '44px' }}
                    >
                      Refine ({5 - character.refinementCount} left)
                    </button>
                  )}
                </div>
              )}
              {character.status === 'approved' && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Approved
                </p>
              )}
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SeriesDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const {
    detail, loading, error, setError, refiningCharId,
    updateSeries, addCharacter, updateCharacter, deleteCharacter,
    refineCharacter, approveCharacter, duplicateCharacter,
  } = useSeriesDetail(id)

  // For importing characters from other series
  const { series: allSeries } = useSeriesList()
  const otherSeries = allSeries.filter(s => s.id !== id)

  const [showAddChar, setShowAddChar] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importing, setImporting] = useState(false)
  const [newCharName, setNewCharName] = useState('')
  const [newCharDesc, setNewCharDesc] = useState('')
  const [newCharVoice, setNewCharVoice] = useState('')
  const [addVoiceGender, setAddVoiceGender] = useState<VoiceGender | ''>('')
  const [addVoiceAge, setAddVoiceAge] = useState<VoiceAge | ''>('')
  const [addVoiceStyle, setAddVoiceStyle] = useState<VoiceStyle | ''>('')
  const [addingChar, setAddingChar] = useState(false)
  const [editingSeries, setEditingSeries] = useState(false)
  const [seriesForm, setSeriesForm] = useState({ title: '', description: '', setting: '', artStyle: '' })

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10 animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 md:p-6">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-3" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          </div>
          {/* Characters skeleton */}
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-24" />
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10 flex flex-col items-center justify-center gap-4 py-20">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Series Not Found</h1>
        <Link
          href="/tools/story-studio/series"
          className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
        >
          Back to My Series
        </Link>
      </div>
    )
  }

  const approvedCount = detail.characters.filter(c => c.status === 'approved').length
  const isReady = approvedCount > 0

  const handleAddCharacter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCharName.trim() || !newCharDesc.trim()) return
    setAddingChar(true)
    try {
      await addCharacter(newCharName.trim(), newCharDesc.trim(), newCharVoice || null)
      setNewCharName('')
      setNewCharDesc('')
      setNewCharVoice('')
      setShowAddChar(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add character')
    } finally {
      setAddingChar(false)
    }
  }

  const handleRefine = async (charId: string, description: string, feedback?: string) => {
    await refineCharacter(charId, description, feedback)
  }

  const startEditSeries = () => {
    setSeriesForm({
      title: detail.title,
      description: detail.description,
      setting: detail.setting,
      artStyle: detail.artStyle,
    })
    setEditingSeries(true)
  }

  const saveSeries = async () => {
    await updateSeries({ ...seriesForm })
    setEditingSeries(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
      {/* Back link */}
        <Link
          href="/tools/story-studio/series"
          className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to My Series
        </Link>

        {/* Series header */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 mb-6">
          {editingSeries ? (
            <div className="space-y-3">
              <input
                value={seriesForm.title}
                onChange={(e) => setSeriesForm(f => ({ ...f, title: e.target.value }))}
                className="w-full text-xl font-bold text-slate-900 dark:text-white bg-transparent border-b border-indigo-500 outline-none pb-1"
              />
              <textarea
                value={seriesForm.description}
                onChange={(e) => setSeriesForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full text-sm text-slate-600 dark:text-slate-400 bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <input
                value={seriesForm.setting}
                onChange={(e) => setSeriesForm(f => ({ ...f, setting: e.target.value }))}
                className="w-full text-sm text-slate-600 dark:text-slate-400 bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Setting"
              />
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Art Style</label>
                <div className="flex flex-wrap gap-1.5">
                  {ART_STYLES.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setSeriesForm(f => ({ ...f, artStyle: style }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        seriesForm.artStyle === style
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                      style={{ minHeight: '32px' }}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={saveSeries} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 cursor-pointer" style={{ minHeight: '40px' }}>Save</button>
                <button onClick={() => setEditingSeries(false)} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer" style={{ minHeight: '40px' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1">{detail.title}</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{detail.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      {detail.setting}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                      </svg>
                      {detail.artStyle}
                    </span>
                    <span>{detail.books.length} book{detail.books.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                {detail.isOwner && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={startEditSeries}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      style={{ minHeight: '44px' }}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Ready status */}
              {detail.isOwner && (
                <div className={`mt-4 p-3 rounded-xl text-sm ${
                  isReady
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                    : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                }`}>
                  {isReady ? (
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        Ready! {approvedCount} approved character{approvedCount !== 1 ? 's' : ''}.
                      </span>
                      <Link
                        href={`/tools/story-studio?seriesId=${id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
                        style={{ minHeight: '40px' }}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                        Create Book in this Series
                      </Link>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                      </svg>
                      Add characters and approve at least one to start creating books.
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline cursor-pointer">Dismiss</button>
          </div>
        )}

        {/* Characters section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Characters ({detail.characters.length}/4)
            </h2>
            {detail.isOwner && detail.characters.length < 4 && (
              <div className="flex items-center gap-2">
                {otherSeries.length > 0 && (
                  <button
                    onClick={() => setShowImport(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 border border-amber-200 dark:border-amber-800 transition-colors cursor-pointer"
                    style={{ minHeight: '44px' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                    </svg>
                    Import
                  </button>
                )}
                <button
                  onClick={() => setShowAddChar(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
                  style={{ minHeight: '44px' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Character
                </button>
              </div>
            )}
          </div>

          {/* Add character form */}
          {showAddChar && (
            <div className="mb-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">New Character</h3>
              <form onSubmit={handleAddCharacter} className="space-y-3">
                <input
                  type="text"
                  required
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  placeholder="Character name (e.g. Katherine)"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{ minHeight: '44px' }}
                />
                <textarea
                  required
                  rows={3}
                  value={newCharDesc}
                  onChange={(e) => setNewCharDesc(e.target.value)}
                  placeholder="Detailed physical description: hair color/style, eye color, skin tone, height, clothing, distinguishing features..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <VoicePicker
                  value={newCharVoice}
                  onChange={setNewCharVoice}
                  characterName={newCharName || undefined}
                  genderFilter={addVoiceGender}
                  ageFilter={addVoiceAge}
                  styleFilter={addVoiceStyle}
                  onGenderChange={setAddVoiceGender}
                  onAgeChange={setAddVoiceAge}
                  onStyleChange={setAddVoiceStyle}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={addingChar}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors cursor-pointer disabled:opacity-50"
                    style={{ minHeight: '40px' }}
                  >
                    {addingChar ? 'Adding...' : 'Add Character'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddChar(false); setNewCharName(''); setNewCharDesc(''); setNewCharVoice('') }}
                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    style={{ minHeight: '40px' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Import character from another series */}
          {showImport && (
            <div className="mb-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Import Character from Another Series</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                This creates a copy of the character (with portrait, description, and voice). Changes to the original won&apos;t affect the copy.
              </p>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {otherSeries.map((series) => {
                  const availableChars = series.characters.filter(c => c.referenceImageUrl)
                  if (availableChars.length === 0) return null
                  return (
                    <div key={series.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">{series.title}</p>
                      <div className="flex flex-wrap gap-2">
                        {availableChars.map((char) => (
                          <button
                            key={char.name}
                            disabled={importing}
                            onClick={async () => {
                              setImporting(true)
                              try {
                                // We need the character ID — find it via the series detail
                                const res = await fetch(`/api/v1/story/series/${series.id}`)
                                if (!res.ok) throw new Error('Failed to load series')
                                const { data: seriesData } = await res.json()
                                const fullChar = seriesData.characters?.find((c: { name: string }) => c.name === char.name)
                                if (!fullChar) throw new Error('Character not found')
                                await duplicateCharacter(series.id, fullChar.id)
                                setShowImport(false)
                              } catch (err) {
                                setError(err instanceof Error ? err.message : 'Import failed')
                              } finally {
                                setImporting(false)
                              }
                            }}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {char.referenceImageUrl && (
                              <img src={char.referenceImageUrl} alt={char.name} className="w-8 h-8 rounded-full object-cover" />
                            )}
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{char.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setShowImport(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  style={{ minHeight: '40px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {detail.characters.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <svg className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">No characters yet. Add your first character to get started.</p>
              <button
                onClick={() => setShowAddChar(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors cursor-pointer"
                style={{ minHeight: '40px' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Character
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {detail.characters.map((char) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  isOwner={detail.isOwner}
                  refining={refiningCharId === char.id}
                  onRefine={handleRefine}
                  onApprove={approveCharacter}
                  onDelete={deleteCharacter}
                  onUpdate={updateCharacter}
                />
              ))}
            </div>
          )}
        </div>

        {/* Books in this series */}
        {detail.books.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Books in this Series ({detail.books.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {detail.books.map((book) => (
                <Link
                  key={book.id}
                  href={`/tools/story-studio/book/${book.slug}`}
                  className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {book.coverImageUrl ? (
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full aspect-[3/4] bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                      <svg className="w-10 h-10 text-purple-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                      </svg>
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">{book.pageCount} pages</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
    </div>
  )
}
