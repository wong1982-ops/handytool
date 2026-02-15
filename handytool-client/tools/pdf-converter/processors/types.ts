export type ProgressCallback = (percent: number, message: string) => void

export interface ProcessorResult {
  blob: Blob
  filename: string
}
