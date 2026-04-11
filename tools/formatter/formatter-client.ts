import yaml from 'js-yaml'
import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import * as TOML from '@iarna/toml'
import * as INI from 'ini'
import { format as sqlFormat } from 'sql-formatter'
import type { Format, ValidationResult } from './formatter-types'

export interface FormatResult {
  ok: boolean
  output?: string
  validation: ValidationResult
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  preserveOrder: false,
})

const xmlBuilder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: true,
  indentBy: '  ',
})

function summarizeJson(value: unknown): string {
  if (Array.isArray(value)) return `Array of ${value.length} items`
  if (value !== null && typeof value === 'object') {
    return `Object with ${Object.keys(value).length} keys`
  }
  return typeof value
}

/**
 * Format a value (prettify) on the client side.
 * Only handles client-execution formats. Server formats throw.
 */
export function formatClient(format: Format, content: string): FormatResult {
  try {
    switch (format) {
      case 'json': {
        const parsed = JSON.parse(content)
        return {
          ok: true,
          output: JSON.stringify(parsed, null, 2),
          validation: { ok: true, summary: summarizeJson(parsed) },
        }
      }
      case 'yaml': {
        const parsed = yaml.load(content)
        return {
          ok: true,
          output: yaml.dump(parsed, { indent: 2, lineWidth: 80 }),
          validation: { ok: true, summary: summarizeJson(parsed) },
        }
      }
      case 'xml': {
        const parsed = xmlParser.parse(content)
        return {
          ok: true,
          output: xmlBuilder.build(parsed),
          validation: { ok: true },
        }
      }
      case 'toml': {
        const parsed = TOML.parse(content)
        return {
          ok: true,
          output: TOML.stringify(parsed),
          validation: { ok: true, summary: summarizeJson(parsed) },
        }
      }
      case 'ini': {
        const parsed = INI.parse(content)
        return {
          ok: true,
          output: INI.stringify(parsed),
          validation: { ok: true },
        }
      }
      case 'sql': {
        const formatted = sqlFormat(content, { language: 'sql', tabWidth: 2 })
        return { ok: true, output: formatted, validation: { ok: true } }
      }
      default:
        throw new Error(`Format ${format} requires server-side execution`)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      ok: false,
      validation: { ok: false, error: { message } },
    }
  }
}

/**
 * Minify content on the client side. Only JSON is minifiable client-side.
 */
export function minifyClient(format: Format, content: string): FormatResult {
  if (format !== 'json') {
    return {
      ok: false,
      validation: { ok: false, error: { message: 'Client minify only supports JSON' } },
    }
  }
  try {
    const parsed = JSON.parse(content)
    return {
      ok: true,
      output: JSON.stringify(parsed),
      validation: { ok: true, summary: summarizeJson(parsed) },
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, validation: { ok: false, error: { message } } }
  }
}

/**
 * Validate content. Returns validation result without producing output.
 */
export function validateClient(format: Format, content: string): ValidationResult {
  const result = formatClient(format, content)
  return result.validation
}

/**
 * Convert content from one format to another (client-side, data formats only).
 */
export function convertClient(from: Format, to: Format, content: string): FormatResult {
  try {
    let value: unknown
    switch (from) {
      case 'json':
        value = JSON.parse(content)
        break
      case 'yaml':
        value = yaml.load(content)
        break
      case 'xml':
        value = xmlParser.parse(content)
        break
      case 'toml':
        value = TOML.parse(content)
        break
      default:
        throw new Error(`Cannot convert from ${from}`)
    }

    let output: string
    switch (to) {
      case 'json':
        output = JSON.stringify(value, null, 2)
        break
      case 'yaml':
        output = yaml.dump(value, { indent: 2, lineWidth: 80 })
        break
      case 'xml':
        output = xmlBuilder.build(value)
        break
      case 'toml':
        if (value === null || typeof value !== 'object' || Array.isArray(value)) {
          throw new Error('TOML requires a top-level object')
        }
        output = TOML.stringify(value as unknown as Parameters<typeof TOML.stringify>[0])
        break
      default:
        throw new Error(`Cannot convert to ${to}`)
    }

    return { ok: true, output, validation: { ok: true } }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, validation: { ok: false, error: { message } } }
  }
}
