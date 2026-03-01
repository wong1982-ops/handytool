export interface ShapeData {
  id: string
  points: [number, number][]
  difficulty: 1 | 2 | 3
}

export const SHAPES: ShapeData[] = [
  { id: 'L', difficulty: 1, points: [[25,20],[45,20],[45,50],[65,50],[65,70],[25,70]] },
  { id: 'T', difficulty: 1, points: [[20,25],[80,25],[80,45],[60,45],[60,75],[40,75],[40,45],[20,45]] },
  { id: 'arrow', difficulty: 1, points: [[50,15],[75,45],[60,45],[60,85],[40,85],[40,45],[25,45]] },
  { id: 'zigzag', difficulty: 1, points: [[20,25],[50,25],[50,45],[70,45],[70,75],[40,75],[40,55],[20,55]] },
  { id: 'hook', difficulty: 1, points: [[30,20],[50,20],[50,55],[70,55],[70,75],[30,75],[30,55],[30,55]] },
  { id: 'pentagon-cut', difficulty: 2, points: [[50,15],[78,35],[68,70],[32,70],[22,35]] },
  { id: 'chevron', difficulty: 2, points: [[20,30],[50,15],[80,30],[80,50],[50,35],[20,50]] },
  { id: 'stairs', difficulty: 2, points: [[20,20],[40,20],[40,40],[60,40],[60,60],[80,60],[80,80],[20,80]] },
  { id: 'flag', difficulty: 2, points: [[25,15],[70,15],[75,40],[55,35],[55,85],[25,85]] },
  { id: 'cross-cut', difficulty: 2, points: [[35,15],[65,15],[65,35],[85,35],[85,65],[65,65],[65,85],[35,85],[35,65],[15,65],[15,35],[35,35]] },
  { id: 'complex-a', difficulty: 3, points: [[30,10],[70,15],[85,40],[75,70],[55,85],[25,75],[15,45]] },
  { id: 'complex-b', difficulty: 3, points: [[45,10],[75,20],[85,50],[70,80],[40,85],[15,65],[20,30]] },
  { id: 'complex-c', difficulty: 3, points: [[50,10],[80,25],[85,55],[65,80],[35,85],[15,60],[20,25],[40,15]] },
  { id: 'complex-d', difficulty: 3, points: [[40,10],[65,15],[80,35],[75,60],[85,80],[50,85],[20,70],[15,40]] },
  { id: 'complex-e', difficulty: 3, points: [[55,10],[80,20],[85,50],[75,75],[45,85],[20,75],[10,45],[25,20]] },
]

export function rotatePoints(points: [number, number][], angleDeg: number): [number, number][] {
  const rad = (angleDeg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return points.map(([x, y]) => {
    const dx = x - 50
    const dy = y - 50
    return [50 + dx * cos - dy * sin, 50 + dx * sin + dy * cos]
  })
}

export function mirrorPoints(points: [number, number][]): [number, number][] {
  return points.map(([x, y]) => [100 - x, y])
}

export function pointsToSvg(points: [number, number][]): string {
  return points.map(([x, y]) => `${x},${y}`).join(' ')
}
