export type RegexMode = 'match' | 'replace'

export interface RegexMatch {
  index: number
  value: string
  start: number
  end: number
  groups: Record<string, string | undefined>
}

export interface RegexState {
  regex: string
  flags: string
  testInput: string
  replaceInput: string
  mode: RegexMode
}

export interface PresetPattern {
  id: string
  name: string
  flag?: string
  category: PresetCategory
  regex: string
  sampleInput: string
  description: string
  defaultFlags?: string
}

export type PresetCategory = 'phone' | 'network' | 'identity' | 'financial' | 'datetime' | 'common'

export const PRESET_CATEGORY_LABELS: Record<PresetCategory, string> = {
  phone: 'Phone Numbers',
  network: 'Network',
  identity: 'Identity',
  financial: 'Financial',
  datetime: 'Date & Time',
  common: 'Common',
}

export interface HistoryEntry {
  regex: string
  flags: string
  testInput: string
  mode: RegexMode
  timestamp: number
}
