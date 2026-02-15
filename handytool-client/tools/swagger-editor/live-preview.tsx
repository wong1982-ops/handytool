'use client'

import { useMemo, useRef, useImperativeHandle, forwardRef } from 'react'
import { EndpointCard } from './endpoint-card'
import { SchemaCard } from './schema-card'
import type { ValidationError } from './use-openapi-validator'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParsedSpec = any

export interface LivePreviewHandle {
  scrollToPercent: (percent: number) => void
}

interface LivePreviewProps {
  spec: ParsedSpec | null
  dereferencedSpec?: ParsedSpec | null
  lastValidSpec: ParsedSpec | null
  errors: ValidationError[]
  expandedEndpoint: string | null
  onToggleEndpoint: (id: string) => void
  onScrollPercent?: (percent: number) => void
}

interface EndpointEntry {
  id: string
  method: string
  path: string
  summary?: string
  description?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestBody?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responses?: any
  tags: string[]
}

export const LivePreview = forwardRef<LivePreviewHandle, LivePreviewProps>(function LivePreview({ spec, dereferencedSpec, lastValidSpec, errors, expandedEndpoint, onToggleEndpoint, onScrollPercent }, ref) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isSyncingScroll = useRef(false)

  useImperativeHandle(ref, () => ({
    scrollToPercent(percent: number) {
      const el = scrollRef.current
      if (!el) return
      const maxScroll = el.scrollHeight - el.clientHeight
      if (maxScroll <= 0) return
      isSyncingScroll.current = true
      el.scrollTop = percent * maxScroll
      requestAnimationFrame(() => { isSyncingScroll.current = false })
    },
  }), [])

  // Use dereferenced spec (all $refs resolved) if available, fallback to raw spec, then last valid
  const displaySpec = dereferencedSpec || spec || lastValidSpec
  const isStale = !spec && !!lastValidSpec
  const hasErrors = errors.filter((e) => e.severity === 'error').length > 0
  const hasWarnings = errors.filter((e) => e.severity === 'warning').length > 0

  // Group endpoints by tag
  const groupedEndpoints = useMemo(() => {
    if (!displaySpec?.paths) return new Map<string, EndpointEntry[]>()
    const groups = new Map<string, EndpointEntry[]>()

    for (const [path, methods] of Object.entries(displaySpec.paths as Record<string, unknown>)) {
      if (!methods || typeof methods !== 'object') continue
      for (const [method, details] of Object.entries(methods as Record<string, Record<string, unknown>>)) {
        if (!['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(method)) continue
        if (!details || typeof details !== 'object') continue
        const tags = (details?.tags as string[]) || ['default']
        const entry: EndpointEntry = {
          id: `${method}-${path}`,
          method,
          path,
          summary: details?.summary as string | undefined,
          description: details?.description as string | undefined,
          parameters: details?.parameters,
          requestBody: details?.requestBody,
          responses: details?.responses,
          tags,
        }
        for (const tag of tags) {
          const existing = groups.get(tag) || []
          existing.push(entry)
          groups.set(tag, existing)
        }
      }
    }
    return groups
  }, [displaySpec])

  const schemas = useMemo(() => {
    if (!displaySpec?.components?.schemas) return []
    return Object.entries(displaySpec.components.schemas as Record<string, { properties?: Record<string, { type?: string; format?: string }>; required?: string[] }>)
  }, [displaySpec])

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

  const apiTitle = displaySpec.info?.title || 'Untitled API'
  const apiVersion = displaySpec.info?.version || ''
  const apiDescription = displaySpec.info?.description || ''
  const oasVersion = displaySpec.openapi?.startsWith('3') ? 'OAS3' : displaySpec.swagger ? 'OAS2' : ''

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
      onScroll={() => {
        if (isSyncingScroll.current) return
        const el = scrollRef.current
        if (!el) return
        const maxScroll = el.scrollHeight - el.clientHeight
        if (maxScroll <= 0) return
        onScrollPercent?.(el.scrollTop / maxScroll)
      }}
    >
      {/* Stale banner */}
      {isStale && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg text-xs text-red-600 dark:text-red-400">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
          </svg>
          <span className="font-medium">YAML syntax error — showing last valid state</span>
        </div>
      )}

      {/* Validation warning banner */}
      {!isStale && hasErrors && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg text-xs text-amber-600 dark:text-amber-400">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
          <span className="font-medium">OpenAPI validation errors — preview may be incomplete</span>
        </div>
      )}

      {!isStale && !hasErrors && hasWarnings && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg text-xs text-blue-600 dark:text-blue-400">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <span className="font-medium">Warnings found — check the Problems panel</span>
        </div>
      )}

      {/* API Header */}
      <div>
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{apiTitle}</h2>
          {apiVersion && (
            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-xs font-mono text-slate-600 dark:text-slate-400">{apiVersion}</span>
          )}
          {oasVersion && (
            <span className="px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded text-[10px] font-bold uppercase tracking-tight">{oasVersion}</span>
          )}
        </div>
        {apiDescription && (
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{apiDescription}</p>
        )}
        {/* Servers */}
        {displaySpec.servers && Array.isArray(displaySpec.servers) && displaySpec.servers.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {displaySpec.servers.map((server: { url?: string; description?: string }, i: number) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-white/5 rounded text-[11px] font-mono text-slate-500 dark:text-slate-400" title={server.description}>
                <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                {server.url}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Endpoints by tag */}
      {Array.from(groupedEndpoints.entries()).map(([tag, endpoints]) => (
        <div key={tag} className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2 capitalize">{tag}</h3>
          {endpoints.map((ep) => (
            <EndpointCard
              key={ep.id}
              method={ep.method}
              path={ep.path}
              summary={ep.summary}
              description={ep.description}
              parameters={ep.parameters}
              requestBody={ep.requestBody}
              responses={ep.responses}
              expanded={expandedEndpoint === ep.id}
              onToggle={() => onToggleEndpoint(ep.id)}
            />
          ))}
        </div>
      ))}

      {groupedEndpoints.size === 0 && (
        <p className="text-sm text-slate-400">No endpoints defined in paths.</p>
      )}

      {/* Schemas */}
      {schemas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">Schemas</h3>
          {schemas.map(([name, schema]) => (
            <SchemaCard
              key={name}
              name={name}
              properties={schema.properties}
              required={schema.required}
            />
          ))}
        </div>
      )}
    </div>
  )
})
