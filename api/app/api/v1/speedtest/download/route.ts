import { type NextRequest } from 'next/server'
import { randomBytes } from 'node:crypto'

export const dynamic = 'force-dynamic'

const CHUNK_SIZE = 65536 // 64 KB
const DEFAULT_SIZE_MB = 25
const MAX_SIZE_MB = 100

export async function GET(request: NextRequest) {
  const sizeParam = request.nextUrl.searchParams.get('size')
  const sizeMB = Math.min(
    Math.max(parseInt(sizeParam || String(DEFAULT_SIZE_MB), 10) || DEFAULT_SIZE_MB, 1),
    MAX_SIZE_MB,
  )
  const totalBytes = sizeMB * 1024 * 1024

  let bytesSent = 0

  const stream = new ReadableStream({
    pull(controller) {
      const remaining = totalBytes - bytesSent
      if (remaining <= 0) {
        controller.close()
        return
      }
      const chunkSize = Math.min(CHUNK_SIZE, remaining)
      const chunk = randomBytes(chunkSize)
      controller.enqueue(new Uint8Array(chunk))
      bytesSent += chunkSize
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(totalBytes),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
