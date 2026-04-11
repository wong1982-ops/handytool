'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import type {
  FormatterState,
  Format,
  FormatOrAuto,
  Action,
  Language,
} from '@/tools/formatter/formatter-types'
import { DEFAULT_STATE } from '@/tools/formatter/formatter-types'
import { FORMAT_DEFINITIONS, MAX_INPUT_BYTES } from '@/tools/formatter/formatter-defaults'
import { detectFormat } from '@/tools/formatter/formatter-detector'
import {
  formatClient,
  minifyClient,
  validateClient,
  convertClient,
} from '@/tools/formatter/formatter-client'
import { en } from '@/tools/formatter/i18n/en'
import { zh } from '@/tools/formatter/i18n/zh'
import type { I18nStrings } from '@/tools/formatter/i18n/en'

export default function FormatterStudio() {
  const [state, setState] = useState<FormatterState>(DEFAULT_STATE)
  const [language, setLanguage] = useState<Language>('en')

  const t: I18nStrings = language === 'zh' ? zh : en

  // Resolve the effective format (auto → detected; explicit → as-is)
  const effectiveFormat: Format | null = useMemo(() => {
    if (state.format === 'auto') return state.detectedFormat
    return state.format
  }, [state.format, state.detectedFormat])

  // Auto-detect when input changes
  useEffect(() => {
    if (!state.input.trim()) {
      setState((s) => ({ ...s, detectedFormat: null }))
      return
    }
    const detected = detectFormat(state.input)
    setState((s) => ({ ...s, detectedFormat: detected }))
  }, [state.input])

  const handleInputChange = useCallback((value: string) => {
    if (new Blob([value]).size > MAX_INPUT_BYTES) {
      setState((s) => ({
        ...s,
        validation: { ok: false, error: { message: en.errors.tooLarge } },
      }))
      return
    }
    setState((s) => ({ ...s, input: value, validation: null }))
  }, [])

  const handleInputBChange = useCallback((value: string) => {
    setState((s) => ({ ...s, inputB: value }))
  }, [])

  const handleFormatChange = useCallback((format: FormatOrAuto) => {
    setState((s) => ({ ...s, format }))
  }, [])

  const handleActionChange = useCallback((action: Action) => {
    setState((s) => ({ ...s, action, output: '', validation: null }))
  }, [])

  const handleConvertTargetChange = useCallback((target: Format) => {
    setState((s) => ({ ...s, convertTarget: target }))
  }, [])

  const handleRun = useCallback(async () => {
    if (!effectiveFormat) {
      setState((s) => ({
        ...s,
        validation: { ok: false, error: { message: t.errors.unknownFormat } },
      }))
      return
    }
    if (!state.input.trim()) {
      setState((s) => ({
        ...s,
        validation: { ok: false, error: { message: t.errors.empty } },
      }))
      return
    }

    const def = FORMAT_DEFINITIONS[effectiveFormat]

    // CONVERT
    if (state.action === 'convert') {
      if (!state.convertTarget) {
        setState((s) => ({
          ...s,
          validation: { ok: false, error: { message: t.status.convertUnsupported } },
        }))
        return
      }
      const result = convertClient(effectiveFormat, state.convertTarget, state.input)
      setState((s) => ({
        ...s,
        output: result.output ?? '',
        validation: result.validation,
      }))
      return
    }

    // VALIDATE
    if (state.action === 'validate') {
      const validation = validateClient(effectiveFormat, state.input)
      setState((s) => ({ ...s, output: '', validation }))
      return
    }

    // FORMAT or MINIFY
    if (def.execution === 'client') {
      const result =
        state.action === 'minify'
          ? minifyClient(effectiveFormat, state.input)
          : formatClient(effectiveFormat, state.input)
      setState((s) => ({
        ...s,
        output: result.output ?? '',
        validation: result.validation,
      }))
      return
    }

    // SERVER-SIDE
    setState((s) => ({ ...s, loading: true, validation: null }))
    try {
      const res = await fetch('/api/v1/formatter/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: effectiveFormat,
          action: state.action,
          content: state.input,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setState((s) => ({
          ...s,
          loading: false,
          output: json.data.result,
          validation: { ok: true },
        }))
      } else {
        setState((s) => ({
          ...s,
          loading: false,
          output: '',
          validation: { ok: false, error: { message: json.error || t.errors.serverError } },
        }))
      }
    } catch {
      setState((s) => ({
        ...s,
        loading: false,
        validation: { ok: false, error: { message: t.errors.networkError } },
      }))
    }
  }, [effectiveFormat, state.input, state.action, state.convertTarget, t])

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t.pageTitle}
        </h1>
        <button
          type="button"
          onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 min-h-[44px] cursor-pointer"
        >
          {language === 'en' ? '中文' : 'EN'}
        </button>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        {t.pageSubtitle}
      </p>
      {/* Sub-components added in subsequent tasks */}
      <div className="text-slate-400 text-sm">
        Studio scaffold ready. Toolbar / editor / diff / status bar coming in next tasks.
      </div>
      {/* Suppress unused warnings until subcomponents are wired */}
      <span hidden>
        {String(state.loading)}
        {String(handleInputChange)}
        {String(handleInputBChange)}
        {String(handleFormatChange)}
        {String(handleActionChange)}
        {String(handleConvertTargetChange)}
        {String(handleRun)}
        {String(effectiveFormat)}
      </span>
    </div>
  )
}
