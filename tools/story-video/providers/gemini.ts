// tools/story-video/providers/gemini.ts

import { GoogleGenAI } from '@google/genai'
import type { ArtStyle, ScreenplayScene, VideoProvider } from '../types'

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

/** Gemini model for high-quality scene image generation */
const IMAGE_MODEL = 'gemini-2.5-flash'

/**
 * Art style prefixes injected at the start of every scene prompt
 * to maintain visual consistency across the entire video.
 */
const ART_STYLE_PREFIXES: Record<ArtStyle, string> = {
  cartoon:
    'Children\'s cartoon illustration style with bold black outlines, flat vibrant colors, simple shapes, and expressive character poses.',
  anime:
    'Japanese anime illustration style with large expressive eyes, dynamic action lines, cel-shaded coloring, and detailed backgrounds.',
  pixar:
    'Pixar-quality 3D rendered illustration with soft global illumination, subsurface scattering on skin, rich detailed textures, and cinematic depth of field.',
  watercolor:
    'Delicate watercolor painting style with soft washes, visible paper texture, gentle color bleeding at edges, and a warm storybook feel.',
}

/**
 * Gemini VideoProvider implementation.
 *
 * For v1 this generates a HIGH QUALITY image per scene (not video).
 * The assembly step can animate these with Ken Burns effects.
 * When Gemini video generation is stable, swap in video gen here.
 */
export class GeminiVideoProvider implements VideoProvider {
  readonly name = 'gemini'

  async generateScene(params: {
    scene: ScreenplayScene
    artStyle: ArtStyle
    characterPortraits?: { name: string; imageUrl: string }[]
    previousSceneUrl?: string
  }): Promise<Buffer> {
    const { scene, artStyle, characterPortraits } = params

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured')
    }

    // Build the scene prompt
    const prompt = this.buildPrompt(scene, artStyle)

    // Build contents: character portrait references first, then text prompt
    const contents: (
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    )[] = []

    // Attach character portrait images as inline references
    if (characterPortraits?.length) {
      const portraitBuffers = await this.fetchPortraitBuffers(characterPortraits)
      for (const { name, buffer } of portraitBuffers) {
        contents.push({
          inlineData: { mimeType: 'image/png', data: buffer.toString('base64') },
        })
        contents.push({
          text: `The image above is a reference portrait of ${name}. Match their appearance EXACTLY.`,
        })
      }
    }

    contents.push({ text: prompt })

    console.log(
      `[story-video] Generating scene ${scene.sceneIndex} image via Gemini (${artStyle}, ${scene.duration}s)`
    )

    const response = await genAI.models.generateContent({
      model: IMAGE_MODEL,
      contents,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    })

    return this.extractImageBuffer(response)
  }

  // ── Private helpers ──────────────────────────────────────────

  private buildPrompt(scene: ScreenplayScene, artStyle: ArtStyle): string {
    const parts: string[] = []

    // Style prefix for consistency
    parts.push(`ART STYLE: ${ART_STYLE_PREFIXES[artStyle]}`)

    // Scene description
    parts.push(`SCENE: ${scene.description}`)

    // Mood and atmosphere
    if (scene.mood) {
      parts.push(`MOOD: ${scene.mood}`)
    }

    // Camera direction
    if (scene.cameraDirection) {
      parts.push(`CAMERA: ${scene.cameraDirection}`)
    }

    // Characters in scene
    if (scene.characters.length > 0) {
      parts.push(`CHARACTERS PRESENT: ${scene.characters.join(', ')}`)
      parts.push(
        'CHARACTER CONSISTENCY: You MUST match EVERY attribute from the reference portraits exactly — '
        + 'hair color/style, eye color, skin tone, clothing, accessories. Do NOT change any detail.'
      )
    }

    // Dialogue context (helps set the emotional tone of the scene)
    if (scene.dialogue.length > 0) {
      const dialogueContext = scene.dialogue
        .map((d) => `${d.character}: "${d.text}"`)
        .join('\n')
      parts.push(`DIALOGUE CONTEXT (for emotional expression):\n${dialogueContext}`)
    }

    // Narration context
    if (scene.narration) {
      parts.push(`NARRATION: ${scene.narration}`)
    }

    // Quality and format directives
    parts.push(
      'Generate a high-quality widescreen (16:9) illustration for this scene. '
      + 'No text, words, letters, or writing in the image. '
      + 'Anatomically correct characters with proper proportions.'
    )

    return parts.join('\n\n')
  }

  /**
   * Fetch character portrait images and return as buffers.
   * Skips portraits that fail to download.
   */
  private async fetchPortraitBuffers(
    portraits: { name: string; imageUrl: string }[]
  ): Promise<{ name: string; buffer: Buffer }[]> {
    const results: { name: string; buffer: Buffer }[] = []

    for (const { name, imageUrl } of portraits) {
      try {
        const response = await fetch(imageUrl)
        if (!response.ok) {
          console.warn(`[story-video] Failed to fetch portrait for ${name}: ${response.status}`)
          continue
        }
        const ab = await response.arrayBuffer()
        results.push({ name, buffer: Buffer.from(ab) })
      } catch (err) {
        console.warn(`[story-video] Error fetching portrait for ${name}:`, err)
      }
    }

    return results
  }

  /**
   * Extract image buffer from Gemini response.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractImageBuffer(response: any): Buffer {
    const parts = response.candidates?.[0]?.content?.parts
    if (!parts) throw new Error('No content in Gemini scene generation response')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'))

    if (!imagePart?.inlineData?.data) {
      throw new Error('No image returned from Gemini scene generation')
    }

    return Buffer.from(imagePart.inlineData.data, 'base64')
  }
}
