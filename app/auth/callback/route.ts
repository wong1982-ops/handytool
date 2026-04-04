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
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const createdAt = new Date(user.created_at).getTime()
        const isNewUser = Date.now() - createdAt < 60_000

        if (isNewUser) {
          const cookieHeader = request.headers.get('cookie') || ''
          const refMatch = cookieHeader.match(/tk_ref=([a-zA-Z0-9]+)/)

          if (refMatch) {
            try {
              await fetch(`${origin}/api/v1/referral/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referralCode: refMatch[1], referredUserId: user.id }),
              })
            } catch (err) {
              console.error('[auth/callback] Referral claim failed:', err)
            }
          }
        }
      }

      const response = NextResponse.redirect(`${origin}${next}`)
      response.cookies.set('tk_ref', '', { maxAge: 0, path: '/' })
      return response
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
