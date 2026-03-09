import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import type { StoryConcept, GenerateRequest, RefineRequest } from './types'

export interface SeriesBookSummary {
  title: string
  premise: string
  theme: string
}

export interface SeriesContext {
  setting: string
  artStyle: string
  characters: { name: string; description: string }[]
  existingBooks?: SeriesBookSummary[]
}

interface ConceptsInput {
  plot: string
  seriesContext?: SeriesContext
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateConcepts(input: ConceptsInput): Promise<StoryConcept> {
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

  // Build prompt with optional series context
  let prompt = `Story idea:\n${input.plot}`

  if (input.seriesContext) {
    const { setting, characters, artStyle } = input.seriesContext
    prompt += `\n\nIMPORTANT — This story is part of a series with the following constraints:
- Setting: ${setting}
- Art style: ${artStyle} (you MUST use this exact style in tags.style)
- The story MUST feature these characters with EXACTLY these physical descriptions:
${characters.map((c: { name: string; description: string }) => `  * ${c.name}: ${c.description}`).join('\n')}

The story concept MUST revolve around these characters in this setting. Do NOT invent new main characters.`

    if (input.seriesContext.existingBooks?.length) {
      prompt += `\n\nPrevious books in this series (for continuity — create a NEW story, do NOT repeat these plots):
${input.seriesContext.existingBooks.map((b, i) => `  ${i + 1}. "${b.title}" — ${b.premise}${b.theme ? ` (Theme: ${b.theme})` : ''}`).join('\n')}

Build on these stories: reference shared history, develop character relationships further, and explore new adventures. The new story should feel like a natural continuation of the series.`
    }
  }

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  if (!text) throw new Error('No response from Gemini')

  const concept = JSON.parse(text) as StoryConcept

  // If series context provided, force the art style
  if (input.seriesContext) {
    concept.tags.style = input.seriesContext.artStyle
  }

  return concept
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
  // Strip markdown code fences if present (streaming doesn't use responseMimeType)
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/```[\s\S]*$/, '')
  }
  // Fallback: extract JSON between first { and last }
  const firstBrace = jsonText.indexOf('{')
  const lastBrace = jsonText.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    jsonText = jsonText.slice(firstBrace, lastBrace + 1)
  }

  yield { type: 'done', data: JSON.parse(jsonText) }
}

// =============================================================================
// Story Bible — internal grounding document for quality pipeline
// =============================================================================

export interface StoryBible {
  characters: {
    name: string
    physicalDescription: string
    personality: string
    role: 'protagonist' | 'antagonist' | 'supporting'
    relationships: { with: string; nature: string }[]
  }[]
  setting: {
    location: string
    timeContext: string
    atmosphere: string
  }
  narrativeArc: {
    opening: string
    incitingIncident: string
    risingAction: string
    climax: string
    resolution: string
  }
  rules: string[]
  artDirection: {
    style: string
    colorPalette: string
    lightingProgression: string
  }
}

interface StoryBibleInput {
  plot: string
  concept: StoryConcept
  seriesContext?: { existingBooks?: SeriesBookSummary[] }
}

export async function generateStoryBible(input: StoryBibleInput): Promise<StoryBible> {
  const { plot, concept, seriesContext } = input

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `You are a world-building specialist for children's picture books. Given a story concept and plot, create a comprehensive Story Bible that will serve as the grounding document for writing and illustrating the book.

Your Story Bible must ensure:
- Character physical descriptions are EXTREMELY detailed and hyper-specific (exact hair color/style/length, eye color/shape, skin tone, body type, specific clothing with colors and details, distinguishing features like freckles, scars, accessories)
- Character personalities include motivations, fears, and quirks that drive behavior
- Relationships between characters are explicit and directional
- The narrative arc is broken into clear beats
- Rules capture any world-specific logic or character constraints
- Art direction provides visual coherence guidance for the illustrator

Target audience: ${concept.tags.audience}
Art style: ${concept.tags.style}
Tone: ${concept.tags.tone}`,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          characters: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                physicalDescription: { type: SchemaType.STRING, description: 'Hyper-detailed physical appearance for illustration consistency. This will be copied verbatim into every image prompt.' },
                personality: { type: SchemaType.STRING, description: 'Core motivations, fears, quirks, and behavioral traits' },
                role: { type: SchemaType.STRING, description: 'protagonist, antagonist, or supporting' },
                relationships: {
                  type: SchemaType.ARRAY,
                  items: {
                    type: SchemaType.OBJECT,
                    properties: {
                      with: { type: SchemaType.STRING, description: 'Name of the other character' },
                      nature: { type: SchemaType.STRING, description: 'How this character feels about/relates to the other' },
                    },
                    required: ['with', 'nature'],
                  },
                },
              },
              required: ['name', 'physicalDescription', 'personality', 'role', 'relationships'],
            },
          },
          setting: {
            type: SchemaType.OBJECT,
            properties: {
              location: { type: SchemaType.STRING, description: 'Where the story takes place — specific and vivid' },
              timeContext: { type: SchemaType.STRING, description: 'When: era, season, time-of-day progression through the story' },
              atmosphere: { type: SchemaType.STRING, description: 'Mood, sensory details, ambient sounds and smells' },
            },
            required: ['location', 'timeContext', 'atmosphere'],
          },
          narrativeArc: {
            type: SchemaType.OBJECT,
            properties: {
              opening: { type: SchemaType.STRING, description: 'How the story begins — status quo' },
              incitingIncident: { type: SchemaType.STRING, description: 'What disrupts the status quo' },
              risingAction: { type: SchemaType.STRING, description: 'How tension escalates' },
              climax: { type: SchemaType.STRING, description: 'The turning point' },
              resolution: { type: SchemaType.STRING, description: 'How the story resolves' },
            },
            required: ['opening', 'incitingIncident', 'risingAction', 'climax', 'resolution'],
          },
          rules: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: 'Story-specific rules and constraints (e.g., "magic always costs energy", "the cat never speaks")',
          },
          artDirection: {
            type: SchemaType.OBJECT,
            properties: {
              style: { type: SchemaType.STRING },
              colorPalette: { type: SchemaType.STRING, description: 'Overall color direction: warm, cool, muted, vibrant, etc.' },
              lightingProgression: { type: SchemaType.STRING, description: 'How lighting changes through the story (e.g., dawn to dusk, bright to stormy)' },
            },
            required: ['style', 'colorPalette', 'lightingProgression'],
          },
        },
        required: ['characters', 'setting', 'narrativeArc', 'rules', 'artDirection'],
      },
    },
  })

  let prompt = `Story concept: "${concept.title}"

Premise: ${concept.sections.premise}
Author's intent: ${concept.sections.authorIntent}
Narrative arc: ${concept.sections.narrativeArc}
Tone: ${concept.sections.tone}
Visual style: ${concept.sections.visualStyle}
Cover description: ${concept.coverDescription}

Original plot idea: ${plot}`

  if (seriesContext?.existingBooks?.length) {
    prompt += `\n\nThis story is part of a series. Previous books:
${seriesContext.existingBooks.map((b, i) => `  ${i + 1}. "${b.title}" — ${b.premise}${b.theme ? ` (Theme: ${b.theme})` : ''}`).join('\n')}

Build character relationships and world details that respect established continuity.`
  }

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  if (!text) throw new Error('No response from Gemini (Story Bible)')

  const bible = JSON.parse(text) as StoryBible
  // Force art style from concept
  bible.artDirection.style = concept.tags.style
  return bible
}

// =============================================================================
// Story Draft — writes the story grounded against the Story Bible
// =============================================================================

export async function generateStoryDraft(input: GenerateRequest, storyBible: StoryBible) {
  const { plot, concept } = input
  const { style, audience, pageCount, tone } = concept.tags

  // Build character reference block from Story Bible
  const characterBlock = storyBible.characters
    .map(c => `- ${c.name} (${c.role}): ${c.physicalDescription}`)
    .join('\n')

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `You are a professional children's book author and illustrator. Create a complete ${pageCount}-page picture book grounded in the Story Bible below.

=== STORY BIBLE (you MUST follow this exactly) ===

CHARACTERS:
${characterBlock}

SETTING: ${storyBible.setting.location} — ${storyBible.setting.timeContext}
ATMOSPHERE: ${storyBible.setting.atmosphere}

NARRATIVE ARC:
- Opening: ${storyBible.narrativeArc.opening}
- Inciting incident: ${storyBible.narrativeArc.incitingIncident}
- Rising action: ${storyBible.narrativeArc.risingAction}
- Climax: ${storyBible.narrativeArc.climax}
- Resolution: ${storyBible.narrativeArc.resolution}

RULES:
${storyBible.rules.map(r => `- ${r}`).join('\n')}

ART DIRECTION:
- Style: ${storyBible.artDirection.style}
- Color palette: ${storyBible.artDirection.colorPalette}
- Lighting progression: ${storyBible.artDirection.lightingProgression}

=== END STORY BIBLE ===

Art style: ${style}
Target audience: ${audience}
Tone: ${tone}

Rules:
- Exactly ${pageCount} pages
- First page is the opening scene, last page is the resolution
- Each page should advance the story following the narrative arc above
- Keep language age-appropriate for ${audience}
- Characters MUST act according to their personality and relationships defined in the Story Bible
- Every imagePrompt MUST start with "${style} style" and include the FULL physicalDescription from the Story Bible for every character present in the scene. Copy verbatim — do NOT abbreviate or paraphrase.
- Image prompts must follow the art direction: use the specified color palette and lighting progression
- Do not include any text, words, or letters in image prompts`,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          theme: { type: SchemaType.STRING, description: 'One-sentence theme' },
          setting: { type: SchemaType.STRING, description: 'Where/when the story takes place' },
          characters: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                role: { type: SchemaType.STRING, description: 'protagonist, antagonist, or supporting' },
                description: { type: SchemaType.STRING, description: 'Extremely detailed physical appearance for illustration consistency' },
                age: { type: SchemaType.STRING },
              },
              required: ['name', 'role', 'description', 'age'],
            },
          },
          pages: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                sequence: { type: SchemaType.NUMBER },
                sceneDescription: { type: SchemaType.STRING, description: 'Detailed visual scene description for the illustrator' },
                narrativeText: { type: SchemaType.STRING, description: 'The text that appears on this page of the book' },
                dialogue: {
                  type: SchemaType.ARRAY,
                  items: {
                    type: SchemaType.OBJECT,
                    properties: {
                      speaker: { type: SchemaType.STRING },
                      line: { type: SchemaType.STRING },
                    },
                    required: ['speaker', 'line'],
                  },
                },
                mood: { type: SchemaType.STRING, description: 'Emotional tone' },
                imagePrompt: { type: SchemaType.STRING, description: `Detailed image generation prompt starting with '${style} style'. Include full character appearances, scene, mood, lighting. No text in images.` },
              },
              required: ['sequence', 'sceneDescription', 'narrativeText', 'mood', 'imagePrompt'],
            },
          },
        },
        required: ['title', 'theme', 'setting', 'characters', 'pages'],
      },
    },
  })

  const userMessage = `Story concept: ${concept.title}

Author's intent: ${concept.sections.authorIntent}
Premise: ${concept.sections.premise}
Message to audience: ${concept.sections.messageToAudience}

Original plot idea: ${plot}`

  const result = await model.generateContent(userMessage)
  const text = result.response.text()

  if (!text) throw new Error('No text response from Gemini (Story Draft)')

  return JSON.parse(text)
}

// =============================================================================
// Validate & Fix — checks draft against Story Bible, surgically fixes issues
// =============================================================================

interface ValidationIssue {
  page: number
  category: string
  description: string
  fix: string
  field: 'narrativeText' | 'dialogue' | 'imagePrompt' | 'sceneDescription'
}

interface ValidationResult {
  status: 'VALIDATED' | 'NEEDS_FIX'
  issues: ValidationIssue[]
}

export async function validateAndFix(storyBible: StoryBible, draft: Record<string, unknown>): Promise<Record<string, unknown>> {
  const characterBlock = storyBible.characters
    .map(c => `- ${c.name} (${c.role}): ${c.physicalDescription} | Personality: ${c.personality}`)
    .join('\n')

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `You are a senior narrative editor for children's picture books. Your job is to review a story draft against its Story Bible and identify any inconsistencies.

=== STORY BIBLE ===

CHARACTERS:
${characterBlock}

RELATIONSHIPS:
${storyBible.characters.flatMap(c => c.relationships.map(r => `- ${c.name} → ${r.with}: ${r.nature}`)).join('\n')}

SETTING: ${storyBible.setting.location} — ${storyBible.setting.timeContext}
ATMOSPHERE: ${storyBible.setting.atmosphere}

NARRATIVE ARC:
- Opening: ${storyBible.narrativeArc.opening}
- Inciting incident: ${storyBible.narrativeArc.incitingIncident}
- Rising action: ${storyBible.narrativeArc.risingAction}
- Climax: ${storyBible.narrativeArc.climax}
- Resolution: ${storyBible.narrativeArc.resolution}

RULES:
${storyBible.rules.map(r => `- ${r}`).join('\n')}

ART DIRECTION:
- Style: ${storyBible.artDirection.style}
- Color palette: ${storyBible.artDirection.colorPalette}
- Lighting: ${storyBible.artDirection.lightingProgression}

=== END STORY BIBLE ===

Review the draft for:
1. Timeline — events follow a logical sequence; no page references future events
2. Character behavior — actions align with personality/motivations from Story Bible
3. Relationship consistency — characters interact per established dynamics
4. Causality — every action has a reason; no deus ex machina
5. Physical descriptions — imagePrompts must contain the EXACT physicalDescription from the Story Bible for each character present (no drift, no abbreviation)
6. Art direction — imagePrompts follow the color palette and lighting progression
7. Age-appropriateness — language and themes match target audience

If the draft is perfect, return status "VALIDATED" with an empty issues array.
If issues are found, return status "NEEDS_FIX" with each issue including the corrected content in the "fix" field.
Be conservative — only flag real problems, not stylistic preferences.`,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          status: { type: SchemaType.STRING, description: 'VALIDATED or NEEDS_FIX' },
          issues: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                page: { type: SchemaType.NUMBER, description: 'Page sequence number (0 for book-level issues)' },
                category: { type: SchemaType.STRING, description: 'timeline, character_behavior, relationship, causality, physical_description, art_direction, or age_appropriateness' },
                description: { type: SchemaType.STRING, description: 'What is wrong' },
                fix: { type: SchemaType.STRING, description: 'The corrected content for this field' },
                field: { type: SchemaType.STRING, description: 'narrativeText, dialogue, imagePrompt, or sceneDescription' },
              },
              required: ['page', 'category', 'description', 'fix', 'field'],
            },
          },
        },
        required: ['status', 'issues'],
      },
    },
  })

  const result = await model.generateContent(`Review this story draft:\n\n${JSON.stringify(draft, null, 2)}`)
  const text = result.response.text()
  if (!text) throw new Error('No response from Gemini (Validation)')

  const validation = JSON.parse(text) as ValidationResult

  if (validation.status === 'VALIDATED' || !validation.issues?.length) {
    return draft
  }

  // Apply surgical fixes
  const pages = (draft.pages as Record<string, unknown>[]) || []
  for (const issue of validation.issues) {
    if (issue.page === 0) continue // Skip book-level issues (no field to patch)
    const page = pages.find((p: Record<string, unknown>) => p.sequence === issue.page)
    if (!page) continue

    if (issue.field === 'dialogue') {
      // Dialogue fix: parse the fix as JSON array if possible, otherwise skip
      try {
        page.dialogue = JSON.parse(issue.fix)
      } catch {
        // If fix isn't valid JSON, skip this fix
      }
    } else if (issue.field in page) {
      page[issue.field] = issue.fix
    }
  }

  return { ...draft, pages }
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
