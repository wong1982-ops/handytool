import type {
  ResumeState,
  ModuleType,
  BaseInfo,
  JobIntention,
  EducationEntry,
  WorkExperienceEntry,
  ProjectEntry,
  TrainingEntry,
  AwardEntry,
  InternshipEntry,
  CustomSection,
  ThemeConfig,
  SidebarMode,
} from './resume-types'
import type { JSONContent } from '@tiptap/core'

// ── Actions ─────────────────────────────────────────────────────

export type ResumeAction =
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_LOCALE'; payload: 'en' | 'zh' }
  | { type: 'SET_SIDEBAR_MODE'; payload: SidebarMode }
  | { type: 'SET_ACTIVE_MODULE'; payload: ModuleType | null }
  // Module management
  | { type: 'TOGGLE_MODULE'; payload: ModuleType }
  | { type: 'REORDER_MODULES'; payload: ModuleType[] }
  // Module data
  | { type: 'SET_BASE_INFO'; payload: Partial<BaseInfo> }
  | { type: 'SET_JOB_INTENTION'; payload: Partial<JobIntention> }
  | { type: 'SET_EDUCATION'; payload: EducationEntry[] }
  | { type: 'SET_WORK_EXPERIENCE'; payload: WorkExperienceEntry[] }
  | { type: 'SET_PROJECTS'; payload: ProjectEntry[] }
  | { type: 'SET_SKILLS_CERTIFICATES'; payload: JSONContent | null }
  | { type: 'SET_SELF_EVALUATION'; payload: JSONContent | null }
  | { type: 'SET_TRAINING'; payload: TrainingEntry[] }
  | { type: 'SET_AWARDS'; payload: AwardEntry[] }
  | { type: 'SET_INTERNSHIPS'; payload: InternshipEntry[] }
  | { type: 'SET_CUSTOM_SECTIONS'; payload: CustomSection[] }
  // Theme
  | { type: 'SET_THEME'; payload: Partial<ThemeConfig> }
  // Full state
  | { type: 'LOAD_STATE'; payload: ResumeState }

// ── Editor state (wraps resume + UI state) ──────────────────────

export interface EditorState {
  resume: ResumeState
  sidebarMode: SidebarMode
  activeModule: ModuleType | null
  isDirty: boolean
}

// ── Default values ──────────────────────────────────────────────

export function createDefaultResume(): ResumeState {
  return {
    id: crypto.randomUUID(),
    title: 'My Resume',
    locale: 'en',
    enabledModules: [
      'baseInfo',
      'jobIntention',
      'education',
      'workExperience',
      'projects',
      'skillsCertificates',
      'selfEvaluation',
    ],
    baseInfo: {
      name: '',
      photo: '',
      phone: '',
      email: '',
      wechat: '',
      dateOfBirth: '',
    },
    jobIntention: {
      position: '',
      jobType: '',
      expectedSalary: '',
      targetCity: '',
      currentStatus: '',
      desiredIndustry: '',
      currentLocation: '',
      hukou: '',
      workStartDate: '',
    },
    education: [],
    workExperience: [],
    projects: [],
    skillsCertificates: null,
    selfEvaluation: null,
    training: [],
    awards: [],
    internships: [],
    customSections: [],
    theme: {
      templateId: 'classic',
      primaryColor: '#D4A052',
      fontFamily: 'system',
      fontSize: 'md',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function createDefaultEditorState(): EditorState {
  return {
    resume: createDefaultResume(),
    sidebarMode: 'edit',
    activeModule: 'baseInfo',
    isDirty: false,
  }
}

// ── Reducer ─────────────────────────────────────────────────────

export function resumeReducer(state: EditorState, action: ResumeAction): EditorState {
  const now = new Date().toISOString()

  switch (action.type) {
    case 'SET_TITLE':
      return {
        ...state,
        isDirty: true,
        resume: { ...state.resume, title: action.payload, updatedAt: now },
      }

    case 'SET_LOCALE':
      return {
        ...state,
        isDirty: true,
        resume: { ...state.resume, locale: action.payload, updatedAt: now },
      }

    case 'SET_SIDEBAR_MODE':
      return { ...state, sidebarMode: action.payload }

    case 'SET_ACTIVE_MODULE':
      return { ...state, activeModule: action.payload, sidebarMode: 'edit' }

    case 'TOGGLE_MODULE': {
      const mod = action.payload
      if (mod === 'baseInfo') return state // cannot disable mandatory module
      const enabled = state.resume.enabledModules
      const newEnabled = enabled.includes(mod)
        ? enabled.filter((m) => m !== mod)
        : [...enabled, mod]
      return {
        ...state,
        isDirty: true,
        resume: { ...state.resume, enabledModules: newEnabled, updatedAt: now },
      }
    }

    case 'REORDER_MODULES':
      return {
        ...state,
        isDirty: true,
        resume: { ...state.resume, enabledModules: action.payload, updatedAt: now },
      }

    case 'SET_BASE_INFO':
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          baseInfo: { ...state.resume.baseInfo, ...action.payload },
          updatedAt: now,
        },
      }

    case 'SET_JOB_INTENTION':
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          jobIntention: { ...state.resume.jobIntention, ...action.payload },
          updatedAt: now,
        },
      }

    case 'SET_EDUCATION':
      return {
        ...state,
        isDirty: true,
        resume: { ...state.resume, education: action.payload, updatedAt: now },
      }

    case 'SET_WORK_EXPERIENCE':
      return {
        ...state,
        isDirty: true,
        resume: { ...state.resume, workExperience: action.payload, updatedAt: now },
      }

    case 'SET_PROJECTS':
      return {
        ...state,
        isDirty: true,
        resume: { ...state.resume, projects: action.payload, updatedAt: now },
      }

    case 'SET_SKILLS_CERTIFICATES':
      return {
        ...state,
        isDirty: true,
        resume: { ...state.resume, skillsCertificates: action.payload, updatedAt: now },
      }

    case 'SET_SELF_EVALUATION':
      return {
        ...state,
        isDirty: true,
        resume: { ...state.resume, selfEvaluation: action.payload, updatedAt: now },
      }

    case 'SET_TRAINING':
      return {
        ...state,
        isDirty: true,
        resume: { ...state.resume, training: action.payload, updatedAt: now },
      }

    case 'SET_AWARDS':
      return {
        ...state,
        isDirty: true,
        resume: { ...state.resume, awards: action.payload, updatedAt: now },
      }

    case 'SET_INTERNSHIPS':
      return {
        ...state,
        isDirty: true,
        resume: { ...state.resume, internships: action.payload, updatedAt: now },
      }

    case 'SET_CUSTOM_SECTIONS':
      return {
        ...state,
        isDirty: true,
        resume: { ...state.resume, customSections: action.payload, updatedAt: now },
      }

    case 'SET_THEME':
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          theme: { ...state.resume.theme, ...action.payload },
          updatedAt: now,
        },
      }

    case 'LOAD_STATE':
      return {
        ...state,
        resume: action.payload,
        isDirty: false,
      }

    default:
      return state
  }
}
