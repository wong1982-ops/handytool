import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const formData = await request.formData()
  const audioFile = formData.get('audio') as File | null
  const name = (formData.get('name') as string) || 'Untitled'
  const durationSeconds = parseInt(formData.get('durationSeconds') as string, 10) || 0
  const format = (formData.get('format') as string) || 'mp3'
  const mode = formData.get('mode') as string | null
  const promptSummary = formData.get('promptSummary') as string | null
  const bpm = parseInt(formData.get('bpm') as string, 10) || null
  const scale = formData.get('scale') as string | null

  if (!audioFile || durationSeconds <= 0) {
    return apiError('Audio file and duration are required', 'VALIDATION_ERROR', 400)
  }

  // Credit cost: 1 for MP3, 2 for WAV
  const creditCost = format === 'wav' ? 2 : 1

  const supabase = await createClient()
  const { error: creditError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: creditCost,
    p_tool_id: 'music-studio',
    p_description: `Music clip download (${format.toUpperCase()})`,
  })

  if (creditError) {
    return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
  }

  // Upload to R2
  const sessionId = crypto.randomUUID()
  const ext = format === 'wav' ? 'wav' : 'mp3'
  const contentType = format === 'wav' ? 'audio/wav' : 'audio/mpeg'
  const r2Path = `music-studio/${sessionId}/${name.replace(/[^a-zA-Z0-9-_]/g, '_')}.${ext}`

  const buffer = Buffer.from(await audioFile.arrayBuffer())
  const clipUrl = await uploadToR2(r2Path, buffer, contentType)

  // Save to DB
  const { data, error } = await supabase
    .from('music_clips')
    .insert({
      user_id: userId,
      name,
      duration_seconds: durationSeconds,
      format,
      clip_url: clipUrl,
      mode,
      prompt_summary: promptSummary,
      bpm,
      scale,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[music-studio/save-clip] DB error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ id: data.id, clipUrl }, 201)
}
