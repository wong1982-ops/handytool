'use client'

import { useState } from 'react'
import { useCharacterDetail, type UpdateCharacterInput } from '@/tools/story-studio/use-characters'
import { useSeriesList } from '@/tools/story-studio/use-series'
import { CharacterForm } from '@/tools/story-studio/characters/character-form'

interface CharacterDetailProps {
  characterId: string
  onBack: () => void
}

export function CharacterDetail({ characterId, onBack }: CharacterDetailProps) {
  const {
    character, loading, refining,
    updateCharacter, refinePortrait, approveCharacter,
    linkToSeries, unlinkFromSeries,
  } = useCharacterDetail(characterId)

  const { series } = useSeriesList()

  const [editing, setEditing] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [linkingSeriesId, setLinkingSeriesId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (loading || !character) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    )
  }

  const maxRefinements = 3
  const canRefine = character.refinementCount < maxRefinements || !character.referenceImageUrl
  const canApprove = character.referenceImageUrl && character.status !== 'approved'
  const linkedSeriesIds = character.seriesIds ?? []
  const availableSeries = series.filter(s => !linkedSeriesIds.includes(s.id))

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
        {/* Left: Portrait + refinement */}
        <div className="space-y-4">
          <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
            {character.referenceImageUrl ? (
              <img src={character.referenceImageUrl} alt={character.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
                </svg>
                <p className="text-sm mt-2">No portrait yet</p>
              </div>
            )}
          </div>

          {/* Refinement controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                {character.referenceImageUrl ? `Refinements: ${character.refinementCount}/${maxRefinements}` : 'Generate first portrait (1 credit)'}
              </span>
            </div>

            {canRefine && (
              <>
                {character.referenceImageUrl && (
                  <textarea
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="Feedback for refinement (e.g., 'make the hair curlier')"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                      bg-white dark:bg-slate-800 text-sm resize-none
                      focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
                <button
                  onClick={async () => {
                    setError(null)
                    try {
                      await refinePortrait(character.physicalDescription || '', feedback || undefined)
                      setFeedback('')
                    } catch (e) {
                      setError(e instanceof Error ? e.message : 'Refinement failed')
                    }
                  }}
                  disabled={refining || (!character.physicalDescription && !character.referenceImageUrl)}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
                    disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                  style={{ minHeight: '44px' }}
                >
                  {refining
                    ? 'Generating...'
                    : character.referenceImageUrl
                      ? `Refine Portrait (free)`
                      : 'Generate Portrait (1 credit)'}
                </button>
              </>
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
        </div>

        {/* Right: Info + series */}
        <div className="space-y-4">
          {/* Info fields */}
          <div className="space-y-3">
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
