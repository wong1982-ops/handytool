import html2canvas from 'html2canvas'

export async function exportCardAsPng(
  element: HTMLElement,
  templateName: string
): Promise<void> {
  // Temporarily neutralise any CSS transform on ancestor elements
  // (e.g. zoom scale wrapper) so html2canvas captures at native size.
  const ancestors: { el: HTMLElement; prev: string }[] = []
  let parent = element.parentElement
  while (parent) {
    const t = parent.style.transform
    if (t) {
      ancestors.push({ el: parent, prev: t })
      parent.style.transform = 'none'
    }
    parent = parent.parentElement
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      width: 600,
      height: 400,
    })

    const link = document.createElement('a')
    link.download = `ecard-${templateName}-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } finally {
    // Restore transforms
    for (const { el, prev } of ancestors) {
      el.style.transform = prev
    }
  }
}
