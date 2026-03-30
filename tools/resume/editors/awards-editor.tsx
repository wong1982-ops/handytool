'use client'

import type { JSONContent } from '@tiptap/core'
import type { AwardEntry } from '../resume-types'
import { useResume } from '../resume-provider'
import { FormField } from '../shared/form-field'
import { EntryCard } from '../shared/entry-card'
import { RichTextField } from '../shared/rich-text-field'

export function AwardsEditor() {
  const { state, dispatch, t } = useResume()
  const entries = state.resume.awards

  const addEntry = () => {
    const newEntry: AwardEntry = {
      id: crypto.randomUUID(),
      name: '',
      issuer: '',
      date: '',
      description: null,
    }
    dispatch({ type: 'SET_AWARDS', payload: [...entries, newEntry] })
  }

  const updateEntry = (id: string, field: keyof AwardEntry, value: string | JSONContent | null) => {
    const updated = entries.map((entry) =>
      entry.id === id ? { ...entry, [field]: value } : entry,
    )
    dispatch({ type: 'SET_AWARDS', payload: updated })
  }

  const deleteEntry = (id: string) => {
    dispatch({ type: 'SET_AWARDS', payload: entries.filter((e) => e.id !== id) })
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          title={entry.name}
          subtitle={entry.issuer}
          onDelete={() => deleteEntry(entry.id)}
          defaultExpanded
        >
          <div className="space-y-4">
            <FormField
              label={t.awards.name}
              value={entry.name}
              onChange={(v) => updateEntry(entry.id, 'name', v)}
              placeholder={t.awards.namePlaceholder}
            />
            <FormField
              label={t.awards.issuer}
              value={entry.issuer}
              onChange={(v) => updateEntry(entry.id, 'issuer', v)}
              placeholder={t.awards.issuerPlaceholder}
            />
            <FormField
              label={t.awards.date}
              value={entry.date}
              onChange={(v) => updateEntry(entry.id, 'date', v)}
              placeholder={t.awards.datePlaceholder}
              type="month"
            />
            <RichTextField
              label={t.awards.description}
              content={entry.description}
              placeholder={t.awards.descriptionPlaceholder}
              module="awards"
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
