import type { TintShadeStep } from './types'
import type { HarmonyRule } from './types'

// ── Conversions ──────────────────────────────────────────────────────────────

/** Parse 3 or 6 character hex string to RGB */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace(/^#/, '')
  let r: number, g: number, b: number

  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16)
    g = parseInt(cleaned[1] + cleaned[1], 16)
    b = parseInt(cleaned[2] + cleaned[2], 16)
  } else {
    r = parseInt(cleaned.slice(0, 2), 16)
    g = parseInt(cleaned.slice(2, 4), 16)
    b = parseInt(cleaned.slice(4, 6), 16)
  }

  return { r, g, b }
}

/** Convert RGB to '#RRGGBB' hex string */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

/** Convert RGB (0-255) to HSL (h: 0-360, s: 0-100, l: 0-100) */
export function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
        break
      case gn:
        h = ((bn - rn) / d + 2) / 6
        break
      case bn:
        h = ((rn - gn) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/** Convert HSL (h: 0-360, s: 0-100, l: 0-100) to RGB (0-255) */
export function hslToRgb(
  h: number,
  s: number,
  l: number,
): { r: number; g: number; b: number } {
  const sn = s / 100
  const ln = l / 100

  if (sn === 0) {
    const v = Math.round(ln * 255)
    return { r: v, g: v, b: v }
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    let tn = t
    if (tn < 0) tn += 1
    if (tn > 1) tn -= 1
    if (tn < 1 / 6) return p + (q - p) * 6 * tn
    if (tn < 1 / 2) return q
    if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6
    return p
  }

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn
  const p = 2 * ln - q
  const hn = h / 360

  return {
    r: Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hn) * 255),
    b: Math.round(hue2rgb(p, q, hn - 1 / 3) * 255),
  }
}

// ── OKLCH conversions ────────────────────────────────────────────────────────

/** Linearize sRGB channel (0-1 range) */
function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/** Convert linear RGB to sRGB channel (0-1 range) */
function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

/** Convert RGB (0-255) to OKLCH (l: 0-1, c: 0-~0.4, h: 0-360) */
export function rgbToOklch(
  r: number,
  g: number,
  b: number,
): { l: number; c: number; h: number } {
  // sRGB to linear
  const lr = srgbToLinear(r / 255)
  const lg = srgbToLinear(g / 255)
  const lb = srgbToLinear(b / 255)

  // Linear RGB to LMS (using OKLab matrix)
  const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb

  // Cube root
  const l_c = Math.cbrt(l_)
  const m_c = Math.cbrt(m_)
  const s_c = Math.cbrt(s_)

  // LMS to OKLab
  const L = 0.2104542553 * l_c + 0.7936177850 * m_c - 0.0040720468 * s_c
  const a = 1.9779984951 * l_c - 2.4285922050 * m_c + 0.4505937099 * s_c
  const bLab = 0.0259040371 * l_c + 0.7827717662 * m_c - 0.8086757660 * s_c

  // OKLab to OKLCH
  const C = Math.sqrt(a * a + bLab * bLab)
  let H = (Math.atan2(bLab, a) * 180) / Math.PI
  if (H < 0) H += 360

  return { l: L, c: C, h: H }
}

/** Convert OKLCH (l: 0-1, c: 0-~0.4, h: 0-360) to RGB (0-255), clamped */
export function oklchToRgb(
  l: number,
  c: number,
  h: number,
): { r: number; g: number; b: number } {
  // OKLCH to OKLab
  const hRad = (h * Math.PI) / 180
  const a = c * Math.cos(hRad)
  const bLab = c * Math.sin(hRad)

  // OKLab to LMS (cube root space)
  const l_c = l + 0.3963377774 * a + 0.2158037573 * bLab
  const m_c = l - 0.1055613458 * a - 0.0638541728 * bLab
  const s_c = l - 0.0894841775 * a - 1.2914855480 * bLab

  // Cube
  const l_ = l_c * l_c * l_c
  const m_ = m_c * m_c * m_c
  const s_ = s_c * s_c * s_c

  // LMS to linear RGB
  const lr = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_
  const lg = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_
  const lb = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_

  // Linear to sRGB, clamp to 0-255
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return {
    r: clamp(linearToSrgb(lr) * 255),
    g: clamp(linearToSrgb(lg) * 255),
    b: clamp(linearToSrgb(lb) * 255),
  }
}

// ── Tint/Shade ───────────────────────────────────────────────────────────────

/** Lightness targets for each scale step (OKLCH L channel, 0-1 range) */
const SCALE_STEPS: { step: number; lightness: number }[] = [
  { step: 50, lightness: 0.97 },
  { step: 100, lightness: 0.93 },
  { step: 200, lightness: 0.87 },
  { step: 300, lightness: 0.78 },
  { step: 400, lightness: 0.68 },
  { step: 500, lightness: 0.55 },
  { step: 600, lightness: 0.48 },
  { step: 700, lightness: 0.40 },
  { step: 800, lightness: 0.32 },
  { step: 900, lightness: 0.23 },
  { step: 950, lightness: 0.15 },
]

