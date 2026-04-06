// Client-side PDF export using html-to-image + jsPDF.
// html-to-image serializes the DOM via SVG <foreignObject>, so the browser
// renders the text itself — preserving exact spacing and font metrics.
// (html2canvas previously caused character overlap with system fonts.)

export async function exportInvoicePDF(invoiceNumber: string): Promise<void> {
  const container = document.getElementById('invoice-preview-container')
  if (!container) {
    throw new Error('Preview container not found')
  }

  const [{ toPng }, { jsPDF }] = await Promise.all([
    import('html-to-image'),
    import('jspdf'),
  ])

  // Render at 2x for crisp output. Pre-compute pixel dimensions so the
  // serialized SVG has explicit width/height (avoids reflow issues).
  const rect = container.getBoundingClientRect()
  const pixelRatio = 2

  const dataUrl = await toPng(container, {
    pixelRatio,
    backgroundColor: '#ffffff',
    width: rect.width,
    height: rect.height,
    cacheBust: true,
    style: {
      transform: 'none',
      transformOrigin: 'top left',
    },
  })

  // Load the image to read its real pixel dimensions
  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Failed to load rendered image'))
    img.src = dataUrl
  })

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  const ratio = Math.min(pdfWidth / img.width, pdfHeight / img.height)
  const renderedWidth = img.width * ratio
  const renderedHeight = img.height * ratio
  const offsetX = (pdfWidth - renderedWidth) / 2

  pdf.addImage(dataUrl, 'PNG', offsetX, 0, renderedWidth, renderedHeight)
  pdf.save(`${invoiceNumber || 'invoice'}.pdf`)
}
