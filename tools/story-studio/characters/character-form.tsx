'use client'

import { useState } from 'react'
import { VoicePicker } from '@/tools/story-studio/characters/voice-picker'
import type { CreateCharacterInput, UpdateCharacterInput } from '@/tools/story-studio/use-characters'

interface CharacterFormProps {
  initial?: {
    name: string
    age: string | null
    role: string | null
    personality: string | null
    physicalDescription: string | null
    voice: string | null
  }
  onSubmit: (data: CreateCharacterInput | UpdateCharacterInput) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function CharacterForm({ initial, onSubmit, onCancel, loading }: CharacterFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [age, setAge] = useState(initial?.age ?? '')
  const [role, setRole] = useState<string>(initial?.role ?? '')
  const [personality, setPersonality] = useState(initial?.personality ?? '')
  const [physicalDescription, setPhysicalDescription] = useState(initial?.physicalDescription ?? '')
  const [voice, setVoice] = useState<string | null>(initial?.voice ?? null)
  const [showVoicePicker, setShowVoicePicker] = useState(false)

  const isEdit = !!initial

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    await onSubmit({
      name,
      age: age || undefined,
      role: (role as 'protagonist' | 'antagonist' | 'supporting') || undefined,
      personality: personality || undefined,
      physicalDescription: physicalDescription || undefined,
      voice: voice ?? undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {isEdit ? 'Edit Character' : 'New Character'}
      </h3>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          maxLength={100}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Character name"
        />
      </div>

      {/* Age + Role (inline) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age</label>
          <input
            type="text"
            value={age}
            onChange={e => setAge(e.target.value)}
            maxLength={50}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
              bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. 8 years old"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
              bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select role</option>
            <option value="protagonist">Protagonist</option>
            <option value="antagonist">Antagonist</option>
            <option value="supporting">Supporting</option>
          </select>
        </div>
      </div>

      {/* Personality */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Personality</label>
        <textarea
          value={personality}
          onChange={e => setPersonality(e.target.value)}
          maxLength={2000}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Brave, curious, always looking for adventure..."
        />
      </div>

      {/* Physical Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Physical Description</label>
        <textarea
          value={physicalDescription}
          onChange={e => setPhysicalDescription(e.target.value)}
          maxLength={2000}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="A young girl with curly red hair, freckles, and bright green eyes..."
        />
      </div>

      {/* Voice */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Voice</label>
          <button
            type="button"
            onClick={() => setShowVoicePicker(!showVoicePicker)}
            className="text-xs text-indigo-500 hover:text-indigo-700 cursor-pointer"
          >
            {showVoicePicker ? 'Hide picker' : voice ? 'Change' : 'Choose voice'}
          </button>
        </div>
        {voice && !showVoicePicker && (
          <p className="text-sm text-slate-600 dark:text-slate-400">{voice}</p>
        )}
        {!voice && !showVoicePicker && (
          <p className="text-sm text-slate-400 italic">Auto-assign</p>
        )}
        {showVoicePicker && (
          <VoicePicker selectedVoice={voice} onSelect={setVoice} characterName={name} />
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400
            hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim() || loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
            disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          {loading ? 'Saving...' : isEdit ? 'Save' : 'Create'}
        </button>
      </div>
    </form>
  )
}
