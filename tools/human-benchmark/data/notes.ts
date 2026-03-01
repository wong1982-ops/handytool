export interface NoteInfo {
  name: string
  frequency: number
  octave: number
}

// Standard equal temperament tuning, A4 = 440Hz
export const NOTES: NoteInfo[] = [
  { name: 'C3', frequency: 130.81, octave: 3 },
  { name: 'D3', frequency: 146.83, octave: 3 },
  { name: 'E3', frequency: 164.81, octave: 3 },
  { name: 'F3', frequency: 174.61, octave: 3 },
  { name: 'G3', frequency: 196.00, octave: 3 },
  { name: 'A3', frequency: 220.00, octave: 3 },
  { name: 'B3', frequency: 246.94, octave: 3 },
  { name: 'C4', frequency: 261.63, octave: 4 },
  { name: 'C#4', frequency: 277.18, octave: 4 },
  { name: 'D4', frequency: 293.66, octave: 4 },
  { name: 'D#4', frequency: 311.13, octave: 4 },
  { name: 'E4', frequency: 329.63, octave: 4 },
  { name: 'F4', frequency: 349.23, octave: 4 },
  { name: 'F#4', frequency: 369.99, octave: 4 },
  { name: 'G4', frequency: 392.00, octave: 4 },
  { name: 'G#4', frequency: 415.30, octave: 4 },
  { name: 'A4', frequency: 440.00, octave: 4 },
  { name: 'A#4', frequency: 466.16, octave: 4 },
  { name: 'B4', frequency: 493.88, octave: 4 },
  { name: 'C5', frequency: 523.25, octave: 5 },
  { name: 'D5', frequency: 587.33, octave: 5 },
  { name: 'E5', frequency: 659.25, octave: 5 },
  { name: 'F5', frequency: 698.46, octave: 5 },
  { name: 'G5', frequency: 783.99, octave: 5 },
  { name: 'A5', frequency: 880.00, octave: 5 },
  { name: 'B5', frequency: 987.77, octave: 5 },
  { name: 'C6', frequency: 1046.50, octave: 6 },
]

export const EASY_NOTES = NOTES.filter(n =>
  ['C4', 'E4', 'G4', 'C5', 'E5', 'G5'].includes(n.name)
)

export const MEDIUM_NOTES = NOTES.filter(n =>
  n.octave === 4 && !n.name.includes('#')
)

export const HARD_NOTES = NOTES.filter(n => n.octave === 4)
