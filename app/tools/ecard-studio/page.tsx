'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DiscoveryPage } from '@/tools/ecard-studio/discovery-page'
import { CardEditor } from '@/tools/ecard-studio/card-editor'
import type { TemplateId } from '@/tools/ecard-studio/types'
import { ALL_TEMPLATES } from '@/tools/ecard-studio/templates'

function ECardStudioContent() {
  const searchParams = useSearchParams()
  const templateParam = searchParams.get('template')

  // Validate template ID exists
  const validTemplate = templateParam && ALL_TEMPLATES.some(t => t.id === templateParam)

  if (validTemplate) {
    return <CardEditor initialTemplate={templateParam as TemplateId} />
  }
  return <DiscoveryPage />
}

export default function ECardStudioPage() {
  return (
    <Suspense>
      <ECardStudioContent />
    </Suspense>
  )
}
