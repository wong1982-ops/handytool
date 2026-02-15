import { PDFDocument } from 'pdf-lib'
import type { ProgressCallback, ProcessorResult } from './types'

export async function imagesToPdf(
  files: File[],
  onProgress: ProgressCallback,
): Promise<ProcessorResult> {
  onProgress(5, 'Creating PDF document...')
  const pdfDoc = await PDFDocument.create()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const progress = 5 + Math.round(((i + 1) / files.length) * 85)
    onProgress(progress, `Embedding image ${i + 1} of ${files.length}...`)

    const bytes = await file.arrayBuffer()
    const uint8 = new Uint8Array(bytes)

    let image
    const type = file.type.toLowerCase()
    if (type === 'image/png') {
      image = await pdfDoc.embedPng(uint8)
    } else if (type === 'image/jpeg' || type === 'image/jpg') {
      image = await pdfDoc.embedJpg(uint8)
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
      image = await pdfDoc.embedPng(pngBytes)
    }

    const page = pdfDoc.addPage([image.width, image.height])
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    })
  }

  onProgress(93, 'Saving PDF...')
  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })

  onProgress(100, 'Done!')
  return { blob, filename: 'images.pdf' }
}
