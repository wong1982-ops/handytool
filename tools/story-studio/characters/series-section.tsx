'use client'

import { useState } from 'react'
import { useSeriesList } from '@/tools/story-studio/use-series'
import type { CharacterItem } from '@/tools/story-studio/use-characters'

interface SeriesSectionProps {
  characters: CharacterItem[]
  onSelectCharacter: (id: string) => void
  onCreateSeries: () => void
}

export function SeriesSection({ characters, onSelectCharacter, onCreateSeries }: SeriesSectionProps) {
  const { series, loading, deleteSeries } = useSeriesList()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Series</h2>
        <button
          onClick={onCreateSeries}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#3D6AF2] dark:text-[#93aaff]
            hover:bg-[#3D6AF2]/10 dark:hover:bg-[#3D6AF2]/15 rounded-lg transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Series
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : series.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
          No series yet. Create a series to group characters together.
        </p>
      ) : (
        <div className="space-y-2">
          {series.map(s => {
            const isExpanded = expandedId === s.id
            const linkedChars = characters.filter(c => c.seriesIds?.includes(s.id))

            return (
              <div key={s.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Series header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer
                    hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  style={{ minHeight: '44px' }}
                >
                  <div>
                    <h3 className="font-medium text-sm text-slate-900 dark:text-white">{s.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {linkedChars.length} character{linkedChars.length !== 1 ? 's' : ''}
                      {s.bookCount > 0 && ` · ${s.bookCount} book${s.bookCount !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {linkedChars.length >= 6 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                        {linkedChars.length}/6+
                      </span>
                    )}
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </button>

                {/* Expanded: linked characters */}
                {isExpanded && (
                  <div className="px-4 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                    {s.description && (
                      <p className="text-xs text-slate-400 mb-2">{s.description}</p>
                    )}
                    {linkedChars.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        No characters linked. Select a character and add it to this series.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {linkedChars.map(char => (
                          <button
                            key={char.id}
                            onClick={() => onSelectCharacter(char.id)}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800
                              hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-sm"
                          >
                            {char.referenceImageUrl ? (
                              <img src={char.referenceImageUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
                            )}
                            <span className="text-slate-700 dark:text-slate-300">{char.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Series actions */}
                    <div className="flex justify-end mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setDeleteConfirm(s.id)}
                        className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        Delete Series
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Delete series confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Delete Series?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              This will delete the series. Characters will be unlinked but not deleted. Books will be unlinked.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Cancel
              </button>
              <button
                onClick={async () => { await deleteSeries(deleteConfirm); setDeleteConfirm(null) }}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
