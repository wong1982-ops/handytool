'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCharacterList } from '@/tools/story-studio/use-characters'
import { CharacterList } from '@/tools/story-studio/characters/character-list'
import { CharacterForm } from '@/tools/story-studio/characters/character-form'
import { SeriesSection } from '@/tools/story-studio/characters/series-section'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'
import type { CreateCharacterInput } from '@/tools/story-studio/use-characters'

type View = 'list' | 'create'

export default function CharactersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { characters, loading, createCharacter, deleteCharacter } = useCharacterList()
  const [view, setView] = useState<View>('list')
  const [formLoading, setFormLoading] = useState(false)

  const handleCreate = useCallback(async (data: CreateCharacterInput) => {
    setFormLoading(true)
    try {
      const id = await createCharacter(data)
      router.push(`/tools/story-studio/characters/${id}`)
    } finally {
      setFormLoading(false)
    }
  }, [createCharacter, router])

  const handleSelect = useCallback((id: string) => {
    router.push(`/tools/story-studio/characters/${id}`)
  }, [router])

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
          router.push('/tools/story-studio/series')
        }}
      />
    </div>
  )
}
