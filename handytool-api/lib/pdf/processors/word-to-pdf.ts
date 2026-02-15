import mammoth from 'mammoth'
import { jsPDF } from 'jspdf'
import type { ProcessorResult } from '../types'

export async function wordToPdf(file: File): Promise<ProcessorResult> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.convertToHtml({
    buffer: Buffer.from(arrayBuffer),
  })

  if (!result.value || result.value.trim().length === 0) {
    throw new Error(
      'The Word document appears to be empty or could not be parsed.',
    )
  }

  // Strip HTML tags and decode entities to get plain text
  const text = result.value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const usableWidth = pageWidth - margin * 2
  const lineHeight = 6
  const fontSize = 11

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(fontSize)

  const lines = pdf.splitTextToSize(text, usableWidth)
  let y = margin

  for (const line of lines) {
    if (y + lineHeight > pageHeight - margin) {
      pdf.addPage()
      y = margin
    }
    pdf.text(line, margin, y)
    y += lineHeight
  }

  const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))
  const baseName = file.name.replace(/\.docx?$/i, '')

  return {
    data: pdfBuffer,
    filename: `${baseName}.pdf`,
    contentType: 'application/pdf',
  }
}
