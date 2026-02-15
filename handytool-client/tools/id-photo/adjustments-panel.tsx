'use client'

import type { Adjustments } from './types'

interface AdjustmentsPanelProps {
  adjustments: Adjustments
  onChange: (adjustments: Adjustments) => void
}

interface SliderConfig {
  key: keyof Adjustments
  label: string
  min: number
  max: number
}

const SLIDERS: SliderConfig[] = [
  { key: 'brightness', label: 'Brightness', min: -100, max: 100 },
  { key: 'contrast', label: 'Contrast', min: -100, max: 100 },
  { key: 'sharpness', label: 'Sharpness', min: -100, max: 100 },
]

export function AdjustmentsPanel({ adjustments, onChange }: AdjustmentsPanelProps) {
  const handleChange = (key: keyof Adjustments, value: number) => {
    onChange({ ...adjustments, [key]: value })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Image Calibration
      </h3>

      {SLIDERS.map(({ key, label, min, max }) => {
        const value = adjustments[key]
        const displayValue = value > 0 ? `+${value}%` : `${value}%`

        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor={`adj-${key}`} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {label}
              </label>
              <span className="text-xs font-bold text-[var(--ht-color-secondary-500)] tabular-nums">
                {displayValue}
              </span>
            </div>
            <input
              id={`adj-${key}`}
              type="range"
              min={min}
              max={max}
              value={value}
              onChange={(e) => handleChange(key, Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-[var(--ht-color-secondary-500)] [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--ht-color-secondary-500)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:dark:border-slate-800"
            />
          </div>
        )
      })}
    </div>
  )
}
