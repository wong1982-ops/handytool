interface Parameter {
  name: string
  in: string
  description?: string
  required?: boolean
  schema?: { type?: string; format?: string }
  example?: unknown
}

interface Response {
  description?: string
  content?: Record<string, { schema?: unknown; example?: unknown; examples?: Record<string, { value?: unknown }> }>
}

interface EndpointCardProps {
  method: string
  path: string
  summary?: string
  description?: string
  parameters?: Parameter[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestBody?: any
  responses?: Record<string, Response>
  expanded?: boolean
  onToggle?: () => void
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
  head: {
    border: 'border-teal-500/30',
    bg: 'bg-teal-500/5',
    headerBg: 'bg-teal-500/10',
    badge: 'bg-teal-500 text-white',
  },
  options: {
    border: 'border-slate-500/30',
    bg: 'bg-slate-500/5',
    headerBg: 'bg-slate-500/10',
    badge: 'bg-slate-500 text-white',
  },
}

function generateExample(schema: Record<string, unknown> | undefined): unknown {
  if (!schema) return {}
  if (schema.example !== undefined) return schema.example

  // If it's an unresolved $ref, show the reference path
  if (schema.$ref && typeof schema.$ref === 'string') {
    return `(ref: ${schema.$ref})`
  }

  const type = schema.type as string | undefined

  if (type === 'array') {
    const items = schema.items as Record<string, unknown> | undefined
    return [generateExample(items)]
  }
  if (type === 'object' || schema.properties) {
    const props = schema.properties as Record<string, Record<string, unknown>> | undefined
    if (!props) {
      // Handle additionalProperties
      if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        return { key: generateExample(schema.additionalProperties as Record<string, unknown>) }
      }
      return {}
    }
    const obj: Record<string, unknown> = {}
    for (const [key, propSchema] of Object.entries(props)) {
      obj[key] = generateExample(propSchema)
    }
    return obj
  }
  if (type === 'string') {
    if (schema.enum && Array.isArray(schema.enum)) return schema.enum[0]
    if (schema.format === 'date') return '2024-01-01'
    if (schema.format === 'date-time' || (schema.format as string)?.includes('ISO')) return '2024-01-01T00:00:00.000Z'
    if (schema.format === 'uuid') return '00000000-0000-0000-0000-000000000000'
    if (schema.format === 'email') return 'user@example.com'
    return 'string'
  }
  if (type === 'integer' || type === 'number') return 0
  if (type === 'boolean') return true
  return null
}

export function EndpointCard({
  method,
  path,
  summary,
  description,
  parameters,
  requestBody,
  responses,
  expanded = false,
  onToggle,
}: EndpointCardProps) {
  const styles = METHOD_STYLES[method] || METHOD_STYLES.get

  // Get response entries
  const responseEntries = responses
    ? Object.entries(responses).filter(([, v]) => v && typeof v === 'object') as [string, Response][]
    : []

  return (
    <div className={`border ${styles.border} rounded-lg overflow-hidden ${styles.bg} ${!expanded ? 'opacity-80 hover:opacity-100' : ''} transition-opacity`}>
      <button
        onClick={onToggle}
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
          {/* Description */}
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">{description}</p>
          )}

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
                    {parameters.filter((p: Parameter) => p.name && p.in).map((param: Parameter) => (
                      <tr key={`${param.in}-${param.name}`}>
                        <td className="px-3 py-2 font-mono">
                          <span className="text-[var(--ht-color-secondary-500)]">{param.name}</span>
                          {' '}
                          <span className="text-[10px] text-slate-400">({param.in})</span>
                          {param.required && <span className="text-[10px] text-red-400 ml-1">*</span>}
                        </td>
                        <td className="px-3 py-2 text-slate-400">
                          {param.description || '—'}
                          {param.schema?.type && (
                            <span className="ml-1 text-[10px] text-slate-300">
                              ({param.schema.type}{param.schema.format ? ` · ${param.schema.format}` : ''})
                            </span>
                          )}
                          {param.example !== undefined && (
                            <span className="ml-1.5 text-[10px] text-blue-400 font-mono">e.g. {String(param.example)}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Request Body */}
          {requestBody?.content?.['application/json'] && (
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Request Body</h4>
              <div className="p-3 bg-[#1a1b26] rounded-lg font-mono text-[11px] border border-slate-800 overflow-x-auto">
                <pre className="text-[#c0caf5]">
                  {(() => {
                    const rb = requestBody.content['application/json']
                    const namedEx = rb.examples ? Object.values(rb.examples as Record<string, { value?: unknown }>).find(e => e?.value !== undefined)?.value : undefined
                    return JSON.stringify(
                      rb.example ?? namedEx ?? generateExample(rb.schema as Record<string, unknown> | undefined),
                      null,
                      2,
                    )
                  })()}
                </pre>
              </div>
            </div>
          )}

          {/* Responses */}
          {responseEntries.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Responses</h4>
              <div className="space-y-2">
                {responseEntries.map(([code, resp]) => {
                  const content = resp?.content?.['application/json']
                  const firstNamedExample = content?.examples ? Object.values(content.examples).find(e => e?.value !== undefined)?.value : undefined
                  const example = content?.example ?? firstNamedExample ?? (content?.schema ? generateExample(content.schema as Record<string, unknown>) : null)
                  const codeColor = code.startsWith('2') ? 'text-green-500'
                    : code.startsWith('4') ? 'text-amber-500'
                    : code.startsWith('5') ? 'text-red-500'
                    : 'text-slate-400'
                  return (
                    <div key={code}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold font-mono ${codeColor}`}>{code}</span>
                        <span className="text-[11px] text-slate-400">{resp?.description || ''}</span>
                      </div>
                      {example != null && (
                        <div className="p-3 bg-[#1a1b26] rounded-lg font-mono text-[11px] border border-slate-800 overflow-x-auto">
                          <pre className="text-[#c0caf5]">{JSON.stringify(example, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* No content */}
          {(!parameters || parameters.length === 0) && responseEntries.length === 0 && !requestBody && !description && (
            <p className="text-xs text-slate-400">No parameters or response examples defined.</p>
          )}
        </div>
      )}
    </div>
  )
}
