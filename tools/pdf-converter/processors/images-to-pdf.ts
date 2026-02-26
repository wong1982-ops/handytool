import { PDFDocument } from 'pdf-lib'
import type { ProgressCallback, ProcessorResult } from './types'

export interface ImageToPdfProcessorOptions {
  pageSize: 'a4' | 'letter' | 'legal' | 'original'
  orientation: 'portrait' | 'landscape' | 'auto'
  margin: 'none' | 'small' | 'medium' | 'large'
  fit: 'fit' | 'fill' | 'stretch'
}

// Page sizes in points (72 points per inch)
const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
  legal: { width: 612, height: 1008 },
}

// Margins in points (1mm = 2.835pt)
const MARGIN_SIZES = {
  none: 0,
  small: 28.35,   // 10mm
  medium: 56.7,   // 20mm
  large: 85.05,   // 30mm
}

async function embedImage(pdfDoc: PDFDocument, file: File) {
  const bytes = await file.arrayBuffer()
  const uint8 = new Uint8Array(bytes)
  const type = file.type.toLowerCase()

  if (type === 'image/png') {
    return pdfDoc.embedPng(uint8)
  } else if (type === 'image/jpeg' || type === 'image/jpg') {
    return pdfDoc.embedJpg(uint8)
  } else {
    // For webp and other formats, convert to PNG via canvas first
    const bitmap = await createImageBitmap(file)
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(bitmap, 0, 0)

    const pngBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png')
    })
    const pngBytes = new Uint8Array(await pngBlob.arrayBuffer())
    return pdfDoc.embedPng(pngBytes)
  }
}

export async function imagesToPdf(
  files: File[],
  onProgress: ProgressCallback,
  options?: ImageToPdfProcessorOptions,
): Promise<ProcessorResult> {
  onProgress(5, 'Creating PDF document...')
  const pdfDoc = await PDFDocument.create()

  const opts = options ?? { pageSize: 'original', orientation: 'portrait', margin: 'none', fit: 'fit' }

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const progress = 5 + Math.round(((i + 1) / files.length) * 85)
    onProgress(progress, `Embedding image ${i + 1} of ${files.length}...`)

    const image = await embedImage(pdfDoc, file)

    if (opts.pageSize === 'original') {
      // Original mode: page size = image size (legacy behavior)
      const page = pdfDoc.addPage([image.width, image.height])
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      })
    } else {
      // Sized page mode
      const baseSize = PAGE_SIZES[opts.pageSize]
      let pageW = baseSize.width
      let pageH = baseSize.height

      // Determine orientation
      if (opts.orientation === 'landscape') {
        ;[pageW, pageH] = [pageH, pageW]
      } else if (opts.orientation === 'auto') {
        // Auto: match image aspect ratio
        if (image.width > image.height) {
          ;[pageW, pageH] = [pageH, pageW]
        }
      }

      const margin = MARGIN_SIZES[opts.margin]
      const areaW = pageW - margin * 2
      const areaH = pageH - margin * 2

      let drawW: number
      let drawH: number
      let drawX: number
      let drawY: number

      if (opts.fit === 'stretch') {
        // Stretch: fill entire area
        drawW = areaW
        drawH = areaH
        drawX = margin
        drawY = margin
      } else if (opts.fit === 'fill') {
        // Fill: cover the area, maintaining aspect ratio (may exceed area)
        const scaleX = areaW / image.width
        const scaleY = areaH / image.height
        const scale = Math.max(scaleX, scaleY)
        drawW = image.width * scale
        drawH = image.height * scale
        drawX = margin + (areaW - drawW) / 2
        drawY = margin + (areaH - drawH) / 2
      } else {
        // Fit: fit within area, maintaining aspect ratio
        const scaleX = areaW / image.width
        const scaleY = areaH / image.height
        const scale = Math.min(scaleX, scaleY)
        drawW = image.width * scale
        drawH = image.height * scale
        drawX = margin + (areaW - drawW) / 2
        drawY = margin + (areaH - drawH) / 2
      }

      const page = pdfDoc.addPage([pageW, pageH])
      page.drawImage(image, {
        x: drawX,
        y: drawY,
        width: drawW,
        height: drawH,
      })
    }
  }

  onProgress(93, 'Saving PDF...')
  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })

  onProgress(100, 'Done!')
  return { blob, filename: 'images.pdf' }
}
