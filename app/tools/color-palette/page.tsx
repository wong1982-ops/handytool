'use client'

import { useState, useEffect, useCallback } from 'react'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import type { PaletteColor, HarmonyRule } from '@/tools/color-palette/types'
import { DEFAULT_PALETTE, COLOR_NAMES } from '@/tools/color-palette/types'
import { randomColor, generateHarmony } from '@/tools/color-palette/color-utils'
import { PaletteStrip } from '@/tools/color-palette/palette-strip'
import { ColorWheelTab } from '@/tools/color-palette/color-wheel-tab'
import { ImageTab } from '@/tools/color-palette/image-tab'
import { AITab } from '@/tools/color-palette/ai-tab'
import { SavedTab } from '@/tools/color-palette/saved-tab'
import { ExportPanel } from '@/tools/color-palette/export-panel'
import { AccessibilityPanel } from '@/tools/color-palette/accessibility-panel'
import { decodeColorsFromHash, copyShareUrl } from '@/tools/color-palette/url-sharing'

type ActiveTab = 'wheel' | 'image' | 'ai' | 'saved'

const TABS: { value: ActiveTab; label: string }[] = [
  { value: 'wheel', label: 'Wheel' },
  { value: 'image', label: 'Image' },
  { value: 'ai', label: 'AI' },
  { value: 'saved', label: 'Saved' },
]

export default function ColorPalettePage() {
  const [colors, setColors] = useState<PaletteColor[]>(DEFAULT_PALETTE)
  const [harmonyRule, setHarmonyRule] = useState<HarmonyRule>('analogous')
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<ActiveTab>('wheel')
  const [shareCopied, setShareCopied] = useState(false)

  // Restore from URL hash on mount
  useEffect(() => {
    const decoded = decodeColorsFromHash(window.location.hash)
    if (decoded) {
      setColors(
        decoded.map((hex, i) => ({
          hex,
          locked: false,
          name: COLOR_NAMES[i] ?? `color-${i + 1}`,
        })),
      )
    }
  }, [])

  const handleColorChange = useCallback((index: number, hex: string) => {
    setColors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, hex } : c)),
    )
  }, [])

  const handleToggleLock = useCallback((index: number) => {
    setColors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, locked: !c.locked } : c)),
    )
  }, [])

  const handleShuffle = useCallback(() => {
    setColors((prev) =>
      prev.map((c) => (c.locked ? c : { ...c, hex: randomColor() })),
    )
  }, [])

  const handleApplyColors = useCallback((hexes: string[]) => {
    setColors((prev) => {
      const updated = [...prev]
      let hexIdx = 0
      for (let i = 0; i < updated.length && hexIdx < hexes.length; i++) {
        if (!updated[i].locked) {
          updated[i] = { ...updated[i], hex: hexes[hexIdx] }
          hexIdx++
        }
      }
      return updated
    })
  }, [])

  const handleRuleChange = useCallback(
    (rule: HarmonyRule) => {
      setHarmonyRule(rule)
      if (rule !== 'custom') {
        const result = generateHarmony(colors[0].hex, rule)
        if (result.length > 0) {
          handleApplyColors(result)
        }
      }
    },
    [colors, handleApplyColors],
  )

  const handleColorsFromWheel = useCallback(
    (hexes: string[]) => {
      // ColorWheelTab provides all 5 colors directly
      setColors((prev) =>
        prev.map((c, i) => {
          if (c.locked) return c
          if (i < hexes.length) return { ...c, hex: hexes[i] }
          return c
        }),
      )
    },
    [],
  )

  async function handleShareCopy() {
    await copyShareUrl(colors)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }

  return (
    <main className="flex-1 flex flex-col items-center py-6 md:py-8 px-4 overflow-x-hidden">
      <div className="w-full max-w-5xl flex flex-col gap-6">
        <ToolBreadcrumb toolName="Color Palette" toolSlug="color-palette" />

        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Color Palette Generator
          </h1>
          <p className="text-xs text-slate-400 dark:text-[#70767f]">
            Harmony rules &middot; Image extraction &middot; AI generation &middot; Accessibility checker
          </p>
        </div>

        <PaletteStrip
          colors={colors}
          onColorChange={handleColorChange}
          onToggleLock={handleToggleLock}
          onShuffle={handleShuffle}
          expandedIndex={expandedIndex}
          onExpandToggle={(i) =>
            setExpandedIndex(expandedIndex === i ? null : i)
          }
        />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column: tabs */}
          <div className="flex-1 min-w-0">
            {/* Tab buttons */}
            <div
              role="tablist"
              className="flex gap-1 p-1 rounded-xl bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-[#1e2631] mb-5 w-fit"
            >
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    activeTab === tab.value
                      ? 'bg-slate-200 dark:bg-[#1e2631] shadow-sm text-white'
                      : 'text-slate-400 dark:text-[#70767f] hover:text-slate-500 dark:hover:text-[#a6abb5]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'wheel' && (
              <ColorWheelTab
                colors={colors}
                harmonyRule={harmonyRule}
                onColorsChange={handleColorsFromWheel}
                onRuleChange={handleRuleChange}
              />
            )}
            {activeTab === 'image' && (
              <ImageTab onApply={handleApplyColors} />
            )}
            {activeTab === 'ai' && (
              <AITab onApply={handleApplyColors} />
            )}
            {activeTab === 'saved' && (
              <SavedTab
                currentColors={colors.map((c) => c.hex)}
                onLoad={handleApplyColors}
              />
            )}
          </div>

          {/* Right column: share, export, accessibility */}
          <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-4">
            {/* Share button */}
            <button
              type="button"
              onClick={handleShareCopy}
              className="w-full py-3 min-h-[44px] rounded-xl border border-slate-200 dark:border-[#1e2631] hover:bg-slate-200 dark:hover:bg-[#1e2631] transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 dark:text-[#a6abb5]"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              {shareCopied ? 'URL Copied!' : 'Copy Share URL'}
            </button>

            <ExportPanel colors={colors} />
            <AccessibilityPanel colors={colors} />
          </div>
        </div>
      </div>
    </main>
  )
}
