import { PDFDocument } from 'pdf-lib'
import type { ProcessorResult } from '../types'

export async function imagesToPdf(files: File[]): Promise<ProcessorResult> {
  const pdfDoc = await PDFDocument.create()

  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const uint8 = new Uint8Array(bytes)

    let image
    const type = file.type.toLowerCase()
    if (type === 'image/png') {
      image = await pdfDoc.embedPng(uint8)
    } else if (type === 'image/jpeg' || type === 'image/jpg') {
      image = await pdfDoc.embedJpg(uint8)
    } else {
      // WebP and other formats: pdf-lib only supports PNG/JPEG natively.
      // On the server without canvas, we skip unsupported formats with an error.
      throw new Error(
        `Unsupported image format: ${file.type} for "${file.name}". Server-side conversion supports PNG and JPEG only.`,
      )
    }

    const page = pdfDoc.addPage([image.width, image.height])
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    })
  }

  const pdfBytes = await pdfDoc.save()

  return {
    data: Buffer.from(pdfBytes),
    filename: 'images.pdf',
    contentType: 'application/pdf',
  }
}
