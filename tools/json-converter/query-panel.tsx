'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import jmespath from 'jmespath'

interface QueryPanelProps {
  input: string
  onResult: (result: string | null) => void
}

export function QueryPanel({ input, onResult }: QueryPanelProps) {
  const [collapsed, setCollapsed] = useState(true)
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Check if input is valid JSON
  const isJsonInput = (() => {
    try {
      JSON.parse(input)
      return true
    } catch {
      return false
    }
  })()

  const executeQuery = useCallback((expression: string) => {
    if (!expression.trim()) {
      setError(null)
      setResult(null)
      onResult(null)
      return
    }

    if (!isJsonInput) {
      setError('JMESPath requires valid JSON input. Please ensure the input panel contains valid JSON.')
      setResult(null)
      onResult(null)
      return
    }

    try {
      const parsed = JSON.parse(input)
      const queryResult = jmespath.search(parsed, expression)
      const formatted = JSON.stringify(queryResult, null, 2)
      setResult(formatted)
      setError(null)
      onResult(formatted)
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Invalid JMESPath expression'
      setError(errMsg)
      setResult(null)
      onResult(null)
    }
  }, [input, isJsonInput, onResult])

  // Debounced live query
  useEffect(() => {
    if (!query.trim() || collapsed) return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      executeQuery(query)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, executeQuery, collapsed])

  // Clear results when collapsed
  useEffect(() => {
    if (collapsed) {
      onResult(null)
    }
  }, [collapsed, onResult])

  const handleRun = useCallback(() => {
    executeQuery(query)
  }, [query, executeQuery])

  const handleClear = useCallback(() => {
    setQuery('')
    setError(null)
    setResult(null)
    onResult(null)
  }, [onResult])

  return (
    <div className="mx-3 mb-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-3 h-3 text-slate-400 transition-transform ${collapsed ? '' : 'rotate-90'}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">JMESPath Query</span>
        </div>
        {!collapsed && result && (
          <span className="text-[10px] font-bold text-emerald-500">Result ready</span>
        )}
      </button>

      {!collapsed && (
        <div className="border-t border-slate-100 dark:border-slate-800">
          {/* Query input */}
          <div className="flex items-center gap-2 p-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRun() }}
                placeholder="e.g., features[0], config.tabSize, [?active==`true`]"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 font-mono text-[13px] text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/30 focus:border-[var(--tk-color-primary-500)] pr-8"
              />
              {query && (
                <button
                  onClick={handleClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  aria-label="Clear query"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={handleRun}
              disabled={!query.trim()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-[var(--tk-color-secondary-500)] text-slate-900 hover:bg-[var(--tk-color-secondary-500)]/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
              Run
            </button>
          </div>

          {/* Not JSON warning */}
          {!isJsonInput && query.trim() && (
            <div className="mx-3 mb-3 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-600 dark:text-amber-400">
              JMESPath requires valid JSON input. Current input is not valid JSON.
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mx-3 mb-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-xs text-red-600 dark:text-red-400 font-mono">
              {error}
            </div>
          )}

          {/* Result preview */}
          {result && (
            <div className="border-t border-slate-100 dark:border-slate-800">
              <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Query Result</span>
              </div>
              <pre className="px-3 py-2 max-h-40 overflow-auto font-mono text-[12px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {result}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
