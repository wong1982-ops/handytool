'use client'

import type { JSONContent } from '@tiptap/core'
import type { InternshipEntry } from '../resume-types'
import { useResume } from '../resume-provider'
import { FormField } from '../shared/form-field'
import { EntryCard } from '../shared/entry-card'
import { DateRangePicker } from '../shared/date-range-picker'
import { RichTextField } from '../shared/rich-text-field'

export function InternshipEditor() {
  const { state, dispatch, t } = useResume()
  const entries = state.resume.internships

  const addEntry = () => {
    const newEntry: InternshipEntry = {
      id: crypto.randomUUID(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: null,
    }
    dispatch({ type: 'SET_INTERNSHIPS', payload: [...entries, newEntry] })
  }

  const updateEntry = (id: string, field: keyof InternshipEntry, value: string | JSONContent | null) => {
    const updated = entries.map((entry) =>
      entry.id === id ? { ...entry, [field]: value } : entry,
    )
    dispatch({ type: 'SET_INTERNSHIPS', payload: updated })
  }

  const deleteEntry = (id: string) => {
    dispatch({ type: 'SET_INTERNSHIPS', payload: entries.filter((e) => e.id !== id) })
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          title={entry.company}
          subtitle={entry.position}
          onDelete={() => deleteEntry(entry.id)}
          defaultExpanded
        >
          <div className="space-y-4">
            <FormField
              label={t.internships.company}
              value={entry.company}
              onChange={(v) => updateEntry(entry.id, 'company', v)}
              placeholder={t.internships.companyPlaceholder}
            />
            <FormField
              label={t.internships.position}
              value={entry.position}
              onChange={(v) => updateEntry(entry.id, 'position', v)}
              placeholder={t.internships.positionPlaceholder}
            />
            <DateRangePicker
              startDate={entry.startDate}
              endDate={entry.endDate}
              onStartChange={(v) => updateEntry(entry.id, 'startDate', v)}
              onEndChange={(v) => updateEntry(entry.id, 'endDate', v)}
            />
            <RichTextField
              label={t.internships.description}
              content={entry.description}
              placeholder={t.internships.descriptionPlaceholder}
              module="internships"
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
