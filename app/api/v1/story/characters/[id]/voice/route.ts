import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { uploadToR2, deleteFromR2 } from '@/lib/storage/r2'
import { deleteClonedVoice, type VoiceCloneProvider } from '@/lib/story/voice-clone'

// GET /api/v1/story/characters/[id]/voice
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { data, error: dbError } = await supabase.rpc('get_character_voice', {
    p_user_id: userId,
    p_character_id: id,
  })
  if (dbError) return apiError(dbError.message, 'DB_ERROR', 500)

  const row = (data || [])[0]
  if (!row) return apiSuccess(null)

  return apiSuccess({
    id: row.id,
    recordingUrl: row.recording_url,
    provider: row.provider,
    status: row.status,
    errorMessage: row.error_message,
    createdAt: row.created_at,
  })
}

// POST /api/v1/story/characters/[id]/voice
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const formData = await request.formData()
  const audio = formData.get('audio')

  if (!audio || !(audio instanceof File)) {
    return apiError('Audio file is required', 'VALIDATION_ERROR', 400)
  }

  const contentType = audio.type || 'audio/webm'
  if (!contentType.startsWith('audio/')) {
    return apiError('File must be an audio file', 'VALIDATION_ERROR', 400)
  }

  const MAX_SIZE = 10 * 1024 * 1024 // 10MB
  if (audio.size > MAX_SIZE) {
    return apiError('Audio file must be 10MB or less', 'VALIDATION_ERROR', 400)
  }

  // Derive extension from content type
  const ext = contentType.includes('wav') ? 'wav' : 'webm'
  const r2Path = `voice-recordings/${userId}/${id}/recording.${ext}`

  // Read file to Buffer
  const arrayBuffer = await audio.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Upload to R2
  let recordingUrl: string
  try {
    recordingUrl = await uploadToR2(r2Path, buffer, contentType, { upsert: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return apiError(`Upload failed: ${msg}`, 'UPLOAD_ERROR', 500)
  }

  // Persist to database
  const { data, error: dbError } = await supabase.rpc('upsert_character_voice', {
    p_user_id: userId,
    p_character_id: id,
    p_recording_url: recordingUrl,
  })
  if (dbError) return apiError(dbError.message, 'DB_ERROR', 500)

  const row = (data || [])[0]
  return apiSuccess(
    {
      id: row?.id,
      recordingUrl,
      status: row?.status || 'recorded',
    },
    201,
  )
}

// DELETE /api/v1/story/characters/[id]/voice
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { data: deleteData, error: dbError } = await supabase.rpc('delete_character_voice', {
    p_user_id: userId,
    p_character_id: id,
  })
  if (dbError) return apiError(dbError.message, 'DB_ERROR', 500)

  const deleted = (deleteData || [])[0]
  if (!deleted) return apiSuccess(null)

  // Best-effort R2 cleanup
  if (deleted.recording_url) {
    try {
      const r2Path = new URL(deleted.recording_url).pathname.replace(/^\//, '')
      await deleteFromR2(r2Path)
    } catch { /* best effort */ }
  }

  // Best-effort provider voice cleanup
  if (deleted.provider && deleted.provider_voice_id) {
    try {
      await deleteClonedVoice(
        deleted.provider as VoiceCloneProvider,
        deleted.provider_voice_id,
      )
    } catch { /* best effort */ }
  }

  return apiSuccess({ deleted: true })
}
