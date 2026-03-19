export interface PaletteColor {
  hex: string
  locked: boolean
  name: string
}

export type HarmonyRule =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'split-complementary'
  | 'tetradic'
  | 'monochromatic'
  | 'square'
  | 'custom'

export const HARMONY_LABELS: Record<HarmonyRule, string> = {
  complementary: 'Complementary',
  analogous: 'Analogous',
  triadic: 'Triadic',
  'split-complementary': 'Split-Comp',
  tetradic: 'Tetradic',
  monochromatic: 'Mono',
  square: 'Square',
  custom: 'Custom',
}

export const COLOR_NAMES = ['primary', 'secondary', 'accent', 'neutral', 'highlight'] as const

export const DEFAULT_PALETTE: PaletteColor[] = [
  { hex: '#3D6AF2', locked: false, name: 'primary' },
  { hex: '#8B5CF6', locked: false, name: 'secondary' },
  { hex: '#EC4899', locked: false, name: 'accent' },
  { hex: '#F59E0B', locked: false, name: 'neutral' },
  { hex: '#10B981', locked: false, name: 'highlight' },
]

export interface TintShadeStep {
  step: number // 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
  hex: string
}

export interface SavedPalette {
  id: string
  name: string
  colors: string[]
  createdAt: number
}
