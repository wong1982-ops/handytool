// scripts/vblog-server/adapt.ts
import { Request, Response } from 'express'
import { execSync } from 'child_process'
import path from 'path'

interface AdaptRequest {
  jobId: string
  masterUrl: string
  targetDuration: number
}

export async function handleAdapt(req: Request, res: Response) {
  const body = req.body as AdaptRequest
  const workDir = `/tmp/vblog-adapt/${body.jobId}`

  try {
    require('fs').mkdirSync(workDir, { recursive: true })

    // Download master
    const masterPath = path.join(workDir, 'master.mp4')
    const response = await fetch(body.masterUrl)
    require('fs').writeFileSync(masterPath, Buffer.from(await response.arrayBuffer()))

    const variants: Record<string, string> = {}

    // TikTok: 9:16, max 60s
    const tiktokPath = path.join(workDir, 'tiktok.mp4')
    execSync(
      `ffmpeg -y -i "${masterPath}" -t 60 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:v libx264 -preset fast -crf 23 -c:a aac "${tiktokPath}"`,
      { timeout: 60000 },
    )
    variants.tiktok = tiktokPath

    // Reels: 9:16, max 90s
    const reelsPath = path.join(workDir, 'reels.mp4')
    execSync(
      `ffmpeg -y -i "${masterPath}" -t 90 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:v libx264 -preset fast -crf 23 -c:a aac "${reelsPath}"`,
      { timeout: 60000 },
    )
    variants.reels = reelsPath

    // Twitter: 1:1, max 140s
    const twitterPath = path.join(workDir, 'twitter.mp4')
    execSync(
      `ffmpeg -y -i "${masterPath}" -t 140 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=1080:1080" -c:v libx264 -preset fast -crf 23 -c:a aac "${twitterPath}"`,
      { timeout: 60000 },
    )
    variants.twitter = twitterPath

    res.json({ ok: true, variants })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Adaptation failed'
    res.status(500).json({ error: msg })
  }
}
