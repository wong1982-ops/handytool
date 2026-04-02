// tools/story-video/screenplay-generator.ts

import type { StoryBook, Page } from '@/tools/story-studio/types'
import type { ArtStyle, DurationPreset, Screenplay, ScreenplayScene } from './types'
import { jsonrepair } from 'jsonrepair'

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()

const MAX_SCENES = 30

/** Target durations in seconds for each preset */
const DURATION_TARGETS: Record<Exclude<DurationPreset, 'auto'>, number> = {
  short: 60,
  medium: 180,
  long: 300,
}

/**
 * Resolve 'auto' duration to a concrete preset based on page count.
 */
function resolveDuration(pageCount: number, duration: DurationPreset): Exclude<DurationPreset, 'auto'> {
  if (duration !== 'auto') return duration
  if (pageCount <= 8) return 'short'
  if (pageCount <= 16) return 'medium'
  return 'long'
}

/**
 * Consolidate pages for long books (>20 pages).
 * Merges 2-3 pages into groups that become single scenes.
 */
function consolidatePages(pages: Page[]): Page[][] {
  if (pages.length <= 20) {
    return pages.map((p) => [p])
  }

  // Merge pages into groups of 2-3 to stay under MAX_SCENES
  const groupSize = Math.ceil(pages.length / MAX_SCENES)
  const groups: Page[][] = []

  for (let i = 0; i < pages.length; i += groupSize) {
    groups.push(pages.slice(i, i + groupSize))
  }

  return groups
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

const SYSTEM_PROMPT = `You are a screenplay writer converting children's storybooks into structured screenplays for animated video production.

Given the book's pages, characters, and metadata, produce a JSON screenplay.

Rules:
- Each scene should have a clear visual description suitable for AI image/video generation
- Include camera directions (e.g., "wide establishing shot", "close-up on face", "slow pan right")
- Include transitions between scenes (e.g., "fade to black", "cross dissolve", "cut")
- Estimate scene duration in seconds based on dialogue and narration text length (~150 words/minute for narration, ~180 words/minute for dialogue)
- sfxHints should be short descriptions of sound effects (e.g., "door creaking", "birds chirping", "thunder rumble")
- musicMood should describe the overall background music mood (e.g., "whimsical and playful", "mysterious and tense")
- sceneIndex must be 0-based and sequential
- characters array should list character names present in each scene

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "scenes": [
    {
      "sceneIndex": 0,
      "description": "Visual description of the scene for image generation",
      "characters": ["Character Name"],
      "dialogue": [{ "character": "Character Name", "text": "What they say" }],
      "narration": "Narrator text for this scene",
      "mood": "emotional mood",
      "sfxHints": ["sound effect description"],
      "duration": 8,
      "cameraDirection": "camera movement/angle",
      "transition": "transition to next scene"
    }
  ],
  "totalDuration": 120,
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
  targetDuration: DurationPreset,
): Promise<Screenplay> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const resolvedDuration = resolveDuration(book.pages.length, targetDuration)
  const targetSeconds = DURATION_TARGETS[resolvedDuration]
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
Target total duration: ~${targetSeconds} seconds
Number of scene groups: ${pageGroups.length} (max ${MAX_SCENES} scenes)

Characters:
${characterDescriptions}

Pages:
${pageSummaries}

Generate the screenplay JSON now. Ensure totalDuration is close to ${targetSeconds} seconds.`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

  console.log(
    `[story-video] Generating screenplay for "${book.title}" (${book.pages.length} pages → ${pageGroups.length} groups, target ${targetSeconds}s)`
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

  // Enforce max scenes
  if (screenplay.scenes.length > MAX_SCENES) {
    screenplay.scenes = screenplay.scenes.slice(0, MAX_SCENES)
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
