// ── Business Info ──────────────────────────────────────────────

export interface BusinessInfo {
  name: string
  title: string
  company: string
  phone: string
  email: string
  website: string
  address: string
  linkedin: string
  twitter: string
  instagram: string
  tagline: string
  industry: string
}

export const REQUIRED_FIELDS = ['name', 'title', 'company'] as const

export const INDUSTRY_OPTIONS = [
  'Technology',
  'Finance & Banking',
  'Healthcare',
  'Education',
  'Real Estate',
  'Marketing & Advertising',
  'Legal',
  'Consulting',
  'Retail & E-commerce',
  'Manufacturing',
  'Food & Hospitality',
  'Entertainment & Media',
  'Non-Profit',
  'Construction',
  'Other',
] as const

// ── Brand Analysis ────────────────────────────────────────────

export type BrandStyle =
  | 'modern'
  | 'classic'
  | 'minimalist'
  | 'bold'
  | 'elegant'
  | 'playful'
  | 'corporate'
  | 'creative'

export interface BrandAnalysis {
  suggestedColors: {
    primary: string
    secondary: string
    accent: string
  }
  suggestedStyle: BrandStyle
  suggestedTagline: string
  suggestedFonts: string[]
  brandPersonality: string
}

// ── Generated Design ──────────────────────────────────────────

export interface GeneratedDesign {
  imageUrl: string
  style: BrandStyle
  prompt: string
}

// ── Chat ──────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
}

// ── Wizard ────────────────────────────────────────────────────

export type WizardStep = 1 | 2 | 3 | 4 | 5

export interface WizardState {
  step: WizardStep
  businessInfo: BusinessInfo
  logoDataUrl: string | null
  brandAnalysis: BrandAnalysis | null
  designs: GeneratedDesign[]
  selectedIndex: number
  chatHistory: ChatMessage[]
  currentDesign: GeneratedDesign | null
  refinementCount: number
  loading: boolean
  error: string | null
}

export const MAX_REFINEMENTS = 10

// ── Defaults ──────────────────────────────────────────────────

export const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  name: '',
  title: '',
  company: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  linkedin: '',
  twitter: '',
  instagram: '',
  tagline: '',
  industry: '',
}

export const DEFAULT_WIZARD_STATE: WizardState = {
  step: 1,
  businessInfo: { ...DEFAULT_BUSINESS_INFO },
  logoDataUrl: null,
  brandAnalysis: null,
  designs: [],
  selectedIndex: 0,
  chatHistory: [],
  currentDesign: null,
  refinementCount: 0,
  loading: false,
  error: null,
}

// ── Field Suggestions ─────────────────────────────────────────
// Maps title keywords to optional fields that are likely relevant

export const FIELD_SUGGESTIONS: Record<string, string[]> = {
  developer: ['website', 'linkedin', 'twitter'],
  engineer: ['website', 'linkedin'],
  designer: ['website', 'instagram', 'linkedin'],
  ceo: ['linkedin', 'twitter', 'address'],
  founder: ['linkedin', 'twitter', 'website'],
  manager: ['linkedin', 'phone', 'address'],
  director: ['linkedin', 'phone', 'address'],
  consultant: ['linkedin', 'website', 'phone'],
  freelance: ['website', 'instagram', 'linkedin'],
  artist: ['instagram', 'website'],
  photographer: ['instagram', 'website'],
  realtor: ['phone', 'address', 'linkedin'],
  lawyer: ['phone', 'address', 'linkedin'],
  doctor: ['phone', 'address'],
  teacher: ['email', 'linkedin'],
  coach: ['website', 'instagram', 'linkedin'],
  marketing: ['linkedin', 'twitter', 'website'],
  sales: ['phone', 'linkedin', 'email'],
}
