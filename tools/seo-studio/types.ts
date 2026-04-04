export interface KeywordResult {
  keyword: string
  volume: 'high' | 'medium' | 'low'
  competition: 'easy' | 'medium' | 'hard'
  relevance: number
}

export interface KeywordResearchResponse {
  suggestions: KeywordResult[]
  questions: string[]
  autocomplete: string[]
  longTail: string[]
}

export interface ContentPlan {
  id: string
  userId: string
  keyword: string
  topic: string | null
  toolSlug: string | null
  scheduledDate: string | null
  status: 'planned' | 'generating' | 'draft' | 'published'
  draftContent: DraftContent | null
  createdAt: string
  updatedAt: string
}

export interface DraftContent {
  title: string
  metaDescription: string
  body: string
  suggestedLinks: { label: string; href: string }[]
}

export type ContentPlanStatus = ContentPlan['status']
