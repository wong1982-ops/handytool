'use client'

/**
 * SVG-to-PNG exporter
 * Renders an SVG string to a canvas at a target width and returns a PNG Blob.
 */

export async function svgToPng(svgString: string, targetWidth: number): Promise<Blob> {
  if (!svgString || !svgString.trim()) {
    throw new Error('Empty SVG string')
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')
  const svgEl = doc.querySelector('svg')

  if (!svgEl) {
    throw new Error('Invalid SVG: no <svg> element found')
  }

  // Determine original dimensions from viewBox or width/height attributes
  let origWidth = 0
  let origHeight = 0
  const viewBox = svgEl.getAttribute('viewBox')
  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number)
    if (parts.length >= 4) {
      origWidth = parts[2]
      origHeight = parts[3]
    }
  }
  if (!origWidth) origWidth = parseFloat(svgEl.getAttribute('width') || '0') || 300
  if (!origHeight) origHeight = parseFloat(svgEl.getAttribute('height') || '0') || 300

  // Calculate target height maintaining aspect ratio
  const scale = targetWidth / origWidth
  const targetHeight = Math.round(origHeight * scale)

  // Ensure the SVG has explicit width/height for rendering
  svgEl.setAttribute('width', String(targetWidth))
  svgEl.setAttribute('height', String(targetHeight))

  const serializer = new XMLSerializer()
  const svgData = serializer.serializeToString(svgEl)
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('Failed to load SVG as image'))
      image.src = url
    })

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas 2d context')

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Canvas toBlob returned null'))
        },
        'image/png',
      )
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}
