// tools/vblog/types.ts

export type PipelineStep = 'script' | 'record' | 'voice' | 'assets' | 'assembly' | 'adapt'
export type StepStatus = 'pending' | 'running' | 'done' | 'failed'
export type JobStatus = 'pending' | 'processing' | 'complete' | 'failed'
export type ScriptStyle = 'feature-walkthrough' | 'problem-solution'
export type VoiceType = 'clone' | 'ai'

export const PIPELINE_STEPS: PipelineStep[] = ['script', 'record', 'voice', 'assets', 'assembly', 'adapt']

export const STEP_LABELS: Record<PipelineStep, string> = {
  script: 'Script',
  record: 'Screen Record',
  voice: 'Voiceover',
  assets: 'Assets',
  assembly: 'Assembly',
  adapt: 'Platform Variants',
}

export interface ScriptSection {
  type: 'intro' | 'demo' | 'feature' | 'outro'
  text: string
  duration: number
  visualNote: 'talking-head' | 'screen-recording'
  actions?: string[]
}

export interface ScriptData {
  title: string
  hook: string
  sections: ScriptSection[]
  hashtags: string[]
  description: string
}

export interface JobSteps {
  script: StepStatus
  record: StepStatus
  voice: StepStatus
  assets: StepStatus
  assembly: StepStatus
  adapt: StepStatus
}

export interface JobArtifacts {
  scriptUrl?: string
  screenRecordings?: string[]
  voiceoverUrl?: string
  titleCardUrl?: string
  lowerThirdUrl?: string
  endCardUrl?: string
  masterUrl?: string
  tiktokUrl?: string
  reelsUrl?: string
  twitterUrl?: string
}

export interface VBlogJob {
  id: string
  toolSlug: string
  toolName: string
  scriptStyle: ScriptStyle
  voiceType: VoiceType
  voiceId?: string
  targetDuration: number
  status: JobStatus
  currentStep: PipelineStep | null
  steps: JobSteps
  artifacts: JobArtifacts
  scriptData: ScriptData | null
  error: string | null
  createdAt: string
  updatedAt: string
}

export const DEFAULT_STEPS: JobSteps = {
  script: 'pending',
  record: 'pending',
  voice: 'pending',
  assets: 'pending',
  assembly: 'pending',
  adapt: 'pending',
}

export const DURATION_OPTIONS = [
  { value: 60, label: '60s — Short' },
  { value: 120, label: '2 min — Standard' },
  { value: 180, label: '3 min — Detailed' },
]

export const PROCESSING_SERVER_URL = process.env.NEXT_PUBLIC_VBLOG_PROCESSOR_URL || 'http://localhost:4000'
