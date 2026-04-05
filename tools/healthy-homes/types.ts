// ─── Healthy Homes Types ──────────────────────────────────────────────────────

export type StandardId = 'heating' | 'insulation' | 'ventilation' | 'moisture' | 'draught'

export type ComplianceStatus = 'compliant' | 'non-compliant' | 'not-checked'

export interface ChecklistAnswers {
  [questionId: string]: string | number | undefined
}

export interface StandardResult {
  standardId: StandardId
  status: ComplianceStatus
  issues: string[]
}

export interface HeatingCalcResult {
  requiredKw: number
  zone: 1 | 2 | 3
  area: number
  volume: number
}

export interface ComplianceResult {
  overall: ComplianceStatus
  standards: StandardResult[]
  checkedAt: string
}

export interface StatementData {
  property: {
    address: string
  }
  landlord: {
    name: string
  }
  tenants: {
    names: string[]
  }
  tenancyStartDate: string
  declarations: Record<StandardId, boolean>
}

export interface Property {
  id?: string
  userId?: string
  address: string
  city?: string
  climateZone?: 1 | 2 | 3
  checklist?: ChecklistAnswers
  complianceStatus?: ComplianceStatus
  lastChecked?: string
  createdAt?: string
  updatedAt?: string
}

export interface QuestionOption {
  value: string
  label: string
}

export interface ChecklistQuestion {
  id: string
  standard: StandardId
  question: string
  type: 'radio' | 'select' | 'number'
  options?: QuestionOption[]
  hint?: string
  unit?: string
}
