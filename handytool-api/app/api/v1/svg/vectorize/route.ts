import { type NextRequest } from 'next/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { parseFormData, getFileFromFormData, getStringField } from '@/lib/pdf/form-data'
import { PdfValidationError } from '@/lib/pdf/validation'
import { validateImageFile, SvgValidationError } from '@/lib/svg/validation'
import { vectorizeSettingsSchema } from '@/lib/svg/types'
import { vectorizeImage } from '@/lib/svg/vectorize'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

export async function POST(request: NextRequest) {
  try {
    const formData = await parseFormData(request)
    const file = getFileFromFormData(formData, 'image')
    validateImageFile(file)

    // Parse settings from JSON string field (with defaults via Zod)
    const settingsRaw = getStringField(formData, 'settings', '{}')
    let settingsParsed: unknown
    try {
      settingsParsed = JSON.parse(settingsRaw)
    } catch {
      return API_ERRORS.VALIDATION({ message: 'Settings must be valid JSON' })
    }
    const parseResult = vectorizeSettingsSchema.safeParse(settingsParsed)
    if (!parseResult.success) {
      return API_ERRORS.VALIDATION({
        message: 'Invalid vectorization settings',
        issues: parseResult.error.flatten().fieldErrors,
      })
    }

    const result = await vectorizeImage(file, parseResult.data)
    return apiSuccess(result)
  } catch (error) {
    if (error instanceof SvgValidationError || error instanceof PdfValidationError) {
      return API_ERRORS.VALIDATION({ message: error.message })
    }
    console.error('[SVG Vectorize] Error:', error)
    return API_ERRORS.INTERNAL()
  }
}
