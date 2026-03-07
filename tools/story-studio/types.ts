// tools/story-studio/types.ts

export type Audience = 'toddler' | 'early-reader' | 'middle-grade' | 'young-adult' | 'all-ages'
export type BookFormat = 'picture-book'
export type BookStatus = 'draft' | 'story-approved' | 'illustrating' | 'complete'
export type ImageStatus = 'pending' | 'generating' | 'done' | 'error'
export type StylePreset = 'watercolor' | 'cartoon' | 'anime' | 'realistic' | 'paper-craft' | 'custom'
export type CharacterRole = 'protagonist' | 'antagonist' | 'supporting'
export type WizardStep = 'input' | 'story' | 'illustrations' | 'editor'

export interface Dialogue {
  speaker: string
  line: string
}

export interface Character {
  name: string
  role: CharacterRole
  description: string
  age?: string
}

export interface Page {
  sequence: number
  sceneDescription: string
  narrativeText: string
  dialogue?: Dialogue[]
  mood: string
  imagePrompt: string
  imageUrl?: string
  imageStatus: ImageStatus
}

export interface BookStyle {
  preset: StylePreset
  customPrompt?: string
}

export interface StoryBook {
  id: string
  title: string
  audience: Audience
  format: BookFormat
  style: BookStyle
  theme: string
  setting: string
  characters: Character[]
  pages: Page[]
  status: BookStatus
  createdAt: string
  updatedAt: string
}

export interface StoryInput {
  title?: string
  plot: string
  audience: Audience
  format: BookFormat
  pageCount: number
  style: BookStyle
}

export const AUDIENCES: { value: Audience; label: string }[] = [
  { value: 'toddler', label: 'Toddler (2-4)' },
  { value: 'early-reader', label: 'Early Reader (5-7)' },
  { value: 'middle-grade', label: 'Middle Grade (8-12)' },
  { value: 'young-adult', label: 'Young Adult' },
  { value: 'all-ages', label: 'All Ages' },
]

export const STYLE_PRESETS: { value: StylePreset; label: string; description: string }[] = [
  { value: 'watercolor', label: 'Watercolor', description: 'Soft, flowing watercolor painting style' },
  { value: 'cartoon', label: 'Cartoon', description: 'Bold lines, bright colors, playful' },
  { value: 'anime', label: 'Anime', description: 'Japanese anime illustration style' },
  { value: 'realistic', label: 'Realistic', description: 'Photorealistic digital art' },
  { value: 'paper-craft', label: 'Paper Craft', description: 'Cut paper collage look' },
  { value: 'custom', label: 'Custom', description: 'Describe your own style' },
]

export const PAGE_COUNTS = [8, 10, 12, 16] as const

export const CREDIT_COSTS = {
  enrich: 20,
  illustrate: 5,
  regenerateStory: 10,
  regenerateImage: 5,
  exportPdf: 5,
} as const
