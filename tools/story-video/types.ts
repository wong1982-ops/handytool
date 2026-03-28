// tools/story-video/types.ts

// ──────────────────────────────────────────────────────────────
// Core union types
// ──────────────────────────────────────────────────────────────

export type VideoProviderType = 'gemini' | 'kling' | 'runway'

export type ArtStyle = 'cartoon' | 'anime' | 'pixar' | 'watercolor'

export type DurationPreset = 'auto' | 'short' | 'medium' | 'long'

export type PipelineStep =
  | 'script'
  | 'scenes'
  | 'voices'
  | 'narration'
  | 'sfx'
  | 'music'
  | 'assembly'

// ──────────────────────────────────────────────────────────────
// Scene & Screenplay
// ──────────────────────────────────────────────────────────────

export interface SceneStatus {
  index: number
  status: 'pending' | 'generating' | 'done' | 'failed'
  clipUrl?: string
  error?: string
}

export interface ScreenplayScene {
  sceneIndex: number
  description: string
  characters: string[]
  dialogue: { character: string; text: string }[]
  narration: string
  mood: string
  sfxHints: string[]
  duration: number
  cameraDirection: string
  transition: string
}

export interface Screenplay {
  scenes: ScreenplayScene[]
  totalDuration: number
  musicMood: string
}

// ──────────────────────────────────────────────────────────────
// Video Provider interface
// ──────────────────────────────────────────────────────────────

export interface VideoProvider {
  readonly name: string
  generateScene(params: {
    scene: ScreenplayScene
    artStyle: ArtStyle
    characterPortraits?: { name: string; imageUrl: string }[]
    previousSceneUrl?: string
  }): Promise<Buffer>
}

// ──────────────────────────────────────────────────────────────
// Job (matches DB schema: story_video_jobs)
// ──────────────────────────────────────────────────────────────

export type StepStatus = 'pending' | 'processing' | 'done' | 'failed'

export interface StoryVideoJob {
  id: string
  user_id: string
  book_id: string
  book_title: string
  art_style: ArtStyle
  provider: VideoProviderType
  target_duration: DurationPreset
  status: 'pending' | 'processing' | 'complete' | 'failed'
  current_step: PipelineStep | null
  steps: Record<PipelineStep, StepStatus>
  screenplay: Screenplay | null
  scene_status: SceneStatus[]
  artifacts: {
    voices?: Record<string, Record<string, string>>
    narration?: Record<string, string>
    sfx?: Record<string, Record<string, string>>
    music?: string
    finalVideo?: string
    thumbnail?: string
  }
  credits_charged: number
  error: string | null
  created_at: string
  updated_at: string
}

// ──────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────

export const PIPELINE_STEPS: PipelineStep[] = [
  'script',
  'scenes',
  'voices',
  'narration',
  'sfx',
  'music',
  'assembly',
]

export const STEP_LABELS: Record<PipelineStep, string> = {
  script: 'Screenplay',
  scenes: 'Scene Generation',
  voices: 'Character Voices',
  narration: 'Narration',
  sfx: 'Sound Effects',
  music: 'Background Music',
  assembly: 'Final Assembly',
}

export interface ArtStyleOption {
  id: ArtStyle
  name: string
  description: string
  gradient: string
}

export const ART_STYLES: ArtStyleOption[] = [
  {
    id: 'cartoon',
    name: 'Cartoon',
    description: 'Classic children\'s cartoon with bold outlines and vibrant colors',
    gradient: 'from-yellow-400 to-orange-500',
  },
  {
    id: 'anime',
    name: 'Anime',
    description: 'Japanese animation style with expressive eyes and dynamic poses',
    gradient: 'from-pink-400 to-purple-500',
  },
  {
    id: 'pixar',
    name: 'Pixar',
    description: '3D rendered style with soft lighting and rich textures',
    gradient: 'from-blue-400 to-cyan-500',
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    description: 'Soft, painterly watercolor illustration with gentle washes',
    gradient: 'from-emerald-400 to-teal-500',
  },
]

export const CREDIT_TIERS: Record<Exclude<DurationPreset, 'auto'>, number> = {
  short: 5,
  medium: 10,
  long: 20,
}

/**
 * Estimate credits for a story video job.
 * 'auto' resolves to short/medium/long based on page count.
 */
export function estimateCredits(pageCount: number, duration: DurationPreset): number {
  if (duration === 'auto') {
    if (pageCount <= 8) return CREDIT_TIERS.short
    if (pageCount <= 16) return CREDIT_TIERS.medium
    return CREDIT_TIERS.long
  }
  return CREDIT_TIERS[duration]
}

/**
 * Default step statuses for a new job.
 */
export const DEFAULT_STEPS: Record<PipelineStep, StepStatus> = {
  script: 'pending',
  scenes: 'pending',
  voices: 'pending',
  narration: 'pending',
  sfx: 'pending',
  music: 'pending',
  assembly: 'pending',
}
