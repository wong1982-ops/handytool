import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type { PDFFont, PDFImage } from 'pdf-lib'
import type { ExportPdfRequest } from './types'

export async function generateBookPdf(input: ExportPdfRequest): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.TimesRoman)
  const boldFont = await doc.embedFont(StandardFonts.TimesRomanBold)
  const italicFont = await doc.embedFont(StandardFonts.TimesRomanItalic)

  const PAGE_WIDTH = 842  // A4 landscape
  const PAGE_HEIGHT = 595
  const MARGIN = 40
  const IMG_WIDTH_RATIO = 0.55 // image takes 55% of page width (like web 60% but with margins)

  // ── Cover page ──────────────────────────────────────────────
  const cover = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const coverImageUrl = input.coverImageUrl || input.pages[0]?.imageUrl

  if (coverImageUrl) {
    // Side-by-side cover: image left, title right (matching web layout)
    const img = await embedImage(doc, coverImageUrl)
    if (img) {
      const imgAreaW = PAGE_WIDTH * IMG_WIDTH_RATIO
      const imgAreaH = PAGE_HEIGHT
      const scale = Math.min(imgAreaW / img.width, imgAreaH / img.height)
      const drawW = img.width * scale
      const drawH = img.height * scale
      cover.drawImage(img, {
        x: (imgAreaW - drawW) / 2,
        y: (PAGE_HEIGHT - drawH) / 2,
        width: drawW,
        height: drawH,
      })
    }

    // Title text on the right side
    const textX = PAGE_WIDTH * IMG_WIDTH_RATIO + MARGIN
    const textMaxW = PAGE_WIDTH - textX - MARGIN

    // Title
    const titleLines = wrapText(input.title, boldFont, 28, textMaxW)
    let y = PAGE_HEIGHT * 0.6
    for (const line of titleLines) {
      cover.drawText(line, {
        x: textX,
        y,
        size: 28,
        font: boldFont,
        color: rgb(0.15, 0.15, 0.15),
      })
      y -= 36
    }

    // Author
    if (input.authors?.length) {
      y -= 8
      cover.drawText(`by ${input.authors.join(' & ')}`, {
        x: textX,
        y,
        size: 13,
        font: italicFont,
        color: rgb(0.45, 0.45, 0.45),
      })
    }
  } else {
    // No cover image — centered title only
    const titleSize = 36
    const titleWidth = boldFont.widthOfTextAtSize(input.title, titleSize)
    cover.drawText(input.title, {
      x: (PAGE_WIDTH - titleWidth) / 2,
      y: PAGE_HEIGHT / 2,
      size: titleSize,
      font: boldFont,
      color: rgb(0.15, 0.15, 0.15),
    })
  }

  // ── Content pages ───────────────────────────────────────────
  for (const pageData of input.pages) {
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

    const imgAreaW = PAGE_WIDTH * IMG_WIDTH_RATIO
    const textX = imgAreaW + MARGIN
    const textMaxW = PAGE_WIDTH - textX - MARGIN

    // Left: illustration (55% of page)
    if (pageData.imageUrl) {
      const img = await embedImage(doc, pageData.imageUrl)
      if (img) {
        const scale = Math.min(imgAreaW / img.width, PAGE_HEIGHT / img.height)
        const drawW = img.width * scale
        const drawH = img.height * scale
        page.drawImage(img, {
          x: (imgAreaW - drawW) / 2,
          y: (PAGE_HEIGHT - drawH) / 2,
          width: drawW,
          height: drawH,
        })
      }
    }

    // Right: narrative text + dialogue (45% of page)
    let y = PAGE_HEIGHT - MARGIN - 10

    // Page number
    const pageNum = `Page ${pageData.sequence || ''}`
    page.drawText(pageNum, {
      x: textX,
      y,
      size: 9,
      font,
      color: rgb(0.6, 0.6, 0.6),
    })
    y -= 24

    // Narrative text
    if (pageData.narrativeText) {
      const lines = wrapText(pageData.narrativeText, font, 13, textMaxW)
      for (const line of lines) {
        if (y < MARGIN) break
        page.drawText(line, {
          x: textX,
          y,
          size: 13,
          font,
          color: rgb(0.15, 0.15, 0.15),
        })
        y -= 19
      }
    }

    // Dialogue
    if (pageData.dialogue?.length) {
      y -= 10
      for (const d of pageData.dialogue) {
        if (y < MARGIN) break
        // Speaker name
        const speaker = `${d.speaker}:`
        page.drawText(speaker, {
          x: textX,
          y,
          size: 11,
          font: boldFont,
          color: rgb(0.3, 0.3, 0.5),
        })
        y -= 16

        // Dialogue line
        const dLines = wrapText(`"${d.line}"`, italicFont, 12, textMaxW - 12)
        for (const dl of dLines) {
          if (y < MARGIN) break
          page.drawText(dl, {
            x: textX + 12,
            y,
            size: 12,
            font: italicFont,
            color: rgb(0.3, 0.3, 0.5),
          })
          y -= 17
        }
        y -= 4
      }
    }

    // Subtle page border divider between image and text
    page.drawLine({
      start: { x: imgAreaW, y: MARGIN },
      end: { x: imgAreaW, y: PAGE_HEIGHT - MARGIN },
      thickness: 0.5,
      color: rgb(0.85, 0.85, 0.85),
    })
  }

  return doc.save()
}

/** Safely embed an image from URL. Returns null on failure. */
async function embedImage(doc: PDFDocument, url: string): Promise<PDFImage | null> {
  try {
    const res = await fetch(url)
    const bytes = new Uint8Array(await res.arrayBuffer())
    if (url.includes('.png')) {
      return await doc.embedPng(bytes)
    }
    return await doc.embedJpg(bytes)
  } catch {
    return null
  }
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
