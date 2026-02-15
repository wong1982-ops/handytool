'use client'

import { useMemo } from 'react'
import yaml from 'js-yaml'
import type { ValidationError } from '@/components/ui/problems-panel'

export type DetectedFormat = 'json' | 'yaml' | 'csv' | 'unknown'

interface JsonValidatorResult {
  errors: ValidationError[]
  format: DetectedFormat
  isValid: boolean | null
  label: string
}

export function useJsonValidator(input: string): JsonValidatorResult {
  return useMemo(() => {
    const trimmed = input.trim()
    if (!trimmed) {
      return { errors: [], format: 'unknown' as DetectedFormat, isValid: null, label: '' }
    }

    const errors: ValidationError[] = []

    // Try JSON
    try {
      JSON.parse(trimmed)
      return { errors: [], format: 'json', isValid: true, label: 'Valid JSON' }
    } catch (e) {
      const jsonErr = e as SyntaxError
      // Only report JSON error if it looks like JSON (starts with { or [)
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        const line = getJsonErrorLine(trimmed, jsonErr.message)
        errors.push({
          line,
          column: 0,
          message: jsonErr.message,
          severity: 'error',
        })
        return { errors, format: 'json', isValid: false, label: 'Invalid JSON' }
      }
    }

    // Try YAML
    try {
      const parsed = yaml.load(trimmed)
      if (typeof parsed === 'object' && parsed !== null) {
        return { errors: [], format: 'yaml', isValid: true, label: 'Valid YAML' }
      }
    } catch (e) {
      const yamlErr = e as yaml.YAMLException
      // Only report YAML error if it doesn't look like CSV
      const lines = trimmed.split('\n').filter((l) => l.trim())
      const looksLikeCsv = lines.length >= 2 && lines[0].includes(',')

      if (!looksLikeCsv) {
        errors.push({
          line: yamlErr.mark?.line != null ? yamlErr.mark.line + 1 : 1,
          column: yamlErr.mark?.column != null ? yamlErr.mark.column + 1 : 0,
          message: yamlErr.reason || yamlErr.message || 'Invalid YAML syntax',
          severity: 'error',
        })
        return { errors, format: 'yaml', isValid: false, label: 'Invalid YAML' }
      }
    }

    // Try CSV
    const lines = trimmed.split('\n').filter((l) => l.trim())
    if (lines.length >= 2 && lines[0].includes(',')) {
      const headerCols = parseCsvLine(lines[0]).length
      if (headerCols >= 2) {
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCsvLine(lines[i]).length
          if (cols !== headerCols) {
            errors.push({
              line: i + 1,
              column: 0,
              message: `Row ${i + 1} has ${cols} column${cols !== 1 ? 's' : ''}, expected ${headerCols} (matching header)`,
              severity: 'error',
            })
          }
        }
        if (errors.length === 0) {
          return { errors: [], format: 'csv', isValid: true, label: 'Valid CSV' }
        }
        return { errors, format: 'csv', isValid: false, label: 'Invalid CSV' }
      }
    }

    // Nothing matched
    errors.push({
      line: 1,
      column: 0,
      message: 'Unable to detect format. Expected JSON, YAML, or CSV.',
      severity: 'error',
    })
    return { errors, format: 'unknown', isValid: false, label: 'Invalid' }
  }, [input])
}

/** Extract line number from JSON.parse error message */
function getJsonErrorLine(input: string, errorMessage: string): number {
  // Common patterns: "at position 123", "at line 5 column 3"
  const posMatch = errorMessage.match(/position\s+(\d+)/i)
  if (posMatch) {
    const position = parseInt(posMatch[1], 10)
    const beforePos = input.substring(0, position)
    return beforePos.split('\n').length
  }

  const lineMatch = errorMessage.match(/line\s+(\d+)/i)
  if (lineMatch) {
    return parseInt(lineMatch[1], 10)
  }

  return 1
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}
