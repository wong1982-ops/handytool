export type WizardStep = 1 | 2 | 3

export type Arcana = 'major' | 'minor'
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles'
export type SpreadCategory = 'love' | 'career' | 'finance' | 'growth' | 'general'
export type Language = 'en' | 'zh'

export interface BilingualText {
  en: string
  zh: string
}

export interface TarotCard {
  id: number
  name: BilingualText
  arcana: Arcana
  suit?: Suit
  number?: number
  imageUrl: string
  meanings: {
    upright: BilingualText
    reversed: BilingualText
  }
  keywords: { en: string[]; zh: string[] }
}

export interface SpreadPosition {
  label: BilingualText
  x: number
  y: number
  rotation?: number
}

export interface TarotSpread {
  id: string
  name: BilingualText
  description: BilingualText
  category: SpreadCategory
  cardCount: number
  positions: SpreadPosition[]
}

export interface DrawnCard {
  cardId: number
  positionIndex: number
  reversed: boolean
  customArtUrl?: string
}

export interface CardInterpretation {
  cardId: number
  positionLabel: BilingualText
  text: string
}

export interface ReadingResult {
  cards: CardInterpretation[]
  narrative: string
}

export type TheaterStage = 'idle' | 'shuffling' | 'dealing' | 'revealing' | 'complete'

export interface TarotProject {
  question: string
  category: SpreadCategory | null
  language: Language
  spreadId: string | null
  recommendedSpreadId: string | null
  drawnCards: DrawnCard[]
  revealedCount: number
  theaterStage: TheaterStage
  interpretation: ReadingResult | null
  streamedText: string
  step: WizardStep
  loading: boolean
  error: string | null
}

export const DEFAULT_PROJECT: TarotProject = {
  question: '',
  category: null,
  language: 'en',
  spreadId: null,
  recommendedSpreadId: null,
  drawnCards: [],
  revealedCount: 0,
  theaterStage: 'idle',
  interpretation: null,
  streamedText: '',
  step: 1,
  loading: false,
  error: null,
}
