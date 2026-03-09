/** All 30 available Gemini TTS voices — shared between client and server */

export type VoiceGender = 'female' | 'male'
export type VoiceAge = 'young' | 'adult' | 'mature'
export type VoiceStyle = 'bright' | 'calm' | 'energetic' | 'serious' | 'warm'

export interface GeminiVoice {
  name: string
  tone: string
  gender: VoiceGender
  age: VoiceAge
  style: VoiceStyle
}

export const GEMINI_VOICES: readonly GeminiVoice[] = [
  // Female voices
  { name: 'Zephyr', tone: 'Bright', gender: 'female', age: 'young', style: 'bright' },
  { name: 'Leda', tone: 'Youthful', gender: 'female', age: 'young', style: 'energetic' },
  { name: 'Aoede', tone: 'Breezy', gender: 'female', age: 'young', style: 'bright' },
  { name: 'Kore', tone: 'Firm', gender: 'female', age: 'adult', style: 'serious' },
  { name: 'Autonoe', tone: 'Bright', gender: 'female', age: 'adult', style: 'bright' },
  { name: 'Callirrhoe', tone: 'Easy-going', gender: 'female', age: 'adult', style: 'calm' },
  { name: 'Despina', tone: 'Smooth', gender: 'female', age: 'adult', style: 'calm' },
  { name: 'Erinome', tone: 'Clear', gender: 'female', age: 'adult', style: 'serious' },
  { name: 'Laomedeia', tone: 'Upbeat', gender: 'female', age: 'adult', style: 'energetic' },
  { name: 'Pulcherrima', tone: 'Forward', gender: 'female', age: 'adult', style: 'energetic' },
  { name: 'Achernar', tone: 'Soft', gender: 'female', age: 'adult', style: 'warm' },
  { name: 'Sulafat', tone: 'Warm', gender: 'female', age: 'mature', style: 'warm' },
  { name: 'Gacrux', tone: 'Mature', gender: 'female', age: 'mature', style: 'serious' },
  { name: 'Vindemiatrix', tone: 'Gentle', gender: 'female', age: 'mature', style: 'warm' },

  // Male voices
  { name: 'Puck', tone: 'Upbeat', gender: 'male', age: 'young', style: 'energetic' },
  { name: 'Fenrir', tone: 'Excitable', gender: 'male', age: 'young', style: 'energetic' },
  { name: 'Sadachbia', tone: 'Lively', gender: 'male', age: 'young', style: 'bright' },
  { name: 'Charon', tone: 'Informative', gender: 'male', age: 'adult', style: 'serious' },
  { name: 'Orus', tone: 'Firm', gender: 'male', age: 'adult', style: 'serious' },
  { name: 'Enceladus', tone: 'Breathy', gender: 'male', age: 'adult', style: 'calm' },
  { name: 'Iapetus', tone: 'Clear', gender: 'male', age: 'adult', style: 'serious' },
  { name: 'Umbriel', tone: 'Easy-going', gender: 'male', age: 'adult', style: 'calm' },
  { name: 'Algieba', tone: 'Smooth', gender: 'male', age: 'adult', style: 'calm' },
  { name: 'Achird', tone: 'Friendly', gender: 'male', age: 'adult', style: 'warm' },
  { name: 'Zubenelgenubi', tone: 'Casual', gender: 'male', age: 'adult', style: 'calm' },
  { name: 'Algenib', tone: 'Gravelly', gender: 'male', age: 'mature', style: 'serious' },
  { name: 'Rasalgethi', tone: 'Informative', gender: 'male', age: 'mature', style: 'serious' },
  { name: 'Alnilam', tone: 'Firm', gender: 'male', age: 'mature', style: 'serious' },
  { name: 'Schedar', tone: 'Even', gender: 'male', age: 'mature', style: 'calm' },
  { name: 'Sadaltager', tone: 'Knowledgeable', gender: 'male', age: 'mature', style: 'warm' },
] as const

export const GEMINI_VOICE_NAMES = GEMINI_VOICES.map(v => v.name)

/** Get unique values for filter options */
export const VOICE_GENDERS: VoiceGender[] = ['female', 'male']
export const VOICE_AGES: VoiceAge[] = ['young', 'adult', 'mature']
export const VOICE_STYLES: VoiceStyle[] = ['bright', 'calm', 'energetic', 'serious', 'warm']
