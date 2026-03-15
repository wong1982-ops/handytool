'use client'

import { useState } from 'react'
import { useCharacterDetail, type UpdateCharacterInput, type CharacterPortrait, ART_STYLES } from '@/tools/story-studio/use-characters'
import { useSeriesList } from '@/tools/story-studio/use-series'
import { CharacterForm } from '@/tools/story-studio/characters/character-form'
import { PortraitLightbox } from '@/tools/story-studio/characters/portrait-lightbox'
import { VoiceRecorder } from '@/tools/story-studio/characters/voice-recorder'

interface CharacterDetailProps {
  characterId: string
  onBack: () => void
}

export function CharacterDetail({ characterId, onBack }: CharacterDetailProps) {
  const {
    character, portraits, loading, refining,
    updateCharacter, generatePortrait, setPrimaryPortrait, approveCharacter,
    linkToSeries, unlinkFromSeries,
  } = useCharacterDetail(characterId)

  const { series } = useSeriesList()

  const [editing, setEditing] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [selectedPortraitId, setSelectedPortraitId] = useState<string | null>(null)
  const [linkingSeriesId, setLinkingSeriesId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmStyle, setConfirmStyle] = useState<{ value: string; label: string } | null>(null)

  if (loading || !character) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    )
  }

  const primaryPortrait = portraits.find(p => p.isPrimary)
  const selectedPortrait = selectedPortraitId
    ? portraits.find(p => p.id === selectedPortraitId) ?? primaryPortrait
    : primaryPortrait
  const displayUrl = selectedPortrait?.imageUrl ?? character.referenceImageUrl

  // Map which styles already have portraits
  const stylePortraitMap = new Map<string, CharacterPortrait>()
  for (const p of portraits) stylePortraitMap.set(p.artStyle, p)

  const canApprove = character.referenceImageUrl && character.status !== 'approved'
  const linkedSeriesIds = character.seriesIds ?? []
  const availableSeries = series.filter(s => !linkedSeriesIds.includes(s.id))

  const handleStyleClick = (styleValue: string, styleLabel: string) => {
    if (refining) return
    if (!character.physicalDescription) {
      setError('Add a physical description before generating a portrait')
      return
    }

    const existing = stylePortraitMap.get(styleValue)
    if (existing) {
      // Style already has a portrait — just select it
      setSelectedPortraitId(existing.id)
      return
    }

    // Show confirmation before spending credits
    setConfirmStyle({ value: styleValue, label: styleLabel })
  }

  const handleConfirmGenerate = async () => {
    if (!confirmStyle) return
    const { value: styleValue } = confirmStyle
    setConfirmStyle(null)
    setError(null)
    try {
      await generatePortrait(styleValue)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    }
  }

  const handleRefine = async () => {
    if (!selectedPortrait || !character.physicalDescription) return
    setError(null)
    try {
      await generatePortrait(selectedPortrait.artStyle, feedback || undefined, selectedPortrait.id)
      setFeedback('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Refinement failed')
    }
  }

  if (editing) {
    return (
      <div className="max-w-lg mx-auto">
        <CharacterForm
          initial={{
            name: character.name,
            age: character.age,
            role: character.role,
            personality: character.personality,
            physicalDescription: character.physicalDescription,
            voice: character.voice,
          }}
          onSubmit={async (data) => {
            await updateCharacter(data as UpdateCharacterInput)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <div>
      {/* Credit confirmation dialog */}
      {confirmStyle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Generate Portrait</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              Generate a <strong className="text-slate-800 dark:text-slate-200">{confirmStyle.label}</strong> portrait for {character.name}?
            </p>
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-6 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              This will use 1 credit
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmStyle(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300
                  bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600
                  rounded-lg transition-colors cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmGenerate}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white
                  bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back + title */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-9 h-9 rounded-full
            hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Back to characters"
        >
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{character.name}</h2>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          character.status === 'approved'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
        }`}>
          {character.status === 'approved' ? 'Approved' : 'Draft'}
        </span>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Portrait + gallery + refinement */}
        <div className="space-y-4">
          {/* Main portrait display */}
          <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
            {displayUrl ? (
              <>
                <PortraitLightbox src={displayUrl} alt={character.name} />
                {/* Style badge */}
                {selectedPortrait && (
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-black/50 text-white backdrop-blur-sm">
                      {ART_STYLES.find(s => s.value === selectedPortrait.artStyle)?.label ?? selectedPortrait.artStyle}
                    </span>
                    {selectedPortrait.isPrimary && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-500/80 text-white backdrop-blur-sm">
                        Primary
                      </span>
                    )}
                  </div>
                )}
                {refining && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-white font-medium">Generating...</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                {refining ? (
                  <>
                    <div className="w-12 h-12 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm mt-3 text-indigo-500 font-medium">Generating portrait...</p>
                  </>
                ) : (
                  <>
                    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
                    </svg>
                    <p className="text-sm mt-2">Pick a style below to generate</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Portrait gallery strip */}
          {portraits.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {portraits.map(p => {
                const isSelected = selectedPortrait?.id === p.id
                const styleLabel = ART_STYLES.find(s => s.value === p.artStyle)?.label ?? p.artStyle
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPortraitId(p.id)}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer
                      transition-all ring-2 ring-offset-1
                      ${isSelected
                        ? 'ring-indigo-500 dark:ring-indigo-400'
                        : 'ring-transparent hover:ring-slate-300 dark:hover:ring-slate-600'
                      }`}
                    aria-label={`${styleLabel}${p.isPrimary ? ' (primary)' : ''}`}
                  >
                    <img src={p.imageUrl} alt={styleLabel} className="w-full h-full object-cover" />
                    {p.isPrimary && (
                      <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-amber-500 text-white">
                        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </span>
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center py-0.5 leading-tight truncate px-0.5">
                      {styleLabel}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Actions for selected portrait */}
          {selectedPortrait && !selectedPortrait.isPrimary && (
            <button
              onClick={() => setPrimaryPortrait(selectedPortrait.id)}
              className="w-full px-3 py-2 text-xs font-medium text-amber-600 dark:text-amber-400
                border border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20
                rounded-lg transition-colors cursor-pointer"
              style={{ minHeight: '36px' }}
            >
              Set as Primary Portrait
            </button>
          )}

          {/* Refinement controls for selected portrait */}
          {selectedPortrait && (
            <div className="space-y-2">
              <div className="text-xs text-slate-500">
                Refinements: {selectedPortrait.refinementCount}/3
              </div>
              {selectedPortrait.refinementCount < 3 && (
                <>
                  <textarea
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="Feedback for refinement (e.g., 'make the hair curlier')"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                      bg-white dark:bg-slate-800 text-sm resize-none
                      focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleRefine}
                    disabled={refining || !feedback.trim()}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
                      disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                    style={{ minHeight: '44px' }}
                  >
                    {refining ? 'Refining...' : 'Refine Portrait (free)'}
                  </button>
                </>
              )}
            </div>
          )}

          {canApprove && (
            <button
              onClick={async () => {
                try { await approveCharacter() } catch { setError('Failed to approve') }
              }}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700
                rounded-lg transition-colors cursor-pointer"
              style={{ minHeight: '44px' }}
            >
              Approve Character
            </button>
          )}
        </div>

        {/* Right: Art styles + info + series */}
        <div className="space-y-4">
          {/* Art style picker */}
          <div>
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Art Styles</h3>
            <div className="flex flex-wrap gap-1.5">
              {ART_STYLES.map(style => {
                const existing = stylePortraitMap.get(style.value)
                const isSelected = selectedPortrait?.artStyle === style.value
                return (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => handleStyleClick(style.value, style.label)}
                    disabled={refining}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer
                      disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1
                      ${isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : existing
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    style={{ minHeight: '32px' }}
                  >
                    {existing && !isSelected && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {style.label}
                    {!existing && (
                      <svg className="w-3 h-3 opacity-40" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-[10px] text-slate-400 flex items-center gap-2">
              <span className="inline-flex items-center gap-0.5">
                <svg className="w-2.5 h-2.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Generated
              </span>
              <span className="inline-flex items-center gap-0.5">
                <svg className="w-2.5 h-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                1 credit
              </span>
            </p>
          </div>

          {/* Info fields */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            {character.role && (
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase">Role</span>
                <p className="text-sm text-slate-700 dark:text-slate-300 capitalize">{character.role}</p>
              </div>
            )}
            {character.age && (
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase">Age</span>
                <p className="text-sm text-slate-700 dark:text-slate-300">{character.age}</p>
              </div>
            )}
            {character.personality && (
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase">Personality</span>
                <p className="text-sm text-slate-700 dark:text-slate-300">{character.personality}</p>
              </div>
            )}
            {character.physicalDescription && (
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase">Physical Description</span>
                <p className="text-sm text-slate-700 dark:text-slate-300">{character.physicalDescription}</p>
              </div>
            )}
            {character.voice && (
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase">Voice</span>
                <p className="text-sm text-slate-700 dark:text-slate-300">{character.voice}</p>
              </div>
            )}
          </div>

          {/* Custom Voice Recording */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-medium text-slate-400 uppercase mb-2">Custom Voice</h3>
            <VoiceRecorder characterId={character.id} characterName={character.name} />
            {character.voice && (
              <p className="text-[11px] text-slate-400 mt-2 italic">
                Custom voice will be used instead of the preset. Remove custom voice to use a preset.
              </p>
            )}
          </div>

          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400
              hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            Edit Details
          </button>

          {/* Series linking */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Series</h3>

            {linkedSeriesIds.length > 0 ? (
              <div className="space-y-1 mb-3">
                {series.filter(s => linkedSeriesIds.includes(s.id)).map(s => (
                  <div key={s.id} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{s.title}</span>
                    <button
                      onClick={() => unlinkFromSeries(s.id)}
                      className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic mb-3">Not in any series</p>
            )}

            {availableSeries.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={linkingSeriesId ?? ''}
                  onChange={e => setLinkingSeriesId(e.target.value || null)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                    bg-white dark:bg-slate-800 text-sm
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Add to series...</option>
                  {availableSeries.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
                <button
                  onClick={async () => {
                    if (!linkingSeriesId) return
                    await linkToSeries(linkingSeriesId)
                    setLinkingSeriesId(null)
                  }}
                  disabled={!linkingSeriesId}
                  className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
                    disabled:opacity-50 disabled:cursor-not-allowed rounded-lg cursor-pointer"
                  style={{ minHeight: '44px' }}
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
