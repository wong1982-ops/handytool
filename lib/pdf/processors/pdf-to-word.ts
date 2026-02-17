import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  PageBreak,
  TabStopPosition,
  TabStopType,
} from 'docx'
import type { ProcessorResult } from '../types'

interface TextItem {
  str: string
  transform: number[]
  fontName: string
  width: number
  height: number
}

export async function pdfToWord(
  file: File,
  preserveLayout: boolean,
): Promise<ProcessorResult> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const totalPages = pdf.numPages

  const allChildren: InstanceType<typeof Paragraph>[] = []

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()
    const viewport = page.getViewport({ scale: 1 })
    const pageHeight = viewport.height

    const items = textContent.items
      .filter((item) => 'str' in item && (item as { str: string }).str.length > 0)
      .map((item) => item as unknown as TextItem)

    if (items.length === 0) {
      allChildren.push(new Paragraph({ children: [new TextRun('')] }))
      continue
    }

    const paragraphs: InstanceType<typeof Paragraph>[] = []

    if (preserveLayout) {
      const lineGroups = groupByY(items, pageHeight, 3)

      for (const line of lineGroups) {
        const sortedItems = line.sort((a, b) => a.transform[4] - b.transform[4])
        const runs: InstanceType<typeof TextRun>[] = []

        for (const item of sortedItems) {
          const isBold = /bold/i.test(item.fontName)
          const isItalic = /italic|oblique/i.test(item.fontName)

          runs.push(
            new TextRun({ text: item.str, bold: isBold, italics: isItalic }),
          )
          runs.push(new TextRun({ children: ['\t'] }))
        }

        if (runs.length > 0) runs.pop()

        paragraphs.push(
          new Paragraph({
            children: runs,
            tabStops: [
              { type: TabStopType.LEFT, position: TabStopPosition.MAX },
            ],
          }),
        )
      }
    } else {
      const lineGroups = groupByY(items, pageHeight, 3)

      const yPositions = lineGroups.map((group) => group[0].transform[5])
      let avgLineSpacing = 12
      if (yPositions.length > 1) {
        const spacings: number[] = []
        for (let i = 1; i < yPositions.length; i++) {
          spacings.push(Math.abs(yPositions[i] - yPositions[i - 1]))
        }
        avgLineSpacing =
          spacings.reduce((a, b) => a + b, 0) / spacings.length
      }
      const paragraphGapThreshold = avgLineSpacing * 1.5

      let currentParagraphRuns: InstanceType<typeof TextRun>[] = []

      for (let i = 0; i < lineGroups.length; i++) {
        const line = lineGroups[i]
        const sortedItems = line.sort((a, b) => a.transform[4] - b.transform[4])
        const lineText = sortedItems.map((item) => item.str).join(' ')

        const firstItem = sortedItems[0]
        const isBold = /bold/i.test(firstItem.fontName)
        const isItalic = /italic|oblique/i.test(firstItem.fontName)

        if (i > 0) {
          const gap = Math.abs(
            lineGroups[i][0].transform[5] - lineGroups[i - 1][0].transform[5],
          )
          if (gap > paragraphGapThreshold) {
            if (currentParagraphRuns.length > 0) {
              paragraphs.push(new Paragraph({ children: currentParagraphRuns }))
              currentParagraphRuns = []
            }
          } else {
            if (currentParagraphRuns.length > 0) {
              currentParagraphRuns.push(new TextRun({ text: ' ' }))
            }
          }
        }

        currentParagraphRuns.push(
          new TextRun({ text: lineText, bold: isBold, italics: isItalic }),
        )
      }

      if (currentParagraphRuns.length > 0) {
        paragraphs.push(new Paragraph({ children: currentParagraphRuns }))
      }
    }

    if (pageNum < totalPages) {
      paragraphs.push(new Paragraph({ children: [new PageBreak()] }))
    }

    allChildren.push(...paragraphs)
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: allChildren,
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)
  const baseName = file.name.replace(/\.pdf$/i, '')

  return {
    data: buffer,
    filename: `${baseName}.docx`,
    contentType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }
}

function groupByY(
  items: TextItem[],
  pageHeight: number,
  tolerance: number,
): TextItem[][] {
  const sorted = [...items].sort((a, b) => {
    const yA = pageHeight - a.transform[5]
    const yB = pageHeight - b.transform[5]
    return yA - yB
  })

  const lines: TextItem[][] = []
  let currentLine: TextItem[] = [sorted[0]]
  let currentY = pageHeight - sorted[0].transform[5]

  for (let i = 1; i < sorted.length; i++) {
    const itemY = pageHeight - sorted[i].transform[5]
    if (Math.abs(itemY - currentY) <= tolerance) {
      currentLine.push(sorted[i])
    } else {
      lines.push(currentLine)
      currentLine = [sorted[i]]
      currentY = itemY
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine)
  }

  return lines
}
