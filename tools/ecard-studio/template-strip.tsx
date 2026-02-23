'use client'

import type { TemplateId } from '@/tools/ecard-studio/types'
import { TEMPLATES } from '@/tools/ecard-studio/templates'
import CardPreview from '@/tools/ecard-studio/card-preview'

interface TemplateStripProps {
  activeTemplate: TemplateId
  onSelectTemplate: (templateId: TemplateId) => void
}

export function TemplateStrip({
  activeTemplate,
  onSelectTemplate,
}: TemplateStripProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 overflow-x-auto bg-slate-900/50 border-b border-slate-800">
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 shrink-0">
        Template
      </span>

      {TEMPLATES.map((template) => {
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
          >
            <div className="w-[100px] h-[67px] relative">
              <CardPreview data={template.defaults} scale={100 / 600} />
            </div>
          </button>
        )
      })}
    </div>
  )
}
