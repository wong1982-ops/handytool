'use client'

import { useState, useRef } from 'react'
import { VoicePicker } from '@/tools/story-studio/characters/voice-picker'
import type { CreateCharacterInput, UpdateCharacterInput } from '@/tools/story-studio/use-characters'
import { useLanguage } from '@/tools/story-studio/use-language-context'

function HintIcon({ hint }: { hint: string }) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  return (
    <span
      className="relative inline-flex ml-1"
      onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); setOpen(true) }}
      onMouseLeave={() => { timeoutRef.current = setTimeout(() => setOpen(false), 150) }}
    >
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-4 h-4 inline-flex items-center justify-center rounded-full
          bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400
          hover:bg-[#3D6AF2]/15 hover:bg-[#3D6AF2]/15 hover:text-[#3D6AF2] dark:hover:text-[#93aaff]
          transition-colors cursor-pointer text-[10px] font-bold leading-none"
        aria-label="Hint"
      >
        ?
      </button>
      {open && (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 z-20
          w-52 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200
          bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700
          pointer-events-none">
          {hint}
        </span>
      )}
    </span>
  )
}

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
  const { t } = useLanguage()
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
        {isEdit ? t.characterForm.editCharacter : t.characterForm.newCharacter}
      </h3>

      {/* Name */}
      <div>
        <label className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {t.characterForm.nameLabel}
          <HintIcon hint={t.characterForm.nameHint} />
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          maxLength={100}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
            focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]"
          placeholder={t.characterForm.namePlaceholder}
        />
      </div>

      {/* Age + Role (inline) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {t.characterForm.ageLabel}
            <HintIcon hint={t.characterForm.ageHint} />
          </label>
          <input
            type="text"
            value={age}
            onChange={e => setAge(e.target.value)}
            maxLength={50}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
              bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
              focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]"
            placeholder={t.characterForm.agePlaceholder}
          />
        </div>
        <div>
          <label className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {t.characterForm.roleLabel}
            <HintIcon hint={t.characterForm.roleHint} />
          </label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
              bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
              focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]"
          >
            <option value="">{t.characterForm.selectRole}</option>
            <option value="protagonist">{t.characterForm.protagonist}</option>
            <option value="antagonist">{t.characterForm.antagonist}</option>
            <option value="supporting">{t.characterForm.supporting}</option>
          </select>
        </div>
      </div>

      {/* Personality */}
      <div>
        <label className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {t.characterForm.personalityLabel}
          <HintIcon hint={t.characterForm.personalityHint} />
        </label>
        <textarea
          value={personality}
          onChange={e => setPersonality(e.target.value)}
          maxLength={2000}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
            focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] resize-none"
          placeholder={t.characterForm.personalityPlaceholder}
        />
      </div>

      {/* Physical Description */}
      <div>
        <label className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {t.characterForm.physicalDescLabel}
          <HintIcon hint={t.characterForm.physicalDescHint} />
        </label>
        <textarea
          value={physicalDescription}
          onChange={e => setPhysicalDescription(e.target.value)}
          maxLength={2000}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
            focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] resize-none"
          placeholder={t.characterForm.physicalDescPlaceholder}
        />
      </div>

      {/* Voice */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
            {t.characterForm.voiceLabel}
            <HintIcon hint={t.characterForm.voiceHint} />
          </label>
          <button
            type="button"
            onClick={() => setShowVoicePicker(!showVoicePicker)}
            className="text-xs text-[#3D6AF2] hover:text-[#3D6AF2] cursor-pointer"
          >
            {showVoicePicker ? t.characterForm.hidePicker : voice ? t.characterForm.change : t.characterForm.chooseVoice}
          </button>
        </div>
        {voice && !showVoicePicker && (
          <p className="text-sm text-slate-600 dark:text-slate-400">{voice}</p>
        )}
        {!voice && !showVoicePicker && (
          <p className="text-sm text-slate-400 italic">{t.characterForm.autoAssign}</p>
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
          {t.characterForm.cancel}
        </button>
        <button
          type="submit"
          disabled={!name.trim() || loading}
          className="px-4 py-2 text-sm font-medium text-white bg-[#3D6AF2] hover:bg-[#3560d8]
            disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          {loading ? t.characterForm.saving : isEdit ? t.characterForm.save : t.characterForm.create}
        </button>
      </div>
    </form>
  )
}
