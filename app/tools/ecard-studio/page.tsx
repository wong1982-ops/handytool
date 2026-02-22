'use client'

import { useState } from 'react'
import { TemplateDiscovery } from '@/tools/ecard-studio/template-discovery'
import { CardEditor } from '@/tools/ecard-studio/card-editor'
import type { TemplateId } from '@/tools/ecard-studio/types'

export default function ECardStudioPage() {
  const [view, setView] = useState<'discovery' | 'editor'>('discovery')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('executive')

  function handleSelectTemplate(templateId: TemplateId) {
    setSelectedTemplate(templateId)
    setView('editor')
  }

  function handleBack() {
    setView('discovery')
  }

  if (view === 'editor') {
    return <CardEditor initialTemplate={selectedTemplate} onBack={handleBack} />
  }

  return <TemplateDiscovery onSelectTemplate={handleSelectTemplate} />
}
