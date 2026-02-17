export interface VectorizationSettings {
  // Curve Fitting
  mode: 'spline' | 'polygon' | 'pixel'
  filterSpeckle: number         // 1-128, discard small patches (px)

  // Color
  colorPrecision: number        // 1-8, significant bits per RGB channel
  layerDifference: number       // 1-64, color difference between layers

  // Path Quality
  cornerThreshold: number       // 0-180, minimum angle for corners (degrees)
  lengthThreshold: number       // 3.5-10, minimum segment length
  spliceThreshold: number       // 0-180, spline splice angle
  pathPrecision: number         // 1-8, decimal places in SVG coords

  // Behavior
  liveProcessing: boolean
  optimizeSvg: boolean          // SVGO post-processing toggle
}

export interface ImageMeta {
  name: string
  width: number
  height: number
  sizeBytes: number
  type: string
  dataUrl: string
}

export interface VectorResult {
  svgString: string
  svgBlobUrl: string
  pathCount: number
  estimatedSize: number
  processingTimeMs: number
}

export type ConversionState = 'idle' | 'processing' | 'ready' | 'error'

export const DEFAULT_SETTINGS: VectorizationSettings = {
  mode: 'spline',
  filterSpeckle: 4,
  colorPrecision: 6,
  layerDifference: 16,
  cornerThreshold: 60,
  lengthThreshold: 4.0,
  spliceThreshold: 45,
  pathPrecision: 8,
  liveProcessing: true,
  optimizeSvg: true,
}

export type EditorPhase = 'upload' | 'crop' | 'vectorize'

export interface CropData {
  /** Crop region as percentages (from react-image-crop) */
  x: number
  y: number
  width: number
  height: number
}

export interface ResizeData {
  width: number
  height: number
  lockAspectRatio: boolean
}
