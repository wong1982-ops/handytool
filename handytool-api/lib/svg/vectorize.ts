import { vectorize } from '@neplex/vectorizer'
import type { VectorizeSettings, VectorizeResult } from './types'

// @neplex/vectorizer uses const enums which can't be accessed with isolatedModules
// Values from: PathSimplifyMode, ColorMode, Hierarchical
const MODE_MAP = {
  spline: 2,   // PathSimplifyMode.Spline
  polygon: 1,  // PathSimplifyMode.Polygon
  pixel: 0,    // PathSimplifyMode.None
} as const

const COLOR_MODE_COLOR = 0    // ColorMode.Color
const HIERARCHICAL_STACKED = 0 // Hierarchical.Stacked

function countPaths(svg: string): number {
  const matches = svg.match(/<path[\s/]/g)
  return matches ? matches.length : 0
}

export async function vectorizeImage(
  file: File,
  settings: VectorizeSettings,
): Promise<VectorizeResult> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const startTime = performance.now()

  const svg = await vectorize(buffer, {
    colorMode: COLOR_MODE_COLOR,
    hierarchical: HIERARCHICAL_STACKED,
    mode: MODE_MAP[settings.mode],
    filterSpeckle: settings.filterSpeckle,
    colorPrecision: settings.colorPrecision,
    layerDifference: settings.layerDifference,
    cornerThreshold: settings.cornerThreshold,
    lengthThreshold: settings.lengthThreshold,
    spliceThreshold: settings.spliceThreshold,
    pathPrecision: settings.pathPrecision,
    maxIterations: 10,
  })

  const processingTimeMs = Math.round(performance.now() - startTime)

  return {
    svg,
    pathCount: countPaths(svg),
    estimatedSize: Buffer.byteLength(svg, 'utf-8'),
    processingTimeMs,
  }
}
