'use client'

import { useState } from 'react'
import type { CharacterItem } from '@/tools/story-studio/use-characters'

interface CharacterListProps {
  characters: CharacterItem[]
  loading: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onCreate: () => void
}

export function CharacterList({ characters, loading, onSelect, onDelete, onCreate }: CharacterListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">My Characters</h2>
        <button
          onClick={onCreate}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white
            bg-[#3D6AF2] hover:bg-[#3560d8] rounded-lg transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Character
        </button>
      </div>

      {characters.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          <p className="text-sm">No characters yet. Create your first character to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {characters.map(char => (
            <div
              key={char.id}
              className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800
                overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelect(char.id)}
            >
              {/* Portrait */}
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {char.referenceImageUrl ? (
                  <img
                    src={char.referenceImageUrl}
                    alt={char.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
                  </svg>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm text-slate-900 dark:text-white truncate">{char.name}</h3>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    char.status === 'approved'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  }`}>
                    {char.status === 'approved' ? 'Approved' : 'Draft'}
                  </span>
                </div>
                {char.role && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 capitalize">{char.role}</p>
                )}
              </div>

              {/* Delete button (hidden until hover) */}
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(char.id) }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 text-white
                  flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label={`Delete ${char.name}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Delete Character?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              This will permanently delete the character and remove it from all series. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 rounded-lg
                  hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { onDelete(deleteConfirm); setDeleteConfirm(null) }}
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
