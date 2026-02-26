'use client'

import { PDFDocument } from 'pdf-lib'

/**
 * SVG-to-PDF exporter
 * Renders SVG to a canvas at 2x resolution, then embeds the resulting PNG
 * into a PDF document using pdf-lib.
 */

/**
 * Render an SVG string to a PNG data URL via canvas.
 * Uses 2x resolution for crisp output.
 */
function renderSvgToCanvas(
  svgString: string,
  width: number,
  height: number,
  scale: number = 2,
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = width * scale
    canvas.height = height * scale

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Failed to get canvas 2d context'))
      return
    }

    const img = new Image()
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)

      canvas.toBlob(
        (pngBlob) => {
          if (!pngBlob) {
            reject(new Error('Canvas toBlob returned null'))
            return
          }
          pngBlob.arrayBuffer().then(
            (buf) => resolve(new Uint8Array(buf)),
            (err) => reject(err),
          )
        },
        'image/png',
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load SVG into image element'))
    }

    img.src = url
  })
}

/**
 * Parse SVG dimensions from viewBox or width/height attributes.
 */
function parseSvgDimensions(svgString: string): { width: number; height: number } {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')
  const svgEl = doc.querySelector('svg')

  let width = 0, height = 0

  if (svgEl) {
    const viewBox = svgEl.getAttribute('viewBox')
    if (viewBox) {
      const parts = viewBox.split(/[\s,]+/).map(Number)
      if (parts.length >= 4) {
        width = parts[2]
        height = parts[3]
      }
    }
    if (!width) width = parseFloat(svgEl.getAttribute('width') || '0')
    if (!height) height = parseFloat(svgEl.getAttribute('height') || '0')
  }

  return {
    width: width || 300,
    height: height || 300,
  }
}

/**
 * Convert an SVG string to PDF format.
 * Returns a Blob of type 'application/pdf'.
 */
export async function svgToPdf(svgString: string): Promise<Blob> {
  if (!svgString || !svgString.trim()) {
    throw new Error('Empty SVG string')
  }

  const { width, height } = parseSvgDimensions(svgString)

  // Render SVG to PNG at 2x resolution
  const pngBytes = await renderSvgToCanvas(svgString, width, height, 2)

  // Create PDF document
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([width, height])

  // Embed the PNG image
  const pngImage = await pdfDoc.embedPng(pngBytes)

  // Draw the image to fill the page
  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width,
    height,
  })

  // Serialize to bytes
  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
}
