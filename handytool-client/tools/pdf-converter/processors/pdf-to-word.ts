import type { ProgressCallback, ProcessorResult } from './types'

interface PdfToWordOptions {
  preserveLayout: boolean
}

interface TextItem {
  str: string
  transform: number[]
  fontName: string
  width: number
  height: number
}

export async function pdfToWord(
  file: File,
  options: PdfToWordOptions,
  onProgress: ProgressCallback,
): Promise<ProcessorResult> {
  onProgress(5, 'Loading libraries...')

  const [pdfjsLib, docxModule] = await Promise.all([
    import('pdfjs-dist'),
    import('docx'),
  ])

  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    PageBreak,
    TabStopPosition,
    TabStopType,
  } = docxModule

  onProgress(10, 'Reading PDF file...')
  const arrayBuffer = await file.arrayBuffer()

  onProgress(15, 'Parsing PDF document...')
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const totalPages = pdf.numPages

  const sections: { children: InstanceType<typeof Paragraph>[] }[] = []

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const progress = 15 + Math.round((pageNum / totalPages) * 70)
    onProgress(progress, `Extracting text from page ${pageNum} of ${totalPages}...`)

    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()
    const viewport = page.getViewport({ scale: 1 })
    const pageHeight = viewport.height

    const items = textContent.items
      .filter((item) => 'str' in item && (item as { str: string }).str.length > 0)
      .map((item) => item as unknown as TextItem)

    if (items.length === 0) {
      sections.push({
        children: [new Paragraph({ children: [new TextRun('')] })],
      })
      continue
    }

    const paragraphs: InstanceType<typeof Paragraph>[] = []

    if (options.preserveLayout) {
      // Spatial positioning: group by Y-coordinate, preserve X positions
      const lineGroups = groupByY(items, pageHeight, 3)

      for (const line of lineGroups) {
        const sortedItems = line.sort((a, b) => a.transform[4] - b.transform[4])
        const runs: InstanceType<typeof TextRun>[] = []

        for (const item of sortedItems) {
          const isBold = /bold/i.test(item.fontName)
          const isItalic = /italic|oblique/i.test(item.fontName)

          runs.push(
            new TextRun({
              text: item.str,
              bold: isBold,
              italics: isItalic,
            }),
          )
          // Add tab between items that are spaced apart
          runs.push(new TextRun({ children: ['\t'] }))
        }

        // Remove trailing tab
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
      // Simple text flow: cluster into paragraphs by vertical gaps
      const lineGroups = groupByY(items, pageHeight, 3)

      // Detect average line spacing
      const yPositions = lineGroups.map((group) => group[0].transform[5])
      let avgLineSpacing = 12
      if (yPositions.length > 1) {
        const spacings: number[] = []
        for (let i = 1; i < yPositions.length; i++) {
          spacings.push(Math.abs(yPositions[i] - yPositions[i - 1]))
        }
        avgLineSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length
      }
      const paragraphGapThreshold = avgLineSpacing * 1.5

      let currentParagraphRuns: InstanceType<typeof TextRun>[] = []

      for (let i = 0; i < lineGroups.length; i++) {
        const line = lineGroups[i]
        const sortedItems = line.sort((a, b) => a.transform[4] - b.transform[4])
        const lineText = sortedItems.map((item) => item.str).join(' ')

        // Detect formatting from first item in line
        const firstItem = sortedItems[0]
        const isBold = /bold/i.test(firstItem.fontName)
        const isItalic = /italic|oblique/i.test(firstItem.fontName)

        // Check if there's a paragraph break before this line
        if (i > 0) {
          const gap = Math.abs(lineGroups[i][0].transform[5] - lineGroups[i - 1][0].transform[5])
          if (gap > paragraphGapThreshold) {
            // Flush current paragraph
            if (currentParagraphRuns.length > 0) {
              paragraphs.push(new Paragraph({ children: currentParagraphRuns }))
              currentParagraphRuns = []
            }
          } else {
            // Same paragraph — add soft break
            if (currentParagraphRuns.length > 0) {
              currentParagraphRuns.push(new TextRun({ text: ' ' }))
            }
          }
        }

        currentParagraphRuns.push(
          new TextRun({
            text: lineText,
            bold: isBold,
            italics: isItalic,
          }),
        )
      }

      // Flush remaining
      if (currentParagraphRuns.length > 0) {
        paragraphs.push(new Paragraph({ children: currentParagraphRuns }))
      }
    }

    // Add page break between pages (except last)
    if (pageNum < totalPages) {
      paragraphs.push(
        new Paragraph({
          children: [new PageBreak()],
        }),
      )
    }

    sections.push({ children: paragraphs })
  }

  onProgress(88, 'Building Word document...')

  // Flatten all sections into a single section with all children
  const allChildren = sections.flatMap((s) => s.children)

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 }, // Letter size in twips
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: allChildren,
      },
    ],
  })

  onProgress(93, 'Generating .docx file...')
  const blob = await Packer.toBlob(doc)

  onProgress(100, 'Done!')
  const baseName = file.name.replace(/\.pdf$/i, '')
  return { blob, filename: `${baseName}.docx` }
}

/** Group text items into lines by Y-coordinate proximity */
function groupByY(items: TextItem[], pageHeight: number, tolerance: number): TextItem[][] {
  // PDF Y-coordinates go bottom-up; invert for top-down ordering
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
