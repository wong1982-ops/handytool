import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ConceptsRequest, StoryConcept, GenerateRequest, RefineRequest } from './types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateConcepts(input: ConceptsRequest): Promise<[StoryConcept, StoryConcept]> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `You are a professional children's book creative director. Given a story plot idea, generate exactly 2 different story concepts that take the idea in distinct creative directions.

Each concept must be richly described with structured sections to help the author understand the vision.

You MUST respond with valid JSON — an array of exactly 2 objects matching this structure:
[
  {
    "id": "concept_1",
    "title": "string — a compelling, memorable book title",
    "coverDescription": "string — visual description of what the book cover would look like",
    "sections": {
      "premise": "string — 2-3 sentences answering: What is this story about? Set the scene and introduce the central conflict or journey.",
      "authorIntent": "string — 1-2 sentences answering: What does the author want to provoke in the reader? What emotions or thoughts should this story stir?",
      "messageToAudience": "string — 1-2 sentences answering: What should the reader take away? The moral, lesson, or feeling they carry after the last page.",
      "narrativeArc": "string — 2-3 sentences answering: How does the story unfold? Sketch the beginning, turning point, and resolution without spoiling surprises.",
      "tone": "string — 1-2 sentences answering: How is the story told? Describe the narrative voice, humor level, emotional texture.",
      "visualStyle": "string — 1-2 sentences answering: What does the world look like? Describe the art direction, color palette, visual mood."
    },
    "tags": {
      "style": "string — art style name (e.g., Watercolor, Cartoon, Anime, Paper Craft, Realistic, Storybook Illustration)",
      "audience": "string — target age group (e.g., Ages 2-4, Ages 5-7, Ages 8-12)",
      "pageCount": number — between 8 and 12,
      "tone": "string — short emotional tone label (e.g., Adventurous & Heartwarming, Funny & Playful)"
    }
  }
]

Rules:
- The 2 concepts MUST feel distinctly different in style, tone, and narrative approach
- One could be lighthearted, the other more dramatic. One for younger, one for older. One whimsical, one grounded.
- Sections should be vivid and specific — avoid generic descriptions
- Respond ONLY with the JSON array, no markdown code fences`,
  })

  const result = await model.generateContent(`Story idea:\n${input.plot}`)
  const text = result.response.text()

  if (!text) throw new Error('No response from Gemini')

  let jsonText = text.trim()
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  const parsed = JSON.parse(jsonText)
  if (!Array.isArray(parsed) || parsed.length !== 2) {
    throw new Error('Expected exactly 2 concepts')
  }

  return parsed as [StoryConcept, StoryConcept]
}

export async function refineConcept(input: RefineRequest): Promise<{ concept: StoryConcept; reply: string }> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `You are a children's book creative director helping an author refine their story concept. The author has selected a concept and wants to make changes.

Given the current concept and the author's feedback, produce an updated concept with the requested changes applied. Also write a brief reply (1-2 sentences) explaining what you changed and why.

You MUST respond with valid JSON matching this structure:
{
  "concept": { ...the full updated StoryConcept object with same structure as input... },
  "reply": "string — brief explanation of what changed"
}

Rules:
- Preserve the concept structure exactly (id, title, coverDescription, sections, tags)
- Only change what the author asked for — keep everything else intact
- If the author's request affects multiple sections, update all relevant ones
- The reply should be conversational and encouraging
- Respond ONLY with the JSON object, no markdown code fences`,
  })

  const history = input.history.map(m => `${m.role === 'user' ? 'Author' : 'Director'}: ${m.content}`).join('\n')

  const userMessage = `Current concept:
${JSON.stringify(input.concept, null, 2)}

${history ? `Previous conversation:\n${history}\n\n` : ''}Author's new request: ${input.message}`

  const result = await model.generateContent(userMessage)
  const text = result.response.text()

  if (!text) throw new Error('No response from Gemini')

  let jsonText = text.trim()
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  return JSON.parse(jsonText)
}

export async function generateStoryText(input: GenerateRequest) {
  const { plot, concept } = input
  const { style, audience, pageCount, tone } = concept.tags

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `You are a professional children's book author and illustrator. Create a complete ${pageCount}-page picture book based on the given concept.

Art style: ${style}
Target audience: ${audience}
Tone: ${tone}
Visual style direction: ${concept.sections.visualStyle}

You MUST respond with valid JSON matching this exact structure:
{
  "title": "${concept.title}",
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
      "sceneDescription": "string — detailed visual scene description for the illustrator",
      "narrativeText": "string — the text that appears on this page of the book",
      "dialogue": [
        { "speaker": "character name", "line": "what they say" }
      ],
      "mood": "string — emotional tone",
      "imagePrompt": "string — detailed image generation prompt starting with '${style} style'. Include full character appearances, scene, mood, lighting. No text in images."
    }
  ]
}

Rules:
- Exactly ${pageCount} pages
- First page is the opening scene, last page is the resolution
- Each page should advance the story
- Keep language age-appropriate for ${audience}
- Every imagePrompt must start with "${style} style" and include full character physical descriptions
- Do not include any text, words, or letters in image prompts
- Respond ONLY with the JSON object, no markdown code fences`,
  })

  const userMessage = `Story concept: ${concept.title}

Author's intent: ${concept.sections.authorIntent}
Premise: ${concept.sections.premise}
Narrative arc: ${concept.sections.narrativeArc}
Tone: ${concept.sections.tone}
Message to audience: ${concept.sections.messageToAudience}

Original plot idea: ${plot}`

  const result = await model.generateContent(userMessage)
  const text = result.response.text()

  if (!text) throw new Error('No text response from Gemini')

  let jsonText = text.trim()
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  return JSON.parse(jsonText)
}

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40)
    .replace(/-$/, '')

  const suffix = Math.random().toString(36).slice(2, 8)
  return `${base}-${suffix}`
}
