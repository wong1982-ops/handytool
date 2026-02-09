'use client'

import { useState } from 'react'

interface Parameter {
  name: string
  in: string
  description?: string
  required?: boolean
  schema?: { type?: string }
}

interface Response {
  description?: string
  content?: Record<string, { schema?: unknown; example?: unknown }>
}

interface EndpointCardProps {
  method: string
  path: string
  summary?: string
  parameters?: Parameter[]
  responses?: Record<string, Response>
  defaultExpanded?: boolean
}

const METHOD_STYLES: Record<string, { border: string; bg: string; headerBg: string; badge: string }> = {
  get: {
    border: 'border-green-500/30',
    bg: 'bg-green-500/5',
    headerBg: 'bg-green-500/10',
    badge: 'bg-green-500 text-white',
  },
  post: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    headerBg: 'bg-blue-500/10',
    badge: 'bg-blue-500 text-white',
  },
  put: {
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/5',
    headerBg: 'bg-orange-500/10',
    badge: 'bg-orange-500 text-white',
  },
  delete: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/5',
    headerBg: 'bg-red-500/10',
    badge: 'bg-red-500 text-white',
  },
  patch: {
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/5',
    headerBg: 'bg-purple-500/10',
    badge: 'bg-purple-500 text-white',
  },
}

function generateExample(schema: Record<string, unknown> | undefined): unknown {
  if (!schema) return {}
  if (schema.example !== undefined) return schema.example

  const type = schema.type as string | undefined

  if (type === 'array') {
    const items = schema.items as Record<string, unknown> | undefined
    return [generateExample(items)]
  }
  if (type === 'object' || schema.properties) {
    const props = schema.properties as Record<string, Record<string, unknown>> | undefined
    if (!props) return {}
    const obj: Record<string, unknown> = {}
    for (const [key, propSchema] of Object.entries(props)) {
      obj[key] = generateExample(propSchema)
    }
    return obj
  }
  if (type === 'string') return 'string'
  if (type === 'integer' || type === 'number') return 0
  if (type === 'boolean') return true
  return null
}

export function EndpointCard({
  method,
  path,
  summary,
  parameters,
  responses,
  defaultExpanded = false,
}: EndpointCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const styles = METHOD_STYLES[method] || METHOD_STYLES.get

  // Get response example
  const successResponse = responses?.['200'] || responses?.['201']
  const responseContent = successResponse?.content?.['application/json']
  const responseExample = responseContent?.example || generateExample(responseContent?.schema as Record<string, unknown> | undefined)

  return (
    <div className={`border ${styles.border} rounded-lg overflow-hidden ${styles.bg} ${!expanded ? 'opacity-80 hover:opacity-100' : ''} transition-opacity`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-3 p-3 ${styles.headerBg} cursor-pointer w-full text-left`}
        aria-expanded={expanded}
      >
        <span className={`${styles.badge} font-bold text-xs px-2 py-1 rounded min-w-[50px] text-center uppercase`}>
          {method}
        </span>
        <span className="font-mono text-sm font-semibold truncate">{path}</span>
        {summary && <span className="text-xs text-slate-500 ml-auto shrink-0">{summary}</span>}
        <svg
          className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="p-4 border-t border-current/10 space-y-4" style={{ borderColor: `${styles.border.replace('border-', '').replace('/30', '')}` }}>
          {/* Parameters */}
          {parameters && parameters.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Parameters</h4>
              <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-white/5 text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold">Name</th>
                      <th className="text-left px-3 py-2 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parameters.map((param) => (
                      <tr key={`${param.in}-${param.name}`}>
                        <td className="px-3 py-2 font-mono">
                          <span className="text-[var(--ht-color-secondary-500)]">{param.name}</span>
                          {' '}
                          <span className="text-[10px] text-slate-400">({param.in})</span>
                        </td>
                        <td className="px-3 py-2 text-slate-400">{param.description || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Responses */}
          {responseExample != null ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase text-slate-500">Responses</h4>
                <span className="text-[10px] text-slate-400">Content-Type: application/json</span>
              </div>
              <div className="p-3 bg-[#1a1b26] rounded-lg font-mono text-[11px] border border-slate-800 overflow-x-auto">
                <pre className="text-[#c0caf5]">{JSON.stringify(responseExample, null, 2)}</pre>
              </div>
            </div>
          ) : null}

          {/* No content */}
          {(!parameters || parameters.length === 0) && responseExample == null && (
            <p className="text-xs text-slate-400">No parameters or response examples defined.</p>
          )}
        </div>
      )}
    </div>
  )
}