/** Generate an 11-step tint/shade scale. Step 500 = base color. Uses OKLCH interpolation. */
export function generateTintShadeScale(hex: string): TintShadeStep[] {
  const { r, g, b } = hexToRgb(hex)
  const oklch = rgbToOklch(r, g, b)

  return SCALE_STEPS.map(({ step, lightness }) => {
    if (step === 500) {
      return { step, hex }
    }
    const rgb = oklchToRgb(lightness, oklch.c, oklch.h)
    return { step, hex: rgbToHex(rgb.r, rgb.g, rgb.b) }
  })
}

// ── Harmony ──────────────────────────────────────────────────────────────────

/** Rotate hue by degrees, keeping 0-360 range */
function rotateHue(h: number, deg: number): number {
  return ((h + deg) % 360 + 360) % 360
}

/** Generate 5 harmony colors from a base hex and harmony rule */
export function generateHarmony(baseHex: string, rule: HarmonyRule): string[] {
  if (rule === 'custom') {
    return []
  }

  const { r, g, b } = hexToRgb(baseHex)
  const { h, s, l } = rgbToHsl(r, g, b)

  const hslToHex = (hue: number, sat: number, lit: number): string => {
    const rgb = hslToRgb(hue, sat, lit)
    return rgbToHex(rgb.r, rgb.g, rgb.b)
  }

  const offsets: Record<Exclude<HarmonyRule, 'custom' | 'monochromatic'>, number[]> = {
    complementary: [0, 180, 150, 210, 90],
    analogous: [0, 30, -30, 60, -60],
    triadic: [0, 120, 240, 60, 300],
    'split-complementary': [0, 150, 210, 30, -30],
    tetradic: [0, 90, 180, 270, 45],
    square: [0, 90, 180, 270, 45],
  }

  if (rule === 'monochromatic') {
    const lightnesses = [20, 35, 50, 65, 80]
    return lightnesses.map((lit) => hslToHex(h, s, lit))
  }

  return offsets[rule].map((deg) => hslToHex(rotateHue(h, deg), s, l))
}

// ── Accessibility ────────────────────────────────────────────────────────────

/** Calculate relative luminance per WCAG 2.1 */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const [rn, gn, bn] = [r, g, b].map((c) => {
    const srgb = c / 255
    return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rn + 0.7152 * gn + 0.0722 * bn
}

/** Calculate WCAG contrast ratio between two colors */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1)
  const l2 = relativeLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** Check if contrast ratio meets WCAG AA (>= 4.5:1) */
export function meetsAA(ratio: number): boolean {
  return ratio >= 4.5
}

/** Check if contrast ratio meets WCAG AAA (>= 7:1) */
export function meetsAAA(ratio: number): boolean {
  return ratio >= 7
}

/** Suggest black or white text color for best contrast on given background */
export function suggestTextColor(bgHex: string): string {
  const lum = relativeLuminance(bgHex)
  return lum > 0.179 ? '#000000' : '#FFFFFF'
}

// ── Color blindness simulation (Brettel) ─────────────────────────────────────

type CBType = 'protanopia' | 'deuteranopia' | 'tritanopia'

/**
 * Brettel simulation matrices.
 * Each type has two half-plane matrices. For simplicity we use a single
 * average matrix per type which provides a good approximation.
 */
const CB_MATRICES: Record<CBType, number[][]> = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.011820, 0.042940, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.303900],
  ],
}

/** Simulate how a color appears under a specific color blindness type */
export function simulateColorBlindness(hex: string, type: CBType): string {
  const { r, g, b } = hexToRgb(hex)
  const matrix = CB_MATRICES[type]

  // Convert to linear RGB for matrix multiplication
  const lr = srgbToLinear(r / 255)
  const lg = srgbToLinear(g / 255)
  const lb = srgbToLinear(b / 255)

  const sr = matrix[0][0] * lr + matrix[0][1] * lg + matrix[0][2] * lb
  const sg = matrix[1][0] * lr + matrix[1][1] * lg + matrix[1][2] * lb
  const sb = matrix[2][0] * lr + matrix[2][1] * lg + matrix[2][2] * lb

  // Back to sRGB and clamp
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return rgbToHex(
    clamp(linearToSrgb(Math.max(0, sr)) * 255),
    clamp(linearToSrgb(Math.max(0, sg)) * 255),
    clamp(linearToSrgb(Math.max(0, sb)) * 255),
  )
}

// ── Utility ──────────────────────────────────────────────────────────────────

/** Generate a random hex color */
export function randomColor(): string {
  const hex = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')
  return `#${hex.toUpperCase()}`
}

/** Validate hex color string (with or without #) */
export function isValidHex(str: string): boolean {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(str.trim())
}
