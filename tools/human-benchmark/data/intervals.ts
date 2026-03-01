export interface IntervalInfo {
  name: string
  shortName: string
  semitones: number
  difficulty: 1 | 2 | 3
}

export const INTERVALS: IntervalInfo[] = [
  { name: 'Major 3rd', shortName: 'M3', semitones: 4, difficulty: 1 },
  { name: 'Perfect 5th', shortName: 'P5', semitones: 7, difficulty: 1 },
  { name: 'Octave', shortName: 'P8', semitones: 12, difficulty: 1 },
  { name: 'Major 2nd', shortName: 'M2', semitones: 2, difficulty: 2 },
  { name: 'Perfect 4th', shortName: 'P4', semitones: 5, difficulty: 2 },
  { name: 'Major 6th', shortName: 'M6', semitones: 9, difficulty: 2 },
  { name: 'Major 7th', shortName: 'M7', semitones: 11, difficulty: 2 },
  { name: 'Minor 2nd', shortName: 'm2', semitones: 1, difficulty: 3 },
  { name: 'Minor 3rd', shortName: 'm3', semitones: 3, difficulty: 3 },
  { name: 'Tritone', shortName: 'TT', semitones: 6, difficulty: 3 },
  { name: 'Minor 6th', shortName: 'm6', semitones: 8, difficulty: 3 },
  { name: 'Minor 7th', shortName: 'm7', semitones: 10, difficulty: 3 },
]

export function semitoneRatio(semitones: number): number {
  return Math.pow(2, semitones / 12)
}

export function getIntervalsForLevel(level: number): IntervalInfo[] {
  if (level <= 3) return INTERVALS.filter((i) => i.difficulty === 1)
  if (level <= 6) return INTERVALS.filter((i) => i.difficulty <= 2)
  return INTERVALS
}
