export type TestId =
  | 'reaction-time'
  | 'sequence-memory'
  | 'aim-trainer'
  | 'number-memory'
  | 'verbal-memory'
  | 'chimp-test'
  | 'visual-memory'
  | 'typing'
  | 'pitch-identification'
  | 'mental-rotation'
  | 'schulte-grid'
  | 'rhythm-test'
  | 'interval-recognition'
  | 'chord-identification'
  | 'tone-memory'
  | 'higher-or-lower'
  | 'stroop-test'
  | 'quick-math'
  | 'word-scramble'
  | 'tracking-test'

export type ViewState = 'dashboard' | TestId

export interface TestConfig {
  id: TestId
  name: string
  description: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  iconBgLight: string
  iconColorLight: string
  gameBgColor: string
  unit: string
  lowerIsBetter: boolean
}

export interface ScoreEntry {
  score: number
  date: string
}

export interface TestScore {
  best: number
  history: ScoreEntry[]
  attempts: number
}

export interface StoredScores {
  [testId: string]: TestScore
}

export interface TestComponentProps {
  onComplete: (score: number) => void
  onBack: () => void
  bestScore?: number
}
