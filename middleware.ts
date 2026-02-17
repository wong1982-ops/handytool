import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  process.env.ALLOWED_ORIGIN,
].filter(Boolean) as string[]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- CORS for API routes ---
  if (pathname.startsWith('/api')) {
    const origin = request.headers.get('origin')

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin':
            origin && ALLOWED_ORIGINS.includes(origin) ? origin : '',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    const response = NextResponse.next()
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    return response
  }

  // --- Supabase session refresh for all other routes ---
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
