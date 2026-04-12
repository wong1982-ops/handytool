// tools/story-studio/types.ts

export type Language = 'en' | 'zh'

export type CharacterRole = 'protagonist' | 'antagonist' | 'supporting'
export type BookStatus = 'generating' | 'complete'
export type ImageStatus = 'pending' | 'generating' | 'done' | 'error'
export type AppPhase = 'input' | 'refine' | 'generating' | 'viewer'
export type StudioMode = 'speed' | 'professional'

export interface ConceptSections {
  premise: string
  authorIntent: string
  messageToAudience: string
  narrativeArc: string
  tone: string
  visualStyle: string
}

export interface StoryConcept {
  id: string
  title: string
  coverDescription: string
  sections: ConceptSections
  tags: {
    style: string
    audience: string
    pageCount: number
    tone: string
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

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
  audioUrl?: string
}

export interface StoryBook {
  id: string
  slug: string
  title: string
  authors: string[]
  coverImageUrl?: string
  concept: StoryConcept
  theme: string
  setting: string
  characters: Character[]
  pages: Page[]
  voiceMap?: Record<string, string>
  status: BookStatus
  createdAt: string
  updatedAt: string
}

export type ProgressEvent =
  | { type: 'status'; message: string }
  | { type: 'story-ready'; data: StoryBook }
  | { type: 'image-done'; page: number; url: string }
  | { type: 'audio-done'; page: number; url: string }
  | { type: 'complete'; data: StoryBook; creditsUsed?: number }
  | { type: 'error'; message: string }

export const CREDIT_COSTS = {
  generate: 50,
  regenerateStory: 10,
  regenerateImage: 5,
  exportPdf: 5,
} as const
