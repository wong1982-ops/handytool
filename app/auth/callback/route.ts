import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function isValidRedirectPath(path: string): boolean {
  if (!path.startsWith('/')) return false
  if (path.includes('://')) return false
  if (path.includes('//')) return false
  return true
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next')
  const next = rawNext && isValidRedirectPath(rawNext) ? rawNext : '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('OAuth callback exchange failed:', {
      errorMessage: error.message,
      errorStatus: error.status,
    })
  } else {
    console.warn('OAuth callback received without code')
  }

  // Auth error — redirect to home with error param
  return NextResponse.redirect(`${origin}/?auth_error=true`)
}
