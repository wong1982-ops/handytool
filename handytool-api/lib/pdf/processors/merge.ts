import { PDFDocument } from 'pdf-lib'
import type { ProcessorResult } from '../types'

export async function mergePdf(files: File[]): Promise<ProcessorResult> {
  const mergedDoc = await PDFDocument.create()

  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const srcDoc = await PDFDocument.load(bytes)
    const pages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices())
    pages.forEach((page) => mergedDoc.addPage(page))
  }

  const pdfBytes = await mergedDoc.save()

  return {
    data: Buffer.from(pdfBytes),
    filename: 'merged.pdf',
    contentType: 'application/pdf',
  }
}
