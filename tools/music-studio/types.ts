// tools/music-studio/types.ts
export type StudioMode = 'music' | 'jingles' | 'sfx'

export interface LaunchpadButton {
  id: string
  label: string
  emoji: string
  gradient: string
}

export interface Clip {
  id: string
  name: string
  durationSeconds: number
  pcmData: Float32Array[]
  createdAt: number
}

export interface LyriaConfig {
  bpm: number
  brightness: number
  density: number
  scale: string
  generationMode: 'QUALITY' | 'DIVERSITY' | 'VOCALIZATION'
  muteBass: boolean
  muteDrums: boolean
}

export interface WeightedPrompt {
  text: string
  weight: number
}

export const DEFAULT_LYRIA_CONFIG: LyriaConfig = {
  bpm: 120,
  brightness: 0.5,
  density: 0.5,
  scale: 'C_MAJOR',
  generationMode: 'QUALITY',
  muteBass: false,
  muteDrums: false,
}

export const SCALES = [
  'C_MAJOR', 'C_MINOR', 'D_MAJOR', 'D_MINOR', 'E_MAJOR', 'E_MINOR',
  'F_MAJOR', 'F_MINOR', 'G_MAJOR', 'G_MINOR', 'A_MAJOR', 'A_MINOR',
  'B_MAJOR', 'B_MINOR',
  'C_SHARP_MAJOR', 'C_SHARP_MINOR', 'E_FLAT_MAJOR', 'E_FLAT_MINOR',
  'F_SHARP_MAJOR', 'F_SHARP_MINOR', 'A_FLAT_MAJOR', 'A_FLAT_MINOR',
  'B_FLAT_MAJOR', 'B_FLAT_MINOR',
] as const

export const SCALE_LABELS: Record<string, string> = {
  C_MAJOR: 'C Major', C_MINOR: 'C Minor', D_MAJOR: 'D Major', D_MINOR: 'D Minor',
  E_MAJOR: 'E Major', E_MINOR: 'E Minor', F_MAJOR: 'F Major', F_MINOR: 'F Minor',
  G_MAJOR: 'G Major', G_MINOR: 'G Minor', A_MAJOR: 'A Major', A_MINOR: 'A Minor',
  B_MAJOR: 'B Major', B_MINOR: 'B Minor',
  C_SHARP_MAJOR: 'C# Major', C_SHARP_MINOR: 'C# Minor',
  E_FLAT_MAJOR: 'Eb Major', E_FLAT_MINOR: 'Eb Minor',
  F_SHARP_MAJOR: 'F# Major', F_SHARP_MINOR: 'F# Minor',
  A_FLAT_MAJOR: 'Ab Major', A_FLAT_MINOR: 'Ab Minor',
  B_FLAT_MAJOR: 'Bb Major', B_FLAT_MINOR: 'Bb Minor',
}

export const MODE_PRESETS: Record<StudioMode, LaunchpadButton[]> = {
  music: [
    { id: 'lofi', label: 'Lo-fi', emoji: '🎧', gradient: 'from-purple-500 to-indigo-500' },
    { id: 'electronic', label: 'Electronic', emoji: '⚡', gradient: 'from-cyan-500 to-blue-500' },
    { id: 'jazz', label: 'Jazz', emoji: '🎷', gradient: 'from-amber-500 to-orange-500' },
    { id: 'classical', label: 'Classical', emoji: '🎻', gradient: 'from-rose-400 to-pink-500' },
    { id: 'rock', label: 'Rock', emoji: '🎸', gradient: 'from-red-500 to-orange-600' },
    { id: 'ambient', label: 'Ambient', emoji: '🌊', gradient: 'from-teal-400 to-emerald-500' },
    { id: 'hiphop', label: 'Hip-hop', emoji: '🎤', gradient: 'from-yellow-500 to-amber-600' },
    { id: 'cinematic', label: 'Cinematic', emoji: '🎬', gradient: 'from-slate-500 to-zinc-600' },
  ],
  jingles: [
    { id: 'upbeat', label: 'Upbeat', emoji: '🎉', gradient: 'from-yellow-400 to-orange-400' },
    { id: 'inspiring', label: 'Inspiring', emoji: '✨', gradient: 'from-blue-400 to-indigo-500' },
    { id: 'playful', label: 'Playful', emoji: '🎈', gradient: 'from-pink-400 to-fuchsia-500' },
    { id: 'corporate', label: 'Corporate', emoji: '💼', gradient: 'from-slate-400 to-blue-500' },
    { id: 'epic', label: 'Epic', emoji: '🏔️', gradient: 'from-amber-600 to-red-600' },
    { id: 'chill', label: 'Chill', emoji: '🧊', gradient: 'from-sky-300 to-blue-400' },
    { id: 'retro', label: 'Retro', emoji: '📼', gradient: 'from-orange-400 to-pink-500' },
    { id: 'dramatic', label: 'Dramatic', emoji: '🎭', gradient: 'from-purple-600 to-red-500' },
  ],
  sfx: [
    { id: 'riser', label: 'Riser', emoji: '📈', gradient: 'from-green-400 to-emerald-500' },
    { id: 'drop', label: 'Drop', emoji: '💥', gradient: 'from-red-500 to-orange-500' },
    { id: 'hit', label: 'Hit', emoji: '🥁', gradient: 'from-amber-500 to-yellow-500' },
    { id: 'stinger', label: 'Stinger', emoji: '⚔️', gradient: 'from-violet-500 to-purple-600' },
    { id: 'whoosh', label: 'Whoosh', emoji: '💨', gradient: 'from-sky-400 to-cyan-500' },
    { id: 'tension', label: 'Tension', emoji: '😰', gradient: 'from-gray-500 to-slate-600' },
    { id: 'fanfare', label: 'Fanfare', emoji: '🎺', gradient: 'from-yellow-400 to-amber-500' },
    { id: 'transition', label: 'Transition', emoji: '🔄', gradient: 'from-indigo-400 to-violet-500' },
  ],
}

export const INSTRUMENTS: LaunchpadButton[] = [
  { id: 'piano', label: 'Piano', emoji: '🎹', gradient: 'from-slate-600 to-slate-400' },
  { id: 'guitar', label: 'Guitar', emoji: '🎸', gradient: 'from-amber-700 to-amber-500' },
  { id: 'synth', label: 'Synth', emoji: '🎛️', gradient: 'from-cyan-600 to-cyan-400' },
  { id: 'drums', label: 'Drums', emoji: '🥁', gradient: 'from-red-700 to-red-500' },
  { id: 'bass', label: 'Bass', emoji: '🎵', gradient: 'from-purple-700 to-purple-500' },
  { id: 'strings', label: 'Strings', emoji: '🎻', gradient: 'from-rose-600 to-rose-400' },
  { id: 'brass', label: 'Brass', emoji: '🎺', gradient: 'from-yellow-600 to-yellow-400' },
  { id: 'flute', label: 'Flute', emoji: '🪈', gradient: 'from-emerald-600 to-emerald-400' },
]

export const MAX_CLIPS = 10
export const MAX_CLIP_DURATION = 180 // 3 minutes in seconds
export const CLIP_WARNING_TIME = 150  // 2:30
