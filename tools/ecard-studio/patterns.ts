// Hero Patterns - curated for ECard Studio
// Source: https://heropatterns.com/ (CC BY 4.0)
// Fill color and opacity are baked into each SVG data URI.
// The `{{ fill }}` placeholder is replaced with the accent color at runtime.

import type { BackgroundPattern } from './types'

export interface PatternDef {
  id: BackgroundPattern
  label: string
  /** SVG data URI template — replace `FILL` with URL-encoded hex color (e.g. %23d4af37) */
  svg: string
}

function makePattern(id: BackgroundPattern, label: string, svg: string): PatternDef {
  return { id, label, svg }
}

export const PATTERNS: PatternDef[] = [
  makePattern('none', 'None', ''),
  makePattern(
    'diagonal-stripes',
    'Stripes',
    "data:image/svg+xml,%3csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='FILL' fill-opacity='0.1' fill-rule='evenodd'%3e%3cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3e%3c/g%3e%3c/svg%3e",
  ),
  makePattern(
    'hexagons',
    'Hexagons',
    "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3e%3cg fill-rule='evenodd'%3e%3cg id='hexagons' fill='FILL' fill-opacity='0.1' fill-rule='nonzero'%3e%3cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e",
  ),
  makePattern(
    'plus',
    'Plus',
    "data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='FILL' fill-opacity='0.1'%3e%3cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e",
  ),
  makePattern(
    'polka-dots',
    'Dots',
    "data:image/svg+xml,%3csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='FILL' fill-opacity='0.1' fill-rule='evenodd'%3e%3ccircle cx='3' cy='3' r='3'/%3e%3ccircle cx='13' cy='13' r='3'/%3e%3c/g%3e%3c/svg%3e",
  ),
  makePattern(
    'texture',
    'Texture',
    "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3e%3cpath fill='FILL' fill-opacity='0.1' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3e%3c/path%3e%3c/svg%3e",
  ),
  makePattern(
    'flipped-diamonds',
    'Diamonds',
    "data:image/svg+xml,%3csvg width='16' height='20' viewBox='0 0 16 20' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='FILL' fill-opacity='0.1' fill-rule='evenodd'%3e%3cpath d='M8 0v20L0 10M16 0v10L8 0M16 10v10H8'/%3e%3c/g%3e%3c/svg%3e",
  ),
  makePattern(
    'four-point-stars',
    'Stars',
    "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3e%3cg fill='FILL' fill-opacity='0.1'%3e%3cpolygon fill-rule='evenodd' points='8 4 12 6 8 8 6 12 4 8 0 6 4 4 6 0 8 4'/%3e%3c/g%3e%3c/svg%3e",
  ),
  makePattern(
    'falling-triangles',
    'Triangles',
    "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='36' height='72' viewBox='0 0 36 72'%3e%3cg fill-rule='evenodd'%3e%3cg fill='FILL' fill-opacity='0.1'%3e%3cpath d='M2 6h12L8 18 2 6zm18 36h12l-6 12-6-12z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e",
  ),
  makePattern(
    'zig-zag',
    'Zig Zag',
    "data:image/svg+xml,%3csvg width='40' height='12' viewBox='0 0 40 12' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M0 6.172L6.172 0h5.656L0 11.828V6.172zm40 5.656L28.172 0h5.656L40 6.172v5.656zM6.172 12l12-12h3.656l12 12h-5.656L20 3.828 11.828 12H6.172zm12 0L20 10.172 21.828 12h-3.656z' fill='FILL' fill-opacity='0.1' fill-rule='evenodd'/%3e%3c/svg%3e",
  ),
  makePattern(
    'signal',
    'Signal',
    "data:image/svg+xml,%3csvg width='84' height='48' viewBox='0 0 84 48' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M0 0h12v6H0V0zm28 8h12v6H28V8zm14-8h12v6H42V0zm14 0h12v6H56V0zm0 8h12v6H56V8zM42 8h12v6H42V8zm0 16h12v6H42v-6zm14-8h12v6H56v-6zm14 0h12v6H70v-6zm0-16h12v6H70V0zM28 32h12v6H28v-6zM14 16h12v6H14v-6zM0 24h12v6H0v-6zm0 8h12v6H0v-6zm14 0h12v6H14v-6zm14 8h12v6H28v-6zm-14 0h12v6H14v-6zm28 0h12v6H42v-6zm14-8h12v6H56v-6zm0-8h12v6H56v-6zm14 8h12v6H70v-6zm0 8h12v6H70v-6zM14 24h12v6H14v-6zm14-8h12v6H28v-6zM14 8h12v6H14V8zM0 8h12v6H0V8z' fill='FILL' fill-opacity='0.1' fill-rule='evenodd'/%3e%3c/svg%3e",
  ),
  makePattern(
    'overlapping-circles',
    'Circles',
    "data:image/svg+xml,%3csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='FILL' fill-opacity='0.1'%3e%3cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3e%3c/g%3e%3c/g%3e%3c/svg%3e",
  ),
  makePattern(
    'formal-invitation',
    'Formal',
    "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='100' height='18' viewBox='0 0 100 18'%3e%3cpath fill='FILL' fill-opacity='0.1' d='M61.82 18c3.47-1.45 6.86-3.78 11.3-7.34C78 6.76 80.34 5.1 83.87 3.42 88.56 1.16 93.75 0 100 0v6.16C98.76 6.05 97.43 6 96 6c-9.59 0-14.23 2.23-23.13 9.34-1.28 1.03-2.39 1.9-3.4 2.66h-7.65zm-23.64 0H22.52c-1-.76-2.1-1.63-3.4-2.66C11.57 9.3 7.08 6.78 0 6.16V0c6.25 0 11.44 1.16 16.14 3.42 3.53 1.7 5.87 3.35 10.73 7.24 4.45 3.56 7.84 5.9 11.31 7.34zM61.82 0h7.66a39.57 39.57 0 0 1-7.34 4.58C57.44 6.84 52.25 8 46 8S34.56 6.84 29.86 4.58A39.57 39.57 0 0 1 22.52 0h15.66C41.65 1.44 45.21 2 50 2c4.8 0 8.35-.56 11.82-2z'%3e%3c/path%3e%3c/svg%3e",
  ),
]

export interface PatternOptions {
  accentColor: string
  /** Opacity 0–100 (default 10) */
  opacity?: number
  /** Scale percentage 50–300 (default 100) */
  scale?: number
  /** Custom pattern image URL (overrides built-in patterns) */
  customPatternUrl?: string
}

/** Get CSS background-image and background-size for a pattern. */
export function getPatternBackground(
  patternId: BackgroundPattern,
  options: PatternOptions,
): { backgroundImage?: string; backgroundSize?: string } {
  const { accentColor, opacity = 10, scale = 100, customPatternUrl } = options

  // Custom uploaded pattern takes priority
  if (customPatternUrl) {
    const sizePct = `${scale}%`
    return {
      backgroundImage: `url("${customPatternUrl}")`,
      backgroundSize: sizePct,
    }
  }

  if (patternId === 'none') return {}
  const pattern = PATTERNS.find((p) => p.id === patternId)
  if (!pattern || !pattern.svg) return {}

  const encodedColor = '%23' + accentColor.replace('#', '')
  const opacityValue = (opacity / 100).toFixed(2)
  const svg = pattern.svg
    .replace(/FILL/g, encodedColor)
    .replace(/fill-opacity='0\.1'/g, `fill-opacity='${opacityValue}'`)

  return {
    backgroundImage: `url("${svg}")`,
    backgroundSize: scale !== 100 ? `${scale}%` : undefined,
  }
}
