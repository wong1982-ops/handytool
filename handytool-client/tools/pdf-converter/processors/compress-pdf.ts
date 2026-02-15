import { PDFDocument } from 'pdf-lib'
import type { ProgressCallback, ProcessorResult } from './types'

export type CompressionQuality = 'low' | 'medium' | 'high'

const JPEG_QUALITY: Record<CompressionQuality, number> = {
  low: 0.3,
  medium: 0.5,
  high: 0.75,
}

export async function compressPdf(
  file: File,
  quality: CompressionQuality,
  onProgress: ProgressCallback,
): Promise<ProcessorResult> {
  onProgress(5, 'Reading PDF file...')
  const bytes = await file.arrayBuffer()

  onProgress(10, 'Loading PDF document...')
  const srcDoc = await PDFDocument.load(bytes)

  onProgress(15, 'Creating optimized copy...')
  // Create a new document by copying all pages (strips unused objects)
  const newDoc = await PDFDocument.create()
  const pages = await newDoc.copyPages(srcDoc, srcDoc.getPageIndices())
  pages.forEach((page) => newDoc.addPage(page))

  onProgress(50, 'Re-rendering pages for compression...')

  // Use PDF.js to render each page, then re-embed as compressed JPEG
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

  const renderDoc = await pdfjsLib.getDocument({ data: bytes }).promise
  const totalPages = renderDoc.numPages

  const compressedDoc = await PDFDocument.create()

  for (let i = 1; i <= totalPages; i++) {
    const progress = 50 + Math.round((i / totalPages) * 40)
    onProgress(progress, `Compressing page ${i} of ${totalPages}...`)

    const page = await renderDoc.getPage(i)
    const viewport = page.getViewport({ scale: 1.5 })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    canvas.getContext('2d')

    await page.render({ canvas, viewport }).promise

    const jpegBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', JPEG_QUALITY[quality])
    })

    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer())
    const image = await compressedDoc.embedJpg(jpegBytes)

    const newPage = compressedDoc.addPage([viewport.width, viewport.height])
    newPage.drawImage(image, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    })
  }

  onProgress(93, 'Saving compressed PDF...')
  const pdfBytes = await compressedDoc.save()
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })

  const originalSize = file.size
  const newSize = blob.size
  const reduction = Math.round((1 - newSize / originalSize) * 100)

  onProgress(100, `Done! Reduced by ${Math.max(0, reduction)}%`)

  const baseName = file.name.replace(/\.pdf$/i, '')
  return { blob, filename: `${baseName}_compressed.pdf` }
}
