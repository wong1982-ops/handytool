'use client'

import type { TaxPreset } from '../invoice-types'

interface TaxPresetSelectProps {
  value: string
  taxPresets: TaxPreset[]
  onChange: (presetId: string) => void
  className?: string
}

const SELECT_CLASS =
  'w-full min-h-[44px] px-3.5 py-2.5 pr-10 bg-[#090f16] border border-[#1e2631] rounded-lg text-white text-sm appearance-none focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 outline-none transition-colors bg-[right_12px_center] bg-no-repeat bg-[length:16px]'

const CHEVRON_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2370767f'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`

export function TaxPresetSelect({ value, taxPresets, onChange, className = '' }: TaxPresetSelectProps) {
  return (
    <select
      className={`${SELECT_CLASS} ${className}`}
      style={{ backgroundImage: CHEVRON_BG }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">No tax</option>
      {taxPresets.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name} {Math.round(p.rate * 100)}%
        </option>
      ))}
    </select>
  )
}
