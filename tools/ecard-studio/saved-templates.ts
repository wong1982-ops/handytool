import type { ECardData } from '@/tools/ecard-studio/types'

export interface SavedTemplate {
  id: string
  name: string
  savedAt: number
  data: ECardData
}

const STORAGE_KEY = 'ecard-studio-saved-templates'

export function getSavedTemplates(): SavedTemplate[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveTemplate(name: string, data: ECardData): void {
  const existing = getSavedTemplates()
  const entry: SavedTemplate = {
    id: `custom-${Date.now()}`,
    name,
    savedAt: Date.now(),
    data: { ...data },
  }
  existing.unshift(entry)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 20)))
}

export function deleteSavedTemplate(id: string): void {
  const existing = getSavedTemplates()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.filter((t) => t.id !== id)))
}
