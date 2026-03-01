export interface ChordInfo {
  name: string
  symbol: string
  offsets: number[]
  difficulty: 1 | 2 | 3
}

export const CHORDS: ChordInfo[] = [
  { name: 'Major', symbol: 'maj', offsets: [0, 4, 7], difficulty: 1 },
  { name: 'Minor', symbol: 'min', offsets: [0, 3, 7], difficulty: 1 },
  { name: 'Diminished', symbol: 'dim', offsets: [0, 3, 6], difficulty: 2 },
  { name: 'Augmented', symbol: 'aug', offsets: [0, 4, 8], difficulty: 2 },
  { name: 'Major 7th', symbol: 'maj7', offsets: [0, 4, 7, 11], difficulty: 3 },
  { name: 'Minor 7th', symbol: 'min7', offsets: [0, 3, 7, 10], difficulty: 3 },
  { name: 'Dominant 7th', symbol: 'dom7', offsets: [0, 4, 7, 10], difficulty: 3 },
]

export function getChordsForLevel(level: number): ChordInfo[] {
  if (level <= 3) return CHORDS.filter((c) => c.difficulty === 1)
  if (level <= 6) return CHORDS.filter((c) => c.difficulty <= 2)
  return CHORDS
}
