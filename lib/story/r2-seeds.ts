/**
 * R2 storage helpers for illustration seed buffers.
 *
 * Seed buffers (raw image data, potentially >4MB) are stored in R2 under
 * `jobs/{jobId}/seed-{page}` for sequential page illustration chaining.
 *
 * Each page's buffer is passed as `previousPageImage` to the next page
 * for visual continuity (Strategy 5: Re-use Successful Images).
 */

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { uploadToR2, deleteManyFromR2 } from '@/lib/storage/r2'

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!
const R2_BUCKET = process.env.R2_BUCKET || 'story-assets'

let _client: S3Client | null = null

function getClient(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    })
  }
  return _client
}

/** R2 key for a seed buffer. */
function seedKey(jobId: string, page: number): string {
  return `jobs/${jobId}/seed-${page}`
}

/**
 * Upload a page's image buffer to R2 as a seed for the next page.
 * Overwrites if already exists (idempotent).
 */
export async function uploadSeedBuffer(
  jobId: string,
  page: number,
  buffer: Buffer,
): Promise<void> {
  const key = seedKey(jobId, page)
  await uploadToR2(key, buffer, 'application/octet-stream', { upsert: true })
  console.log(`[r2-seeds] Uploaded seed for job ${jobId} page ${page} (${(buffer.length / 1024).toFixed(0)} KB)`)
}

/**
 * Download the previous page's seed buffer from R2.
 * Returns null if the seed doesn't exist (first page or seed lost).
 */
export async function downloadSeedBuffer(
  jobId: string,
  page: number,
): Promise<Buffer | null> {
  const key = seedKey(jobId, page)
  try {
    const client = getClient()
    const response = await client.send(
      new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      }),
    )

    if (!response.Body) return null

    // Convert readable stream to Buffer
    const chunks: Uint8Array[] = []
    const stream = response.Body as AsyncIterable<Uint8Array>
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)
    console.log(`[r2-seeds] Downloaded seed for job ${jobId} page ${page} (${(buffer.length / 1024).toFixed(0)} KB)`)
    return buffer
  } catch (err: unknown) {
    // NoSuchKey = seed doesn't exist yet (expected for page 1)
    if (err instanceof Error && 'name' in err && err.name === 'NoSuchKey') {
      return null
    }
    console.error(`[r2-seeds] Failed to download seed for job ${jobId} page ${page}:`, err)
    return null
  }
}

/**
 * Delete all seed buffers for a job (cleanup after completion or failure).
 * Tolerates missing keys.
 */
export async function cleanupJobSeeds(
  jobId: string,
  totalPages: number,
): Promise<void> {
  if (totalPages <= 0) return

  // Build list of all possible seed keys: cover seed + page seeds
  const keys: string[] = []
  for (let page = 0; page <= totalPages; page++) {
    keys.push(seedKey(jobId, page))
  }

  try {
    await deleteManyFromR2(keys)
    console.log(`[r2-seeds] Cleaned up ${keys.length} seeds for job ${jobId}`)
  } catch (err) {
    console.error(`[r2-seeds] Failed to cleanup seeds for job ${jobId}:`, err)
  }
}
