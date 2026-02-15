import { type NextRequest } from 'next/server'
import { API_ERRORS, apiFileResponse } from '@/lib/api/response'
import { parseFormData, getFileFromFormData, getStringField } from '@/lib/pdf/form-data'
import { validateFileSizes, validatePdfFile, PdfValidationError } from '@/lib/pdf/validation'
import { splitPdf } from '@/lib/pdf/processors/split'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await parseFormData(request)
    const file = getFileFromFormData(formData, 'file')
    const ranges = getStringField(formData, 'ranges')

    validateFileSizes([file])
    validatePdfFile(file)

    const result = await splitPdf(file, ranges)
    return apiFileResponse(result)
  } catch (error) {
    console.error('Split PDF failed:', error)
    if (error instanceof PdfValidationError) {
      return API_ERRORS.VALIDATION({ message: error.message })
    }
    return API_ERRORS.INTERNAL()
  }
}
