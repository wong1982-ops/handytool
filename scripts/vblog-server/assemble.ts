// scripts/vblog-server/assemble.ts
import { Request, Response } from 'express'
import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'

interface AssembleRequest {
  jobId: string
  introUrl?: string
  outroUrl?: string
  bgmUrl?: string
  screenRecordingUrl: string
  voiceoverUrl: string
  titleCardUrl: string
  endCardUrl: string
}

export async function handleAssemble(req: Request, res: Response) {
  const body = req.body as AssembleRequest
  const workDir = `/tmp/vblog-assembly/${body.jobId}`

  try {
    mkdirSync(workDir, { recursive: true })

    // Download all assets
    const downloads: Record<string, string> = {}
    const assets: [string, string | undefined][] = [
      ['screen.webm', body.screenRecordingUrl],
      ['voice.mp3', body.voiceoverUrl],
      ['title.png', body.titleCardUrl],
      ['end.png', body.endCardUrl],
      ['intro.mp4', body.introUrl],
      ['outro.mp4', body.outroUrl],
      ['bgm.mp3', body.bgmUrl],
    ]

    for (const [name, url] of assets) {
      if (!url) continue
      const filePath = path.join(workDir, name)
      const response = await fetch(url)
      const buffer = Buffer.from(await response.arrayBuffer())
      require('fs').writeFileSync(filePath, buffer)
      downloads[name] = filePath
    }

    // Build FFmpeg filter complex
    const outputPath = path.join(workDir, 'master.mp4')
    const inputs: string[] = []
    const filters: string[] = []

    // Simple approach: overlay voice on screen recording, add intro/outro if available
    let cmd = 'ffmpeg -y'

    if (downloads['intro.mp4']) {
      cmd += ` -i "${downloads['intro.mp4']}"`
    }
    cmd += ` -loop 1 -t 3 -i "${downloads['title.png']}"`
    cmd += ` -i "${downloads['screen.webm']}"`
    if (downloads['end.png']) {
      cmd += ` -loop 1 -t 5 -i "${downloads['end.png']}"`
    }
    if (downloads['outro.mp4']) {
      cmd += ` -i "${downloads['outro.mp4']}"`
    }
    cmd += ` -i "${downloads['voice.mp3']}"`

    if (downloads['bgm.mp3']) {
      cmd += ` -i "${downloads['bgm.mp3']}"`
    }

    // For v1: simple concat + audio mix
    cmd += ` -filter_complex "concat=n=3:v=1:a=0[v];[v]scale=1920:1080[vout]"`
    cmd += ` -map "[vout]" -map 4:a`  // voice as primary audio
    cmd += ` -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 192k`
    cmd += ` -movflags +faststart "${outputPath}"`

    execSync(cmd, { cwd: workDir, timeout: 120000 })

    res.json({ ok: true, outputPath })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Assembly failed'
    res.status(500).json({ error: msg })
  }
}
