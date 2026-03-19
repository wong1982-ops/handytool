// Web Worker for median cut color quantization
// Self-contained — no imports

interface WorkerInput {
  pixels: Uint8ClampedArray
  width: number
  height: number
  colorCount: number
}

interface RGB {
  r: number
  g: number
  b: number
}

interface Bucket {
  colors: RGB[]
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

function getRange(colors: RGB[], channel: 'r' | 'g' | 'b'): number {
  let min = 255
  let max = 0
  for (const c of colors) {
    if (c[channel] < min) min = c[channel]
    if (c[channel] > max) max = c[channel]
  }
  return max - min
}

function getWidestChannel(colors: RGB[]): 'r' | 'g' | 'b' {
  const rRange = getRange(colors, 'r')
  const gRange = getRange(colors, 'g')
  const bRange = getRange(colors, 'b')

  if (rRange >= gRange && rRange >= bRange) return 'r'
  if (gRange >= rRange && gRange >= bRange) return 'g'
  return 'b'
}

function splitBucket(bucket: Bucket): [Bucket, Bucket] {
  const channel = getWidestChannel(bucket.colors)
  bucket.colors.sort((a, b) => a[channel] - b[channel])
  const mid = Math.floor(bucket.colors.length / 2)
  return [
    { colors: bucket.colors.slice(0, mid) },
    { colors: bucket.colors.slice(mid) },
  ]
}

function averageBucket(bucket: Bucket): RGB {
  let rSum = 0
  let gSum = 0
  let bSum = 0
  const len = bucket.colors.length
  for (const c of bucket.colors) {
    rSum += c.r
    gSum += c.g
    bSum += c.b
  }
  return {
    r: Math.round(rSum / len),
    g: Math.round(gSum / len),
    b: Math.round(bSum / len),
  }
}

function medianCut(colors: RGB[], count: number): RGB[] {
  if (colors.length === 0) return []

  let buckets: Bucket[] = [{ colors }]

  while (buckets.length < count) {
    // Find bucket with most colors to split
    let maxIdx = 0
    let maxLen = 0
    for (let i = 0; i < buckets.length; i++) {
      if (buckets[i].colors.length > maxLen) {
        maxLen = buckets[i].colors.length
        maxIdx = i
      }
    }

    // Can't split a bucket with <= 1 color
    if (maxLen <= 1) break

    const [a, b] = splitBucket(buckets[maxIdx])
    buckets.splice(maxIdx, 1, a, b)
  }

  // Sort by bucket size (frequency) descending
  buckets.sort((a, b) => b.colors.length - a.colors.length)

  return buckets.map(averageBucket)
}

self.onmessage = function (e: MessageEvent<WorkerInput>) {
  try {
    const { pixels, width, height, colorCount } = e.data
    const totalPixels = width * height

    // Determine sampling step (skip pixels for large images)
    const step = totalPixels > 100000 ? Math.ceil(totalPixels / 100000) : 1

    const sampledColors: RGB[] = []

    for (let i = 0; i < totalPixels; i += step) {
      const offset = i * 4
      const r = pixels[offset]
      const g = pixels[offset + 1]
      const b = pixels[offset + 2]
      const a = pixels[offset + 3]

      // Skip fully transparent pixels
      if (a < 128) continue

      sampledColors.push({ r, g, b })
    }

    if (sampledColors.length === 0) {
      self.postMessage({ error: 'No visible pixels found in image' })
      return
    }

    const dominantColors = medianCut(sampledColors, colorCount)
    const hexColors = dominantColors.map((c) => rgbToHex(c.r, c.g, c.b))

    self.postMessage({ colors: hexColors })
  } catch (err) {
    self.postMessage({
      error: err instanceof Error ? err.message : 'Color extraction failed',
    })
  }
}
