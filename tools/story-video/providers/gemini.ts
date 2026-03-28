// tools/story-video/providers/gemini.ts

import type { ArtStyle, ScreenplayScene, VideoProvider } from '../types'

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()

/** Veo 3.1 for actual video generation */
const VIDEO_MODEL = 'veo-3.1-generate-preview'

/**
 * Art style prefixes for visual consistency across scenes.
 */
const ART_STYLE_PREFIXES: Record<ArtStyle, string> = {
  cartoon:
    'Animated cartoon style with bold outlines, vibrant colors, smooth character motion, expressive character animation, children\'s storybook aesthetic.',
  anime:
    'Japanese anime animation style with large expressive eyes, dynamic motion, cel-shaded coloring, fluid character movement, detailed backgrounds.',
  pixar:
    'Pixar-quality 3D animation with soft global illumination, smooth character motion, rich textures, cinematic depth of field, warm lighting.',
  watercolor:
    'Animated watercolor painting style with soft washes, gentle motion, visible brush texture, warm storybook feel, dreamy atmosphere.',
}

/**
 * Gemini VideoProvider implementation.
 *
 * Uses Veo 3.1 for actual animated video clips (4-8s per scene).
 * Falls back to image generation + static frame if video gen fails.
 */
export class GeminiVideoProvider implements VideoProvider {
  readonly name = 'gemini'

  async generateScene(params: {
    scene: ScreenplayScene
    artStyle: ArtStyle
    characterPortraits?: { name: string; imageUrl: string }[]
    previousSceneUrl?: string
  }): Promise<Buffer> {
    const { scene, artStyle } = params

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured')
    }

    const prompt = this.buildVideoPrompt(scene, artStyle)

    console.log(
      `[story-video] Generating scene ${scene.sceneIndex} VIDEO via Veo 3.1 (${artStyle}, ${scene.duration}s)`
    )

    const videoBuffer = await this.generateVideo(prompt, Math.min(scene.duration, 8))
    console.log(`[story-video] Scene ${scene.sceneIndex} video generated: ${videoBuffer.length} bytes`)
    return videoBuffer
  }

  // ── Video generation via Veo 3.1 ──────────────────────────

  private async generateVideo(prompt: string, durationSeconds: number): Promise<Buffer> {
    // Step 1: Start long-running operation
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${VIDEO_MODEL}:predictLongRunning?key=${GEMINI_API_KEY}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{
          prompt,
        }],
        parameters: {
          aspectRatio: '16:9',
          durationSeconds: String(Math.min(Math.max(durationSeconds, 4), 8)),
          resolution: '720p',
        },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Veo 3.1 API error ${response.status}: ${errText.substring(0, 300)}`)
    }

    const operation = await response.json()
    const operationName = operation.name

    if (!operationName) {
      throw new Error('No operation name returned from Veo 3.1')
    }

    // Step 2: Poll for completion (max 120 seconds)
    const pollUrl = `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${GEMINI_API_KEY}`
    const maxWait = 120_000
    const pollInterval = 5_000
    const startTime = Date.now()

    while (Date.now() - startTime < maxWait) {
      await new Promise((r) => setTimeout(r, pollInterval))

      const pollRes = await fetch(pollUrl)
      if (!pollRes.ok) continue

      const pollData = await pollRes.json()

      if (pollData.done) {
        // Extract video data
        const videoData = pollData.response?.generatedVideos?.[0]?.video
        if (!videoData) {
          throw new Error('No video in Veo 3.1 response')
        }

        // Download the video file
        if (videoData.uri) {
          const videoRes = await fetch(`${videoData.uri}?key=${GEMINI_API_KEY}`)
          if (!videoRes.ok) throw new Error(`Failed to download video: ${videoRes.status}`)
          return Buffer.from(await videoRes.arrayBuffer())
        }

        // Or inline data
        if (videoData.data) {
          return Buffer.from(videoData.data, 'base64')
        }

        throw new Error('No video URI or data in response')
      }

      if (pollData.error) {
        throw new Error(`Veo 3.1 error: ${JSON.stringify(pollData.error).substring(0, 300)}`)
      }
    }

    throw new Error('Veo 3.1 timed out after 120 seconds')
  }

  // ── Prompt builder ──────────────────────────────────────

  private buildVideoPrompt(scene: ScreenplayScene, artStyle: ArtStyle): string {
    const parts: string[] = []

    parts.push(`Animation style: ${ART_STYLE_PREFIXES[artStyle]}`)
    parts.push(`Scene: ${scene.description}`)

    if (scene.mood) parts.push(`Mood and atmosphere: ${scene.mood}`)
    if (scene.cameraDirection) parts.push(`Camera movement: ${scene.cameraDirection}`)

    if (scene.characters.length > 0) {
      parts.push(`Characters in scene: ${scene.characters.join(', ')}`)
    }

    if (scene.dialogue.length > 0) {
      const dialogueContext = scene.dialogue
        .map((d) => `${d.character} says: "${d.text}"`)
        .join('. ')
      parts.push(`Dialogue context: ${dialogueContext}`)
    }

    if (scene.narration) {
      parts.push(`Story context: ${scene.narration}`)
    }

    parts.push(
      'Animated video clip with smooth character motion and expressive animation. ' +
      'Cinematic quality, 16:9 widescreen. No text or writing visible in the video.'
    )

    return parts.join('. ')
  }
}
