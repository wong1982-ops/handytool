export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
export const MAX_TOTAL_SIZE = 100 * 1024 * 1024 // 100 MB
export const MAX_FILES = 50

export class PdfValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PdfValidationError'
  }
}

export function validateFileSizes(files: File[]): void {
  if (files.length === 0) {
    throw new PdfValidationError('No files provided')
  }

  if (files.length > MAX_FILES) {
    throw new PdfValidationError(`Maximum ${MAX_FILES} files allowed`)
  }

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      throw new PdfValidationError(
        `File "${file.name}" exceeds 50 MB limit`,
      )
    }
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0)
  if (totalSize > MAX_TOTAL_SIZE) {
    throw new PdfValidationError('Total upload size exceeds 100 MB limit')
  }
}

export function validatePdfFile(file: File): void {
  if (file.type !== 'application/pdf') {
    throw new PdfValidationError(
      `Invalid file type: ${file.type}. Expected application/pdf`,
    )
  }
}

export function validateImageFiles(files: File[]): void {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  for (const file of files) {
    if (!validTypes.includes(file.type)) {
      throw new PdfValidationError(
        `Invalid image type for "${file.name}": ${file.type}. Expected PNG, JPEG, or WebP`,
      )
    }
  }
}

export function validateDocxFile(file: File): void {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ]
  if (!validTypes.includes(file.type)) {
    throw new PdfValidationError(
      `Invalid file type: ${file.type}. Expected DOCX`,
    )
  }
}

export interface PageRange {
  start: number
  end: number
}

export function parsePageRanges(input: string, totalPages: number): PageRange[] {
  const ranges: PageRange[] = []
  const parts = input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim())
      const start = parseInt(startStr, 10)
      const end = parseInt(endStr, 10)
      if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
        throw new PdfValidationError(
          `Invalid range "${part}". Pages must be between 1 and ${totalPages}`,
        )
      }
      ranges.push({ start, end })
    } else {
      const page = parseInt(part, 10)
      if (isNaN(page) || page < 1 || page > totalPages) {
        throw new PdfValidationError(
          `Invalid page "${part}". Pages must be between 1 and ${totalPages}`,
        )
      }
      ranges.push({ start: page, end: page })
    }
  }

  if (ranges.length === 0) {
    throw new PdfValidationError('No page ranges specified')
  }

  return ranges
}
