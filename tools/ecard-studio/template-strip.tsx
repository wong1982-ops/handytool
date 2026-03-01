'use client'

import { useMemo } from 'react'
import type { TemplateId } from '@/tools/ecard-studio/types'
import { ALL_TEMPLATES } from '@/tools/ecard-studio/templates'
import CardPreview from '@/tools/ecard-studio/card-preview'

interface TemplateStripProps {
  activeTemplate: TemplateId
  onSelectTemplate: (templateId: TemplateId) => void
}

export function TemplateStrip({
  activeTemplate,
  onSelectTemplate,
}: TemplateStripProps) {
  const grouped = useMemo(() => {
    const ecards = ALL_TEMPLATES.filter((t) => t.cardType === 'ecard')
    const bizCards = ALL_TEMPLATES.filter((t) => t.cardType === 'business-card')
    return [
      { label: 'E-Cards', templates: ecards },
      { label: 'Business Cards', templates: bizCards },
    ]
  }, [])

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto bg-slate-900/50 border-b border-slate-800 scrollbar-none">
      {grouped.map((group) => (
        <div key={group.label} className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 shrink-0 [writing-mode:vertical-lr] rotate-180 leading-none">
            {group.label}
          </span>

          {group.templates.map((template) => {
            const isActive = template.id === activeTemplate

            return (
              <button
                key={template.id}
                type="button"
                aria-label={template.name}
                aria-pressed={isActive}
                onClick={() => onSelectTemplate(template.id)}
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
