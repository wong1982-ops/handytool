import { type NextRequest } from 'next/server'
import { API_ERRORS, apiFileResponse } from '@/lib/api/response'
import { parseFormData, getFilesFromFormData } from '@/lib/pdf/form-data'
import { validateFileSizes, validatePdfFile, PdfValidationError } from '@/lib/pdf/validation'
import { mergePdf } from '@/lib/pdf/processors/merge'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await parseFormData(request)
    const files = getFilesFromFormData(formData, 'files')

    if (files.length < 2) {
      return API_ERRORS.VALIDATION({ message: 'At least 2 PDF files required' })
    }

    validateFileSizes(files)
    files.forEach(validatePdfFile)

    const result = await mergePdf(files)
    return apiFileResponse(result)
  } catch (error) {
    console.error('Merge PDF failed:', error)
    if (error instanceof PdfValidationError) {
      return API_ERRORS.VALIDATION({ message: error.message })
    }
    return API_ERRORS.INTERNAL()
  }
}
