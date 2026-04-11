'use client'

import { useMemo } from 'react'
import { diffLines } from 'diff'
import type { I18nStrings } from '@/tools/formatter/i18n/en'

interface FormatterDiffProps {
  inputA: string
  inputB: string
  onInputAChange: (value: string) => void
  onInputBChange: (value: string) => void
  t: I18nStrings
}

export function FormatterDiff({
  inputA,
  inputB,
  onInputAChange,
  onInputBChange,
  t,
}: FormatterDiffProps) {
  const diffResult = useMemo(() => {
    if (!inputA.trim() || !inputB.trim()) return null
    return diffLines(inputA, inputB)
  }, [inputA, inputB])

  return (
    <div className="space-y-3">
      {/* Input A and Input B side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label htmlFor="diff-input-a" className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            {t.panes.inputA}
          </label>
          <textarea
            id="diff-input-a"
            value={inputA}
            onChange={(e) => onInputAChange(e.target.value)}
            placeholder={t.panes.inputPlaceholder}
            spellCheck={false}
            className="w-full font-mono text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1620] px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 resize-none"
            style={{ height: 'clamp(220px, 35vh, 400px)' }}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="diff-input-b" className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            {t.panes.inputB}
          </label>
          <textarea
            id="diff-input-b"
            value={inputB}
            onChange={(e) => onInputBChange(e.target.value)}
            placeholder={t.panes.inputPlaceholder}
            spellCheck={false}
            className="w-full font-mono text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1620] px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 resize-none"
            style={{ height: 'clamp(220px, 35vh, 400px)' }}
          />
        </div>
      </div>

      {/* Diff result */}
      <div>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
          {t.panes.diffResult}
        </p>
        {!diffResult ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0a0f17] px-4 py-6 text-center text-sm text-slate-400">
            {t.status.addBothSides}
          </div>
        ) : (
          <pre className="font-mono text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0a0f17] px-4 py-3 overflow-auto whitespace-pre-wrap" style={{ maxHeight: 'clamp(220px, 35vh, 400px)' }}>
            {diffResult.map((part, i) => {
              const className = part.added
                ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-200'
                : part.removed
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-200 line-through'
                  : 'text-slate-700 dark:text-slate-300'
              const prefix = part.added ? '+ ' : part.removed ? '- ' : '  '
              return (
                <span key={i} className={className}>
                  {part.value
                    .split('\n')
                    .filter((line, idx, arr) => !(idx === arr.length - 1 && line === ''))
                    .map((line) => `${prefix}${line}\n`)
                    .join('')}
                </span>
              )
            })}
          </pre>
        )}
      </div>
    </div>
  )
}
