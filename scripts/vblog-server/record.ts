// scripts/vblog-server/record.ts
import { Request, Response } from 'express'
import { chromium } from 'playwright'

interface RecordRequest {
  jobId: string
  toolUrl: string
  sections: {
    actions: string[]
    duration: number
  }[]
  r2UploadUrl: string // callback URL to upload result
}

export async function handleRecord(req: Request, res: Response) {
  const body = req.body as RecordRequest

  try {
    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: { dir: '/tmp/vblog-recordings', size: { width: 1920, height: 1080 } },
    })

    const page = await context.newPage()

    // Add custom cursor overlay
    await page.addStyleTag({
      content: `* { cursor: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="%233D6AF2" opacity="0.7"/></svg>') 12 12, auto !important; }`,
    })

    await page.goto(body.toolUrl)
    await page.waitForLoadState('networkidle')

    // Execute actions for each section
    for (const section of body.sections) {
      for (const action of section.actions) {
        await executeAction(page, action)
      }
    }

    await page.waitForTimeout(1000) // buffer
    await context.close()
    await browser.close()

    // Get recorded video path
    const videoPath = await page.video()?.path()

    // Return path (caller handles R2 upload)
    res.json({ ok: true, videoPath })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Recording failed'
    res.status(500).json({ error: msg })
  }
}

async function executeAction(page: any, action: string) {
  const parts = action.split(' ')
  const cmd = parts[0]

  switch (cmd) {
    case 'goto':
      await page.goto(parts.slice(1).join(' '))
      break
    case 'click':
      await page.click(parts.slice(1).join(' '))
      break
    case 'type': {
      const selector = parts[1]
      const text = action.match(/'([^']+)'/)?.[1] || ''
      for (const char of text) {
        await page.type(selector, char)
        await page.waitForTimeout(80 + Math.random() * 40)
      }
      break
    }
    case 'wait':
      await page.waitForTimeout(parseInt(parts[1]) || 1000)
      break
    case 'scroll':
      await page.evaluate((px: number) => window.scrollBy({ top: px, behavior: 'smooth' }), parseInt(parts[2]) || 300)
      await page.waitForTimeout(500)
      break
    default:
      console.warn(`[vblog] Unknown action: ${cmd}`)
  }

  // Natural pause between actions
  await page.waitForTimeout(300 + Math.random() * 200)
}
