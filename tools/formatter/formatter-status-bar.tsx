'use client'

import { useCallback, useState } from 'react'
import type { Format, ValidationResult } from '@/tools/formatter/formatter-types'
import { FORMAT_DEFINITIONS } from '@/tools/formatter/formatter-defaults'
import type { I18nStrings } from '@/tools/formatter/i18n/en'

interface FormatterStatusBarProps {
  output: string
  validation: ValidationResult | null
  effectiveFormat: Format | null
  t: I18nStrings
}

export function FormatterStatusBar({
  output,
  validation,
  effectiveFormat,
  t,
}: FormatterStatusBarProps) {
  const [copied, setCopied] = useState(false)

  const bytes = output ? new Blob([output]).size : 0
  const lines = output ? output.split('\n').length : 0

  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }, [output])

  const handleDownload = useCallback(() => {
    if (!output || !effectiveFormat) return
    const def = FORMAT_DEFINITIONS[effectiveFormat]
    const blob = new Blob([output], { type: def.mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formatted.${def.extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [output, effectiveFormat])

  let validationLabel: string | null = null
  let validationClass = ''
  if (validation) {
    if (validation.ok) {
      validationLabel = `✓ ${t.status.valid}${validation.summary ? ` · ${validation.summary}` : ''}`
      validationClass = 'text-green-600 dark:text-green-400'
    } else {
      const loc = validation.error?.line ? ` (line ${validation.error.line})` : ''
      validationLabel = `✗ ${t.status.invalid}${loc} — ${validation.error?.message ?? ''}`
      validationClass = 'text-red-600 dark:text-red-400'
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-slate-700 text-xs">
      {/* Validation status */}
      <div className={`flex-1 min-w-0 truncate ${validationClass || 'text-slate-500 dark:text-slate-400'}`}>
        {validationLabel ?? t.status.pasteToBegin}
      </div>

      {/* Counts */}
      {output && (
        <div className="text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {bytes} {t.status.bytes} · {lines} {t.status.lines}
        </div>
      )}

      {/* Privacy notice */}
      <div className="text-slate-400 dark:text-slate-500 italic whitespace-nowrap hidden sm:block">
        {t.status.privacy}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          disabled={!output}
          className="px-3 py-2 rounded-lg text-xs font-medium bg-white dark:bg-[#0f1620] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] cursor-pointer"
        >
          {copied ? `✓ ${t.status.copied}` : t.buttons.copy}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!output || !effectiveFormat}
          className="px-3 py-2 rounded-lg text-xs font-medium bg-white dark:bg-[#0f1620] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] cursor-pointer"
        >
          {t.buttons.download}
        </button>
      </div>
    </div>
  )
}
