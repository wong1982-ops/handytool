import type { Format } from './formatter-types'

/**
 * Detect the format of a content string using heuristics.
 * Returns null if detection fails.
 */
export function detectFormat(content: string): Format | null {
  const trimmed = content.trim()
  if (!trimmed) return null

  // 1. JSON — starts with { or [
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed)
      return 'json'
    } catch {
      // not valid JSON, continue
    }
  }

  // 2. XML — starts with <?xml or <
  if (trimmed.startsWith('<?xml') || /^<[a-zA-Z][^>]*>/.test(trimmed)) {
    if (trimmed.startsWith('<!DOCTYPE html') || trimmed.toLowerCase().startsWith('<html')) {
      return 'html'
    }
    return 'xml'
  }

  // 3. HTML — DOCTYPE or html tag
  if (trimmed.toLowerCase().startsWith('<!doctype') || trimmed.toLowerCase().includes('<html')) {
    return 'html'
  }

  // 4. GraphQL — query/mutation/subscription keyword followed by {
  if (/^(query|mutation|subscription|fragment)\s+\w*\s*[({]/m.test(trimmed)) {
    return 'graphql'
  }

  // 5. SQL — starts with common SQL keywords
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|WITH)\s/i.test(trimmed)) {
    return 'sql'
  }

  // 6. TypeScript — interface, type alias, type annotations
  if (/\b(interface\s+\w+|type\s+\w+\s*=|:\s*(string|number|boolean)\b)/.test(trimmed)) {
    return 'typescript'
  }

  // 7. JavaScript — function, const/let/var, arrow functions
  if (/\b(function\s+\w+|const\s+\w+|let\s+\w+|var\s+\w+|=>)/.test(trimmed)) {
    return 'javascript'
  }

  // 8. CSS — selectors with { } and ; declarations
  if (/[#.]?[\w-]+\s*\{[^}]*[\w-]+\s*:[^;}]+;/.test(trimmed)) {
    return 'css'
  }

  // 9. Markdown — heading, bold, list markers, links
  if (/^#{1,6}\s+/m.test(trimmed) || /\*\*[^*]+\*\*/.test(trimmed) || /^[-*+]\s+/m.test(trimmed)) {
    return 'markdown'
  }

  // 10. TOML — [section] header with key = value
  if (/^\[[\w.]+\]/m.test(trimmed) && /^[\w-]+\s*=\s*/m.test(trimmed)) {
    return 'toml'
  }

  // 11. INI — [section] header without key = value (or simpler key=value)
  if (/^\[[\w.\s]+\]/m.test(trimmed) && /^[\w-]+\s*=\s*/m.test(trimmed)) {
    return 'ini'
  }

  // 12. YAML — key: value pattern (after other checks)
  if (/^[\w-]+\s*:\s*\S/m.test(trimmed) || /^---\s*$/m.test(trimmed)) {
    return 'yaml'
  }

  return null
}
