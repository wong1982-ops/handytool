import JSZip from 'jszip'
import type { FaviconConfig, ExportSize } from './types'
import { EXPORT_SIZES } from './types'
import { renderFaviconBlob } from './favicon-canvas'
import { encodeIco } from './ico-encoder'

// ── ZIP generation ─────────────────────────────────────────────

export async function generateFaviconZip(
  config: FaviconConfig,
  sizes: ExportSize[] = EXPORT_SIZES,
): Promise<Blob> {
  const zip = new JSZip()
  const checkedSizes = sizes.filter((s) => s.checked)

  // Render all checked sizes as PNGs in parallel
  const pngEntries = await Promise.all(
    checkedSizes.map(async (s) => {
      const blob = await renderFaviconBlob(config, s.width)
      return { size: s, blob }
    }),
  )

  // Add PNGs to ZIP
  for (const entry of pngEntries) {
    zip.file(entry.size.filename, entry.blob)
  }

  // Generate favicon.ico from 16, 32, 48 sizes
  const icoSizes = [16, 32, 48]
  const icoPngs = await Promise.all(
    icoSizes.map(async (size) => {
      const blob = await renderFaviconBlob(config, size)
      return { size, blob }
    }),
  )
  const icoBlob = await encodeIco(icoPngs)
  zip.file('favicon.ico', icoBlob)

  return zip.generateAsync({ type: 'blob' })
}

// ── HTML tags ──────────────────────────────────────────────────

export function generateHtmlTags(): string {
  return [
    '<link rel="icon" type="image/x-icon" href="/favicon.ico" />',
    '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />',
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />',
    '<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />',
    '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />',
    '<link rel="manifest" href="/site.webmanifest" />',
  ].join('\n')
}

// ── Manifest JSON ──────────────────────────────────────────────

export function generateManifestJson(): string {
  return JSON.stringify(
    {
      icons: [
        { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  )
}

// ── Download helper ────────────────────────────────────────────

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
