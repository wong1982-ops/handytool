'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import yaml from 'js-yaml'

export type { ValidationError } from '@/components/ui/problems-panel'
import type { ValidationError } from '@/components/ui/problems-panel'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParsedSpec = any

interface UseOpenApiValidatorReturn {
  spec: ParsedSpec | null
  dereferencedSpec: ParsedSpec | null
  lastValidSpec: ParsedSpec | null
  errors: ValidationError[]
  isValid: boolean | null
  isValidating: boolean
}

/**
 * Map a JSON-path-like string (e.g. "/paths/~1pets/get/responses")
 * to an approximate line number in the YAML source.
 */
function findLineForPath(source: string, jsonPath: string): number {
  if (!jsonPath) return 1
  // Decode JSON pointer segments: ~1 → /, ~0 → ~
  const segments = jsonPath
    .replace(/^\//, '')
    .split('/')
    .map((s) => s.replace(/~1/g, '/').replace(/~0/g, '~'))

  const lines = source.split('\n')
  let currentLine = 0

  for (const segment of segments) {
    // Search forward for a line containing this key
    const keyPattern = new RegExp(`^\\s*${escapeRegex(segment)}\\s*:`, 'm')
    let found = false
    for (let i = currentLine; i < lines.length; i++) {
      if (keyPattern.test(lines[i])) {
        currentLine = i
        found = true
        break
      }
    }
    // Also try quoted versions
    if (!found) {
      const quotedPattern = new RegExp(`^\\s*["']${escapeRegex(segment)}["']\\s*:`, 'm')
      for (let i = currentLine; i < lines.length; i++) {
        if (quotedPattern.test(lines[i])) {
          currentLine = i
          found = true
          break
        }
      }
    }
    if (!found) break
  }

  return currentLine + 1 // 1-based
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Simple manual $ref resolver for internal JSON pointers (#/...).
 * Used as a fallback when swagger-parser dereference fails.
 * Handles circular references via depth limit and path tracking.
 */
function manualDereference(spec: Record<string, unknown>): Record<string, unknown> {
  const root = JSON.parse(JSON.stringify(spec))
  const MAX_DEPTH = 20

  function resolveRef(refPath: string): unknown {
    if (!refPath.startsWith('#/')) return undefined
    const segments = refPath.slice(2).split('/').map(s => s.replace(/~1/g, '/').replace(/~0/g, '~'))
    let current: unknown = root
    for (const seg of segments) {
      if (current == null || typeof current !== 'object') return undefined
      current = (current as Record<string, unknown>)[seg]
    }
    return current
  }

  function resolve(node: unknown, depth: number, activeRefs: Set<string>): unknown {
    if (node == null || typeof node !== 'object') return node
    if (depth > MAX_DEPTH) return node

    if (Array.isArray(node)) {
      return node.map(item => resolve(item, depth + 1, activeRefs))
    }

    const obj = node as Record<string, unknown>

    // If this object is a $ref, resolve it
    if (typeof obj.$ref === 'string' && obj.$ref.startsWith('#/')) {
      const refKey = obj.$ref
      // Prevent circular reference loops
      if (activeRefs.has(refKey)) return obj
      const resolved = resolveRef(refKey)
      if (resolved != null && typeof resolved === 'object') {
        const nextRefs = new Set(activeRefs)
        nextRefs.add(refKey)
        // Merge any sibling properties with the resolved object (OAS 3.1 allows siblings)
        const { $ref: _, ...siblings } = obj
        const merged = { ...(JSON.parse(JSON.stringify(resolved)) as Record<string, unknown>), ...siblings }
        return resolve(merged, depth + 1, nextRefs)
      }
      return obj
    }

    // Recursively resolve all properties
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = resolve(value, depth + 1, activeRefs)
    }
    return result
  }

  return resolve(root, 0, new Set()) as Record<string, unknown>
}

export function useOpenApiValidator(yamlContent: string): UseOpenApiValidatorReturn {
  const [spec, setSpec] = useState<ParsedSpec | null>(null)
  const [dereferencedSpec, setDereferencedSpec] = useState<ParsedSpec | null>(null)
  const [lastValidSpec, setLastValidSpec] = useState<ParsedSpec | null>(null)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SwaggerParserRef = useRef<any>(null)

  // Lazy-load swagger-parser (it's heavy, don't block initial render)
  const getParser = useCallback(async () => {
    if (!SwaggerParserRef.current) {
      const mod = await import('@apidevtools/swagger-parser')
      SwaggerParserRef.current = mod.default || mod
    }
    return SwaggerParserRef.current
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      const trimmed = yamlContent.trim()
      if (!trimmed) {
        setSpec(null)
        setDereferencedSpec(null)
        setErrors([])
        setIsValid(null)
        setIsValidating(false)
        return
      }

      setIsValidating(true)
      const validationErrors: ValidationError[] = []

      // Layer 1: YAML syntax
      let parsed: ParsedSpec | null = null
      try {
        parsed = yaml.load(trimmed) as ParsedSpec
      } catch (e) {
        const yamlErr = e as yaml.YAMLException
        validationErrors.push({
          line: yamlErr.mark?.line != null ? yamlErr.mark.line + 1 : 1,
          column: yamlErr.mark?.column != null ? yamlErr.mark.column + 1 : 0,
          message: yamlErr.reason || yamlErr.message || 'Invalid YAML syntax',
          severity: 'error',
        })
        setSpec(null)
        setErrors(validationErrors)
        setIsValid(false)
        setIsValidating(false)
        return
      }

      // YAML parsed successfully — update spec
      setSpec(parsed)

      if (typeof parsed === 'object' && parsed !== null) {
        setLastValidSpec(parsed)
      }

      // Basic structural check
      if (!parsed || typeof parsed !== 'object') {
        validationErrors.push({
          line: 1,
          column: 0,
          message: 'Document must be a YAML mapping (object)',
          severity: 'error',
        })
        setErrors(validationErrors)
        setIsValid(false)
        setIsValidating(false)
        return
      }

      if (!parsed.openapi && !parsed.swagger) {
        validationErrors.push({
          line: 1,
          column: 0,
          message: 'Missing required field: "openapi" or "swagger"',
          severity: 'error',
        })
      }

      if (!parsed.info) {
        validationErrors.push({
          line: 1,
          column: 0,
          message: 'Missing required field: "info"',
          severity: 'error',
        })
      }

      if (!parsed.paths && !parsed.webhooks) {
        validationErrors.push({
          line: 1,
          column: 0,
          message: 'Missing "paths" — no endpoints defined',
          severity: 'warning',
        })
      }

      // Layer 2: OpenAPI schema validation + dereference via swagger-parser
      try {
        const SwaggerParser = await getParser()
        // swagger-parser needs a JS object, validate a deep clone
        const clone = JSON.parse(JSON.stringify(parsed))
        await SwaggerParser.validate(clone)

        // Dereference to resolve all $ref pointers for the preview
        try {
          const derefClone = JSON.parse(JSON.stringify(parsed))
          const resolved = await SwaggerParser.dereference(derefClone)
          setDereferencedSpec(resolved)
        } catch {
          // swagger-parser dereference failed — use manual resolver
          setDereferencedSpec(manualDereference(parsed as Record<string, unknown>))
        }
      } catch (e) {
        // Validation failed — still try to dereference for preview
        try {
          const SwaggerParser = await getParser()
          const derefClone = JSON.parse(JSON.stringify(parsed))
          const resolved = await SwaggerParser.dereference(derefClone)
          setDereferencedSpec(resolved)
        } catch {
          // swagger-parser dereference failed — use manual resolver
          setDereferencedSpec(manualDereference(parsed as Record<string, unknown>))
        }
        const err = e as Error & { details?: Array<{ path: string[]; message: string }> }
        if (err.details && Array.isArray(err.details)) {
          for (const detail of err.details) {
            const pathStr = detail.path ? '/' + detail.path.join('/') : ''
            validationErrors.push({
              line: findLineForPath(trimmed, pathStr),
              column: 0,
              message: detail.message,
              severity: 'error',
              path: pathStr,
            })
          }
        } else if (err.message) {
          // Extract path from error message if possible
          const pathMatch = err.message.match(/at ([\w/~.[\]]+)/)
          const pathStr = pathMatch?.[1] || ''
          validationErrors.push({
            line: findLineForPath(trimmed, pathStr),
            column: 0,
            message: err.message.replace(/^Swagger schema validation failed\.\s*/, ''),
            severity: 'error',
            path: pathStr || undefined,
          })
        }
      }

      setErrors(validationErrors)
      setIsValid(validationErrors.filter((e) => e.severity === 'error').length === 0)
      setIsValidating(false)
    }, 300)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [yamlContent, getParser])

  return { spec, dereferencedSpec, lastValidSpec, errors, isValid, isValidating }
}
