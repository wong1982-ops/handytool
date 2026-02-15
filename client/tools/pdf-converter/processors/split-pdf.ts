import { PDFDocument } from 'pdf-lib'
import type { ProgressCallback, ProcessorResult } from './types'

export interface PageRange {
  start: number
  end: number
}

/** Parse a range string like "1-3, 5, 8-10" into PageRange[] */
export function parsePageRanges(input: string, totalPages: number): PageRange[] {
  const ranges: PageRange[] = []
  const parts = input.split(',').map((s) => s.trim()).filter(Boolean)

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim())
      const start = parseInt(startStr, 10)
      const end = parseInt(endStr, 10)
      if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
        throw new Error(`Invalid range "${part}". Pages must be between 1 and ${totalPages}.`)
      }
      ranges.push({ start, end })
    } else {
      const page = parseInt(part, 10)
      if (isNaN(page) || page < 1 || page > totalPages) {
        throw new Error(`Invalid page "${part}". Pages must be between 1 and ${totalPages}.`)
      }
      ranges.push({ start: page, end: page })
    }
  }

  if (ranges.length === 0) {
    throw new Error('No page ranges specified.')
  }

  return ranges
}

export async function splitPdf(
  file: File,
  rangeStr: string,
  onProgress: ProgressCallback,
): Promise<ProcessorResult> {
  onProgress(5, 'Reading PDF file...')
  const bytes = await file.arrayBuffer()
  const srcDoc = await PDFDocument.load(bytes)
  const totalPages = srcDoc.getPageCount()

  onProgress(10, 'Parsing page ranges...')
  const ranges = parsePageRanges(rangeStr, totalPages)

  const baseName = file.name.replace(/\.pdf$/i, '')

  if (ranges.length === 1) {
    // Single range: return PDF directly
    const range = ranges[0]
    onProgress(20, `Extracting pages ${range.start}-${range.end}...`)
    const newDoc = await PDFDocument.create()
    const indices = []
    for (let i = range.start - 1; i <= range.end - 1; i++) {
      indices.push(i)
    }
    const pages = await newDoc.copyPages(srcDoc, indices)
    pages.forEach((page) => newDoc.addPage(page))

    onProgress(90, 'Saving PDF...')
    const pdfBytes = await newDoc.save()
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })

    onProgress(100, 'Done!')
    return { blob, filename: `${baseName}_pages_${range.start}-${range.end}.pdf` }
  }

  // Multiple ranges: create ZIP
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()

  for (let r = 0; r < ranges.length; r++) {
    const range = ranges[r]
    const progress = 10 + Math.round(((r + 1) / ranges.length) * 80)
    onProgress(progress, `Extracting range ${r + 1} of ${ranges.length}: pages ${range.start}-${range.end}`)

    const newDoc = await PDFDocument.create()
    const indices = []
    for (let i = range.start - 1; i <= range.end - 1; i++) {
      indices.push(i)
    }
    const pages = await newDoc.copyPages(srcDoc, indices)
    pages.forEach((page) => newDoc.addPage(page))

    const pdfBytes = await newDoc.save()
    const rangeLabel = range.start === range.end ? `page_${range.start}` : `pages_${range.start}-${range.end}`
    zip.file(`${baseName}_${rangeLabel}.pdf`, pdfBytes)
  }

  onProgress(93, 'Creating ZIP archive...')
  const zipBlob = await zip.generateAsync({ type: 'blob' })

  onProgress(100, 'Done!')
  return { blob: zipBlob, filename: `${baseName}_split.zip` }
}
