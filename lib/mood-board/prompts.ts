// lib/mood-board/prompts.ts

export function buildMoodImagePrompt(theme: string, index: number): string {
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

  return (
    `Generate a high-quality mood board reference image for the theme: "${theme}". ` +
    `This image should be ${variation}. ` +
    `Professional photography quality, visually cohesive with the theme, ` +
    `no text overlays or watermarks. Square format.`
  )
}

export function buildPalettePrompt(theme: string): string {
  return (
    `Suggest a 5-color palette for the theme: "${theme}". ` +
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
