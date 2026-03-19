'use client'

import { useState, useMemo } from 'react'
import type { PaletteColor } from './types'
import {
  contrastRatio,
  meetsAA,
  meetsAAA,
  suggestTextColor,
  simulateColorBlindness,
} from './color-utils'

interface AccessibilityPanelProps {
  colors: PaletteColor[]
}

type CBType = 'protanopia' | 'deuteranopia' | 'tritanopia'

const CB_LABELS: { type: CBType; label: string }[] = [
  { type: 'protanopia', label: 'Protanopia (red-blind)' },
  { type: 'deuteranopia', label: 'Deuteranopia (green-blind)' },
  { type: 'tritanopia', label: 'Tritanopia (blue-blind)' },
]

function CollapsibleSection({
  title,
  defaultOpen,
  children,
}: {
  title: string
  defaultOpen: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-[var(--tk-color-border)] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] text-sm font-semibold text-[var(--tk-color-text)] hover:bg-[var(--tk-color-hover)] transition-colors cursor-pointer"
        aria-expanded={open}
      >
        {title}
        <svg
          className={`w-4 h-4 text-[var(--tk-color-text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

export function AccessibilityPanel({ colors }: AccessibilityPanelProps) {
  // Determine default open state based on screen width (SSR-safe default: closed)
  const [isDesktop] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth >= 1024
  })

  // Pre-compute contrast matrix
  const contrastMatrix = useMemo(() => {
    return colors.map((fg) =>
      colors.map((bg) => contrastRatio(fg.hex, bg.hex)),
    )
  }, [colors])

  // Pre-compute color blindness simulations
  const cbSimulations = useMemo(() => {
    return CB_LABELS.map(({ type }) => ({
      type,
      simulated: colors.map((c) => simulateColorBlindness(c.hex, type)),
    }))
  }, [colors])

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-[var(--tk-color-text)]">
        Accessibility
      </h3>

      {/* Section 1: Contrast Checker */}
      <CollapsibleSection title="Contrast Checker" defaultOpen={isDesktop}>
        <div className="flex flex-col gap-4">
          {/* 5x5 matrix */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-1 text-[var(--tk-color-text-muted)] font-medium text-left">
                    FG / BG
                  </th>
                  {colors.map((c, i) => (
                    <th key={i} className="p-1">
                      <div
                        className="w-6 h-6 rounded border border-[var(--tk-color-border)] mx-auto"
                        style={{ backgroundColor: c.hex }}
                        title={c.hex}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {colors.map((fg, ri) => (
                  <tr key={ri}>
                    <td className="p-1">
                      <div
                        className="w-6 h-6 rounded border border-[var(--tk-color-border)]"
                        style={{ backgroundColor: fg.hex }}
                        title={fg.hex}
                      />
                    </td>
                    {colors.map((bg, ci) => {
                      if (ri === ci) {
                        return (
                          <td key={ci} className="p-1 text-center text-[var(--tk-color-text-muted)]">
                            —
                          </td>
                        )
                      }
                      const ratio = contrastMatrix[ri][ci]
                      const passAA = meetsAA(ratio)
                      const passAAA = meetsAAA(ratio)

                      return (
                        <td key={ci} className="p-1">
                          <div className="flex flex-col items-center gap-0.5">
                            {/* Preview */}
                            <div
                              className="w-8 h-5 rounded flex items-center justify-center text-[10px] font-bold"
                              style={{ backgroundColor: bg.hex, color: fg.hex }}
                            >
                              Aa
                            </div>
                            {/* Ratio */}
                            <span className="text-[10px] font-mono text-[var(--tk-color-text-muted)]">
                              {ratio.toFixed(1)}
                            </span>
                            {/* Badges */}
                            <div className="flex gap-0.5">
                              <span
                                className={`text-[8px] font-bold px-1 rounded ${
                                  passAA
                                    ? 'bg-green-500/20 text-green-500'
                                    : 'bg-red-500/20 text-red-500'
                                }`}
                              >
                                AA
                              </span>
                              <span
                                className={`text-[8px] font-bold px-1 rounded ${
                                  passAAA
                                    ? 'bg-green-500/20 text-green-500'
                                    : 'bg-red-500/20 text-red-500'
                                }`}
                              >
                                AAA
                              </span>
                            </div>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Suggested text colors */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-[var(--tk-color-text-muted)]">
              Suggested text colors
            </span>
            <div className="flex gap-2">
              {colors.map((c, i) => {
                const textCol = suggestTextColor(c.hex)
                return (
                  <div
                    key={i}
                    className="flex-1 h-10 rounded-lg flex items-center justify-center text-xs font-bold border border-[var(--tk-color-border)]"
                    style={{ backgroundColor: c.hex, color: textCol }}
                  >
                    Aa
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 2: Color Blindness Simulation */}
      <CollapsibleSection title="Color Blindness Simulation" defaultOpen={isDesktop}>
        <div className="flex flex-col gap-4">
          {cbSimulations.map(({ type, simulated }) => {
            const label = CB_LABELS.find((l) => l.type === type)!.label

            // Check for nearly indistinguishable adjacent colors
            const warnings: number[] = []
            for (let i = 0; i < simulated.length - 1; i++) {
              const ratio = contrastRatio(simulated[i], simulated[i + 1])
              if (ratio < 1.5) {
                warnings.push(i)
              }
            }

            return (
              <div key={type} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[var(--tk-color-text)]">
                    {label}
                  </span>
                  {warnings.length > 0 && (
                    <svg
                      className="w-4 h-4 text-amber-500 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="Some adjacent colors may be hard to distinguish"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  )}
                </div>

                {/* Simulated swatches */}
                <div className="flex gap-1.5">
                  {simulated.map((hex, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full aspect-square rounded-lg border ${
                          warnings.includes(i) || warnings.includes(i - 1)
                            ? 'border-amber-500 border-2'
                            : 'border-[var(--tk-color-border)]'
                        }`}
                        style={{ backgroundColor: hex }}
                        title={`Simulated: ${hex}`}
                      />
                    </div>
                  ))}
                </div>

                {/* Original for comparison */}
                <div className="flex gap-1.5">
                  {colors.map((c, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full aspect-square rounded-lg border border-[var(--tk-color-border)] opacity-60"
                        style={{ backgroundColor: c.hex }}
                        title={`Original: ${c.hex}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CollapsibleSection>
    </div>
  )
}
