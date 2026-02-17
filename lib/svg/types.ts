import { z } from 'zod'

export const vectorizeSettingsSchema = z.object({
  mode: z.enum(['spline', 'polygon', 'pixel']).default('spline'),
  filterSpeckle: z.number().int().min(1).max(128).default(4),
  colorPrecision: z.number().int().min(1).max(8).default(6),
  layerDifference: z.number().int().min(1).max(64).default(16),
  cornerThreshold: z.number().min(0).max(180).default(60),
  lengthThreshold: z.number().min(3.5).max(10).default(4.0),
  spliceThreshold: z.number().min(0).max(180).default(45),
  pathPrecision: z.number().int().min(1).max(8).default(8),
})

export type VectorizeSettings = z.infer<typeof vectorizeSettingsSchema>

export interface VectorizeResult {
  svg: string
  pathCount: number
  estimatedSize: number
  processingTimeMs: number
}
