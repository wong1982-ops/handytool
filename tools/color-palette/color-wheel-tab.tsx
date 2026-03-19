'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { PaletteColor, HarmonyRule } from './types'
import { HARMONY_LABELS } from './types'
import {
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  rgbToHex,
  generateHarmony,
  isValidHex,
} from './color-utils'

interface ColorWheelTabProps {
  colors: PaletteColor[]
  harmonyRule: HarmonyRule
  onColorsChange: (hexes: string[]) => void
  onRuleChange: (rule: HarmonyRule) => void
}

export function ColorWheelTab({
  colors,
  harmonyRule,
  onColorsChange,
  onRuleChange,
}: ColorWheelTabProps) {
  const baseHex = colors[0]?.hex ?? '#3D6AF2'
  const { r, g, b } = hexToRgb(baseHex)
  const initialHsl = rgbToHsl(r, g, b)

  const [hue, setHue] = useState(initialHsl.h)
  const [saturation, setSaturation] = useState(initialHsl.s)
  const [lightness, setLightness] = useState(initialHsl.l)
  const [hexInput, setHexInput] = useState(baseHex.toUpperCase())
  const [customHexes, setCustomHexes] = useState<string[]>(
    colors.map((c) => c.hex.toUpperCase()),
  )

  // Sync when colors change externally
  useEffect(() => {
    const hex = colors[0]?.hex ?? '#3D6AF2'
    const { r: cr, g: cg, b: cb } = hexToRgb(hex)
    const hsl = rgbToHsl(cr, cg, cb)
    setHue(hsl.h)
    setSaturation(hsl.s)
    setLightness(hsl.l)
    setHexInput(hex.toUpperCase())
    setCustomHexes(colors.map((c) => c.hex.toUpperCase()))
  }, [colors])

  const currentBaseHex = useMemo(() => {
    const rgb = hslToRgb(hue, saturation, lightness)
    return rgbToHex(rgb.r, rgb.g, rgb.b)
  }, [hue, saturation, lightness])

  const generate = useCallback(
    (rule: HarmonyRule, base: string) => {
      if (rule === 'custom') return
      const result = generateHarmony(base, rule)
      if (result.length > 0) {
        onColorsChange(result)
      }
    },
    [onColorsChange],
  )

  function handleSliderChange(h: number, s: number, l: number) {
    setHue(h)
    setSaturation(s)
    setLightness(l)
    const rgb = hslToRgb(h, s, l)
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
    setHexInput(hex)
  }

  function handleGenerate() {
    generate(harmonyRule, currentBaseHex)
  }

  function handleRuleChange(rule: HarmonyRule) {
    onRuleChange(rule)
    if (rule !== 'custom') {
      generate(rule, currentBaseHex)
    }
  }

  function handleHexSubmit() {
    const trimmed = hexInput.trim()
    const value = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
    if (isValidHex(value)) {
      const fullHex =
        value.length === 4
          ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toUpperCase()
          : value.toUpperCase()
      const { r: cr, g: cg, b: cb } = hexToRgb(fullHex)
      const hsl = rgbToHsl(cr, cg, cb)
      handleSliderChange(hsl.h, hsl.s, hsl.l)
      if (harmonyRule !== 'custom') {
        generate(harmonyRule, fullHex)
      }
    } else {
      setHexInput(currentBaseHex)
    }
  }

  function handleCustomHexChange(index: number, value: string) {
    const updated = [...customHexes]
    updated[index] = value.toUpperCase()
    setCustomHexes(updated)
  }

  function handleCustomHexSubmit(index: number) {
    const trimmed = customHexes[index].trim()
    const value = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
    if (isValidHex(value)) {
      const fullHex =
        value.length === 4
          ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toUpperCase()
          : value.toUpperCase()
      const updated = colors.map((c) => c.hex)
      updated[index] = fullHex
      onColorsChange(updated)
    } else {
      setCustomHexes(colors.map((c) => c.hex.toUpperCase()))
    }
  }

  // Compute dot positions on the hue ring
  const dotPositions = useMemo(() => {
    const radius = 85
    const centerX = 100
    const centerY = 100
    return colors.map((c) => {
      const { r: cr, g: cg, b: cb } = hexToRgb(c.hex)
      const { h: ch } = rgbToHsl(cr, cg, cb)
      const angle = ((ch - 90) * Math.PI) / 180
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        hex: c.hex,
      }
    })
  }, [colors])

  const rules = Object.entries(HARMONY_LABELS) as [HarmonyRule, string][]

  return (
    <div className="flex flex-col gap-6">
      {/* Hue ring visualization */}
      <div className="flex justify-center">
        <div
          className="relative w-[200px] h-[200px] rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)',
          }}
          aria-hidden="true"
        >
          {/* Inner cutout */}
          <div className="absolute inset-[30px] rounded-full bg-[var(--tk-color-surface)]" />
          {/* Color dots */}
          {dotPositions.map((dot, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                backgroundColor: dot.hex,
              }}
            />
          ))}
        </div>
      </div>

      {/* Harmony rule selector */}
      <div className="flex flex-wrap gap-1.5">
        {rules.map(([rule, label]) => (
          <button
            key={rule}
            type="button"
            onClick={() => handleRuleChange(rule)}
            className={`px-3 py-2 min-h-[44px] rounded-full text-sm font-medium transition-colors cursor-pointer ${
              harmonyRule === rule
                ? 'bg-[var(--tk-color-primary-500)] text-white'
                : 'bg-[var(--tk-color-hover)] text-[var(--tk-color-text)] hover:bg-[var(--tk-color-border)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Base color controls (non-custom mode) */}
      {harmonyRule !== 'custom' && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-[var(--tk-color-text)]">
            Base Color
          </h3>

          {/* Hex input */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg border border-[var(--tk-color-border)] shrink-0"
              style={{ backgroundColor: currentBaseHex }}
            />
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--tk-color-text-muted)] pointer-events-none">
                #
              </span>
              <input
                type="text"
                value={hexInput.replace(/^#/, '')}
                onChange={(e) => setHexInput(`#${e.target.value}`)}
                onBlur={handleHexSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleHexSubmit()}
                maxLength={6}
                aria-label="Base hex color"
                className="w-full pl-7 pr-2 py-2 text-sm font-mono rounded-lg border border-[var(--tk-color-border)] bg-[var(--tk-color-bg)] text-[var(--tk-color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]"
              />
            </div>
          </div>

          {/* Hue slider */}
          <SliderRow
            label="Hue"
            value={hue}
            min={0}
            max={360}
            onChange={(v) => handleSliderChange(v, saturation, lightness)}
            trackStyle={{
              background:
                'linear-gradient(to right, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)',
            }}
          />

          {/* Saturation slider */}
          <SliderRow
            label="Sat"
            value={saturation}
            min={0}
            max={100}
            onChange={(v) => handleSliderChange(hue, v, lightness)}
            trackStyle={{
              background: `linear-gradient(to right, hsl(${hue}, 0%, ${lightness}%), hsl(${hue}, 100%, ${lightness}%))`,
            }}
          />

          {/* Lightness slider */}
          <SliderRow
            label="Light"
            value={lightness}
            min={0}
            max={100}
            onChange={(v) => handleSliderChange(hue, saturation, v)}
            trackStyle={{
              background: `linear-gradient(to right, hsl(${hue}, ${saturation}%, 0%), hsl(${hue}, ${saturation}%, 50%), hsl(${hue}, ${saturation}%, 100%))`,
            }}
          />

          {/* Generate button */}
          <button
            type="button"
            onClick={handleGenerate}
            className="w-full py-3 min-h-[44px] rounded-xl bg-[var(--tk-color-primary-500)] text-white font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            Generate Palette
          </button>
        </div>
      )}

      {/* Custom mode: individual hex inputs */}
      {harmonyRule === 'custom' && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-[var(--tk-color-text)]">
            Custom Colors
          </h3>
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg border border-[var(--tk-color-border)] shrink-0"
                style={{ backgroundColor: c.hex }}
              />
              <span className="text-xs font-medium text-[var(--tk-color-text-muted)] w-16 shrink-0 capitalize">
                {c.name}
              </span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--tk-color-text-muted)] pointer-events-none">
                  #
                </span>
                <input
                  type="text"
                  value={customHexes[i]?.replace(/^#/, '') ?? ''}
                  onChange={(e) =>
                    handleCustomHexChange(i, `#${e.target.value}`)
                  }
                  onBlur={() => handleCustomHexSubmit(i)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && handleCustomHexSubmit(i)
                  }
                  maxLength={6}
                  aria-label={`${c.name} hex color`}
                  className="w-full pl-7 pr-2 py-2 text-sm font-mono rounded-lg border border-[var(--tk-color-border)] bg-[var(--tk-color-bg)] text-[var(--tk-color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Slider sub-component ─────────────────────────────────────────────────────

interface SliderRowProps {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  trackStyle: React.CSSProperties
}

function SliderRow({ label, value, min, max, onChange, trackStyle }: SliderRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-[var(--tk-color-text-muted)] w-10 shrink-0">
        {label}
      </span>
      <div className="relative flex-1 h-6 flex items-center">
        <div
          className="absolute inset-x-0 h-3 rounded-full"
          style={trackStyle}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={`${label} slider`}
          className="relative w-full h-6 appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-[var(--tk-color-border)] [&::-webkit-slider-thumb]:shadow-md
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-[var(--tk-color-border)] [&::-moz-range-thumb]:shadow-md"
        />
      </div>
      <span className="text-xs font-mono text-[var(--tk-color-text-muted)] w-8 text-right shrink-0">
        {value}
      </span>
    </div>
  )
}
