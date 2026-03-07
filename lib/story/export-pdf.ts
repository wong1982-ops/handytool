import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type { PDFFont } from 'pdf-lib'
import type { ExportPdfRequest } from './types'

export async function generateBookPdf(input: ExportPdfRequest): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold)

  const PAGE_WIDTH = 842  // A4 landscape width
  const PAGE_HEIGHT = 595 // A4 landscape height
  const MARGIN = 40

  // Cover page
  const cover = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const titleSize = 36
  const titleWidth = boldFont.widthOfTextAtSize(input.title, titleSize)
  cover.drawText(input.title, {
    x: (PAGE_WIDTH - titleWidth) / 2,
    y: PAGE_HEIGHT / 2,
    size: titleSize,
    font: boldFont,
    color: rgb(0.15, 0.15, 0.15),
  })

  // Content pages
  for (const pageData of input.pages) {
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

    // Embed illustration
    try {
      const imgResponse = await fetch(pageData.imageUrl)
      const imgBytes = new Uint8Array(await imgResponse.arrayBuffer())

      let image
      if (pageData.imageUrl.includes('.png')) {
        image = await doc.embedPng(imgBytes)
      } else {
        image = await doc.embedJpg(imgBytes)
      }

      const imgWidth = PAGE_WIDTH - MARGIN * 2
      const imgHeight = (PAGE_HEIGHT - MARGIN * 2) * 0.6
      const scale = Math.min(imgWidth / image.width, imgHeight / image.height)

      page.drawImage(image, {
        x: MARGIN,
        y: PAGE_HEIGHT - MARGIN - image.height * scale,
        width: image.width * scale,
        height: image.height * scale,
      })
    } catch {
      // Image failed to load — skip
    }

    // Narrative text
    const textY = PAGE_HEIGHT * 0.3
    const lines = wrapText(pageData.narrativeText, font, 14, PAGE_WIDTH - MARGIN * 2)
    lines.forEach((line, i) => {
      page.drawText(line, {
        x: MARGIN,
        y: textY - i * 20,
        size: 14,
        font,
        color: rgb(0.2, 0.2, 0.2),
      })
    })

    // Dialogue
    if (pageData.dialogue?.length) {
      const dialogueY = textY - lines.length * 20 - 20
      pageData.dialogue.forEach((d, i) => {
        const text = `${d.speaker}: "${d.line}"`
        page.drawText(text, {
          x: MARGIN + 20,
          y: dialogueY - i * 18,
          size: 12,
          font,
          color: rgb(0.3, 0.3, 0.5),
        })
      })
    }
  }

  return doc.save()
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    const testWidth = font.widthOfTextAtSize(test, size)
    if (testWidth > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}
