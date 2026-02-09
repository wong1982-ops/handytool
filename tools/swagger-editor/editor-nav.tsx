'use client'

import { useMemo } from 'react'

interface OpenApiSpec {
  paths?: Record<string, Record<string, { summary?: string; operationId?: string; tags?: string[] }>>
  components?: {
    schemas?: Record<string, unknown>
    securitySchemes?: Record<string, { type?: string }>
  }
}

interface EditorNavProps {
  spec: OpenApiSpec | null
  selectedEndpoint: string | null
  onSelectEndpoint: (id: string) => void
}

const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
  get: { bg: 'bg-green-500/20', text: 'text-green-400' },
  post: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  put: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  delete: { bg: 'bg-red-500/20', text: 'text-red-400' },
  patch: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
}

export function EditorNav({ spec, selectedEndpoint, onSelectEndpoint }: EditorNavProps) {
  const endpoints = useMemo(() => {
    if (!spec?.paths) return []
    const result: { id: string; method: string; path: string; summary: string }[] = []
    for (const [path, methods] of Object.entries(spec.paths)) {
      for (const [method, details] of Object.entries(methods)) {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
          result.push({
            id: `${method}-${path}`,
            method,
            path,
            summary: details?.summary || '',
          })
        }
      }
    }
    return result
  }, [spec])

  const schemas = useMemo(() => {
    if (!spec?.components?.schemas) return []
    return Object.keys(spec.components.schemas)
  }, [spec])

  const securitySchemes = useMemo(() => {
    if (!spec?.components?.securitySchemes) return []
    return Object.entries(spec.components.securitySchemes)
  }, [spec])

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1a1d] flex-col hidden lg:flex">
      <div className="p-4 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Navigation</span>
        <button className="text-slate-400 hover:text-[var(--ht-color-secondary-500)] transition-colors cursor-pointer" aria-label="Expand all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-4">
        {/* Endpoints */}
        <div>
          <div className="flex items-center gap-2 px-2 py-1 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Endpoints
          </div>
          <div className="mt-1 space-y-0.5">
            {endpoints.map((ep) => {
              const colors = METHOD_COLORS[ep.method] || METHOD_COLORS.get
              const isSelected = selectedEndpoint === ep.id
              return (
                <button
                  key={ep.id}
                  onClick={() => onSelectEndpoint(ep.id)}
                  className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer truncate ${
                    isSelected
                      ? 'bg-[var(--ht-color-secondary-500)]/10 text-[var(--ht-color-secondary-500)]'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/5'
                  }`}
                >
                  <span className={`text-[10px] font-bold px-1 rounded ${colors.bg} ${colors.text} w-9 text-center shrink-0 uppercase`}>
                    {ep.method}
                  </span>
                  <span className="text-sm truncate">{ep.path}</span>
                </button>
              )
            })}
            {endpoints.length === 0 && (
              <p className="text-xs text-slate-400 px-2 py-1">No endpoints defined</p>
            )}
          </div>
        </div>

        {/* Schemas */}
        <div>
          <div className="flex items-center gap-2 px-2 py-1 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            Schemas
          </div>
          <div className="mt-1 space-y-0.5">
            {schemas.map((name) => (
              <div
                key={name}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className="text-sm">{name}</span>
              </div>
            ))}
            {schemas.length === 0 && (
              <p className="text-xs text-slate-400 px-2 py-1">No schemas defined</p>
            )}
          </div>
        </div>

        {/* Security */}
        <div>
          <div className="flex items-center gap-2 px-2 py-1 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Security
          </div>
          <div className="mt-1 space-y-0.5">
            {securitySchemes.map(([name]) => (
              <div
                key={name}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span className="text-sm">{name}</span>
              </div>
            ))}
            {securitySchemes.length === 0 && (
              <p className="text-xs text-slate-400 px-2 py-1">No security schemes</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom action */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 text-xs font-medium hover:bg-slate-200 dark:hover:bg-white/5 transition-colors cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Endpoint
        </button>
      </div>
    </aside>
  )
}
