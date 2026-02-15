import { type NextRequest } from 'next/server'
import { API_ERRORS, apiFileResponse } from '@/lib/api/response'
import { parseFormData, getFilesFromFormData } from '@/lib/pdf/form-data'
import { validateFileSizes, validateImageFiles, PdfValidationError } from '@/lib/pdf/validation'
import { imagesToPdf } from '@/lib/pdf/processors/images-to-pdf'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await parseFormData(request)
    const files = getFilesFromFormData(formData, 'files')

    validateFileSizes(files)
    validateImageFiles(files)

    const result = await imagesToPdf(files)
    return apiFileResponse(result)
  } catch (error) {
    console.error('Images to PDF failed:', error)
    if (error instanceof PdfValidationError) {
      return API_ERRORS.VALIDATION({ message: error.message })
    }
    return API_ERRORS.INTERNAL()
  }
}
