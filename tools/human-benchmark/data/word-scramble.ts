export const WORDS_4: string[] = [
  'apple', 'house', 'water', 'light', 'stone', 'plant', 'music', 'dance',
  'beach', 'cloud', 'dream', 'flame', 'ghost', 'heart', 'judge', 'knife',
  'lemon', 'mouse', 'night', 'ocean', 'piano', 'queen', 'river', 'smile',
  'tiger', 'voice', 'world', 'youth', 'brain', 'chair', 'earth', 'grain',
]

export const WORDS_5: string[] = [
  'bridge', 'garden', 'planet', 'silver', 'orange', 'forest', 'castle',
  'desert', 'island', 'monkey', 'pencil', 'rabbit', 'simple', 'temple',
  'unique', 'violet', 'winter', 'bronze', 'candle', 'dinner', 'eleven',
  'frozen', 'gentle', 'hollow', 'insect', 'jungle', 'kitten', 'liquid',
  'marble', 'needle', 'oxygen', 'pepper', 'rocket', 'shadow', 'tunnel',
]

export const WORDS_6: string[] = [
  'circuit', 'journey', 'kitchen', 'mystery', 'organic', 'picture',
  'quality', 'rainbow', 'society', 'traffic', 'uniform', 'venture',
  'weather', 'ancient', 'balance', 'cabinet', 'diamond', 'eclipse',
  'fashion', 'glacier', 'harvest', 'impulse', 'lantern', 'machine',
  'network', 'opinion', 'pattern', 'quantum', 'refresh', 'shelter',
]

export const WORDS_7: string[] = [
  'elephant', 'discover', 'treasure', 'sandwich', 'champion', 'umbrella',
  'alphabet', 'building', 'calendar', 'december', 'envelope', 'firework',
  'geometry', 'harmonic', 'interact', 'keyboard', 'magnetic', 'notebook',
  'opposite', 'platform', 'resource', 'struggle', 'together', 'universe',
]

export function getWordsForLevel(level: number): string[] {
  if (level <= 3) return WORDS_4
  if (level <= 6) return WORDS_5
  if (level <= 9) return WORDS_6
  return WORDS_7
}

export function getTimeForLevel(level: number): number {
  if (level <= 3) return 15000
  if (level <= 6) return 12000
  if (level <= 9) return 10000
  return 8000
}

export function scrambleWord(word: string): string {
  const chars = word.split('')
  let scrambled: string
  do {
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[chars[i], chars[j]] = [chars[j], chars[i]]
    }
    scrambled = chars.join('')
  } while (scrambled === word)
  return scrambled
}
