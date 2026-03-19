'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import { PresetSidebar, PresetDrawer } from '@/tools/regex-tester/preset-sidebar'
import { RegexInput } from '@/tools/regex-tester/regex-input'
import { RegexToolbar } from '@/tools/regex-tester/regex-toolbar'
import { TestInput } from '@/tools/regex-tester/test-input'
import { MatchResults } from '@/tools/regex-tester/match-results'
import { ReplacePanel } from '@/tools/regex-tester/replace-panel'
import { HistoryDrawer } from '@/tools/regex-tester/history-drawer'
import { useRegexEngine } from '@/tools/regex-tester/use-regex-engine'
import { decodeStateFromHash } from '@/tools/regex-tester/url-sharing'
import { saveToHistory } from '@/tools/regex-tester/history'
import type { RegexMode, RegexState, PresetPattern } from '@/tools/regex-tester/types'

export default function RegexTesterPage() {
  const [regex, setRegex] = useState('')
  const [flags, setFlags] = useState('gm')
  const [testInput, setTestInput] = useState('')
  const [replaceInput, setReplaceInput] = useState('')
  const [mode, setMode] = useState<RegexMode>('match')
  const [activePresetId, setActivePresetId] = useState<string | undefined>()
  const [presetDescription, setPresetDescription] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // On mount: restore state from URL hash
  useEffect(() => {
    const decoded = decodeStateFromHash(window.location.hash)
    if (decoded) {
      if (decoded.regex) setRegex(decoded.regex)
      if (decoded.flags) setFlags(decoded.flags)
      if (decoded.testInput) setTestInput(decoded.testInput)
      if (decoded.replaceInput) setReplaceInput(decoded.replaceInput)
      if (decoded.mode) setMode(decoded.mode)
    }
  }, [])

  // Auto-save to history (debounced 2s)
  useEffect(() => {
    if (!regex) return

    if (historyTimerRef.current) {
      clearTimeout(historyTimerRef.current)
    }

    historyTimerRef.current = setTimeout(() => {
      saveToHistory({ regex, flags, testInput, mode })
    }, 2000)

    return () => {
      if (historyTimerRef.current) {
        clearTimeout(historyTimerRef.current)
      }
    }
  }, [regex, flags, testInput, mode])

  // Regex engine
  const { matches, error, replaceResult, matchCount, groupCount } = useRegexEngine(
    regex,
    flags,
    testInput,
    replaceInput,
    mode,
  )

  // Current state object for toolbar share
  const currentState: RegexState = { regex, flags, testInput, replaceInput, mode }

  const handlePresetSelect = useCallback((preset: PresetPattern) => {
    setRegex(preset.regex)
    if (preset.defaultFlags) setFlags(preset.defaultFlags)
    setTestInput(preset.sampleInput)
    setActivePresetId(preset.id)
    setPresetDescription(preset.description)
  }, [])

  const handleClear = useCallback(() => {
    setRegex('')
    setFlags('gm')
    setTestInput('')
    setReplaceInput('')
    setMode('match')
    setActivePresetId(undefined)
    setPresetDescription(null)
  }, [])

  const handleRestore = useCallback((state: Partial<RegexState>) => {
    if (state.regex !== undefined) setRegex(state.regex)
    if (state.flags !== undefined) setFlags(state.flags)
    if (state.testInput !== undefined) setTestInput(state.testInput)
    if (state.mode !== undefined) setMode(state.mode)
    setActivePresetId(undefined)
    setPresetDescription(null)
  }, [])

  // When regex is manually edited, clear preset selection
  const handleRegexChange = useCallback((value: string) => {
    setRegex(value)
    setActivePresetId(undefined)
    setPresetDescription(null)
  }, [])

  return (
    <main className="flex-1 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-[1200px] flex flex-col gap-6">
        <ToolBreadcrumb toolName="Regex Tester" toolSlug="regex-tester" />

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Regex Tester
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Test, match, and replace with regular expressions — 100% client-side with 30+ preset patterns.
          </p>
        </div>

        {/* Mobile: Patterns button */}
        <div className="lg:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Pattern Library
          </button>
        </div>

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <PresetSidebar onSelect={handlePresetSelect} activePresetId={activePresetId} />

          {/* Main workspace */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <RegexToolbar
              mode={mode}
              onModeChange={setMode}
              state={currentState}
              onHistoryOpen={() => setHistoryOpen(true)}
              onClear={handleClear}
            />

            <RegexInput
              value={regex}
              onChange={handleRegexChange}
              flags={flags}
              onFlagsChange={setFlags}
              error={error}
            />

            {presetDescription && (
              <div className="px-3 py-2 rounded-lg bg-[var(--tk-color-primary-500)]/5 border border-[var(--tk-color-primary-500)]/20 text-sm text-[var(--tk-color-primary-700)] dark:text-[var(--tk-color-primary-300)]">
                {presetDescription}
              </div>
            )}

            <TestInput value={testInput} onChange={setTestInput} matches={matches} />

            {mode === 'replace' && (
              <ReplacePanel
                replaceInput={replaceInput}
                onReplaceInputChange={setReplaceInput}
                replaceResult={replaceResult}
              />
            )}

            <MatchResults
              matches={matches}
              matchCount={matchCount}
              groupCount={groupCount}
              hasRegex={!!regex}
              hasInput={!!testInput}
            />

            {/* Status bar */}
            <div className="flex flex-wrap items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span>{matchCount} match{matchCount !== 1 ? 'es' : ''}</span>
              <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">|</span>
              <span>{groupCount} group{groupCount !== 1 ? 's' : ''}</span>
              <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">|</span>
              <span>Flags: /{flags || '-'}/</span>
              <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">|</span>
              <span>JavaScript RegExp</span>
            </div>
          </div>
        </div>
      </div>

      <PresetDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSelect={handlePresetSelect}
        activePresetId={activePresetId}
      />

      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRestore={handleRestore}
      />
    </main>
  )
}
