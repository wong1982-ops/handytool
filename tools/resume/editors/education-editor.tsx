'use client'

import type { JSONContent } from '@tiptap/core'
import type { EducationEntry } from '../resume-types'
import { useResume } from '../resume-provider'
import { FormField } from '../shared/form-field'
import { EntryCard } from '../shared/entry-card'
import { DateRangePicker } from '../shared/date-range-picker'
import { RichTextField } from '../shared/rich-text-field'

export function EducationEditor() {
  const { state, dispatch, t } = useResume()
  const entries = state.resume.education

  const addEntry = () => {
    const newEntry: EducationEntry = {
      id: crypto.randomUUID(),
      school: '',
      major: '',
      degree: '',
      startDate: '',
      endDate: '',
      description: null,
    }
    dispatch({ type: 'SET_EDUCATION', payload: [...entries, newEntry] })
  }

  const updateEntry = (id: string, field: keyof EducationEntry, value: string | JSONContent | null) => {
    const updated = entries.map((entry) =>
      entry.id === id ? { ...entry, [field]: value } : entry,
    )
    dispatch({ type: 'SET_EDUCATION', payload: updated })
  }

  const deleteEntry = (id: string) => {
    dispatch({ type: 'SET_EDUCATION', payload: entries.filter((e) => e.id !== id) })
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          title={entry.school}
          subtitle={[entry.major, entry.degree].filter(Boolean).join(' · ')}
          onDelete={() => deleteEntry(entry.id)}
          defaultExpanded
        >
          <div className="space-y-4">
            <FormField
              label={t.education.school}
              value={entry.school}
              onChange={(v) => updateEntry(entry.id, 'school', v)}
              placeholder={t.education.schoolPlaceholder}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label={t.education.major}
                value={entry.major}
                onChange={(v) => updateEntry(entry.id, 'major', v)}
                placeholder={t.education.majorPlaceholder}
              />
              <FormField
                label={t.education.degree}
                value={entry.degree}
                onChange={(v) => updateEntry(entry.id, 'degree', v)}
                placeholder={t.education.degreePlaceholder}
              />
            </div>
            <DateRangePicker
              startDate={entry.startDate}
              endDate={entry.endDate}
              onStartChange={(v) => updateEntry(entry.id, 'startDate', v)}
              onEndChange={(v) => updateEntry(entry.id, 'endDate', v)}
            />
            <RichTextField
              label={t.education.description}
              content={entry.description}
              placeholder={t.education.descriptionPlaceholder}
              module="education"
              onUpdate={(v) => updateEntry(entry.id, 'description', v)}
            />
          </div>
        </EntryCard>
      ))}

      <button
        type="button"
        onClick={addEntry}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
      >
        {t.actions.addEntry}
      </button>
    </div>
  )
}
