export interface StroopColor {
  name: string
  hex: string
  tw: string
}

export const BASIC_COLORS: StroopColor[] = [
  { name: 'Red', hex: '#ef4444', tw: 'text-red-500' },
  { name: 'Blue', hex: '#3b82f6', tw: 'text-blue-500' },
  { name: 'Green', hex: '#22c55e', tw: 'text-green-500' },
  { name: 'Yellow', hex: '#eab308', tw: 'text-yellow-500' },
]

export const EXTENDED_COLORS: StroopColor[] = [
  ...BASIC_COLORS,
  { name: 'Purple', hex: '#a855f7', tw: 'text-purple-500' },
  { name: 'Orange', hex: '#f97316', tw: 'text-orange-500' },
]

export function getColorsForLevel(level: number): StroopColor[] {
  if (level <= 3) return BASIC_COLORS
  return EXTENDED_COLORS
}
