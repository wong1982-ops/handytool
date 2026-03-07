'use client'

import { STYLE_PRESETS, type BookStyle } from './types'

interface StylePickerProps {
  value: BookStyle
  onChange: (style: BookStyle) => void
}

export function StylePicker({ value, onChange }: StylePickerProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Illustration Style
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {STYLE_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange({ preset: preset.value, customPrompt: preset.value === 'custom' ? value.customPrompt : undefined })}
            className={`p-3 rounded-xl border-2 text-left transition-colors cursor-pointer ${
              value.preset === preset.value
                ? 'border-[#3D6AF2] bg-[#3D6AF2]/5 dark:bg-[#3D6AF2]/10'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
            style={{ minHeight: '44px' }}
          >
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{preset.label}</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{preset.description}</p>
          </button>
        ))}
      </div>
      {value.preset === 'custom' && (
        <textarea
          value={value.customPrompt || ''}
          onChange={(e) => onChange({ ...value, customPrompt: e.target.value })}
          placeholder="Describe your illustration style (e.g., 'retro 1950s comic book with halftone dots')"
          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm resize-none h-20 focus:border-[#3D6AF2] focus:outline-none"
          maxLength={500}
        />
      )}
    </div>
  )
}
