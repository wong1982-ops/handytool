interface SchemaProperty {
  type?: string
  format?: string
  description?: string
  enum?: unknown[]
  items?: { type?: string; format?: string; $ref?: string }
  $ref?: string
  properties?: Record<string, SchemaProperty>
  additionalProperties?: boolean | SchemaProperty
}

interface SchemaCardProps {
  name: string
  properties?: Record<string, SchemaProperty>
  required?: string[]
}

function formatType(prop: SchemaProperty): string {
  if (prop.$ref) {
    const refName = prop.$ref.split('/').pop() || prop.$ref
    return refName
  }
  if (prop.type === 'array' && prop.items) {
    if (prop.items.$ref) {
      const refName = prop.items.$ref.split('/').pop() || prop.items.$ref
      return `${refName}[]`
    }
    const itemType = prop.items.format ? `${prop.items.type} (${prop.items.format})` : prop.items.type || 'unknown'
    return `${itemType}[]`
  }
  if (prop.type === 'object' && prop.properties) {
    return `object {${Object.keys(prop.properties).length}}`
  }
  if (prop.enum) return `enum`
  if (prop.format) return `${prop.type} (${prop.format})`
  return prop.type || 'unknown'
}

export function SchemaCard({ name, properties, required }: SchemaCardProps) {
  const entries = properties ? Object.entries(properties) : []

  return (
    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold font-mono">{name}</span>
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </div>
      {entries.length > 0 ? (
        <div className="text-xs space-y-0">
          {entries.map(([propName, propSchema], idx) => (
            <div
              key={propName}
              className={`flex items-start justify-between gap-4 py-1.5 ${idx < entries.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
            >
              <div className="flex flex-col min-w-0">
                <span className="text-slate-600 dark:text-slate-300">
                  {propName}
                  {required?.includes(propName) && <span className="text-red-400 ml-0.5">*</span>}
                </span>
                {propSchema.description && (
                  <span className="text-[10px] text-slate-400 truncate">{propSchema.description}</span>
                )}
                {propSchema.enum && (
                  <span className="text-[10px] text-slate-400 font-mono truncate">
                    [{propSchema.enum.map(v => JSON.stringify(v)).join(', ')}]
                  </span>
                )}
              </div>
              <span className="text-blue-400 font-mono shrink-0">{formatType(propSchema)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400">No properties defined</p>
      )}
    </div>
  )
}
