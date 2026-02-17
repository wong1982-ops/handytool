import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { API_ERRORS, apiFileResponse } from '@/lib/api/response'
import { parseFormData, getFileFromFormData, getStringField } from '@/lib/pdf/form-data'
import { validateFileSizes, validatePdfFile, PdfValidationError } from '@/lib/pdf/validation'
import { pdfToExcel } from '@/lib/pdf/processors/pdf-to-excel'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const ExtractionModeSchema = z.enum(['auto', 'table-only'])

export async function POST(request: NextRequest) {
  try {
    const formData = await parseFormData(request)
    const file = getFileFromFormData(formData, 'file')
    const modeRaw = getStringField(formData, 'extractionMode', 'auto')

    const modeParsed = ExtractionModeSchema.safeParse(modeRaw)
    if (!modeParsed.success) {
      return API_ERRORS.VALIDATION({
        message: 'extractionMode must be "auto" or "table-only"',
      })
    }

    validateFileSizes([file])
    validatePdfFile(file)

    const result = await pdfToExcel(file, modeParsed.data)
    return apiFileResponse(result)
  } catch (error) {
    console.error('PDF to Excel failed:', error)
    if (error instanceof PdfValidationError) {
      return API_ERRORS.VALIDATION({ message: error.message })
    }
    return API_ERRORS.INTERNAL()
  }
}
