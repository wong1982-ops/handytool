import { NextRequest, NextResponse } from 'next/server'
import { UAParser } from 'ua-parser-js'
import { createClient } from '@/lib/supabase/server'

const DEVICE_MAP: Record<string, string> = {
  console: 'desktop',
  mobile: 'mobile',
  tablet: 'tablet',
  smarttv: 'desktop',
  wearable: 'mobile',
  embedded: 'desktop',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { session_id, page_path, tool_slug, referrer, duration_ms } = body

    // Basic validation
    if (!session_id || typeof session_id !== 'string' || session_id.length > 100) {
      return NextResponse.json({ error: 'Invalid session_id' }, { status: 400 })
    }
    if (!page_path || typeof page_path !== 'string' || page_path.length > 500) {
      return NextResponse.json({ error: 'Invalid page_path' }, { status: 400 })
    }
    if (tool_slug !== undefined && tool_slug !== null && (typeof tool_slug !== 'string' || tool_slug.length > 100)) {
      return NextResponse.json({ error: 'Invalid tool_slug' }, { status: 400 })
    }
    if (duration_ms !== undefined && duration_ms !== null && (typeof duration_ms !== 'number' || duration_ms < 0 || duration_ms > 86400000)) {
      return NextResponse.json({ error: 'Invalid duration_ms' }, { status: 400 })
    }

    // Parse User-Agent
    const uaResult = UAParser(request.headers.get('user-agent') || '')
    const deviceResult = uaResult.device
    const browserResult = uaResult.browser
    const osResult = uaResult.os

    const device_type = DEVICE_MAP[deviceResult.type || ''] || 'desktop'
    const browser = browserResult.name || 'Unknown'
    const os = osResult.name || 'Unknown'

    // Insert into Supabase
    const supabase = await createClient()
    const { error } = await supabase.from('page_events').insert({
      session_id,
      page_path,
      tool_slug: tool_slug || null,
      referrer: typeof referrer === 'string' ? referrer.slice(0, 500) : null,
      duration_ms: typeof duration_ms === 'number' ? Math.round(duration_ms) : null,
      device_type,
      browser,
      os,
    })

    if (error) {
      console.error('Analytics insert error:', error.message)
      return new NextResponse(null, { status: 204 })
    }

    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
