import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ai_news')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return API_ERRORS.NOT_FOUND('News item')
  }

  return apiSuccess(data)
}
