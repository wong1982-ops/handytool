'use client'

import { useState, useCallback } from 'react'
import { useCharacterList } from '@/tools/story-studio/use-characters'
import { CharacterList } from '@/tools/story-studio/characters/character-list'
import { CharacterForm } from '@/tools/story-studio/characters/character-form'
import { CharacterDetail } from '@/tools/story-studio/characters/character-detail'
import { SeriesSection } from '@/tools/story-studio/characters/series-section'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'
import type { CreateCharacterInput } from '@/tools/story-studio/use-characters'

type View = 'list' | 'create' | 'detail'

export default function CharactersPage() {
  const { user, loading: authLoading } = useAuth()
  const { characters, loading, createCharacter, deleteCharacter, refresh } = useCharacterList()
  const [view, setView] = useState<View>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const handleCreate = useCallback(async (data: CreateCharacterInput) => {
    setFormLoading(true)
    try {
      const id = await createCharacter(data)
      setSelectedId(id)
      setView('detail')
    } finally {
      setFormLoading(false)
    }
  }, [createCharacter])

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id)
    setView('detail')
  }, [])

  const handleBack = useCallback(() => {
    setSelectedId(null)
    setView('list')
    refresh()
  }, [refresh])

  // Auth gate
  if (!authLoading && !user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Sign in to manage characters</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">Create and manage your characters after signing in.</p>
        <button
          onClick={() => signInWithOAuth('google')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  // Create form
  if (view === 'create') {
    return (
      <div className="max-w-lg mx-auto">
        <CharacterForm
          onSubmit={data => handleCreate(data as CreateCharacterInput)}
          onCancel={() => setView('list')}
          loading={formLoading}
        />
      </div>
    )
  }

  // Detail view
  if (view === 'detail' && selectedId) {
    return (
      <CharacterDetail
        characterId={selectedId}
        onBack={handleBack}
      />
    )
  }

  // List view (default)
  return (
    <div>
      <CharacterList
        characters={characters}
        loading={loading}
        onSelect={handleSelect}
        onDelete={deleteCharacter}
        onCreate={() => setView('create')}
      />

      <SeriesSection
        characters={characters}
        onSelectCharacter={handleSelect}
        onCreateSeries={() => {
          window.location.href = '/tools/story-studio/series'
        }}
      />
    </div>
  )
}
