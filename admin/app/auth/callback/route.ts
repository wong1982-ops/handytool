import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAILS = [
  'loicwong1982@gmail.com',
]

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
  const next = rawNext && isValidRedirectPath(rawNext) ? rawNext : '/analytics'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Verify the user is an admin
      const { data: { user } } = await supabase.auth.getUser()

      if (user && ADMIN_EMAILS.includes(user.email ?? '')) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      // Not an admin — sign them out and redirect to login with error
      await supabase.auth.signOut()
      return NextResponse.redirect(`${origin}/login?error=unauthorized`)
    }

    console.error('Admin OAuth callback failed:', {
      errorMessage: error.message,
      errorStatus: error.status,
    })
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
