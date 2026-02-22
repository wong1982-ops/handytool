'use client'

import { useState } from 'react'
import type { TemplateId } from '@/tools/ecard-studio/types'
import { TEMPLATES } from '@/tools/ecard-studio/templates'
import CardPreview from '@/tools/ecard-studio/card-preview'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DesignLibraryProps {
  activeTemplate: TemplateId
  onSelectTemplate: (templateId: TemplateId) => void
}

/* ------------------------------------------------------------------ */
/*  Categories                                                         */
/* ------------------------------------------------------------------ */

interface Category {
  id: string
  label: string
  icon: React.ReactNode
}

const CATEGORIES: Category[] = [
  {
    id: 'modern-corporate',
    label: 'Modern Corporate',
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="2" y="4" width="5" height="10" rx="0.5" />
        <rect x="9" y="2" width="5" height="12" rx="0.5" />
      </svg>
    ),
  },
  {
    id: 'classic-patterns',
    label: 'Classic Patterns',
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="6" height="6" rx="0.5" />
        <rect x="9" y="1" width="6" height="6" rx="0.5" />
        <rect x="1" y="9" width="6" height="6" rx="0.5" />
        <rect x="9" y="9" width="6" height="6" rx="0.5" />
      </svg>
    ),
  },
  {
    id: 'minimalist',
    label: 'Minimalist',
    icon: (
      <span className="inline-block w-4 text-center" aria-hidden="true">
        —
      </span>
    ),
  },
  {
    id: 'floral',
    label: 'Floral',
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <circle cx="8" cy="4" r="2.5" />
        <circle cx="12" cy="8" r="2.5" />
        <circle cx="4" cy="8" r="2.5" />
        <circle cx="8" cy="12" r="2.5" />
        <circle cx="8" cy="8" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
]

/* ------------------------------------------------------------------ */
/*  Quick template mapping                                             */
/* ------------------------------------------------------------------ */

const QUICK_TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: 'executive', label: 'Executive' },
  { id: 'midnight-pinstripe', label: 'Startup' },
  { id: 'aura-signature', label: 'Seasonal' },
  { id: 'black-tie-matte', label: 'Classic' },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DesignLibrary({
  activeTemplate,
  onSelectTemplate,
}: DesignLibraryProps) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id)

  return (
    <div className="overflow-y-auto p-4 space-y-6">
      {/* Header */}
      <h2 className="uppercase tracking-widest text-xs text-slate-400 font-medium">
        Design Library
      </h2>

      {/* Categories section */}
      <div className="space-y-3">
        <h3 className="uppercase text-xs text-blue-400 font-medium tracking-wider">
          Categories
        </h3>
        <nav aria-label="Design categories">
          <ul className="space-y-1">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id
              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {cat.icon}
                    {cat.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* Quick Templates section */}
      <div className="space-y-3">
        <h3 className="uppercase text-xs text-slate-500 font-medium tracking-wider">
          Quick Templates
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_TEMPLATES.map(({ id, label }) => {
            const template = TEMPLATES.find((t) => t.id === id)
            if (!template) return null
            const isActive = activeTemplate === id

            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectTemplate(id)}
                className={`rounded-lg overflow-hidden bg-slate-900 transition-all cursor-pointer ${
                  isActive
                    ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-slate-900'
                    : 'hover:ring-1 hover:ring-slate-600'
                }`}
                aria-label={`Select ${label} template`}
                aria-pressed={isActive}
              >
                <div className="pointer-events-none">
                  <CardPreview data={template.defaults} scale={0.15} />
                </div>
                <p
                  className={`text-xs py-1.5 text-center ${
                    isActive ? 'text-blue-400' : 'text-slate-400'
                  }`}
                >
                  {label}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Workspace Storage (visual placeholder) */}
      <div className="space-y-2 pt-2">
        <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500"
            style={{ width: '65%' }}
          />
        </div>
        <p className="text-xs text-blue-400 uppercase tracking-wider">
          65% of 2GB used
        </p>
      </div>
    </div>
  )
}
