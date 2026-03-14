'use client'

import { use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CharacterDetail } from '@/tools/story-studio/characters/character-detail'

export default function CharacterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const handleBack = useCallback(() => {
    router.push('/tools/story-studio/characters')
  }, [router])

  return <CharacterDetail characterId={id} onBack={handleBack} />
}
