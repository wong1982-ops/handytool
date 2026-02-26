'use client'

import { useState, useCallback, useEffect } from 'react'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const STORAGE_KEY = 'ht-json-schema'

interface SchemaError {
  path: string
  message: string
}

interface SchemaValidatorProps {
  input: string
  onErrors: (errors: SchemaError[]) => void
}

export function SchemaValidator({ input, onErrors }: SchemaValidatorProps) {
  const [collapsed, setCollapsed] = useState(true)
  const [schema, setSchema] = useState('')
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: SchemaError[] } | null>(null)
  const [schemaError, setSchemaError] = useState<string | null>(null)

  // Load saved schema from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setSchema(saved)
    } catch { /* ignore */ }
  }, [])

  // Save schema to localStorage
  useEffect(() => {
    try {
      if (schema.trim()) {
        localStorage.setItem(STORAGE_KEY, schema)
      }
    } catch { /* ignore */ }
  }, [schema])

  const handleValidate = useCallback(() => {
    setSchemaError(null)
    setValidationResult(null)

    // Parse input
    let parsed: unknown
    try {
      parsed = JSON.parse(input)
    } catch {
      const errors = [{ path: '/', message: 'Input is not valid JSON. Schema validation requires JSON input.' }]
      setValidationResult({ valid: false, errors })
      onErrors(errors)
      return
    }

    // Parse schema
    let schemaObj: object
    try {
      schemaObj = JSON.parse(schema)
    } catch {
      setSchemaError('Invalid JSON Schema. Please check your schema syntax.')
      return
    }

    // Validate
    try {
      const ajv = new Ajv({ allErrors: true, verbose: true })
      addFormats(ajv)
      const validate = ajv.compile(schemaObj)
      const valid = validate(parsed)

      if (valid) {
        setValidationResult({ valid: true, errors: [] })
        onErrors([])
      } else {
        const errors: SchemaError[] = (validate.errors || []).map((err) => ({
          path: err.instancePath || '/',
          message: `${err.instancePath || '/'}: ${err.message || 'validation failed'}${err.params ? ` (${JSON.stringify(err.params)})` : ''}`,
        }))
        setValidationResult({ valid: false, errors })
        onErrors(errors)
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Unknown schema compilation error'
      setSchemaError(`Schema error: ${errMsg}`)
    }
  }, [input, schema, onErrors])

  const handleClear = useCallback(() => {
    setSchema('')
    setValidationResult(null)
    setSchemaError(null)
    onErrors([])
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }, [onErrors])

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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">JSON Schema Validation</span>
        </div>
        {validationResult && (
          <span className={`flex items-center gap-1 text-[10px] font-bold ${
            validationResult.valid ? 'text-emerald-500' : 'text-red-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${validationResult.valid ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {validationResult.valid ? 'Valid' : `${validationResult.errors.length} error${validationResult.errors.length !== 1 ? 's' : ''}`}
          </span>
        )}
      </button>

      {!collapsed && (
        <div className="border-t border-slate-100 dark:border-slate-800">
          {/* Schema textarea */}
          <div className="p-3">
            <textarea
              value={schema}
              onChange={(e) => { setSchema(e.target.value); setValidationResult(null); setSchemaError(null) }}
              placeholder='Paste your JSON Schema here, e.g.:\n{\n  "type": "object",\n  "properties": {\n    "name": { "type": "string" }\n  },\n  "required": ["name"]\n}'
              className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 font-mono text-[13px] text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-y focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/30 focus:border-[var(--tk-color-primary-500)]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 px-3 pb-3">
            <button
              onClick={handleValidate}
              disabled={!schema.trim() || !input.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--tk-color-primary-500)] text-white hover:bg-[var(--tk-color-primary-500)]/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Validate
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>

          {/* Schema error */}
          {schemaError && (
            <div className="mx-3 mb-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-xs text-red-600 dark:text-red-400">
              {schemaError}
            </div>
          )}

          {/* Validation result */}
          {validationResult && (
            <div className="border-t border-slate-100 dark:border-slate-800">
              {validationResult.valid ? (
                <div className="flex items-center gap-2 px-3 py-2 text-emerald-600 dark:text-emerald-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <span className="text-xs font-bold">JSON is valid against the schema</span>
                </div>
              ) : (
                <div className="max-h-40 overflow-auto">
                  {validationResult.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 px-3 py-1.5 text-[11px] border-b border-slate-50 dark:border-slate-900 last:border-b-0">
                      <svg className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path fill="white" d="M15.59 7L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z" />
                      </svg>
                      <span className="text-violet-600 dark:text-violet-400 font-mono shrink-0">{err.path}</span>
                      <span className="text-slate-600 dark:text-slate-300">{err.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
