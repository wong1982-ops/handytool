// tools/component-lab/types.ts

export type Framework = 'react' | 'vue' | 'svelte' | 'html'
export type ThemeSetting = 'light' | 'dark' | 'both'
export type AnimationLevel = 'none' | 'subtle' | 'rich'
export type A11yLevel = 'standard' | 'wcag-aa'
export type CssFramework = 'tailwind' | 'vanilla' | 'none'

export const FRAMEWORKS: { id: Framework; label: string; lang: string }[] = [
  { id: 'react', label: 'React', lang: 'jsx' },
  { id: 'vue', label: 'Vue', lang: 'html' },
  { id: 'svelte', label: 'Svelte', lang: 'html' },
  { id: 'html', label: 'HTML', lang: 'html' },
]

export interface ComponentSettings {
  theme: ThemeSetting
  responsive: boolean
  animations: AnimationLevel
  accessibility: A11yLevel
  cssFramework: CssFramework
}

export const DEFAULT_SETTINGS: ComponentSettings = {
  theme: 'light',
  responsive: true,
  animations: 'subtle',
  accessibility: 'standard',
  cssFramework: 'tailwind',
}

export interface GeneratedCode {
  react: string
  vue: string
  svelte: string
  html: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface ComponentVersion {
  code: GeneratedCode
  timestamp: number
}

export interface ComponentSession {
  prompt: string
  settings: ComponentSettings
  referenceImageBase64: string | null
  code: GeneratedCode
  versions: ComponentVersion[]
  versionIndex: number
  chatHistory: ChatMessage[]
  activeFramework: Framework
}

export interface SavedComponent {
  id: string
  name: string
  slug: string
  tags: string[]
  prompt: string
  settings: ComponentSettings
  codeReact: string
  codeVue: string
  codeSvelte: string
  codeHtml: string
  thumbnailUrl: string | null
  isPublic: boolean
  copyCount: number
  createdAt: string
  updatedAt: string
}

export const DEFAULT_SESSION: ComponentSession = {
  prompt: '',
  settings: DEFAULT_SETTINGS,
  referenceImageBase64: null,
  code: { react: '', vue: '', svelte: '', html: '' },
  versions: [],
  versionIndex: -1,
  chatHistory: [],
  activeFramework: 'react',
}

export const VIEWPORT_PRESETS = [
  { label: 'Mobile', width: 375 },
  { label: 'Tablet', width: 768 },
  { label: 'Desktop', width: 1280 },
]

export const PROMPT_PLACEHOLDERS = [
  'A pricing table with 3 tiers, toggle for monthly/annual...',
  'A dark mode toggle button with smooth animation...',
  'A file upload dropzone with drag-and-drop and progress bar...',
  'A testimonial carousel with avatar, quote, and navigation dots...',
  'A search bar with autocomplete dropdown and recent searches...',
  'A notification bell with badge count and dropdown panel...',
]
