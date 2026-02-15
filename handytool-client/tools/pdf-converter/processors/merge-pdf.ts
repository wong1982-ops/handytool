import { PDFDocument } from 'pdf-lib'
import type { ProgressCallback, ProcessorResult } from './types'

export async function mergePdf(
  files: File[],
  onProgress: ProgressCallback,
): Promise<ProcessorResult> {
  onProgress(5, 'Creating merged document...')
  const mergedDoc = await PDFDocument.create()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const progress = 5 + Math.round(((i + 1) / files.length) * 85)
    onProgress(progress, `Merging file ${i + 1} of ${files.length}: ${file.name}`)

    const bytes = await file.arrayBuffer()
    const srcDoc = await PDFDocument.load(bytes)
    const pages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices())
    pages.forEach((page) => mergedDoc.addPage(page))
  }

  onProgress(93, 'Saving merged PDF...')
  const pdfBytes = await mergedDoc.save()
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })

  onProgress(100, 'Done!')
  return { blob, filename: 'merged.pdf' }
}
