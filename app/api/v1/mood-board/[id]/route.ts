// app/api/v1/mood-board/[id]/route.ts
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError } from '@/lib/api/response'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mood_boards')
    .select('id, title, theme, elements, created_at')
    .eq('share_id', id)
    .eq('shared', true)
    .single()

  if (error || !data) {
    return apiError('Board not found', 'NOT_FOUND', 404)
  }

  return apiSuccess({ board: data })
}
