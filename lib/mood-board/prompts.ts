// lib/mood-board/prompts.ts
import type { MoodOption, ColorPreference } from '@/tools/mood-board/types'

const MOOD_DESCRIPTORS: Record<MoodOption, string> = {
  cozy: 'warm, soft lighting, comfortable textures, inviting atmosphere',
  bold: 'high contrast, vivid colors, strong compositions, impactful visuals',
  elegant: 'refined, sophisticated, luxurious materials, graceful forms',
  playful: 'bright, whimsical, fun patterns, energetic composition',
  minimal: 'clean lines, negative space, muted palette, understated beauty',
  vintage: 'retro tones, film grain, nostalgic elements, timeless aesthetic',
  luxurious: 'rich textures, gold accents, premium materials, opulent detail',
  natural: 'organic textures, earth tones, botanical elements, serene landscapes',
}

const COLOR_DESCRIPTORS: Record<ColorPreference, string> = {
  warm: 'warm color palette — reds, oranges, yellows, terracotta, amber',
  cool: 'cool color palette — blues, teals, lavenders, slate, mint',
  neutral: 'neutral color palette — whites, grays, beiges, taupes, cream',
  surprise: '',
}

export function buildMoodImagePrompt(
  theme: string,
  index: number,
  mood?: MoodOption | null,
  colorPref?: ColorPreference,
): string {
  const variations = [
    'a close-up detail shot capturing texture and material',
    'a wide atmospheric scene capturing the overall mood',
    'a product or object that embodies this aesthetic',
    'a color-rich composition focusing on the palette',
    'an interior or environment that fits this vibe',
    'a pattern or surface texture that matches this style',
    'a lifestyle scene with people or activity',
    'a typography or signage detail in this aesthetic',
  ]
  const variation = variations[index % variations.length]
  const moodDesc = mood ? ` Visual mood: ${MOOD_DESCRIPTORS[mood]}.` : ''
  const colorDesc = colorPref && colorPref !== 'surprise' ? ` Color direction: ${COLOR_DESCRIPTORS[colorPref]}.` : ''

  return (
    `Generate a high-quality mood board reference image for the theme: "${theme}".${moodDesc}${colorDesc} ` +
    `This image should be ${variation}. ` +
    `Professional photography quality, visually cohesive with the theme, ` +
    `no text overlays or watermarks. Square format.`
  )
}

export function buildPalettePrompt(theme: string, mood?: MoodOption | null, colorPref?: ColorPreference): string {
  const moodHint = mood ? ` The mood is ${mood}.` : ''
  const colorHint = colorPref && colorPref !== 'surprise' ? ` Lean toward ${colorPref} tones.` : ''

  return (
    `Suggest a 5-color palette for the theme: "${theme}".${moodHint}${colorHint} ` +
    `Return ONLY a JSON array of 5 hex color strings, no explanation. ` +
    `Example: ["#2D3436", "#636E72", "#DFE6E9", "#74B9FF", "#0984E3"]`
  )
}

export function buildAddMorePrompt(theme: string, userPrompt: string): string {
  return (
    `Generate a mood board reference image for the theme: "${theme}". ` +
    `Specific request: ${userPrompt}. ` +
    `Professional quality, visually cohesive, square format, no text overlays.`
  )
}
