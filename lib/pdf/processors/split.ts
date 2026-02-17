import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import { parsePageRanges } from '../validation'
import type { ProcessorResult } from '../types'

export async function splitPdf(
  file: File,
  rangeStr: string,
): Promise<ProcessorResult> {
  const bytes = await file.arrayBuffer()
  const srcDoc = await PDFDocument.load(bytes)
  const totalPages = srcDoc.getPageCount()

  const ranges = parsePageRanges(rangeStr, totalPages)
  const baseName = file.name.replace(/\.pdf$/i, '')

  if (ranges.length === 1) {
    const range = ranges[0]
    const newDoc = await PDFDocument.create()
    const indices: number[] = []
    for (let i = range.start - 1; i <= range.end - 1; i++) {
      indices.push(i)
    }
    const pages = await newDoc.copyPages(srcDoc, indices)
    pages.forEach((page) => newDoc.addPage(page))

    const pdfBytes = await newDoc.save()

    return {
      data: Buffer.from(pdfBytes),
      filename: `${baseName}_pages_${range.start}-${range.end}.pdf`,
      contentType: 'application/pdf',
    }
  }

  // Multiple ranges → ZIP
  const zip = new JSZip()

  for (const range of ranges) {
    const newDoc = await PDFDocument.create()
    const indices: number[] = []
    for (let i = range.start - 1; i <= range.end - 1; i++) {
      indices.push(i)
    }
    const pages = await newDoc.copyPages(srcDoc, indices)
    pages.forEach((page) => newDoc.addPage(page))

    const pdfBytes = await newDoc.save()
    const rangeLabel =
      range.start === range.end
        ? `page_${range.start}`
        : `pages_${range.start}-${range.end}`
    zip.file(`${baseName}_${rangeLabel}.pdf`, pdfBytes)
  }

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

  return {
    data: zipBuffer,
    filename: `${baseName}_split.zip`,
    contentType: 'application/zip',
  }
}
