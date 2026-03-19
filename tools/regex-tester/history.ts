import type { HistoryEntry } from './types'

const STORAGE_KEY = 'tk-regex-history'
const MAX_ENTRIES = 20

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveToHistory(entry: Omit<HistoryEntry, 'timestamp'>): void {
  if (typeof window === 'undefined') return

  try {
    const history = getHistory()

    // Dedupe by regex + flags + testInput
    const filtered = history.filter(
      (h) =>
        h.regex !== entry.regex ||
        h.flags !== entry.flags ||
        h.testInput !== entry.testInput,
    )

    // Prepend new entry with timestamp
    const newEntry: HistoryEntry = {
      ...entry,
      timestamp: Date.now(),
    }
    filtered.unshift(newEntry)

    // Trim to MAX_ENTRIES
    const trimmed = filtered.slice(0, MAX_ENTRIES)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // Storage full or unavailable — silently fail
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Silently fail
  }
}
