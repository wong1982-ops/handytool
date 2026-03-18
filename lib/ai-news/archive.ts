import { getAdminSupabase } from '@/lib/supabase/admin'

const ARCHIVE_AFTER_DAYS = 90

/**
 * Move AI news items older than 90 days from `ai_news` to `ai_news_archive`.
 * Returns the number of archived rows.
 */
export async function archiveOldNews(): Promise<number> {
  const supabase = getAdminSupabase()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - ARCHIVE_AFTER_DAYS)
  const cutoffIso = cutoff.toISOString()

  const { data: oldItems, error: selectError } = await supabase
    .from('ai_news')
    .select('*')
    .eq('is_active', true)
    .lt('posted_at', cutoffIso)
    .limit(500)

  if (selectError || !oldItems || oldItems.length === 0) {
    if (selectError) console.error('[ai-radar] Archive select error:', selectError.message)
    return 0
  }

  const { error: insertError } = await supabase
    .from('ai_news_archive')
    .upsert(oldItems, { onConflict: 'source,source_id', ignoreDuplicates: true })

  if (insertError) {
    console.error('[ai-radar] Archive insert error:', insertError.message)
    return 0
  }

  const ids = oldItems.map((item) => item.id)
  const { error: updateError } = await supabase
    .from('ai_news')
    .update({ is_active: false })
    .in('id', ids)

  if (updateError) {
    console.error('[ai-radar] Archive update error:', updateError.message)
  }

  return oldItems.length
}
