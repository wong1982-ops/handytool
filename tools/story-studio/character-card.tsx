'use client'

import type { Character, CharacterRole } from './types'

interface CharacterCardProps {
  character: Character
  onChange: (character: Character) => void
}

const ROLES: { value: CharacterRole; label: string }[] = [
  { value: 'protagonist', label: 'Protagonist' },
  { value: 'antagonist', label: 'Antagonist' },
  { value: 'supporting', label: 'Supporting' },
]

export default function CharacterCard({ character, onChange }: CharacterCardProps) {
  const update = (fields: Partial<Character>) => {
    onChange({ ...character, ...fields })
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 dark:border-slate-700 dark:bg-slate-800">
      {/* Name */}
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Name
        </label>
        <input
          type="text"
          value={character.name}
          onChange={(e) => update({ name: e.target.value })}
          className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 dark:border-slate-700 dark:text-white"
          placeholder="Character name"
        />
      </div>

      {/* Role */}
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Role
        </label>
        <select
          value={character.role}
          onChange={(e) => update({ role: e.target.value as CharacterRole })}
          className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 dark:border-slate-700 dark:text-white dark:bg-slate-800"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Description
        </label>
        <textarea
          value={character.description}
          onChange={(e) => update({ description: e.target.value })}
          rows={2}
          className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none transition-colors resize-y focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 dark:border-slate-700 dark:text-white"
          placeholder="Describe this character..."
        />
      </div>

      {/* Age (optional) */}
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Age <span className="text-slate-400 dark:text-slate-500">(optional)</span>
        </label>
        <input
          type="text"
          value={character.age ?? ''}
          onChange={(e) => update({ age: e.target.value || undefined })}
          className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 dark:border-slate-700 dark:text-white"
          placeholder="e.g. 8, young, elderly"
        />
      </div>
    </div>
  )
}
