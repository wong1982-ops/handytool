import type { ProgressCallback, ProcessorResult } from './types'

export async function wordToPdf(
  file: File,
  onProgress: ProgressCallback,
): Promise<ProcessorResult> {
  onProgress(5, 'Loading libraries...')

  const mammoth = await import('mammoth')

  onProgress(15, 'Reading Word document...')
  const arrayBuffer = await file.arrayBuffer()

  onProgress(25, 'Converting to HTML...')
  const result = await mammoth.convertToHtml({ arrayBuffer })

  if (!result.value || result.value.trim().length === 0) {
    throw new Error('The Word document appears to be empty or could not be parsed.')
  }

  onProgress(40, 'Preparing document layout...')

  // Create a hidden container for rendering
  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 210mm;
    background: white;
    color: black;
    font-family: 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.6;
    padding: 20mm;
    box-sizing: border-box;
  `

  // Apply base styles for clean document rendering
  container.innerHTML = `
    <style>
      .docx-content h1 { font-size: 24pt; font-weight: bold; margin: 16pt 0 8pt; }
      .docx-content h2 { font-size: 18pt; font-weight: bold; margin: 14pt 0 6pt; }
      .docx-content h3 { font-size: 14pt; font-weight: bold; margin: 12pt 0 4pt; }
      .docx-content p { margin: 0 0 6pt; }
      .docx-content ul, .docx-content ol { margin: 4pt 0 4pt 24pt; }
      .docx-content li { margin: 2pt 0; }
      .docx-content table { border-collapse: collapse; width: 100%; margin: 8pt 0; }
      .docx-content td, .docx-content th { border: 1px solid #999; padding: 4pt 6pt; }
      .docx-content img { max-width: 100%; height: auto; }
    </style>
    <div class="docx-content">${result.value}</div>
  `

  document.body.appendChild(container)

  try {
    onProgress(55, 'Rendering to PDF...')

    const html2pdf = (await import('html2pdf.js')).default

    const pdfBlob: Blob = await html2pdf()
      .from(container)
      .set({
        margin: 0,
        filename: 'output.pdf',
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      } as Record<string, unknown>)
      .outputPdf('blob')

    onProgress(95, 'Finalizing...')

    const baseName = file.name.replace(/\.docx?$/i, '')
    onProgress(100, 'Done!')
    return { blob: pdfBlob, filename: `${baseName}.pdf` }
  } finally {
    document.body.removeChild(container)
  }
}
