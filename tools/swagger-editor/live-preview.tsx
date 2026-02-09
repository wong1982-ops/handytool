'use client'

import { useMemo } from 'react'
import { EndpointCard } from './endpoint-card'
import { SchemaCard } from './schema-card'

interface OpenApiSpec {
  openapi?: string
  info?: {
    title?: string
    version?: string
    description?: string
  }
  servers?: { url: string }[]
  paths?: Record<string, Record<string, {
    summary?: string
    operationId?: string
    tags?: string[]
    parameters?: {
      name: string
      in: string
      description?: string
      required?: boolean
      schema?: { type?: string }
    }[]
    responses?: Record<string, {
      description?: string
      content?: Record<string, { schema?: unknown; example?: unknown }>
    }>
  }>>
  components?: {
    schemas?: Record<string, {
      type?: string
      properties?: Record<string, { type?: string; format?: string; items?: { type?: string; format?: string } }>
      required?: string[]
    }>
  }
}

interface LivePreviewProps {
  spec: OpenApiSpec | null
  expandedEndpoint: string | null
  onToggleEndpoint: (id: string) => void
}

interface EndpointEntry {
  id: string
  method: string
  path: string
  summary?: string
  parameters?: {
    name: string
    in: string
    description?: string
    required?: boolean
    schema?: { type?: string }
  }[]
  responses?: Record<string, {
    description?: string
    content?: Record<string, { schema?: unknown; example?: unknown }>
  }>
  tags: string[]
}

export function LivePreview({ spec, expandedEndpoint }: LivePreviewProps) {
  // Group endpoints by tag
  const groupedEndpoints = useMemo(() => {
    if (!spec?.paths) return new Map<string, EndpointEntry[]>()
    const groups = new Map<string, EndpointEntry[]>()

    for (const [path, methods] of Object.entries(spec.paths)) {
      for (const [method, details] of Object.entries(methods)) {
        if (!['get', 'post', 'put', 'delete', 'patch'].includes(method)) continue
        const tags = details?.tags || ['default']
        const entry: EndpointEntry = {
          id: `${method}-${path}`,
          method,
          path,
          summary: details?.summary,
          parameters: details?.parameters,
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
  }, [spec])

  const schemas = useMemo(() => {
    if (!spec?.components?.schemas) return []
    return Object.entries(spec.components.schemas)
  }, [spec])

  if (!spec) {
    return (
      <section className="w-1/3 min-w-[340px] flex flex-col bg-white dark:bg-[#101f22] shrink-0 hidden xl:flex">
        <div className="h-10 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-slate-50 dark:bg-white/5 shrink-0">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Live Preview</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-slate-400">Enter valid OpenAPI YAML to see preview</p>
        </div>
      </section>
    )
  }

  const apiTitle = spec.info?.title || 'Untitled API'
  const apiVersion = spec.info?.version || ''
  const apiDescription = spec.info?.description || ''
  const oasVersion = spec.openapi?.startsWith('3') ? 'OAS3' : 'OAS2'

  return (
    <section className="w-1/3 min-w-[340px] flex flex-col bg-white dark:bg-[#101f22] shrink-0 hidden xl:flex">
      {/* Header */}
      <div className="h-10 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-slate-50 dark:bg-white/5 shrink-0">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Live Preview</span>
        <div className="flex gap-2">
          <button className="w-6 h-6 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 rounded cursor-pointer" aria-label="Open in new window">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
          <button className="w-6 h-6 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 rounded cursor-pointer" aria-label="Refresh preview">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* API Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold">{apiTitle}</h2>
            {apiVersion && (
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-xs font-mono">{apiVersion}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-bold uppercase tracking-tight">{oasVersion}</span>
            <span className="text-[var(--ht-color-secondary-500)] text-sm">/swagger.json</span>
          </div>
          {apiDescription && (
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{apiDescription}</p>
          )}
        </div>

        {/* Endpoints by tag */}
        {Array.from(groupedEndpoints.entries()).map(([tag, endpoints]) => (
          <div key={tag} className="space-y-4">
            <h3 className="text-lg font-bold border-b border-slate-200 dark:border-slate-800 pb-2 capitalize">{tag}</h3>
            {endpoints.map((ep) => (
              <EndpointCard
                key={ep.id}
                method={ep.method}
                path={ep.path}
                summary={ep.summary}
                parameters={ep.parameters}
                responses={ep.responses}
                defaultExpanded={expandedEndpoint === ep.id}
              />
            ))}
          </div>
        ))}

        {groupedEndpoints.size === 0 && (
          <p className="text-sm text-slate-400">No endpoints defined in paths.</p>
        )}

        {/* Schemas */}
        {schemas.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-slate-200 dark:border-slate-800 pb-2">Schemas</h3>
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
    </section>
  )
}
