import Anthropic from '@anthropic-ai/sdk'
import type { EnrichRequest } from './types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const STYLE_DESCRIPTIONS: Record<string, string> = {
  watercolor: 'soft watercolor painting with flowing colors and gentle textures',
  cartoon: 'bold cartoon style with thick outlines and bright saturated colors',
  anime: 'Japanese anime illustration with expressive eyes and dynamic poses',
  realistic: 'photorealistic digital art with detailed textures and lighting',
  'paper-craft': 'paper cut-out collage style with layered textures and shadows',
}

function buildSystemPrompt(input: EnrichRequest): string {
  const styleDesc = input.style.customPrompt || STYLE_DESCRIPTIONS[input.style.preset] || input.style.preset

  return `You are a professional children's book author and illustrator. Given a story plot, create a complete ${input.pageCount}-page picture book for a ${input.audience} audience.

You MUST respond with valid JSON matching this exact structure:
{
  "title": "string — the book title",
  "theme": "string — one-sentence theme",
  "setting": "string — where/when the story takes place",
  "characters": [
    {
      "name": "string",
      "role": "protagonist" | "antagonist" | "supporting",
      "description": "string — detailed physical appearance (hair color, eye color, clothing, distinguishing features) and personality traits. Be very specific for illustration consistency.",
      "age": "string — approximate age"
    }
  ],
  "pages": [
    {
      "sequence": 1,
      "sceneDescription": "string — detailed visual scene description for the illustrator. Include setting, character positions, actions, lighting, and atmosphere.",
      "narrativeText": "string — the text that appears on this page of the book. Age-appropriate language.",
      "dialogue": [
        { "speaker": "character name", "line": "what they say" }
      ],
      "mood": "string — emotional tone (e.g., joyful, tense, peaceful, excited, mysterious)",
      "imagePrompt": "string — a detailed image generation prompt. Include: art style (${styleDesc}), scene description, character appearances, mood, lighting. Do NOT include text in the image."
    }
  ]
}

Rules:
- Exactly ${input.pageCount} pages
- First page is the opening scene, last page is the resolution
- Each page should advance the story
- Keep dialogue age-appropriate for ${input.audience}
- Image prompts must describe the visual scene completely — an artist who hasn't read the story should be able to illustrate it from the prompt alone
- Include full character physical descriptions in every image prompt for consistency
- Every imagePrompt must start with the art style description
- Do not include any text, words, or letters in image prompts — illustrations only`
}

export async function enrichStory(input: EnrichRequest) {
  const systemPrompt = buildSystemPrompt(input)
  const userMessage = input.title
    ? `Title: ${input.title}\n\nStory plot:\n${input.plot}`
    : `Story plot:\n${input.plot}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const textBlock = response.content.find(b => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  // Parse JSON from response — handle markdown code blocks
  let jsonText = textBlock.text.trim()
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  const parsed = JSON.parse(jsonText)
  return parsed
}
