import { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3'

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!
const R2_BUCKET = process.env.R2_BUCKET || 'story-assets'
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-8feef024ac6a4d26b109ddfe22f033c1.r2.dev'

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

/**
 * Upload a file to R2 and return its public URL.
 */
export async function uploadToR2(
  path: string,
  body: Buffer | Uint8Array,
  contentType: string,
  options?: { upsert?: boolean },
): Promise<string> {
  const client = getClient()
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: path,
      Body: body,
      ContentType: contentType,
      CacheControl: options?.upsert ? 'no-cache' : 'public, max-age=31536000, immutable',
    }),
  )
  return getR2PublicUrl(path)
}

/**
 * Get the public URL for an R2 object.
 */
export function getR2PublicUrl(path: string): string {
  return `${R2_PUBLIC_URL}/${path}`
}

/**
 * Delete a single object from R2.
 */
export async function deleteFromR2(path: string): Promise<void> {
  const client = getClient()
  await client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: path,
    }),
  )
}

/**
 * Delete multiple objects from R2.
 */
export async function deleteManyFromR2(paths: string[]): Promise<void> {
  if (paths.length === 0) return
  const client = getClient()
  await client.send(
    new DeleteObjectsCommand({
      Bucket: R2_BUCKET,
      Delete: {
        Objects: paths.map((key) => ({ Key: key })),
        Quiet: true,
      },
    }),
  )
}
