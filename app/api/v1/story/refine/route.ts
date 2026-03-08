import { API_ERRORS } from '@/lib/api/response'
import { refineRequestSchema } from '@/lib/story/types'
import { refineConceptStream } from '@/lib/story/enrich'

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const parsed = refineRequestSchema.safeParse(body)
  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(new TextEncoder().encode(sseEvent(data)))
      }

      try {
        for await (const event of refineConceptStream(parsed.data)) {
          if (event.type === 'chunk') {
            send({ type: 'chunk', text: event.text })
          } else if (event.type === 'done') {
            send({ type: 'done', concept: event.data.concept, reply: event.data.reply })
          }
        }
      } catch (err) {
        const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
        console.error('story/refine: AI call failed —', message)
        send({ type: 'error', message: 'Refinement failed. Please try again.' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
