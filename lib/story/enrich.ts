import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import type { ConceptsRequest, StoryConcept, GenerateRequest, RefineRequest } from './types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateConcepts(input: ConceptsRequest): Promise<StoryConcept> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `You are a professional children's book creative director. Given a story plot idea, generate a compelling story concept with rich detail.

Rules:
- Sections should be vivid and specific — avoid generic descriptions
- Keep each section concise (1-3 sentences max)`,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          title: { type: SchemaType.STRING, description: 'A compelling, memorable book title' },
          coverDescription: { type: SchemaType.STRING, description: 'Visual description of the book cover' },
          sections: {
            type: SchemaType.OBJECT,
            properties: {
              premise: { type: SchemaType.STRING, description: 'What is this story about? Set the scene and central conflict.' },
              authorIntent: { type: SchemaType.STRING, description: 'What emotions or thoughts should this story stir?' },
              messageToAudience: { type: SchemaType.STRING, description: 'What should the reader take away?' },
              narrativeArc: { type: SchemaType.STRING, description: 'How does the story unfold? Beginning, turning point, resolution.' },
              tone: { type: SchemaType.STRING, description: 'How is the story told? Voice, humor, emotional texture.' },
              visualStyle: { type: SchemaType.STRING, description: 'Art direction, color palette, visual mood.' },
            },
            required: ['premise', 'authorIntent', 'messageToAudience', 'narrativeArc', 'tone', 'visualStyle'],
          },
          tags: {
            type: SchemaType.OBJECT,
            properties: {
              style: { type: SchemaType.STRING, description: 'Art style (e.g., Watercolor, Cartoon, Anime)' },
              audience: { type: SchemaType.STRING, description: 'Target age group (e.g., Ages 2-4, Ages 5-7)' },
              pageCount: { type: SchemaType.NUMBER, description: 'Number of pages, between 8 and 12' },
              tone: { type: SchemaType.STRING, description: 'Short emotional tone label' },
            },
            required: ['style', 'audience', 'pageCount', 'tone'],
          },
        },
        required: ['id', 'title', 'coverDescription', 'sections', 'tags'],
      },
    },
  })

  const result = await model.generateContent(`Story idea:\n${input.plot}`)
  const text = result.response.text()

  if (!text) throw new Error('No response from Gemini')

  return JSON.parse(text) as StoryConcept
}

/**
 * Stream-based refineConcept: yields text chunks as they arrive from Gemini,
 * then parses the final accumulated JSON.
 */
export async function* refineConceptStream(input: RefineRequest): AsyncGenerator<
  | { type: 'chunk'; text: string }
  | { type: 'done'; data: { concept: StoryConcept; reply: string } }
> {
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

  const result = await model.generateContentStream(userMessage)

  let accumulated = ''
  for await (const chunk of result.stream) {
    const text = chunk.text()
    if (text) {
      accumulated += text
      yield { type: 'chunk', text }
    }
  }

  if (!accumulated) throw new Error('No response from Gemini')

  let jsonText = accumulated.trim()
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  yield { type: 'done', data: JSON.parse(jsonText) }
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
      "description": "string — EXTREMELY detailed physical appearance for illustration consistency. Use hyper-specific modifiers (e.g., 'messy charcoal-grey hair' not 'grey hair', 'round tortoiseshell glasses' not 'glasses', 'oversized mustard-yellow raincoat with brass buttons' not 'yellow coat'). Include: exact hair color/style/length, eye color/shape, skin tone, body type/height, specific clothing items with colors and details, and any distinguishing features (freckles, scars, accessories). These descriptions will be copied verbatim into every illustration prompt.",
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
- Every imagePrompt MUST start with "${style} style" and include the FULL physical description of every character present in the scene. Do NOT abbreviate or summarize — copy the complete character description into each imagePrompt. The AI image model does NOT remember characters between pages.
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
