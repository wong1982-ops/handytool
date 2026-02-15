import { type NextRequest } from 'next/server'
import { API_ERRORS, apiFileResponse } from '@/lib/api/response'
import { parseFormData, getFileFromFormData, getStringField } from '@/lib/pdf/form-data'
import { validateFileSizes, validatePdfFile, PdfValidationError } from '@/lib/pdf/validation'
import { pdfToWord } from '@/lib/pdf/processors/pdf-to-word'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await parseFormData(request)
    const file = getFileFromFormData(formData, 'file')
    const preserveLayout = getStringField(formData, 'preserveLayout', 'false') === 'true'

    validateFileSizes([file])
    validatePdfFile(file)

    const result = await pdfToWord(file, preserveLayout)
    return apiFileResponse(result)
  } catch (error) {
    console.error('PDF to Word failed:', error)
    if (error instanceof PdfValidationError) {
      return API_ERRORS.VALIDATION({ message: error.message })
    }
    return API_ERRORS.INTERNAL()
  }
}
