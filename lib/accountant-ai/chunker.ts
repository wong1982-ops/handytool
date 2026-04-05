/**
 * Splits scraped text content into overlapping chunks suitable for embedding.
 * Target: ~500 tokens (2000 chars) per chunk, 50-token (200 char) overlap.
 * Tries to break at sentence boundaries where possible.
 */

const CHUNK_SIZE = 2000
const CHUNK_OVERLAP = 200

export interface Chunk {
  content: string
  chunkIndex: number
  metadata: {
    url: string
    title: string
    source: string
  }
}

/**
 * Splits a single text into overlapping chunks, preferring sentence boundaries.
 */
function splitIntoChunks(text: string): string[] {
  if (text.length <= CHUNK_SIZE) {
    return [text]
  }

  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = start + CHUNK_SIZE

    if (end >= text.length) {
      // Last chunk — take whatever is left
      chunks.push(text.slice(start).trim())
      break
    }

    // Try to find a sentence boundary (. ! ?) within the last 200 chars of the window
    const window = text.slice(start, end)
    const sentenceEndRegex = /[.!?]\s+/g
    let lastBoundary = -1
    let match: RegExpExecArray | null

    while ((match = sentenceEndRegex.exec(window)) !== null) {
      if (match.index > CHUNK_SIZE - 400) {
        lastBoundary = match.index + match[0].length
      }
    }

    const splitAt = lastBoundary > 0 ? start + lastBoundary : end

    chunks.push(text.slice(start, splitAt).trim())

    // Next chunk starts with overlap
    start = Math.max(splitAt - CHUNK_OVERLAP, start + 1)
  }

  return chunks.filter((c) => c.length > 0)
}

/**
 * Chunks an array of scraped pages into fixed-size overlapping segments.
 */
export function chunkPages(
  pages: Array<{ url: string; title: string; source: string; content: string }>,
): Chunk[] {
  const chunks: Chunk[] = []

  for (const page of pages) {
    const segments = splitIntoChunks(page.content)

    segments.forEach((segment, index) => {
      chunks.push({
        content: segment,
        chunkIndex: index,
        metadata: {
          url: page.url,
          title: page.title,
          source: page.source,
        },
      })
    })
  }

  return chunks
}
