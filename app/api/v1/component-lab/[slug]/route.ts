// app/api/v1/component-lab/[slug]/route.ts
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('components_library')
    .select(
      'id, name, slug, tags, prompt, settings, code_react, code_vue, code_svelte, code_html, thumbnail_url, is_public, copy_count, created_at, updated_at',
    )
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (error || !data) {
    return API_ERRORS.NOT_FOUND('Component')
  }

  return apiSuccess({ component: data })
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  const supabase = await createClient()

  const { error } = await supabase.rpc('increment_copy_count', { p_slug: slug })

  if (error) {
    // Fallback: manual increment
    const { data: existing } = await supabase
      .from('components_library')
      .select('id, copy_count')
      .eq('slug', slug)
      .eq('is_public', true)
      .single()

    if (existing) {
      await supabase
        .from('components_library')
        .update({ copy_count: (existing.copy_count ?? 0) + 1 })
        .eq('id', existing.id)
    }
  }

  return apiSuccess({ ok: true })
}
