import { NextRequest } from 'next/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { uploadToR2, getR2PublicUrl } from '@/lib/storage/r2'

const TEMPLATE_NAMES = ['intro', 'outro', 'bgm'] as const
type TemplateName = typeof TEMPLATE_NAMES[number]

const TEMPLATE_EXTENSIONS: Record<TemplateName, string> = {
  intro: 'mp4',
  outro: 'mp4',
  bgm: 'mp3',
}

const TEMPLATE_CONTENT_TYPES: Record<TemplateName, string> = {
  intro: 'video/mp4',
  outro: 'video/mp4',
  bgm: 'audio/mpeg',
}

/**
 * POST /api/v1/vblog/templates — Upload intro/outro/bgm template files.
 * Accepts multipart FormData with fields named 'intro', 'outro', 'bgm'.
 */
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid multipart form data' })
  }

  const uploaded: Record<string, string> = {}
  const errors: Record<string, string> = {}

  for (const name of TEMPLATE_NAMES) {
    const file = formData.get(name)
    if (!file) continue

    if (!(file instanceof File)) {
      errors[name] = 'Expected a file'
      continue
    }

    const ext = TEMPLATE_EXTENSIONS[name]
    const contentType = TEMPLATE_CONTENT_TYPES[name]
    const r2Path = `vblog/templates/${name}.${ext}`

    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      const url = await uploadToR2(r2Path, buffer, contentType, { upsert: true })
      uploaded[name] = url
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      errors[name] = msg
    }
  }

  if (Object.keys(uploaded).length === 0 && Object.keys(errors).length > 0) {
    return apiError('All uploads failed', 'UPLOAD_ERROR', 500, errors)
  }

  return apiSuccess({ uploaded, errors: Object.keys(errors).length > 0 ? errors : undefined })
}

/**
 * GET /api/v1/vblog/templates — Return the list of available template URLs.
 */
export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const templates: Record<string, string> = {}

  for (const name of TEMPLATE_NAMES) {
    const ext = TEMPLATE_EXTENSIONS[name]
    const r2Path = `vblog/templates/${name}.${ext}`
    templates[name] = getR2PublicUrl(r2Path)
  }

  return apiSuccess({ templates })
}
