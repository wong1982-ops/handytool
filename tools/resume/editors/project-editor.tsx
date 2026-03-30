'use client'

import type { JSONContent } from '@tiptap/core'
import type { ProjectEntry } from '../resume-types'
import { useResume } from '../resume-provider'
import { FormField } from '../shared/form-field'
import { EntryCard } from '../shared/entry-card'
import { DateRangePicker } from '../shared/date-range-picker'
import { RichTextField } from '../shared/rich-text-field'

export function ProjectEditor() {
  const { state, dispatch, t } = useResume()
  const entries = state.resume.projects

  const addEntry = () => {
    const newEntry: ProjectEntry = {
      id: crypto.randomUUID(),
      projectName: '',
      role: '',
      startDate: '',
      endDate: '',
      description: null,
    }
    dispatch({ type: 'SET_PROJECTS', payload: [...entries, newEntry] })
  }

  const updateEntry = (id: string, field: keyof ProjectEntry, value: string | JSONContent | null) => {
    const updated = entries.map((entry) =>
      entry.id === id ? { ...entry, [field]: value } : entry,
    )
    dispatch({ type: 'SET_PROJECTS', payload: updated })
  }

  const deleteEntry = (id: string) => {
    dispatch({ type: 'SET_PROJECTS', payload: entries.filter((e) => e.id !== id) })
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          title={entry.projectName}
          subtitle={entry.role}
          onDelete={() => deleteEntry(entry.id)}
          defaultExpanded
        >
          <div className="space-y-4">
            <FormField
              label={t.projects.projectName}
              value={entry.projectName}
              onChange={(v) => updateEntry(entry.id, 'projectName', v)}
              placeholder={t.projects.projectNamePlaceholder}
            />
            <FormField
              label={t.projects.role}
              value={entry.role}
              onChange={(v) => updateEntry(entry.id, 'role', v)}
              placeholder={t.projects.rolePlaceholder}
            />
            <DateRangePicker
              startDate={entry.startDate}
              endDate={entry.endDate}
              onStartChange={(v) => updateEntry(entry.id, 'startDate', v)}
              onEndChange={(v) => updateEntry(entry.id, 'endDate', v)}
            />
            <RichTextField
              label={t.projects.description}
              content={entry.description}
              placeholder={t.projects.descriptionPlaceholder}
              module="projects"
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
