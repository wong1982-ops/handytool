export type ToolCategory = 'creative' | 'utility' | 'interactive'

export interface CategoryTheme {
  gradient: string
  border: string
  iconAccent: string
  bgSubtle: string
}

export const CATEGORY_THEMES: Record<ToolCategory, CategoryTheme> = {
  creative: {
    gradient: 'from-indigo-950 via-purple-900 to-indigo-950',
    border: 'border-purple-800/50',
    iconAccent: 'text-amber-400',
    bgSubtle: 'bg-purple-950/80',
  },
  utility: {
    gradient: 'from-slate-900 via-blue-950 to-slate-900',
    border: 'border-blue-800/50',
    iconAccent: 'text-blue-400',
    bgSubtle: 'bg-blue-950/80',
  },
  interactive: {
    gradient: 'from-slate-900 via-cyan-950 to-slate-900',
    border: 'border-cyan-800/50',
    iconAccent: 'text-cyan-400',
    bgSubtle: 'bg-cyan-950/80',
  },
}

const TOOL_CATEGORY_MAP: Record<string, ToolCategory> = {
  'story-studio': 'creative',
  'mood-board': 'creative',
  'sketch-to-art': 'creative',
  'logo-generator': 'creative',
  'font-generator': 'creative',
  'favicon-generator': 'creative',
  'ecard-studio': 'creative',
  'music-studio': 'creative',
  'vblog': 'creative',
  'story-video': 'creative',
  'component-lab': 'creative',
  'json-converter': 'utility',
  'swagger-editor': 'utility',
  'regex-tester': 'utility',
  'jwt-decoder': 'utility',
  'pdf-converter': 'utility',
  'myip': 'utility',
  'ipcheck': 'utility',
  'speedtest': 'utility',
  'currency-exchange': 'utility',
  'color-palette': 'utility',
  'svg-converter': 'utility',
  'tax-manager': 'utility',
  'accountant-ai': 'utility',
  'local-services': 'interactive',
  'human-benchmark': 'interactive',
  'slots': 'interactive',
  'openclaw': 'interactive',
  'image-editor': 'interactive',
  'id-photo': 'interactive',
  'resume': 'interactive',
  'job-radar': 'interactive',
  'ai-radar': 'interactive',
  'flight-monitor': 'utility',
  'seo-studio': 'utility',
  'dashboard': 'utility',
  'ecommerce-readiness': 'utility',
  'tenancy-manager': 'utility',
  'healthy-homes': 'utility',
  'visa-pathway': 'utility',
  'worksafe-toolkit': 'utility',
  'tradie-tax': 'utility',
}

export function getToolCategory(slug: string): ToolCategory {
  return TOOL_CATEGORY_MAP[slug] || 'utility'
}

export function getCategoryTheme(category: ToolCategory): CategoryTheme {
  return CATEGORY_THEMES[category]
}
