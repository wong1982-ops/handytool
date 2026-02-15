import { type NextRequest } from 'next/server'
import { API_ERRORS, apiFileResponse } from '@/lib/api/response'
import { parseFormData, getFileFromFormData } from '@/lib/pdf/form-data'
import { validateFileSizes, validateDocxFile, PdfValidationError } from '@/lib/pdf/validation'
import { wordToPdf } from '@/lib/pdf/processors/word-to-pdf'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await parseFormData(request)
    const file = getFileFromFormData(formData, 'file')

    validateFileSizes([file])
    validateDocxFile(file)

    const result = await wordToPdf(file)
    return apiFileResponse(result)
  } catch (error) {
    console.error('Word to PDF failed:', error)
    if (error instanceof PdfValidationError) {
      return API_ERRORS.VALIDATION({ message: error.message })
    }
    return API_ERRORS.INTERNAL()
  }
}
