export type FontStyle =
  | 'neon'
  | 'hand-drawn'
  | 'retro-pixel'
  | 'watercolor'
  | '3d-bubble'
  | 'gothic'
  | 'graffiti'
  | 'minimalist'

export type WizardStep = 1 | 2 | 3 | 4 | 5

export interface FontCharacter {
  char: string
  imageUrl: string
  svgUrl?: string | null
}

export interface FontProject {
  stylePreset: FontStyle | null
  customPrompt: string
  colors: string[]
  colorMode: 'ai-suggested' | 'custom'
  referenceImageBase64: string | null
  projectId: string | null
  characters: FontCharacter[]
  step: WizardStep
  loading: boolean
  error: string | null
}

export const PREVIEW_CHARS = ['A', 'B', 'G', 'R', 'a', 'g', '1', '&']

export const FULL_CHARS = [
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  ...'0123456789'.split(''),
]

export const FONT_STYLES: {
  id: FontStyle
  name: string
  description: string
  gradient: string
}[] = [
  { id: 'neon', name: 'Neon', description: 'Glowing neon tube letters with vibrant glow effects', gradient: 'from-pink-500 to-blue-500' },
  { id: 'hand-drawn', name: 'Hand-drawn', description: 'Sketchy, imperfect, organic ink feel', gradient: 'from-amber-600 to-orange-400' },
  { id: 'retro-pixel', name: 'Retro Pixel', description: '8-bit pixel art style, blocky and game-like', gradient: 'from-green-500 to-emerald-400' },
  { id: 'watercolor', name: 'Watercolor', description: 'Soft paint bleeds with translucent pastel layers', gradient: 'from-sky-400 to-indigo-300' },
  { id: '3d-bubble', name: '3D Bubble', description: 'Inflated, rounded, glossy 3D with shiny highlights', gradient: 'from-fuchsia-500 to-pink-400' },
  { id: 'gothic', name: 'Gothic', description: 'Blackletter, ornate, medieval decorative style', gradient: 'from-slate-700 to-slate-500' },
  { id: 'graffiti', name: 'Graffiti', description: 'Street art, spray paint, bold urban style', gradient: 'from-red-500 to-yellow-400' },
  { id: 'minimalist', name: 'Minimalist', description: 'Thin geometric strokes, monoline, ultra-clean', gradient: 'from-gray-500 to-gray-300' },
]

export const FONT_COLOR_PALETTES: { name: string; colors: string[] }[] = [
  { name: 'Neon Nights', colors: ['#FF00FF', '#00FFFF', '#FF1493', '#7B68EE', '#000000'] },
  { name: 'Earth Tones', colors: ['#8B4513', '#D2691E', '#F4A460', '#DEB887', '#2F1B14'] },
  { name: 'Ocean', colors: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#03045E'] },
  { name: 'Sunset', colors: ['#FF6B6B', '#FF8E53', '#FFC300', '#FF5733', '#C70039'] },
  { name: 'Monochrome', colors: ['#000000', '#333333', '#666666', '#999999', '#FFFFFF'] },
  { name: 'Pastel', colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'] },
]

export const DEFAULT_FONT_PROJECT: FontProject = {
  stylePreset: null,
  customPrompt: '',
  colors: FONT_COLOR_PALETTES[0].colors,
  colorMode: 'ai-suggested',
  referenceImageBase64: null,
  projectId: null,
  characters: [],
  step: 1,
  loading: false,
  error: null,
}
