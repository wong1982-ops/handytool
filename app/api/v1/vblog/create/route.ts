import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { DEFAULT_STEPS } from '@/tools/vblog/types'

/**
 * POST /api/v1/vblog/create — Create a new VBlog video generation job.
 */
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const { toolSlug, toolName, scriptStyle, voiceType, voiceId, targetDuration } = body as Record<string, unknown>

  if (!toolSlug || typeof toolSlug !== 'string') {
    return API_ERRORS.VALIDATION({ toolSlug: 'Required string' })
  }
  if (!toolName || typeof toolName !== 'string') {
    return API_ERRORS.VALIDATION({ toolName: 'Required string' })
  }
  if (!scriptStyle || !['feature-walkthrough', 'problem-solution'].includes(scriptStyle as string)) {
    return API_ERRORS.VALIDATION({ scriptStyle: 'Must be feature-walkthrough or problem-solution' })
  }
  if (!voiceType || !['clone', 'ai'].includes(voiceType as string)) {
    return API_ERRORS.VALIDATION({ voiceType: 'Must be clone or ai' })
  }
  if (!targetDuration || typeof targetDuration !== 'number' || ![60, 120, 180].includes(targetDuration as number)) {
    return API_ERRORS.VALIDATION({ targetDuration: 'Must be 60, 120, or 180' })
  }

  const supabase = await createClient()

  const { data: job, error: insertError } = await supabase
    .from('vblog_jobs')
    .insert({
      user_id: userId,
      tool_slug: toolSlug,
      tool_name: toolName,
      script_style: scriptStyle,
      voice_type: voiceType,
      voice_id: voiceId && typeof voiceId === 'string' ? voiceId : null,
      target_duration: targetDuration,
      status: 'pending',
      steps: DEFAULT_STEPS,
      artifacts: {},
    })
    .select('id')
    .single()

  if (insertError || !job) {
    console.error('[vblog/create] Failed to insert job:', insertError)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ jobId: job.id }, 201)
}
