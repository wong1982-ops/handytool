// ─── Industry ─────────────────────────────────────────────────────────────────

export type IndustryId =
  | 'construction'
  | 'hospitality'
  | 'office'
  | 'retail'
  | 'agriculture'
  | 'manufacturing'

export interface Industry {
  id: IndustryId
  name: string
  icon: string
  description: string
}

// ─── Workplace Questions ──────────────────────────────────────────────────────

export interface WorkplaceQuestion {
  id: string
  question: string
  industries: IndustryId[]
}

// ─── Hazard Register ──────────────────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface HazardEntry {
  id: string
  hazard: string
  riskLevel: RiskLevel
  likelihood: string
  consequence: string
  controls: string
  responsible: string
  reviewDate: string
  createdAt: string
}

// ─── Incident Report ─────────────────────────────────────────────────────────

export type IncidentType = 'near-miss' | 'minor' | 'serious' | 'notifiable'

export interface IncidentData {
  date: string
  time: string
  location: string
  type: IncidentType
  description: string
  people: string
  injuries: string
  immediateActions: string
  rootCause: string
  correctiveActions: string
  reportedBy: string
}

// ─── Worker Engagement ────────────────────────────────────────────────────────

export type EngagementStatus = 'yes' | 'partially' | 'no' | null

export interface EngagementItem {
  id: string
  question: string
  status: EngagementStatus
  recommendation: string
}

// ─── H&S Plan ────────────────────────────────────────────────────────────────

export interface PlanData {
  industry: IndustryId
  businessName: string
  questions: Record<string, boolean>
}
