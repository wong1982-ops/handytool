import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import ExcelJS from 'exceljs'
import type { ProcessorResult, ExtractionMode } from '../types'

interface TextItem {
  str: string
  transform: number[]
  fontName: string
  width: number
  height: number
}

export async function pdfToExcel(
  file: File,
  extractionMode: ExtractionMode,
): Promise<ProcessorResult> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const totalPages = pdf.numPages

  const workbook = new ExcelJS.Workbook()

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()
    const viewport = page.getViewport({ scale: 1 })
    const pageHeight = viewport.height

    const items = textContent.items
      .filter(
        (item) =>
          'str' in item && (item as { str: string }).str.trim().length > 0,
      )
      .map((item) => item as unknown as TextItem)

    if (items.length === 0) continue

    const worksheet = workbook.addWorksheet(`Page ${pageNum}`)

    const rows = groupIntoRows(items, pageHeight, 3)
    const columnBoundaries = detectColumns(rows, extractionMode)

    if (columnBoundaries.length === 0) {
      // Fallback: single column with all text
      rows.forEach((row) => {
        const sortedItems = row.sort((a, b) => a.transform[4] - b.transform[4])
        const text = sortedItems.map((item) => item.str).join(' ')
        worksheet.addRow([text])
      })
    } else {
      for (const row of rows) {
        const cells: string[] = new Array(columnBoundaries.length).fill('')

        for (const item of row) {
          const x = item.transform[4]
          const colIdx = findClosestColumn(x, columnBoundaries)
          if (cells[colIdx]) {
            cells[colIdx] += ' ' + item.str
          } else {
            cells[colIdx] = item.str
          }
        }

        worksheet.addRow(cells)
      }

      // Bold header if first row has bold items
      const firstRow = rows[0]
      if (firstRow && firstRow.some((item) => /bold/i.test(item.fontName))) {
        const headerRow = worksheet.getRow(1)
        headerRow.font = { bold: true }
      }
    }

    // Auto-fit column widths
    worksheet.columns.forEach((column) => {
      let maxLength = 10
      column.eachCell?.({ includeEmpty: false }, (cell) => {
        const cellLength = cell.value ? String(cell.value).length : 0
        if (cellLength > maxLength) maxLength = cellLength
      })
      column.width = Math.min(maxLength + 2, 50)
    })
  }

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer())
  const baseName = file.name.replace(/\.pdf$/i, '')

  return {
    data: buffer,
    filename: `${baseName}.xlsx`,
    contentType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }
}

function groupIntoRows(
  items: TextItem[],
  pageHeight: number,
  tolerance: number,
): TextItem[][] {
  const sorted = [...items].sort((a, b) => {
    const yA = pageHeight - a.transform[5]
    const yB = pageHeight - b.transform[5]
    return yA - yB
  })

  const rows: TextItem[][] = []
  let currentRow: TextItem[] = [sorted[0]]
  let currentY = pageHeight - sorted[0].transform[5]

  for (let i = 1; i < sorted.length; i++) {
    const itemY = pageHeight - sorted[i].transform[5]
    if (Math.abs(itemY - currentY) <= tolerance) {
      currentRow.push(sorted[i])
    } else {
      rows.push(currentRow)
      currentRow = [sorted[i]]
      currentY = itemY
    }
  }

  if (currentRow.length > 0) {
    rows.push(currentRow)
  }

  return rows
}

function detectColumns(
  rows: TextItem[][],
  extractionMode: ExtractionMode,
): number[] {
  const xPositions: number[] = []
  for (const row of rows) {
    for (const item of row) {
      xPositions.push(Math.round(item.transform[4]))
    }
  }

  if (xPositions.length === 0) return []

  const clusters = clusterValues(xPositions, 8)
  const minRowThreshold =
    extractionMode === 'table-only' ? rows.length * 0.5 : rows.length * 0.2

  const validClusters = clusters.filter((cluster) => {
    let rowCount = 0
    for (const row of rows) {
      const hasItemNearCluster = row.some(
        (item) =>
          Math.abs(Math.round(item.transform[4]) - cluster.center) <= 8,
      )
      if (hasItemNearCluster) rowCount++
    }
    return rowCount >= minRowThreshold
  })

  if (validClusters.length < 2) return []

  return validClusters.map((c) => c.center).sort((a, b) => a - b)
}

function clusterValues(
  values: number[],
  tolerance: number,
): { center: number; count: number }[] {
  const sorted = [...values].sort((a, b) => a - b)
  const clusters: { center: number; values: number[] }[] = []

  for (const val of sorted) {
    const existing = clusters.find(
      (c) => Math.abs(c.center - val) <= tolerance,
    )
    if (existing) {
      existing.values.push(val)
      existing.center =
        existing.values.reduce((a, b) => a + b, 0) / existing.values.length
    } else {
      clusters.push({ center: val, values: [val] })
    }
  }

  return clusters.map((c) => ({
    center: Math.round(c.center),
    count: c.values.length,
  }))
}

function findClosestColumn(x: number, boundaries: number[]): number {
  let minDist = Infinity
  let bestIdx = 0

  for (let i = 0; i < boundaries.length; i++) {
    const dist = Math.abs(x - boundaries[i])
    if (dist < minDist) {
      minDist = dist
      bestIdx = i
    }
  }

  return bestIdx
}
