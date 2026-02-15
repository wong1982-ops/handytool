'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-pulse text-sm text-slate-400">Loading preview...</div>
    </div>
  ),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParsedSpec = any

interface Header {
  key: string
  value: string
}

interface SwaggerUIPreviewProps {
  spec: ParsedSpec | null
  lastValidSpec: ParsedSpec | null
}

export function SwaggerUIPreview({ spec, lastValidSpec }: SwaggerUIPreviewProps) {
  const [baseUrl, setBaseUrl] = useState('')
  const [headers, setHeaders] = useState<Header[]>([{ key: '', value: '' }])
  const [configExpanded, setConfigExpanded] = useState(false)

  const headersRef = useRef(headers)
  headersRef.current = headers

  const displaySpec = spec || lastValidSpec

  // Inject custom base URL into spec servers
  const specWithServer = useMemo(() => {
    if (!displaySpec) return null
    if (!baseUrl.trim()) return displaySpec
    return {
      ...displaySpec,
      servers: [{ url: baseUrl.trim(), description: 'Custom server' }, ...(displaySpec.servers || [])],
    }
  }, [displaySpec, baseUrl])

  // Intercept requests to inject custom headers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestInterceptor = useCallback((req: any) => {
    const current = headersRef.current
    for (const { key, value } of current) {
      if (key.trim() && value.trim()) {
        req.headers[key.trim()] = value.trim()
      }
    }
    return req
  }, [])

  const addHeader = useCallback(() => {
    setHeaders((prev) => [...prev, { key: '', value: '' }])
  }, [])

  const removeHeader = useCallback((index: number) => {
    setHeaders((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateHeader = useCallback((index: number, field: 'key' | 'value', val: string) => {
    setHeaders((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: val } : h)))
  }, [])

  if (!displaySpec) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm text-slate-400">Enter OpenAPI YAML to see preview</p>
        </div>
      </div>
    )
  }

  const activeHeaderCount = headers.filter((h) => h.key.trim() && h.value.trim()).length

  return (
    <div className="flex-1 flex flex-col overflow-hidden swagger-ui-wrap">
      {/* Config bar */}
      <div className="shrink-0 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setConfigExpanded(!configExpanded)}
          className="flex items-center justify-between w-full px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
          aria-expanded={configExpanded}
        >
          <div className="flex items-center gap-2">
            <svg
              className={`w-3 h-3 text-slate-400 transition-transform ${configExpanded ? 'rotate-90' : ''}`}
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Request Config</span>
          </div>
          <div className="flex items-center gap-2">
            {baseUrl.trim() && (
              <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-[9px] font-bold">
                URL
              </span>
            )}
            {activeHeaderCount > 0 && (
              <span className="px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded text-[9px] font-bold">
                {activeHeaderCount} header{activeHeaderCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </button>

        {configExpanded && (
          <div className="px-3 pb-3 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
            {/* Base URL */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Base URL
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.example.com/v1"
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--ht-color-primary-500)] focus:border-[var(--ht-color-primary-500)]"
              />
            </div>

            {/* Headers */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Headers
                </label>
                <button
                  onClick={addHeader}
                  className="text-[10px] font-semibold text-[var(--ht-color-primary-500)] hover:text-[var(--ht-color-primary-600)] cursor-pointer"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-1.5">
                {headers.map((header, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={header.key}
                      onChange={(e) => updateHeader(i, 'key', e.target.value)}
                      placeholder="Header name"
                      className="flex-1 min-w-0 px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--ht-color-primary-500)] focus:border-[var(--ht-color-primary-500)]"
                    />
                    <input
                      type="text"
                      value={header.value}
                      onChange={(e) => updateHeader(i, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1 min-w-0 px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--ht-color-primary-500)] focus:border-[var(--ht-color-primary-500)]"
                    />
                    {headers.length > 1 && (
                      <button
                        onClick={() => removeHeader(i)}
                        className="shrink-0 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
                        aria-label="Remove header"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Swagger UI */}
      <div className="flex-1 overflow-y-auto">
        <SwaggerUI
          spec={specWithServer}
          docExpansion="list"
          defaultModelsExpandDepth={1}
          defaultModelExpandDepth={1}
          deepLinking={false}
          tryItOutEnabled
          requestInterceptor={requestInterceptor}
        />
      </div>
    </div>
  )
}
