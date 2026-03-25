import type { FontStyle } from '@/tools/font-generator/types'

const STYLE_DESCRIPTIONS: Record<FontStyle, string> = {
  'neon': 'a brightly glowing neon tube sign letter, vivid neon light with subtle glow and reflections on a dark background',
  'hand-drawn': 'a hand-drawn ink sketch letter with organic imperfections, visible pen strokes, and a natural handmade feel on white paper',
  'retro-pixel': 'an 8-bit pixel art letter with clean blocky pixels, retro video game aesthetic, sharp edges, on a white background',
  'watercolor': 'a watercolor painted letter with soft translucent paint bleeds, visible brush texture, and gentle pastel gradients on white paper',
  '3d-bubble': 'a glossy inflated 3D bubble letter with shiny highlights, rounded puffy form, and a subtle drop shadow on a white background',
  'gothic': 'an ornate blackletter gothic letter with decorative serifs, medieval manuscript style, intricate details on a white background',
  'graffiti': 'a bold graffiti street art letter with spray paint texture, drips, vibrant colors, urban wildstyle on a white background',
  'minimalist': 'an ultra-clean minimalist geometric letter with thin precise monoline strokes, balanced whitespace, on a white background',
}

export function buildCharPrompt(
  char: string,
  style: FontStyle,
  colors: string[],
  customPrompt?: string,
  hasReference?: boolean,
): string {
  const styleDesc = STYLE_DESCRIPTIONS[style]
  const colorList = colors.length > 0 ? `Color palette: ${colors.join(', ')}. ` : ''
  const customClause = customPrompt?.trim()
    ? `Additional creative direction: ${customPrompt.trim()}. `
    : ''
  const referenceClause = hasReference
    ? 'Match the visual style and texture of the provided reference image. '
    : ''

  return (
    `Generate a single letter "${char}" rendered as ${styleDesc}. ` +
    `${colorList}` +
    `${referenceClause}` +
    `${customClause}` +
    `The letter must be centered on a pure white square background, clean crisp rendering, high quality. ` +
    `Do NOT include any other text, labels, or decoration — ONLY the single letter "${char}" itself.`
  )
}
