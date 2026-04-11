import type { Format, FormatDefinition } from './formatter-types'

export const FORMAT_DEFINITIONS: Record<Format, FormatDefinition> = {
  json: {
    id: 'json',
    label: 'JSON',
    extension: 'json',
    mimeType: 'application/json',
    execution: 'client',
    canMinify: true,
    convertTargets: ['yaml', 'xml', 'toml'],
  },
  yaml: {
    id: 'yaml',
    label: 'YAML',
    extension: 'yaml',
    mimeType: 'text/yaml',
    execution: 'client',
    canMinify: false,
    convertTargets: ['json'],
  },
  xml: {
    id: 'xml',
    label: 'XML',
    extension: 'xml',
    mimeType: 'application/xml',
    execution: 'client',
    canMinify: true,
    convertTargets: ['json'],
  },
  toml: {
    id: 'toml',
    label: 'TOML',
    extension: 'toml',
    mimeType: 'text/x-toml',
    execution: 'client',
    canMinify: false,
    convertTargets: ['json'],
  },
  ini: {
    id: 'ini',
    label: 'INI',
    extension: 'ini',
    mimeType: 'text/x-ini',
    execution: 'client',
    canMinify: false,
    convertTargets: [],
  },
  sql: {
    id: 'sql',
    label: 'SQL',
    extension: 'sql',
    mimeType: 'application/sql',
    execution: 'client',
    canMinify: false,
    convertTargets: [],
  },
  html: {
    id: 'html',
    label: 'HTML',
    extension: 'html',
    mimeType: 'text/html',
    execution: 'server',
    canMinify: true,
    convertTargets: [],
  },
  css: {
    id: 'css',
    label: 'CSS',
    extension: 'css',
    mimeType: 'text/css',
    execution: 'server',
    canMinify: true,
    convertTargets: [],
  },
  javascript: {
    id: 'javascript',
    label: 'JavaScript',
    extension: 'js',
    mimeType: 'application/javascript',
    execution: 'server',
    canMinify: true,
    convertTargets: [],
  },
  typescript: {
    id: 'typescript',
    label: 'TypeScript',
    extension: 'ts',
    mimeType: 'application/typescript',
    execution: 'server',
    canMinify: true,
    convertTargets: [],
  },
  markdown: {
    id: 'markdown',
    label: 'Markdown',
    extension: 'md',
    mimeType: 'text/markdown',
    execution: 'server',
    canMinify: false,
    convertTargets: [],
  },
  graphql: {
    id: 'graphql',
    label: 'GraphQL',
    extension: 'graphql',
    mimeType: 'application/graphql',
    execution: 'server',
    canMinify: false,
    convertTargets: [],
  },
}

export const ALL_FORMATS: Format[] = [
  'json', 'yaml', 'xml', 'toml', 'ini', 'sql',
  'html', 'css', 'javascript', 'typescript', 'markdown', 'graphql',
]

export const MAX_INPUT_BYTES = 1_048_576

export function getFormatDefinition(format: Format): FormatDefinition {
  return FORMAT_DEFINITIONS[format]
}
