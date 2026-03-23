export const MAX_DIMENSION = 768
export const MAX_PAYLOAD_BYTES = 3 * 1024 * 1024 // 3MB max base64 payload
export const MIN_EDITOR_DIMENSION = 256

/**
 * Resize and compress image for API payload.
 * - Max 768px on longest side (sufficient for AI)
 * - JPEG at 0.7 quality (much smaller than PNG for photos)
 * - If still too large, reduce quality further
 */
export function resizeImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let w = img.width
      let h = img.height

      // Resize if needed
      if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
        const scale = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h)
        w = Math.round(w * scale)
        h = Math.round(h * scale)
      }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)

      // Try JPEG at decreasing quality until under payload limit
      for (const quality of [0.7, 0.5, 0.3]) {
        const result = canvas.toDataURL('image/jpeg', quality)
        if (result.length < MAX_PAYLOAD_BYTES) {
          resolve(result)
          return
        }
      }

      // Last resort: smallest quality
      resolve(canvas.toDataURL('image/jpeg', 0.2))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

/**
 * Load an image and return its natural dimensions.
 */
export function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}

/**
 * Returns true if both dimensions are at least MIN_EDITOR_DIMENSION (256px).
 */
export function isEditorEligible(width: number, height: number): boolean {
  return width >= MIN_EDITOR_DIMENSION && height >= MIN_EDITOR_DIMENSION
}

/**
 * Creates an offscreen canvas, applies rotation, draws the cropped region,
 * and exports it as a JPEG data URL at 0.8 quality.
 *
 * For CORS: loads Image with crossOrigin="anonymous".
 * If the image fails to load (CORS), falls back to fetching as blob and retrying once.
 */
export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation: number = 0,
  _retried: boolean = false,
): Promise<string> {
  const loadImage = (src: string, crossOrigin?: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      if (crossOrigin) img.crossOrigin = crossOrigin
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })

  let img: HTMLImageElement
  try {
    img = await loadImage(imageSrc, 'anonymous')
  } catch {
    if (!_retried) {
      // Fallback: fetch as blob and convert to object URL
      const resp = await fetch(imageSrc)
      const blob = await resp.blob()
      const blobUrl = URL.createObjectURL(blob)
      try {
        const result = await getCroppedImage(blobUrl, pixelCrop, rotation, true)
        URL.revokeObjectURL(blobUrl)
        return result
      } catch {
        URL.revokeObjectURL(blobUrl)
        throw new Error('Failed to load image for cropping')
      }
    }
    throw new Error('Failed to load image for cropping')
  }

  const rad = (rotation * Math.PI) / 180

  // Compute bounding box of rotated source image
  const sin = Math.abs(Math.sin(rad))
  const cos = Math.abs(Math.cos(rad))
  const boundingWidth = Math.round(img.width * cos + img.height * sin)
  const boundingHeight = Math.round(img.width * sin + img.height * cos)

  // Offscreen canvas sized to bounding box
  const offscreen = document.createElement('canvas')
  offscreen.width = boundingWidth
  offscreen.height = boundingHeight
  const ctx = offscreen.getContext('2d')!

  // Translate to center, rotate, draw image centered
  ctx.translate(boundingWidth / 2, boundingHeight / 2)
  ctx.rotate(rad)
  ctx.drawImage(img, -img.width / 2, -img.height / 2)

  // Output canvas for the cropped region
  const cropCanvas = document.createElement('canvas')
  cropCanvas.width = pixelCrop.width
  cropCanvas.height = pixelCrop.height
  const cropCtx = cropCanvas.getContext('2d')!

  // The crop origin within the bounding box
  const cropOriginX = (boundingWidth - img.width) / 2 + pixelCrop.x
  const cropOriginY = (boundingHeight - img.height) / 2 + pixelCrop.y

  cropCtx.drawImage(
    offscreen,
    cropOriginX,
    cropOriginY,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )

  return cropCanvas.toDataURL('image/jpeg', 0.8)
}
