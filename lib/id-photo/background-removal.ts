/**
 * Client-side background removal using @imgly/background-removal.
 * Runs entirely in the browser via ONNX/WebAssembly — no API key needed.
 * The ONNX model (~5MB) is downloaded on first use and cached by the browser.
 */

import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal'

/**
 * Remove background from an image data URL.
 * Returns a new data URL with transparent background.
 *
 * @param imageDataUrl - The image as a data URL (data:image/...)
 * @returns Data URL of the image with background removed (PNG with transparency)
 */
export async function removeBackgroundClient(imageDataUrl: string): Promise<string> {
  // Convert data URL to blob
  const response = await fetch(imageDataUrl)
  const blob = await response.blob()

  // Run background removal (downloads ONNX model on first use)
  const resultBlob = await imglyRemoveBackground(blob, {
    output: { format: 'image/png' },
  })

  // Convert result blob back to data URL
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(resultBlob)
  })
}

/**
 * Apply a solid background color to a transparent PNG data URL.
 * Used after background removal to set the ID photo background color.
 *
 * @param transparentDataUrl - PNG data URL with transparent background
 * @param bgColor - Hex color string (e.g., '#FFFFFF')
 * @returns Data URL with solid background applied
 */
export function applyBackgroundColor(transparentDataUrl: string, bgColor: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!

      // Fill with background color first
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw the transparent image on top
      ctx.drawImage(img, 0, 0)

      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => resolve(transparentDataUrl) // fallback
    img.src = transparentDataUrl
  })
}
