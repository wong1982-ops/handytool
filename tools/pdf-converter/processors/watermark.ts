import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib'
import type { ProgressCallback, ProcessorResult } from './types'

export type WatermarkType = 'text' | 'image'
export type WatermarkPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'diagonal'

export interface WatermarkOptions {
  type: WatermarkType
  text: string
  fontSize: number
  opacity: number // 0-1
  color: string // hex
  rotation: number // degrees
  position: WatermarkPosition
  imageFile?: File
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255
  return { r, g, b }
}

function getPositionCoords(
  position: WatermarkPosition,
  pageWidth: number,
  pageHeight: number,
  textWidth: number,
  textHeight: number,
): { x: number; y: number } {
  const margin = 40

  switch (position) {
    case 'top-left':
      return { x: margin, y: pageHeight - margin - textHeight }
    case 'top-center':
      return { x: (pageWidth - textWidth) / 2, y: pageHeight - margin - textHeight }
    case 'top-right':
      return { x: pageWidth - margin - textWidth, y: pageHeight - margin - textHeight }
    case 'center-left':
      return { x: margin, y: (pageHeight - textHeight) / 2 }
    case 'center':
      return { x: (pageWidth - textWidth) / 2, y: (pageHeight - textHeight) / 2 }
    case 'center-right':
      return { x: pageWidth - margin - textWidth, y: (pageHeight - textHeight) / 2 }
    case 'bottom-left':
      return { x: margin, y: margin }
    case 'bottom-center':
      return { x: (pageWidth - textWidth) / 2, y: margin }
    case 'bottom-right':
      return { x: pageWidth - margin - textWidth, y: margin }
    case 'diagonal':
      return { x: pageWidth / 2, y: pageHeight / 2 }
  }
}

export async function watermarkPdf(
  file: File,
  options: WatermarkOptions,
  onProgress: ProgressCallback,
): Promise<ProcessorResult> {
  onProgress(5, 'Reading PDF file...')
  const bytes = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(bytes)
  const pages = pdfDoc.getPages()
  const totalPages = pages.length

  if (options.type === 'text') {
    onProgress(10, 'Embedding font...')
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const { r, g, b } = hexToRgb(options.color)
    const color = rgb(r, g, b)

    for (let i = 0; i < totalPages; i++) {
      const progress = 10 + Math.round(((i + 1) / totalPages) * 80)
      onProgress(progress, `Adding watermark to page ${i + 1} of ${totalPages}...`)

      const page = pages[i]
      const { width, height } = page.getSize()
      const textWidth = font.widthOfTextAtSize(options.text, options.fontSize)
      const textHeight = options.fontSize

      if (options.position === 'diagonal') {
        // Diagonal: draw rotated text at center
        page.drawText(options.text, {
          x: width / 2 - textWidth / 2,
          y: height / 2 - textHeight / 2,
          size: options.fontSize,
          font,
          color,
          opacity: options.opacity,
          rotate: degrees(options.rotation),
        })
      } else {
        const pos = getPositionCoords(options.position, width, height, textWidth, textHeight)
        page.drawText(options.text, {
          x: pos.x,
          y: pos.y,
          size: options.fontSize,
          font,
          color,
          opacity: options.opacity,
          rotate: degrees(options.rotation),
        })
      }
    }
  } else if (options.type === 'image' && options.imageFile) {
    onProgress(10, 'Embedding watermark image...')
    const imgBytes = new Uint8Array(await options.imageFile.arrayBuffer())
    const imgType = options.imageFile.type.toLowerCase()

    let image
    if (imgType === 'image/png') {
      image = await pdfDoc.embedPng(imgBytes)
    } else if (imgType === 'image/jpeg' || imgType === 'image/jpg') {
      image = await pdfDoc.embedJpg(imgBytes)
    } else {
      // Convert to PNG via canvas
      const bitmap = await createImageBitmap(options.imageFile)
      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(bitmap, 0, 0)
      const pngBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png')
      })
      const pngBytes = new Uint8Array(await pngBlob.arrayBuffer())
      image = await pdfDoc.embedPng(pngBytes)
    }

    const imgWidth = image.width
    const imgHeight = image.height

    for (let i = 0; i < totalPages; i++) {
      const progress = 10 + Math.round(((i + 1) / totalPages) * 80)
      onProgress(progress, `Adding watermark to page ${i + 1} of ${totalPages}...`)

      const page = pages[i]
      const { width, height } = page.getSize()

      // Scale image to max 30% of page size
      const maxW = width * 0.3
      const maxH = height * 0.3
      const scale = Math.min(maxW / imgWidth, maxH / imgHeight, 1)
      const drawW = imgWidth * scale
      const drawH = imgHeight * scale

      const pos = getPositionCoords(options.position, width, height, drawW, drawH)

      page.drawImage(image, {
        x: pos.x,
        y: pos.y,
        width: drawW,
        height: drawH,
        opacity: options.opacity,
      })
    }
  }

  onProgress(93, 'Saving watermarked PDF...')
  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })

  onProgress(100, 'Done!')
  const baseName = file.name.replace(/\.pdf$/i, '')
  return { blob, filename: `${baseName}_watermarked.pdf` }
}
