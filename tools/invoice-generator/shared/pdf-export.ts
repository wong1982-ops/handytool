// Client-side PDF export using html2canvas + jsPDF.
// Captures the live preview DOM at 2x resolution and writes to A4 PDF.

export async function exportInvoicePDF(invoiceNumber: string): Promise<void> {
  const container = document.getElementById('invoice-preview-container')
  if (!container) {
    throw new Error('Preview container not found')
  }

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  // Render at 2x for crisp output
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = canvas.width
  const imgHeight = canvas.height
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
  const renderedWidth = imgWidth * ratio
  const renderedHeight = imgHeight * ratio
  const offsetX = (pdfWidth - renderedWidth) / 2

  pdf.addImage(imgData, 'PNG', offsetX, 0, renderedWidth, renderedHeight)
  pdf.save(`${invoiceNumber || 'invoice'}.pdf`)
}
