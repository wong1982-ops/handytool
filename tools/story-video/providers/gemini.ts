// tools/story-video/providers/gemini.ts

import type { ArtStyle, CharacterBible, ScreenplayScene, Screenplay, VideoProvider } from '../types'

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

const IMAGEN_MODEL = 'imagen-4.0-generate-001'

/**
 * Generate a character portrait from text description using Imagen 4.0
 */
export async function generateCharacterPortrait(
  name: string,
  description: string,
  artStyle: ArtStyle
): Promise<Buffer> {
  const styleDesc = ART_STYLE_PREFIXES[artStyle] || 'cartoon animation style'
  const prompt = `Character portrait of ${name}: ${description}. ${styleDesc}. Full body portrait, centered composition, clean background, detailed features, professional character design reference sheet.`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGEN_MODEL}:predict?key=${GEMINI_API_KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: '1:1',
        outputOptions: { mimeType: 'image/png' },
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Imagen 4.0 error ${response.status}: ${err.substring(0, 200)}`)
  }

  const data = await response.json()
  const imgB64 = data.predictions?.[0]?.bytesBase64Encoded
  if (!imgB64) throw new Error('No image data from Imagen 4.0')

  return Buffer.from(imgB64, 'base64')
}

/**
 * Describe a character's appearance from their portrait using Gemini vision
 */
export async function describeCharacterAppearance(
  existingDescription: string,
  name: string,
  role: string,
  artStyle: ArtStyle
): Promise<string> {
  const styleDesc = ART_STYLE_PREFIXES[artStyle] || 'animation style'

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Generate a detailed visual appearance description for a character in a ${styleDesc} video.

Character name: ${name}
Role: ${role}
Description: ${existingDescription}

Write exactly 2-3 sentences describing ONLY their physical appearance: hair color/style, eye color, skin tone, clothing with specific colors, body build, age appearance, and distinguishing features. This will be used as a reference prompt to maintain consistent character appearance across multiple video scenes. Be very specific about colors and details.`,
        }],
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 200,
      },
    }),
  })

  if (!response.ok) {
    return `${name}: ${existingDescription}. Maintain this exact appearance throughout.`
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  return text?.trim() || `${name}: ${existingDescription}. Maintain this exact appearance throughout.`
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
    characterBible?: CharacterBible
    characterPortraits?: { name: string; imageUrl: string }[]
    previousSceneUrl?: string
  }): Promise<Buffer> {
    const { scene, artStyle, characterBible } = params

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured')
    }

    const prompt = this.buildVideoPrompt(scene, artStyle, characterBible)

    console.log(
      `[story-video] Generating scene ${scene.sceneIndex} VIDEO via Veo 3.1 (${artStyle}, ${scene.duration}s)`
    )

    const videoBuffer = await this.generateVideo(prompt, Math.min(scene.duration, 8))
    console.log(`[story-video] Scene ${scene.sceneIndex} video generated: ${videoBuffer.length} bytes`)
    return videoBuffer
  }

  /**
   * Attempt to generate the entire story as a single video.
   * Returns null if the model can't handle it (fallback to scene-by-scene).
   */
  async generateFullStoryVideo(params: {
    screenplay: Screenplay
    characterBible: CharacterBible
    artStyle: ArtStyle
  }): Promise<Buffer | null> {
    const { screenplay, characterBible, artStyle } = params

    if (!GEMINI_API_KEY) return null

    const parts: string[] = []

    parts.push(`Animation style: ${ART_STYLE_PREFIXES[artStyle]}`)

    // Full character bible
    if (characterBible.characters.length > 0) {
      parts.push('CHARACTER APPEARANCES (maintain exact consistency throughout entire video):')
      for (const char of characterBible.characters) {
        parts.push(`- ${char.name} (${char.role}): ${char.appearancePrompt}`)
      }
    }

    // All scenes as a continuous story
    parts.push('STORY SEQUENCE (generate as one continuous video with smooth transitions):')
    for (const scene of screenplay.scenes) {
      const sceneDesc = [
        `Scene ${scene.sceneIndex + 1}: ${scene.description}`,
        scene.cameraDirection ? `Camera: ${scene.cameraDirection}` : '',
        scene.mood ? `Mood: ${scene.mood}` : '',
        `Duration: ~${scene.duration}s`,
      ].filter(Boolean).join('. ')
      parts.push(sceneDesc)
    }

    parts.push(
      `Total target duration: ${screenplay.totalDuration} seconds. ` +
      'Smooth transitions between scenes. Consistent character appearances throughout. ' +
      'Cinematic quality, 16:9 widescreen. No text or writing visible.'
    )

    const prompt = parts.join('\n')
    const targetDuration = Math.min(screenplay.totalDuration, 60) // cap at 60s for safety

    console.log(`[story-video] Attempting full-story generation (${screenplay.scenes.length} scenes, ~${targetDuration}s)`)

    try {
      const videoBuffer = await this.generateVideo(prompt, targetDuration)
      console.log(`[story-video] Full-story video generated: ${videoBuffer.length} bytes`)
      return videoBuffer
    } catch (e: any) {
      console.warn(`[story-video] Full-story generation failed: ${e.message}. Will fallback to scene-by-scene.`)
      return null
    }
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
          durationSeconds: Math.min(Math.max(durationSeconds, 4), 8),
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
        // Extract video — handle both response formats
        const videoData =
          pollData.response?.generateVideoResponse?.generatedSamples?.[0]?.video
          ?? pollData.response?.generatedVideos?.[0]?.video

        if (!videoData) {
          throw new Error(`No video in Veo 3.1 response. Keys: ${JSON.stringify(Object.keys(pollData.response || {}))}`)
        }

        // Download the video file (follow redirects)
        if (videoData.uri) {
          const downloadUrl = videoData.uri.includes('?')
            ? `${videoData.uri}&key=${GEMINI_API_KEY}`
            : `${videoData.uri}?key=${GEMINI_API_KEY}`

          // Veo returns a 302 redirect — need to follow it
          const videoRes = await fetch(downloadUrl, { redirect: 'follow' })
          if (!videoRes.ok) throw new Error(`Failed to download video: ${videoRes.status}`)
          const buffer = Buffer.from(await videoRes.arrayBuffer())
          if (buffer.length < 1000) {
            throw new Error(`Video download too small (${buffer.length} bytes) — likely an error response`)
          }
          return buffer
        }

        // Or inline base64 data
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

  private buildVideoPrompt(scene: ScreenplayScene, artStyle: ArtStyle, characterBible?: CharacterBible): string {
    const parts: string[] = []

    parts.push(`Animation style: ${ART_STYLE_PREFIXES[artStyle]}`)

    // CHARACTER BIBLE — inject detailed appearance for every character in this scene
    if (characterBible && characterBible.characters.length > 0) {
      const sceneChars = characterBible.characters.filter(
        c => scene.characters.includes(c.name)
      )
      if (sceneChars.length > 0) {
        parts.push('IMPORTANT - Maintain exact character appearances:')
        for (const char of sceneChars) {
          parts.push(`${char.name}: ${char.appearancePrompt}`)
        }
      }
    }

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
