import html2canvas from 'html2canvas'

export async function exportCardAsPng(
  element: HTMLElement,
  templateName: string
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
  })

  const link = document.createElement('a')
  link.download = `ecard-${templateName}-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
