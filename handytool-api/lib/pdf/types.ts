export interface ProcessorResult {
  data: Buffer
  filename: string
  contentType: string
}

export type CompressionQuality = 'low' | 'medium' | 'high'
export type ExtractionMode = 'auto' | 'table-only'
