'use client'

import { useState } from 'react'
import type { PaletteColor } from './types'
import { generateTintShadeScale, suggestTextColor } from './color-utils'
import { ColorPickerPopover } from './color-picker-popover'

interface PaletteStripProps {
  colors: PaletteColor[]
  onColorChange: (index: number, hex: string) => void
  onToggleLock: (index: number) => void
  onShuffle: () => void
  expandedIndex: number | null
  onExpandToggle: (index: number) => void
}

export function PaletteStrip({
  colors,
  onColorChange,
  onToggleLock,
  onShuffle,
  expandedIndex,
  onExpandToggle,
}: PaletteStripProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedStep, setCopiedStep] = useState<string | null>(null)

  async function handleCopyHex(hex: string, index: number) {
    await navigator.clipboard.writeText(hex)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  async function handleCopyStep(hex: string, stepKey: string) {
    await navigator.clipboard.writeText(hex)
    setCopiedStep(stepKey)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const scale =
    expandedIndex !== null ? generateTintShadeScale(colors[expandedIndex].hex) : null

  return (
    <div className="flex flex-col gap-4">
      {/* Swatch row */}
      <div className="flex gap-2 items-stretch">
        {colors.map((pc, i) => {
          const isExpanded = expandedIndex === i
          const isEditing = editingIndex === i

          return (
            <div key={i} className="relative flex-1 min-w-0 flex flex-col gap-1.5">
              {/* Color block */}
              <button
                type="button"
                onClick={() => setEditingIndex(isEditing ? null : i)}
                aria-label={`Edit ${pc.name} color: ${pc.hex}`}
                className={`h-16 w-full rounded-xl transition-all cursor-pointer border-2 ${
                  isExpanded
                    ? 'border-[#3D6AF2] ring-2 ring-[#3D6AF2]/40'
                    : 'border-transparent hover:border-slate-200 dark:hover:border-[#1e2631]'
                }`}
                style={{ backgroundColor: pc.hex }}
              />

              {/* Hex label */}
              <span
                className="text-xs font-mono text-center truncate text-slate-500 dark:text-[#a6abb5]"
                title={pc.hex}
              >
                {pc.hex}
              </span>

              {/* Action buttons */}
              <div className="flex justify-center gap-0.5">
                {/* Copy button */}
                <button
                  type="button"
                  onClick={() => handleCopyHex(pc.hex, i)}
                  aria-label={copiedIndex === i ? 'Copied' : `Copy ${pc.hex}`}
                  title={copiedIndex === i ? 'Copied!' : 'Copy hex'}
                  className={`p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-[#1e2631] transition-colors cursor-pointer ${copiedIndex === i ? 'text-[#10B981]' : 'text-slate-400 dark:text-[#70767f]'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {copiedIndex === i ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    )}
                  </svg>
                </button>

                {/* Lock toggle */}
                <button
                  type="button"
                  onClick={() => onToggleLock(i)}
                  aria-label={pc.locked ? `Unlock ${pc.name}` : `Lock ${pc.name}`}
                  title={pc.locked ? 'Locked' : 'Lock'}
                  className={`p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-[#1e2631] transition-colors cursor-pointer ${pc.locked ? 'text-[#3D6AF2]' : 'text-slate-400 dark:text-[#70767f]'}`}
                >
                  <svg className="w-4 h-4" fill={pc.locked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    {pc.locked ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    )}
                  </svg>
                </button>

                {/* Expand toggle */}
                <button
                  type="button"
                  onClick={() => onExpandToggle(i)}
                  aria-label={isExpanded ? `Collapse ${pc.name} scale` : `Expand ${pc.name} scale`}
                  title={isExpanded ? 'Collapse' : 'Expand tints/shades'}
                  className="p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-[#1e2631] transition-colors cursor-pointer text-slate-400 dark:text-[#70767f]"
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Color picker popover */}
              {isEditing && (
                <ColorPickerPopover
                  color={pc.hex}
                  onChange={(hex) => onColorChange(i, hex)}
                  onClose={() => setEditingIndex(null)}
                />
              )}
            </div>
          )
        })}

        {/* Shuffle button */}
        <button
          type="button"
          onClick={onShuffle}
          aria-label="Shuffle unlocked colors"
          title="Shuffle"
          className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl border border-slate-200 dark:border-[#1e2631] hover:bg-slate-200 dark:hover:bg-[#1e2631] transition-colors cursor-pointer self-start text-slate-400 dark:text-[#70767f] hover:text-slate-500 dark:hover:text-[#a6abb5]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Tint/shade expansion */}
      {scale && expandedIndex !== null && (
        <div className="overflow-x-auto pb-2 -mx-1 px-1 mt-3 hide-scrollbar">
          <div className="flex gap-1.5 min-w-max">
            {scale.map((step) => {
              const stepKey = `${expandedIndex}-${step.step}`
              const isCopied = copiedStep === stepKey
              const textCol = suggestTextColor(step.hex)

              return (
                <button
                  key={step.step}
                  type="button"
                  onClick={() => handleCopyStep(step.hex, stepKey)}
                  title={isCopied ? 'Copied!' : `Copy ${step.hex}`}
                  aria-label={`Step ${step.step}: ${step.hex}`}
                  className="flex flex-col items-center gap-1 cursor-pointer group"
                >
                  <div
                    className="w-12 h-12 rounded-lg border border-slate-200 dark:border-[#1e2631] transition-transform group-hover:scale-110 flex items-center justify-center"
                    style={{ backgroundColor: step.hex }}
                  >
                    {isCopied && (
                      <svg className="w-4 h-4" fill="none" stroke={textCol} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-[#70767f]">
                    {step.step}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-[#70767f] opacity-75">
                    {step.hex}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
