import type { SavedPalette } from './types'

const STORAGE_KEY = 'tk-palettes'
const MAX_PALETTES = 20

/** Retrieve all saved palettes from localStorage */
export function getSavedPalettes(): SavedPalette[] {
  try {
    if (typeof window === 'undefined') return []
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** Save a new palette (prepends, trims to MAX_PALETTES) */
export function savePalette(name: string, colors: string[]): void {
  try {
    if (typeof window === 'undefined') return
    const palettes = getSavedPalettes()
    const newPalette: SavedPalette = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim() || 'Untitled Palette',
      colors,
      createdAt: Date.now(),
    }
    palettes.unshift(newPalette)
    if (palettes.length > MAX_PALETTES) {
      palettes.length = MAX_PALETTES
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes))
  } catch {
    // Silently fail for SSR or storage quota
  }
}

/** Delete a saved palette by ID */
export function deletePalette(id: string): void {
  try {
    if (typeof window === 'undefined') return
    const palettes = getSavedPalettes().filter((p) => p.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes))
  } catch {
    // Silently fail
  }
}
