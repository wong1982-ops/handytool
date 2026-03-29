export const SHAPE_TYPES = [
  'rectangle',
  'ellipse',
  'line',
  'arrow',
  'polygon',
  'star',
  'rounded-rectangle',
  'triangle',
  'custom-polygon',
] as const

export type ShapeType = (typeof SHAPE_TYPES)[number]

export const SHAPE_LABELS: Record<ShapeType, string> = {
  'rectangle': 'Rectangle',
  'ellipse': 'Ellipse',
  'line': 'Line',
  'arrow': 'Arrow',
  'polygon': 'Polygon',
  'star': 'Star',
  'rounded-rectangle': 'Rounded Rectangle',
  'triangle': 'Triangle',
  'custom-polygon': 'Custom Polygon',
}

export interface ShapeStyle {
  fill: string
  fillType: 'solid' | 'gradient' | 'none'
  gradientType: 'linear' | 'radial'
  gradientAngle: number
  gradientColorStart: string
  gradientColorEnd: string
  stroke: string
  strokeWidth: number
  strokeDashArray: number[]
  cornerRadius: number
  opacity: number
  blendMode: string
  shadowEnabled: boolean
  shadowColor: string
  shadowOffsetX: number
  shadowOffsetY: number
  shadowBlur: number
}

export const DEFAULT_SHAPE_STYLE: ShapeStyle = {
  fill: '#3D6AF2',
  fillType: 'solid',
  gradientType: 'linear',
  gradientAngle: 0,
  gradientColorStart: '#3D6AF2',
  gradientColorEnd: '#32A9D9',
  stroke: '#ffffff',
  strokeWidth: 0,
  strokeDashArray: [],
  cornerRadius: 0,
  opacity: 100,
  blendMode: 'source-over',
  shadowEnabled: false,
  shadowColor: 'rgba(0,0,0,0.5)',
  shadowOffsetX: 4,
  shadowOffsetY: 4,
  shadowBlur: 8,
}

export function generateStarPoints(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  points: number,
): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = []
  const step = Math.PI / points
  const startAngle = -Math.PI / 2

  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = startAngle + i * step
    result.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    })
  }
  return result
}

export function generatePolygonPoints(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = []
  const startAngle = -Math.PI / 2

  for (let i = 0; i < sides; i++) {
    const angle = startAngle + (i * 2 * Math.PI) / sides
    result.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    })
  }
  return result
}

export function generateArrowheadPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  headLength: number,
): { x: number; y: number }[] {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const spreadAngle = Math.PI / 6

  return [
    { x: x2, y: y2 },
    {
      x: x2 - headLength * Math.cos(angle - spreadAngle),
      y: y2 - headLength * Math.sin(angle - spreadAngle),
    },
    {
      x: x2 - headLength * Math.cos(angle + spreadAngle),
      y: y2 - headLength * Math.sin(angle + spreadAngle),
    },
  ]
}

export function constrainProportions(
  width: number,
  height: number,
): { width: number; height: number } {
  const size = Math.max(Math.abs(width), Math.abs(height))
  return {
    width: Math.sign(width) * size,
    height: Math.sign(height) * size,
  }
}

export function snapAngle(x1: number, y1: number, x2: number, y2: number): { x: number; y: number } {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const snapped = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4)
  const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  return {
    x: x1 + dist * Math.cos(snapped),
    y: y1 + dist * Math.sin(snapped),
  }
}

export const DASH_PATTERNS: Record<string, number[]> = {
  solid: [],
  dashed: [12, 6],
  dotted: [3, 3],
}
