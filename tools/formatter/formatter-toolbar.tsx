'use client'

import type {
  Format,
  FormatOrAuto,
  Action,
} from '@/tools/formatter/formatter-types'
import { ALL_FORMATS, FORMAT_DEFINITIONS } from '@/tools/formatter/formatter-defaults'
import type { I18nStrings } from '@/tools/formatter/i18n/en'

interface FormatterToolbarProps {
  format: FormatOrAuto
  detectedFormat: Format | null
  effectiveFormat: Format | null
  action: Action
  convertTarget: Format | null
  loading: boolean
  onFormatChange: (format: FormatOrAuto) => void
  onActionChange: (action: Action) => void
  onConvertTargetChange: (target: Format) => void
  onRun: () => void
  t: I18nStrings
}

const ACTIONS: Action[] = ['format', 'minify', 'validate', 'convert', 'diff']

export function FormatterToolbar({
  format,
  detectedFormat,
  effectiveFormat,
  action,
  convertTarget,
  loading,
  onFormatChange,
  onActionChange,
  onConvertTargetChange,
  onRun,
  t,
}: FormatterToolbarProps) {
  const convertTargets = effectiveFormat
    ? FORMAT_DEFINITIONS[effectiveFormat].convertTargets
    : []

  const minifySupported =
    effectiveFormat !== null && FORMAT_DEFINITIONS[effectiveFormat].canMinify

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 p-3 rounded-xl bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-slate-700">
      {/* Format dropdown */}
      <div className="flex items-center gap-2">
        <label htmlFor="format-select" className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {t.formatLabel}
        </label>
        <select
          id="format-select"
          value={format}
          onChange={(e) => onFormatChange(e.target.value as FormatOrAuto)}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1620] px-3 py-2 text-sm text-slate-900 dark:text-white min-h-[44px] cursor-pointer"
        >
          <option value="auto">
            {t.auto}{detectedFormat ? ` (${t.detected}: ${FORMAT_DEFINITIONS[detectedFormat].label})` : ''}
          </option>
          {ALL_FORMATS.map((f) => (
            <option key={f} value={f}>
              {FORMAT_DEFINITIONS[f].label}
            </option>
          ))}
        </select>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        {ACTIONS.map((act) => {
          const isActive = action === act
          const isDisabled = act === 'minify' && !minifySupported
          return (
            <button
              key={act}
              type="button"
              onClick={() => onActionChange(act)}
              disabled={isDisabled}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'bg-white dark:bg-[#0f1620] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {t.actions[act]}
            </button>
          )
        })}
      </div>

      {/* Convert target dropdown — only when convert is active */}
      {action === 'convert' && (
        <div className="flex items-center gap-2">
          <label htmlFor="convert-select" className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t.convertTo}
          </label>
          <select
            id="convert-select"
            value={convertTarget ?? ''}
            onChange={(e) => onConvertTargetChange(e.target.value as Format)}
            disabled={convertTargets.length === 0}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1620] px-3 py-2 text-sm text-slate-900 dark:text-white min-h-[44px] cursor-pointer disabled:opacity-40"
          >
            <option value="">—</option>
            {convertTargets.map((f) => (
              <option key={f} value={f}>
                {FORMAT_DEFINITIONS[f].label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Run button */}
      <div className="ml-auto">
        <button
          type="button"
          onClick={onRun}
          disabled={loading}
          className="px-6 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:opacity-90 disabled:opacity-50 min-h-[44px] cursor-pointer"
        >
          {loading ? t.status.loading : t.actions[action]}
        </button>
      </div>
    </div>
  )
}
