// ─── Business Types ──────────────────────────────────────────────────────────

export type BusinessType =
  | 'accountant'
  | 'lawyer'
  | 'real-estate'
  | 'conveyancer'
  | 'financial-adviser'

export interface BusinessTypeInfo {
  id: BusinessType
  name: string
  regulator: string
  description: string
}

// ─── Risk Levels ─────────────────────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high'

export interface RiskFactor {
  id: string
  category: string
  label: string
  level: RiskLevel
  weight: number
}

// ─── Risk Assessment ─────────────────────────────────────────────────────────

export interface RiskQuestion {
  id: string
  question: string
  helpText?: string
  options: RiskOption[]
}

export interface RiskOption {
  label: string
  value: string
  riskWeight: number // 1 = low, 2 = medium, 3 = high
}

export interface RiskAssessmentAnswers {
  [questionId: string]: string
}

export interface RiskAreaResult {
  area: string
  level: RiskLevel
  score: number
  recommendations: string[]
}

export interface RiskAssessmentResult {
  overallLevel: RiskLevel
  overallScore: number
  areas: RiskAreaResult[]
  completedAt: string
  businessType: BusinessType | null
}

// ─── CDD Checklist ───────────────────────────────────────────────────────────

export type CDDLevel = 'standard' | 'enhanced' | 'simplified'

export interface CDDItem {
  id: string
  level: CDDLevel
  label: string
  description: string
  required: boolean
}

// ─── SAR Indicators ──────────────────────────────────────────────────────────

export type SARCategory =
  | 'unusual-transactions'
  | 'client-behaviour'
  | 'document-concerns'
  | 'geographic-concerns'

export interface SARIndicator {
  id: string
  category: SARCategory
  title: string
  description: string
  whatToDo: string
}

// ─── Compliance Programme ────────────────────────────────────────────────────

export interface ProgrammeSection {
  id: string
  title: string
  content: string[]
}
