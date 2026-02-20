'use client'

import { useState } from 'react'
import type { VectorizationSettings } from './types'
import './svg-converter.scss'

interface VectorizationSettingsProps {
  settings: VectorizationSettings
  onChange: (s: VectorizationSettings) => void
}

interface CheckboxItemProps {
  checked: boolean
  onToggle: () => void
  label: string
}

function CheckboxItem({ checked, onToggle, label }: CheckboxItemProps) {
  return (
    <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
      <span
        className="flex items-center justify-center flex-shrink-0 rounded border transition-colors duration-150"
        style={{
          width: '16px',
          height: '16px',
          borderColor: checked
            ? 'var(--tk-color-secondary-500, #32A9D9)'
            : 'rgba(255, 255, 255, 0.2)',
          backgroundColor: checked
            ? 'color-mix(in srgb, var(--tk-color-secondary-500, #32A9D9) 20%, transparent)'
            : 'transparent',
        }}
        role="presentation"
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 5L4 7L8 3"
              stroke="var(--tk-color-secondary-500, #32A9D9)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="sr-only"
        aria-label={label}
      />
      <span className="text-xs text-slate-300 group-hover:text-slate-100 transition-colors">
        {label}
      </span>
    </label>
  )
}

interface SliderControlProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  displayValue: string
  ariaLabel: string
  onChange: (value: number) => void
}

function SliderControl({ label, value, min, max, step = 1, displayValue, ariaLabel, onChange }: SliderControlProps) {
  const fillPct = ((value - min) / (max - min)) * 100

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-300">{label}</span>
        <span
          className="text-[10px] font-mono font-medium"
          style={{ color: 'var(--tk-color-secondary-500, #32A9D9)' }}
        >
          {displayValue}
        </span>
      </div>
      <div className="relative h-[6px]">
        <div
          className="absolute top-0 left-0 h-[6px] rounded-full"
          style={{
            width: `${fillPct}%`,
            backgroundColor: 'var(--tk-color-secondary-500, #32A9D9)',
            opacity: 0.6,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider-track relative z-10 w-full"
          aria-label={ariaLabel}
        />
      </div>
    </div>
  )
}

const MODE_OPTIONS: { value: VectorizationSettings['mode']; label: string }[] = [
  { value: 'spline', label: 'Spline' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'pixel', label: 'Pixel' },
]

export function VectorizationSettingsPanel({ settings, onChange }: VectorizationSettingsProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const update = (patch: Partial<VectorizationSettings>) => {
    onChange({ ...settings, ...patch })
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-slate-400"
        >
          <path
            d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M20 12H21M3 12H4M12 4V3M12 21V20"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M17.657 6.343L18.364 5.636M5.636 18.364L6.343 17.657M17.657 17.657L18.364 18.364M5.636 5.636L6.343 6.343"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
          Vectorization Settings
        </h3>
      </div>

      {/* Curve Fitting Mode */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-slate-300">Curve Fitting</span>
        <div className="grid grid-cols-3 gap-1">
          {MODE_OPTIONS.map((opt) => {
            const isActive = settings.mode === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => update({ mode: opt.value })}
                aria-pressed={isActive}
                className={`
                  py-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer
                  ${isActive
                    ? 'text-white'
                    : 'text-slate-400 bg-white/5 hover:bg-white/10'
                  }
                `}
                style={isActive ? {
                  backgroundColor: 'color-mix(in srgb, var(--tk-color-secondary-500, #32A9D9) 20%, transparent)',
                  color: 'var(--tk-color-secondary-500, #32A9D9)',
                  boxShadow: 'inset 0 0 0 1px var(--tk-color-secondary-500, #32A9D9)',
                } : undefined}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Noise Filter (filterSpeckle) */}
      <SliderControl
        label="Noise Filter"
        value={settings.filterSpeckle}
        min={1}
        max={128}
        displayValue={`${settings.filterSpeckle} px`}
        ariaLabel="Noise filter speckle size"
        onChange={(v) => update({ filterSpeckle: v })}
      />

      {/* Corner Sharpness (cornerThreshold) */}
      <SliderControl
        label="Corner Sharpness"
        value={settings.cornerThreshold}
        min={0}
        max={180}
        displayValue={`${settings.cornerThreshold}°`}
        ariaLabel="Corner threshold angle"
        onChange={(v) => update({ cornerThreshold: v })}
      />

      {/* Segment Length (lengthThreshold) */}
      <SliderControl
        label="Segment Length"
        value={settings.lengthThreshold}
        min={3.5}
        max={10}
        step={0.5}
        displayValue={settings.lengthThreshold.toFixed(1)}
        ariaLabel="Minimum segment length"
        onChange={(v) => update({ lengthThreshold: v })}
      />

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* Color section label */}
      <div className="flex items-center gap-2">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-slate-400"
        >
          <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="15" r="5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="16" cy="15" r="5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
          Color
        </span>
      </div>

      {/* Color Precision */}
      <SliderControl
        label="Color Depth"
        value={settings.colorPrecision}
        min={1}
        max={8}
        displayValue={`${settings.colorPrecision} bits`}
        ariaLabel="Color precision bits per channel"
        onChange={(v) => update({ colorPrecision: v })}
      />

      {/* Layer Difference */}
      <SliderControl
        label="Layer Difference"
        value={settings.layerDifference}
        min={1}
        max={64}
        displayValue={`${settings.layerDifference}`}
        ariaLabel="Color layer difference"
        onChange={(v) => update({ layerDifference: v })}
      />

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* Advanced Settings */}
      <div>
        <button
          type="button"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="flex items-center gap-2 w-full text-left group"
          aria-expanded={advancedOpen}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={`text-slate-500 transition-transform duration-200 ${advancedOpen ? 'rotate-90' : ''}`}
          >
            <path
              d="M4.5 2.5L8 6L4.5 9.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 group-hover:text-slate-400 transition-colors">
            Advanced Settings
          </span>
        </button>

        {advancedOpen && (
          <div className="mt-3 flex flex-col gap-4">
            {/* Splice Threshold */}
            <SliderControl
              label="Splice Angle"
              value={settings.spliceThreshold}
              min={0}
              max={180}
              displayValue={`${settings.spliceThreshold}°`}
              ariaLabel="Spline splice threshold angle"
              onChange={(v) => update({ spliceThreshold: v })}
            />

            {/* Path Precision */}
            <SliderControl
              label="Path Precision"
              value={settings.pathPrecision}
              min={1}
              max={8}
              displayValue={`${settings.pathPrecision} dp`}
              ariaLabel="SVG path coordinate decimal places"
              onChange={(v) => update({ pathPrecision: v })}
            />

            <div className="h-px bg-white/5" />

            <CheckboxItem
              checked={settings.optimizeSvg}
              onToggle={() => update({ optimizeSvg: !settings.optimizeSvg })}
              label="SVGO Optimization"
            />
            <CheckboxItem
              checked={settings.liveProcessing}
              onToggle={() => update({ liveProcessing: !settings.liveProcessing })}
              label="Live Processing"
            />
          </div>
        )}
      </div>
    </div>
  )
}
