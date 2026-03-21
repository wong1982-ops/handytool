/**
 * Shared fal.ai helper for Image Editor AI routes.
 */

export async function callFalAi(model: string, input: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`https://fal.run/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${process.env.FAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`fal.ai error: ${res.status} ${err}`)
  }
  return res.json()
}

export async function fetchImageAsBase64(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.status}`)
  }
  const buffer = Buffer.from(await res.arrayBuffer())
  const contentType = res.headers.get('content-type') || 'image/png'
  return `data:${contentType};base64,${buffer.toString('base64')}`
}
