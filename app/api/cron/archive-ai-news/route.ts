import { NextRequest, NextResponse } from 'next/server'
import { archiveOldNews } from '@/lib/ai-news/archive'

const CRON_SECRET = process.env.CRON_SECRET || ''

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && cronSecret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const archived = await archiveOldNews()
    console.log(`[ai-radar] Archived ${archived} old news items`)
    return NextResponse.json({ ok: true, archived })
  } catch (error) {
    console.error('[ai-radar] Archive failed:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
