// tools/story-video/screenplay-generator.ts

import type { StoryBook, Page } from '@/tools/story-studio/types'
import type { ArtStyle, DurationPreset, Screenplay, ScreenplayScene } from './types'
// DurationPreset kept in signature for API compatibility
import { jsonrepair } from 'jsonrepair'

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()

/**
 * Combine ALL pages into a single scene group.
 * Veo 3.1 supports max 8 seconds per video, so we generate one condensed scene
 * that captures the entire story's essence rather than individual page scenes.
 */
function consolidatePages(pages: Page[]): Page[][] {
  return [pages]
}

/**
 * Build the page data section for the prompt.
 */
function buildPageSummaries(pageGroups: Page[][]): string {
  return pageGroups
    .map((group, idx) => {
      const descriptions = group.map((p) => p.sceneDescription).join(' ')
      const narratives = group.map((p) => p.narrativeText).join(' ')
      const dialogues = group
        .flatMap((p) => p.dialogue ?? [])
        .map((d) => `${d.speaker}: "${d.line}"`)
        .join('\n    ')
      const moods = [...new Set(group.map((p) => p.mood))].join(', ')

      return `  Scene group ${idx + 1} (pages ${group.map((p) => p.sequence).join(',')}):
    Description: ${descriptions}
    Narrative: ${narratives}
    ${dialogues ? `Dialogue:\n    ${dialogues}` : 'Dialogue: (none)'}
    Mood: ${moods}`
    })
    .join('\n\n')
}

const SYSTEM_PROMPT = `You are a screenplay writer converting children's storybooks into a SINGLE condensed scene for an 8-second animated video.

Given the book's pages, characters, and metadata, distill the entire story into ONE scene that captures the essence, key characters, and emotional arc.

Rules:
- Produce EXACTLY 1 scene — combine the entire story into a single cinematic moment
- The scene description should be a rich, detailed visual prompt capturing the story's most iconic moment or a montage of key moments
- Include ALL main characters in the scene
- Camera direction should describe a dynamic shot (e.g., "sweeping establishing shot that reveals characters in their world")
- Duration must be exactly 8 (seconds) — this is the maximum for the video generation model
- sfxHints should be the 2-3 most important sound effects for the story
- musicMood should capture the overall emotional tone
- The narration should be a brief 1-2 sentence summary of the story's message

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "scenes": [
    {
      "sceneIndex": 0,
      "description": "Rich visual description combining the story's key moments and characters",
      "characters": ["Character Name"],
      "dialogue": [{ "character": "Character Name", "text": "Most memorable line" }],
      "narration": "Brief story essence narration",
      "mood": "emotional mood",
      "sfxHints": ["sound effect"],
      "duration": 8,
      "cameraDirection": "dynamic camera movement",
      "transition": "fade to black"
    }
  ],
  "totalDuration": 8,
  "musicMood": "overall music mood description"
}`

/**
 * Convert a StoryBook into a structured Screenplay using Gemini text model.
 *
 * - Consolidates pages for long books (>20 pages → merge 2-3 per scene)
 * - Caps at 30 scenes max
 * - Estimates scene durations based on dialogue/narration text length
 */
export async function generateScreenplay(
  book: StoryBook,
  artStyle: ArtStyle,
  _targetDuration: DurationPreset,
): Promise<Screenplay> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const pageGroups = consolidatePages(book.pages)

  // Build character list
  const characterDescriptions = book.characters
    .map((c) => `${c.name} (${c.role}): ${c.description}`)
    .join('\n')

  const pageSummaries = buildPageSummaries(pageGroups)

  const userPrompt = `Book: "${book.title}"
Theme: ${book.theme}
Setting: ${book.setting}
Art style for video: ${artStyle}
Target total duration: 8 seconds (single scene)

Characters:
${characterDescriptions}

Pages (combine ALL into one scene):
${pageSummaries}

Generate a single-scene screenplay JSON. Duration must be exactly 8 seconds.`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

  console.log(
    `[story-video] Generating screenplay for "${book.title}" (${book.pages.length} pages → 1 scene, 8s)`
  )

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT + '\n\n' + userPrompt }],
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gemini screenplay generation failed: ${response.status} — ${err.substring(0, 300)}`)
  }

  const data = await response.json()
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No JSON found in screenplay response')
  }

  // Repair and parse JSON — handles single quotes, trailing commas, unescaped chars, etc.
  let jsonStr = jsonMatch[0]
  let screenplay: Screenplay
  try {
    screenplay = JSON.parse(jsonStr)
  } catch {
    try {
      const repaired = jsonrepair(jsonStr)
      screenplay = JSON.parse(repaired)
    } catch (e2) {
      throw new Error(`Failed to parse screenplay JSON: ${e2 instanceof Error ? e2.message : 'Invalid JSON'}. Raw (first 500): ${jsonStr.slice(0, 500)}`)
    }
  }

  // Validate structure
  if (!screenplay.scenes?.length) {
    throw new Error('Invalid screenplay: no scenes generated')
  }

  // Enforce single scene
  if (screenplay.scenes.length > 1) {
    screenplay.scenes = screenplay.scenes.slice(0, 1)
  }

  // Ensure sceneIndex is correct and sequential
  screenplay.scenes = screenplay.scenes.map(
    (scene: ScreenplayScene, idx: number) => ({
      ...scene,
      sceneIndex: idx,
    })
  )

  // Recalculate total duration from scene durations
  screenplay.totalDuration = screenplay.scenes.reduce(
    (sum: number, s: ScreenplayScene) => sum + (s.duration || 5),
    0
  )

  console.log(
    `[story-video] Screenplay generated: ${screenplay.scenes.length} scenes, ${screenplay.totalDuration}s total`
  )

  return screenplay
}
