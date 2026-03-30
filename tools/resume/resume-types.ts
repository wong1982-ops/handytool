import type { JSONContent } from '@tiptap/core'

// ── Module types ────────────────────────────────────────────────

export const MODULE_TYPES = [
  'baseInfo',
  'jobIntention',
  'education',
  'workExperience',
  'projects',
  'skillsCertificates',
  'selfEvaluation',
  'training',
  'awards',
  'internships',
  'custom',
] as const

export type ModuleType = (typeof MODULE_TYPES)[number]

// ── Module data interfaces ──────────────────────────────────────

export interface BaseInfo {
  name: string
  photo: string // base64 or Supabase Storage URL
  phone: string
  email: string
  wechat: string
  dateOfBirth: string // YYYY-MM-DD
}

export interface JobIntention {
  position: string
  jobType: string // e.g. 'campus', 'social', 'internship'
  expectedSalary: string
  targetCity: string
  // Optional fields
  currentStatus: string
  desiredIndustry: string
  currentLocation: string
  hukou: string
  workStartDate: string
}

export interface EducationEntry {
  id: string
  school: string
  major: string
  degree: string
  startDate: string // YYYY-MM
  endDate: string
  description: JSONContent | null
}

export interface WorkExperienceEntry {
  id: string
  company: string
  position: string
  industry: string
  startDate: string
  endDate: string
  description: JSONContent | null
}

export interface ProjectEntry {
  id: string
  projectName: string
  role: string
  startDate: string
  endDate: string
  description: JSONContent | null
}

export interface TrainingEntry {
  id: string
  institution: string
  course: string
  startDate: string
  endDate: string
  description: JSONContent | null
}

export interface AwardEntry {
  id: string
  name: string
  issuer: string
  date: string
  description: JSONContent | null
}

export interface InternshipEntry {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  description: JSONContent | null
}

export interface CustomSection {
  id: string
  title: string
  type: 'richtext' | 'structured'
  richTextContent: JSONContent | null
  structuredFields: { label: string; value: string }[]
}

// ── Theme ───────────────────────────────────────────────────────

export type TemplateId = 'classic' | 'blue-minimal' | 'yellow-minimal'
export type FontFamily = 'system' | 'serif' | 'mono'
export type FontSize = 'sm' | 'md' | 'lg'

export interface ThemeConfig {
  templateId: TemplateId
  primaryColor: string
  fontFamily: FontFamily
  fontSize: FontSize
}

// ── Resume state ────────────────────────────────────────────────

export interface ResumeState {
  id: string
  title: string
  locale: 'en' | 'zh'

  // Module visibility & order
  enabledModules: ModuleType[]

  // Module data
  baseInfo: BaseInfo
  jobIntention: JobIntention
  education: EducationEntry[]
  workExperience: WorkExperienceEntry[]
  projects: ProjectEntry[]
  skillsCertificates: JSONContent | null
  selfEvaluation: JSONContent | null
  training: TrainingEntry[]
  awards: AwardEntry[]
  internships: InternshipEntry[]
  customSections: CustomSection[]

  // Theme
  theme: ThemeConfig

  // Meta
  createdAt: string
  updatedAt: string
}

// ── Sidebar modes ───────────────────────────────────────────────

export type SidebarMode = 'edit' | 'modules' | 'beautify' | 'toolbox' | 'export'

// ── AI ──────────────────────────────────────────────────────────

export type AIAction = 'polish' | 'continue' | 'expand'

export interface AIAssistRequest {
  action: AIAction
  content: string
  context: {
    module: string
    locale: 'en' | 'zh'
    jobTitle?: string
  }
}

export interface AIAssistResponse {
  result: string
}

export interface AIAnalysisResponse {
  score: number
  strengths: string[]
  improvements: string[]
  suggestions: string[]
}
