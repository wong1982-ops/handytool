'use client'

import { useState } from 'react'
import { useResume } from '../resume-provider'
import { RichTextField } from '../shared/rich-text-field'
import { FormField } from '../shared/form-field'
import type { JSONContent } from '@tiptap/core'

interface CustomSection {
  id: string
  title: string
  type: 'richtext' | 'structured'
  richTextContent: JSONContent | null
  structuredFields: { label: string; value: string }[]
}

export function CustomSectionEditor() {
  const { state, dispatch, t } = useResume()
  const [showTypeMenu, setShowTypeMenu] = useState(false)
  const sections: CustomSection[] = state.resume.customSections ?? []

  const updateSections = (updated: CustomSection[]) => {
    dispatch({ type: 'SET_CUSTOM_SECTIONS', payload: updated })
  }

  const addSection = (type: 'richtext' | 'structured') => {
    const newSection: CustomSection = {
      id: crypto.randomUUID(),
      title: '',
      type,
      richTextContent: null,
      structuredFields: type === 'structured' ? [{ label: '', value: '' }] : [],
    }
    updateSections([...sections, newSection])
    setShowTypeMenu(false)
  }

  const deleteSection = (id: string) => {
    updateSections(sections.filter((s) => s.id !== id))
  }

  const updateSection = (id: string, patch: Partial<CustomSection>) => {
    updateSections(
      sections.map((s) => (s.id === id ? { ...s, ...patch } : s))
    )
  }

  const updateStructuredField = (
    sectionId: string,
    fieldIndex: number,
    key: 'label' | 'value',
    val: string
  ) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return
    const fields = [...section.structuredFields]
    fields[fieldIndex] = { ...fields[fieldIndex], [key]: val }
    updateSection(sectionId, { structuredFields: fields })
  }

  const addStructuredField = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return
    updateSection(sectionId, {
      structuredFields: [...section.structuredFields, { label: '', value: '' }],
    })
  }

  const deleteStructuredField = (sectionId: string, fieldIndex: number) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return
    const fields = section.structuredFields.filter((_, i) => i !== fieldIndex)
    updateSection(sectionId, { structuredFields: fields })
  }

  return (
    <div className="space-y-4">
      {/* Add Section button */}
      <div className="relative">
        <button
          type="button"
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          onClick={() => setShowTypeMenu(!showTypeMenu)}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t.customSection.title}
        </button>

        {showTypeMenu && (
          <div className="absolute left-0 top-full mt-1 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[200px]">
            <button
              type="button"
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => addSection('richtext')}
            >
              {t.customSection.typeRichtext}
            </button>
            <button
              type="button"
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => addSection('structured')}
            >
              {t.customSection.typeStructured}
            </button>
          </div>
        )}
      </div>

      {/* Section cards */}
      {sections.map((section) => (
        <div
          key={section.id}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
        >
          {/* Section header: title + delete */}
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <FormField
                label={t.customSection.title}
                value={section.title}
                onChange={(value) => updateSection(section.id, { title: value })}
                placeholder={t.customSection.titlePlaceholder}
              />
            </div>
            <button
              type="button"
              className="mt-6 p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              onClick={() => deleteSection(section.id)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Rich text content */}
          {section.type === 'richtext' && (
            <RichTextField
              content={section.richTextContent}
              placeholder={t.customSection.placeholder}
              module={`customSection-${section.id}`}
              onUpdate={(content: JSONContent | null) =>
                updateSection(section.id, { richTextContent: content })
              }
            />
          )}

          {/* Structured fields */}
          {section.type === 'structured' && (
            <div className="space-y-2">
              {section.structuredFields.map((field, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <FormField
                      label={index === 0 ? t.customSection.label : ''}
                      value={field.label}
                      onChange={(val) =>
                        updateStructuredField(section.id, index, 'label', val)
                      }
                      placeholder={t.customSection.labelPlaceholder}
                    />
                    <FormField
                      label={index === 0 ? t.customSection.value : ''}
                      value={field.value}
                      onChange={(val) =>
                        updateStructuredField(section.id, index, 'value', val)
                      }
                      placeholder={t.customSection.valuePlaceholder}
                    />
                  </div>
                  <button
                    type="button"
                    className={`shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ${index === 0 ? 'mt-6' : ''}`}
                    onClick={() => deleteStructuredField(section.id, index)}
                  >
                    &times;
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                onClick={() => addStructuredField(section.id)}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                {t.customSection.addField}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
