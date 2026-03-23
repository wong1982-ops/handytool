/**
 * Generate showcase images for all 18 art styles using a sketch input.
 * Uploads original sketch + all transformed images to Cloudflare R2.
 *
 * Usage: npx tsx scripts/generate-showcase.ts ~/Downloads/mermaid-sketch.png
 *
 * Requires: GEMINI_API_KEY, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *           R2_BUCKET, R2_PUBLIC_URL in .env.local
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { readFileSync } from 'fs'
import { resolve, extname } from 'path'

// Load .env.local manually (no dotenv dependency)
const envPath = resolve(__dirname, '../.env.local')
const envContent = readFileSync(envPath, 'utf-8')
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx)
  const val = trimmed.slice(eqIdx + 1)
  if (!process.env[key]) process.env[key] = val
}

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!
const R2_ACCESS_KEY_ID = (process.env.R2_ACCESS_KEY_ID || '').replace(/[^\x20-\x7E]/g, '').trim()
const R2_SECRET_ACCESS_KEY = (process.env.R2_SECRET_ACCESS_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const R2_BUCKET = process.env.R2_BUCKET || 'story-assets'
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || ''

const GEMINI_MODEL = 'gemini-3.1-flash-image-preview'

const ART_STYLES = [
  { id: 'watercolor', name: 'Watercolor' },
  { id: 'oil-painting', name: 'Oil Painting' },
  { id: 'impressionist', name: 'Impressionist' },
  { id: 'van-gogh', name: 'Van Gogh' },
  { id: 'picasso', name: 'Picasso' },
  { id: 'chalk-pastel', name: 'Chalk / Pastel' },
  { id: 'cartoon', name: 'Cartoon' },
  { id: 'anime', name: 'Anime / Manga' },
  { id: 'pixel-art', name: 'Pixel Art' },
  { id: '3d-render', name: '3D Render' },
  { id: 'comic-book', name: 'Comic Book' },
  { id: 'pop-art', name: 'Pop Art' },
  { id: 'ghibli', name: 'Studio Ghibli' },
  { id: 'stained-glass', name: 'Stained Glass' },
  { id: 'steampunk', name: 'Steampunk' },
  { id: 'cyberpunk', name: 'Cyberpunk' },
  { id: 'claymation', name: 'Claymation' },
  { id: 'fantasy', name: 'Fantasy Illustration' },
]

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
})

function getMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase()
  const mimeMap: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
  }
  return mimeMap[ext] || 'image/png'
}

async function uploadToR2(key: string, body: Buffer, contentType: string): Promise<string> {
  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }))
  return `${R2_PUBLIC_URL}/${key}`
}

async function callGeminiImageGeneration(
  sketchBase64: string,
  sketchMime: string,
  prompt: string,
): Promise<Buffer> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inline_data: { mime_type: sketchMime, data: sketchBase64 } },
          { text: prompt },
        ],
      }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini API ${response.status}: ${errText.substring(0, 300)}`)
  }

  const data = await response.json()
  const parts = data.candidates?.[0]?.content?.parts
  if (!parts) throw new Error('No parts in Gemini response')

  for (const part of parts) {
    const imageData = part.inlineData?.data || part.inline_data?.data
    if (imageData) {
      return Buffer.from(imageData, 'base64')
    }
  }

  throw new Error('No image in Gemini response')
}

async function main() {
  const sketchPath = process.argv[2]
  if (!sketchPath) {
    console.error('Usage: npx tsx scripts/generate-showcase.ts <sketch-image-path>')
    process.exit(1)
  }

  const resolvedPath = resolve(sketchPath)
  console.log(`Reading sketch from: ${resolvedPath}`)

  const sketchBuffer = readFileSync(resolvedPath)
  const sketchMime = getMimeType(resolvedPath)
  const sketchBase64 = sketchBuffer.toString('base64')

  console.log(`Sketch size: ${(sketchBuffer.length / 1024).toFixed(1)} KB, mime: ${sketchMime}`)
  console.log()

  const urls: Record<string, string> = {}

  // Upload original sketch
  console.log('Uploading original sketch...')
  try {
    const originalKey = 'sketch-art/showcase/mermaid-original.png'
    const originalUrl = await uploadToR2(originalKey, sketchBuffer, sketchMime)
    urls['original'] = originalUrl
    console.log(`  OK: ${originalUrl}`)
  } catch (err) {
    console.error(`  FAILED: ${err instanceof Error ? err.message : err}`)
  }
  console.log()

  // Generate and upload each art style
  console.log(`Generating ${ART_STYLES.length} art style transformations...`)
  console.log()

  for (const style of ART_STYLES) {
    console.log(`Generating ${style.name}...`)
    try {
      const prompt = `Transform this sketch into beautiful ${style.name} art. Maintain the original composition and subjects but elevate it with professional ${style.name} artistic quality.`

      const imageBuffer = await callGeminiImageGeneration(sketchBase64, sketchMime, prompt)
      const key = `sketch-art/showcase/mermaid-${style.id}.png`
      const url = await uploadToR2(key, imageBuffer, 'image/png')

      urls[style.id] = url
      console.log(`  OK: ${url}`)
    } catch (err) {
      console.log(`  FAILED: ${err instanceof Error ? err.message : err}`)
    }

    // 2-second delay between API calls (rate limiting)
    await new Promise((r) => setTimeout(r, 2000))
  }

  console.log()
  console.log('=== Generated URLs (JSON) ===')
  console.log(JSON.stringify(urls, null, 2))
}

main().catch(console.error)
