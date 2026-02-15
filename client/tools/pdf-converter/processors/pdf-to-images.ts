import type { ProgressCallback, ProcessorResult } from './types'

interface PdfToImagesOptions {
  scale: number // 1, 2, or 3
}

export async function pdfToImages(
  file: File,
  options: PdfToImagesOptions,
  onProgress: ProgressCallback,
): Promise<ProcessorResult> {
  onProgress(5, 'Loading PDF.js library...')

  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

  onProgress(10, 'Reading PDF file...')
  const arrayBuffer = await file.arrayBuffer()

  onProgress(15, 'Parsing PDF document...')
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const totalPages = pdf.numPages

  if (totalPages === 1) {
    // Single page: return PNG directly
    onProgress(20, 'Rendering page...')
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: options.scale })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    canvas.getContext('2d')

    await page.render({ canvas, viewport }).promise
    onProgress(90, 'Encoding image...')

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png')
    })

    onProgress(100, 'Done!')
    const baseName = file.name.replace(/\.pdf$/i, '')
    return { blob, filename: `${baseName}.png` }
  }

  // Multiple pages: create ZIP
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()
  const baseName = file.name.replace(/\.pdf$/i, '')

  for (let i = 1; i <= totalPages; i++) {
    const progress = 15 + Math.round((i / totalPages) * 75)
    onProgress(progress, `Rendering page ${i} of ${totalPages}...`)

    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: options.scale })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    canvas.getContext('2d')

    await page.render({ canvas, viewport }).promise

    const pageBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png')
    })

    const pageNum = String(i).padStart(String(totalPages).length, '0')
    zip.file(`${baseName}_page_${pageNum}.png`, pageBlob)
  }

  onProgress(93, 'Creating ZIP archive...')
  const zipBlob = await zip.generateAsync({ type: 'blob' })

  onProgress(100, 'Done!')
  return { blob: zipBlob, filename: `${baseName}_images.zip` }
}
