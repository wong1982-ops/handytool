import type { LogoStyle } from '@/tools/logo-generator/types'

const STYLE_DESCRIPTIONS: Record<LogoStyle, string> = {
  modern:
    'clean geometric forms, crisp lines, balanced negative space, and a forward-looking contemporary aesthetic that conveys innovation and professionalism',
  playful:
    'rounded shapes, energetic curves, fun and friendly character, vibrant dynamic composition that feels approachable, lively, and full of personality',
  elegant:
    'refined sophisticated letterforms, graceful lines, luxurious spacing, restrained ornamentation, and timeless high-end aesthetic that conveys prestige and exclusivity',
  bold:
    'strong high-contrast shapes, heavy impactful weight, powerful confident composition, commanding presence that demands attention and communicates strength',
  vintage:
    'classic retro-inspired details, weathered textures, nostalgic typographic elements, heritage badge styling, and timeless craftsmanship that evokes tradition and authenticity',
  minimalist:
    'ultra-clean purposeful simplicity, essential forms only, generous whitespace, reductive design philosophy that communicates clarity, focus, and understated confidence',
}

const VARIATIONS: string[] = [
  // icon + text
  'icon above text: a distinctive icon or symbol centered above the business name, stacked vertical layout',
  'icon left of text: a compact icon or symbol to the left of the business name, horizontal inline layout',
  'icon right of text: a compact icon or symbol to the right of the business name, horizontal inline layout',
  // text-only / wordmark
  'wordmark: the business name rendered in a unique, custom-styled typeface with no separate icon — the typography itself is the logo',
  'lettermark: one or two initials of the business name crafted into a distinctive monogram or lettermark badge',
  'custom type: the full business name set in highly customized lettering with unique ligatures, flourishes, or modified characters',
  // icon-heavy / symbol
  'symbol-focused: a bold standalone symbol or icon that represents the brand, with the business name in small text beneath',
  'emblem: the business name enclosed within a shield, crest, circle, or badge shape — classic emblem style',
  'mascot: a stylized character or creature that embodies the brand personality, with the business name integrated below',
  // abstract / creative
  'abstract mark: a purely abstract geometric or organic shape that captures the brand essence without literal imagery, paired with the business name',
  'monogram seal: an ornate interlocking monogram of the initials set inside a circular or oval seal, with the full name around the perimeter',
  'dynamic mark: a logo that uses motion-inspired lines, gradients, or fragmented shapes to convey energy and progress, with the business name',
]

export function buildPrompts(
  businessName: string,
  tagline: string,
  industry: string,
  style: LogoStyle,
  colors: string[],
  customPrompt?: string,
): string[] {
  const styleDescription = STYLE_DESCRIPTIONS[style]
  const colorList = colors.join(', ')
  const taglineClause = tagline
    ? ` with tagline "${tagline}"`
    : ''
  const customClause = customPrompt?.trim()
    ? ` Additional creative direction: ${customPrompt.trim()}.`
    : ''

  return VARIATIONS.map((variation) => {
    return (
      `Design a professional logo for "${businessName}"${taglineClause}, a ${industry} brand. ` +
      `Style: ${styleDescription}. ` +
      `Color palette: ${colorList}. ` +
      `Layout: ${variation}.${customClause} ` +
      `The logo must be on a pure white background, square format, clean vector-style rendering, high quality. ` +
      `Do NOT include any mockups, devices, or context — ONLY the logo itself.`
    )
  })
}
