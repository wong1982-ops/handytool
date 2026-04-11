export type Format =
  | 'json'
  | 'yaml'
  | 'xml'
  | 'toml'
  | 'ini'
  | 'sql'
  | 'html'
  | 'css'
  | 'javascript'
  | 'typescript'
  | 'markdown'
  | 'graphql'

export type FormatOrAuto = Format | 'auto'

export type Action = 'format' | 'minify' | 'validate' | 'convert' | 'diff'

export type Language = 'en' | 'zh'

export interface ValidationError {
  line?: number
  column?: number
  message: string
}

export interface ValidationResult {
  ok: boolean
  error?: ValidationError
  summary?: string
}

export interface FormatterState {
  input: string
  inputB: string
  output: string
  format: FormatOrAuto
  detectedFormat: Format | null
  action: Action
  convertTarget: Format | null
  validation: ValidationResult | null
  loading: boolean
  copyFeedback: boolean
}

export interface FormatDefinition {
  id: Format
  label: string
  extension: string
  mimeType: string
  execution: 'client' | 'server'
  canMinify: boolean
  convertTargets: Format[]
}

export const DEFAULT_STATE: FormatterState = {
  input: '',
  inputB: '',
  output: '',
  format: 'auto',
  detectedFormat: null,
  action: 'format',
  convertTarget: null,
  validation: null,
  loading: false,
  copyFeedback: false,
}
