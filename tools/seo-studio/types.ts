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

// ── Audit types ──────────────────────────────────────────────────────────────

export interface AuditIssue {
  type: 'critical' | 'warning' | 'info'
  message: string
  current?: string
  recommended?: string
}

export interface ToolAuditResult {
  slug: string
  name: string
  score: number
  issues: AuditIssue[]
}

export interface AuditResult {
  id?: string
  scannedAt: string
  overallScore: number
  tools: ToolAuditResult[]
}

// ── Landing page types ───────────────────────────────────────────────────────

export interface LandingPage {
  id: string
  toolSlug: string
  keyword: string
  pageType: 'use-case' | 'free-tool'
  slug: string
  title: string
  metaDescription: string
  content: LandingPageContent
  structuredData: Record<string, unknown>
  status: 'draft' | 'live'
  createdAt: string
  updatedAt: string
}

export interface LandingPageContent {
  heroHeadline: string
  heroSubheadline: string
  benefits: { title: string; description: string }[]
  faq: { question: string; answer: string }[]
  ctaText: string
  ctaHref: string
}
