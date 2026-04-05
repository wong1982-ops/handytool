export interface QuizOption {
  label: string
  value: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: QuizOption[]
}

export type QuizAnswers = Record<string, string>

export type PathwayId =
  | 'smc'
  | 'aewv'
  | 'green-list-1'
  | 'green-list-2'
  | 'post-study'
  | 'student'
  | 'partner'
  | 'parent'

export type MatchLevel = 'strong' | 'possible' | 'unlikely'

export interface RequirementCheck {
  label: string
  status: 'met' | 'not-met' | 'possible' | 'unknown'
}

export interface FeeInfo {
  applicationFee: number
  immigrationLevy: number
  total: number
  processingTime: string
}

export interface PathwayMatch {
  id: PathwayId
  name: string
  description: string
  matchLevel: MatchLevel
  requirements: RequirementCheck[]
  fee: FeeInfo
}

export interface PointsBreakdown {
  age: number
  qualifications: number
  experience: number
  jobOffer: number
  greenListBonus: number
  partnerBonus: number
  nzStudyBonus: number
  total: number
}

export interface GreenListOccupation {
  title: string
  anzsco: string
  tier: 1 | 2
}

export interface DocumentItem {
  name: string
  note?: string
  required: boolean
}
