import { getAdminSupabase } from '@/lib/supabase/admin'

const ARCHIVE_AFTER_DAYS = 90

/**
 * Move jobs older than 90 days from `jobs` to `jobs_archive`.
 * Returns the number of archived rows.
 */
export async function archiveOldJobs(): Promise<number> {
  const supabase = getAdminSupabase()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - ARCHIVE_AFTER_DAYS)
  const cutoffIso = cutoff.toISOString()

  // Select old active jobs
  const { data: oldJobs, error: selectError } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .lt('posted_at', cutoffIso)
    .limit(500) as { data: Record<string, unknown>[] | null; error: { message: string } | null }

  if (selectError || !oldJobs || oldJobs.length === 0) {
    if (selectError) console.error('[job-radar] Archive select error:', selectError.message)
    return 0
  }

  // Insert into archive
  const { error: insertError } = await supabase
    .from('jobs_archive')
    .upsert(oldJobs as never[], { onConflict: 'source,source_id,category', ignoreDuplicates: true })

  if (insertError) {
    console.error('[job-radar] Archive insert error:', insertError.message)
    return 0
  }

  // Mark as inactive in jobs table
  const ids = oldJobs.map((j) => j.id as string)
  const { error: updateError } = await supabase
    .from('jobs')
    .update({ is_active: false } as never)
    .in('id', ids)

  if (updateError) {
    console.error('[job-radar] Archive update error:', updateError.message)
  }

  return oldJobs.length
}
