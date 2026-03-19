/**
 * URL sharing utilities for color palette.
 * Pure utility — no 'use client'.
 */

import type { PaletteColor } from './types'

/**
 * Encode palette colors to URL hash format.
 * Format: #3D6AF2-8B5CF6-EC4899-F59E0B-10B981
 */
export function encodeColorsToHash(colors: PaletteColor[]): string {
  return colors.map((c) => c.hex.replace(/^#/, '')).join('-')
}

/**
 * Decode URL hash to array of 5 hex color strings.
 * Returns null if invalid.
 */
export function decodeColorsFromHash(hash: string): string[] | null {
  const cleaned = hash.replace(/^#/, '')
  if (!cleaned) return null

  const segments = cleaned.split('-')
  if (segments.length !== 5) return null

  const hexRegex = /^[0-9A-Fa-f]{6}$/
  const colors: string[] = []

  for (const seg of segments) {
    if (!hexRegex.test(seg)) return null
    colors.push(`#${seg.toUpperCase()}`)
  }

  return colors
}

/**
 * Copy a shareable URL with the current palette encoded in the hash.
 */
export async function copyShareUrl(colors: PaletteColor[]): Promise<void> {
  const hash = encodeColorsToHash(colors)
  const url = `${window.location.origin}${window.location.pathname}#${hash}`
  await navigator.clipboard.writeText(url)
}
