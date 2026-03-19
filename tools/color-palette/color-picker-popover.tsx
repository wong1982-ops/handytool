'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex, isValidHex } from './color-utils'

interface ColorPickerPopoverProps {
  color: string
  onChange: (hex: string) => void
  onClose: () => void
}

export function ColorPickerPopover({ color, onChange, onClose }: ColorPickerPopoverProps) {
  const { r, g, b } = hexToRgb(color)
  const initialHsl = rgbToHsl(r, g, b)

  const [hue, setHue] = useState(initialHsl.h)
  const [saturation, setSaturation] = useState(initialHsl.s)
  const [lightness, setLightness] = useState(initialHsl.l)
  const [hexInput, setHexInput] = useState(color.toUpperCase())
  const popoverRef = useRef<HTMLDivElement>(null)

  // Sync internal state when color prop changes externally
  useEffect(() => {
    const { r: cr, g: cg, b: cb } = hexToRgb(color)
    const hsl = rgbToHsl(cr, cg, cb)
    setHue(hsl.h)
    setSaturation(hsl.s)
    setLightness(hsl.l)
    setHexInput(color.toUpperCase())
  }, [color])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Use setTimeout to avoid immediately closing from the click that opened the popover
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  const emitChange = useCallback(
    (h: number, s: number, l: number) => {
      const rgb = hslToRgb(h, s, l)
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
      setHexInput(hex)
      onChange(hex)
    },
    [onChange],
  )

  function handleHueChange(value: number) {
    setHue(value)
    emitChange(value, saturation, lightness)
  }

  function handleSaturationChange(value: number) {
    setSaturation(value)
    emitChange(hue, value, lightness)
  }

  function handleLightnessChange(value: number) {
    setLightness(value)
    emitChange(hue, saturation, value)
  }

  function handleHexSubmit() {
    const trimmed = hexInput.trim()
    const value = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
    if (isValidHex(value)) {
      const upperHex = value.length === 4
        ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toUpperCase()
        : value.toUpperCase()
      onChange(upperHex)
    } else {
      setHexInput(color.toUpperCase())
    }
  }

  function handleHexKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleHexSubmit()
  }

  const previewColor = rgbToHex(
    ...(() => {
      const rgb = hslToRgb(hue, saturation, lightness)
      return [rgb.r, rgb.g, rgb.b] as [number, number, number]
    })(),
  )

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Color picker"
      className="absolute z-50 top-full mt-2 left-0 w-64 rounded-xl border border-[var(--tk-color-border)] bg-[var(--tk-color-surface)] shadow-xl p-4 flex flex-col gap-3"
    >
      {/* Preview swatch + hex input */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full border border-[var(--tk-color-border)] shrink-0"
          style={{ backgroundColor: previewColor }}
          aria-label={`Preview: ${previewColor}`}
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
            onKeyDown={handleHexKeyDown}
            maxLength={6}
            aria-label="Hex color value"
            className="w-full pl-7 pr-2 py-2 text-sm font-mono rounded-lg border border-[var(--tk-color-border)] bg-[var(--tk-color-bg)] text-[var(--tk-color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]"
          />
        </div>
      </div>

      {/* Hue slider */}
      <SliderRow
        label="H"
        value={hue}
        min={0}
        max={360}
        onChange={handleHueChange}
        trackStyle={{
          background:
            'linear-gradient(to right, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)',
        }}
      />

      {/* Saturation slider */}
      <SliderRow
        label="S"
        value={saturation}
        min={0}
        max={100}
        onChange={handleSaturationChange}
        trackStyle={{
          background: `linear-gradient(to right, hsl(${hue}, 0%, ${lightness}%), hsl(${hue}, 100%, ${lightness}%))`,
        }}
      />

      {/* Lightness slider */}
      <SliderRow
        label="L"
        value={lightness}
        min={0}
        max={100}
        onChange={handleLightnessChange}
        trackStyle={{
          background: `linear-gradient(to right, hsl(${hue}, ${saturation}%, 0%), hsl(${hue}, ${saturation}%, 50%), hsl(${hue}, ${saturation}%, 100%))`,
        }}
      />
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
      <span className="text-xs font-semibold text-[var(--tk-color-text-muted)] w-4 shrink-0">
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
