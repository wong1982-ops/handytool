'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import type { ECardData, TemplateId } from '@/tools/ecard-studio/types'
import { ALL_TEMPLATES } from '@/tools/ecard-studio/templates'
import { getSavedTemplates, deleteSavedTemplate } from '@/tools/ecard-studio/saved-templates'
import type { SavedTemplate } from '@/tools/ecard-studio/saved-templates'
import CardPreview from '@/tools/ecard-studio/card-preview'

interface TemplateStripProps {
  activeTemplate: TemplateId
  onSelectTemplate: (templateId: TemplateId) => void
  onLoadCardData?: (data: ECardData) => void
}

export function TemplateStrip({
  activeTemplate,
  onSelectTemplate,
  onLoadCardData,
}: TemplateStripProps) {
  const [saved, setSaved] = useState<SavedTemplate[]>([])
  const [activeCustomId, setActiveCustomId] = useState<string | null>(null)

  // Load saved templates from localStorage on mount and listen for changes
  const refreshSaved = useCallback(() => {
    setSaved(getSavedTemplates())
  }, [])

  useEffect(() => {
    refreshSaved()
    // Listen for storage events (save from customization panel)
    const handler = () => refreshSaved()
    window.addEventListener('storage', handler)
    // Also poll briefly since storage event doesn't fire in same tab
    const interval = setInterval(refreshSaved, 2000)
    return () => {
      window.removeEventListener('storage', handler)
      clearInterval(interval)
    }
  }, [refreshSaved])

  const grouped = useMemo(() => {
    const ecards = ALL_TEMPLATES.filter((t) => t.cardType === 'ecard')
    const bizCards = ALL_TEMPLATES.filter((t) => t.cardType === 'business-card')
    return [
      { label: 'E-Cards', templates: ecards },
      { label: 'Business Cards', templates: bizCards },
    ]
  }, [])

  const handleLoadSaved = (template: SavedTemplate) => {
    setActiveCustomId(template.id)
    onLoadCardData?.(template.data)
  }

  const handleDeleteSaved = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteSavedTemplate(id)
    if (activeCustomId === id) setActiveCustomId(null)
    refreshSaved()
  }

  const handleSelectBuiltin = (templateId: TemplateId) => {
    setActiveCustomId(null)
    onSelectTemplate(templateId)
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto bg-slate-900/50 border-b border-slate-800 scrollbar-none">
      {/* Saved Templates — only show if any exist */}
      {saved.length > 0 && (
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-500/70 shrink-0 [writing-mode:vertical-lr] rotate-180 leading-none">
            Saved
          </span>

          {saved.map((st) => {
            const isActive = activeCustomId === st.id
            return (
              <div key={st.id} className="relative group shrink-0">
                <button
                  type="button"
                  aria-label={st.name}
                  aria-pressed={isActive}
                  onClick={() => handleLoadSaved(st)}
                  className={`shrink-0 rounded-md overflow-hidden transition-all cursor-pointer ${
                    isActive
                      ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-slate-950'
                      : 'ring-1 ring-amber-500/30 hover:ring-amber-500/60'
                  }`}
                  title={st.name}
                >
                  <div className="w-[80px] h-[53px] relative">
                    <CardPreview data={st.data} scale={80 / 600} />
                  </div>
                </button>
                {/* Delete button — shows on hover */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteSaved(e, st.id)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label={`Delete saved template "${st.name}"`}
                  title="Delete"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )
          })}

          <div className="w-px h-10 bg-slate-700 shrink-0 mx-1" aria-hidden="true" />
        </div>
      )}

      {/* Built-in Templates */}
      {grouped.map((group) => (
        <div key={group.label} className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 shrink-0 [writing-mode:vertical-lr] rotate-180 leading-none">
            {group.label}
          </span>

          {group.templates.map((template) => {
            const isActive = !activeCustomId && template.id === activeTemplate

            return (
              <button
                key={template.id}
                type="button"
                aria-label={template.name}
                aria-pressed={isActive}
                onClick={() => handleSelectBuiltin(template.id)}
                className={`shrink-0 rounded-md overflow-hidden transition-all cursor-pointer ${
                  isActive
                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950'
                    : 'ring-1 ring-slate-700 hover:ring-slate-500'
                }`}
                title={template.name}
              >
                <div className="w-[80px] h-[53px] relative">
                  <CardPreview data={template.defaults} scale={80 / 600} />
                </div>
              </button>
            )
          })}

          {/* Separator between groups */}
          <div className="w-px h-10 bg-slate-700 shrink-0 mx-1" aria-hidden="true" />
        </div>
      ))}
    </div>
  )
}
