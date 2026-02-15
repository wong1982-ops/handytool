import { type NextRequest } from 'next/server'
import { apiSuccess } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const buffer = await request.arrayBuffer()
  return apiSuccess({ bytesReceived: buffer.byteLength })
}
