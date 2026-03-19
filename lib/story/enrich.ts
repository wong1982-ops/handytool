import { GoogleGenerativeAI, SchemaType, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
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

// Relaxed safety settings for children's story generation — avoids false positives
// on whimsical/fantasy content (dragons, villains, mild conflict) that Gemini's
// default filters sometimes flag as PROHIBITED_CONTENT.
const storySafetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
]

// Safety language rules injected into all story generation prompts to prevent
// Gemini's content filter from blocking children's stories with innocent intent.
const CONTENT_SAFETY_RULES = `
CONTENT SAFETY — You MUST follow these rewriting rules to keep stories child-safe:
1. Children must NEVER find and eat/drink unknown items. If the plot involves consuming something magical, rewrite so a TRUSTED CHARACTER (fairy, sprite, guardian, parent) offers or gifts it to them.
2. NEVER use enticement/luring language: "irresistible scent", "couldn't resist", "so attractive", "drawn to it". Instead use: "warm glow", "friendly shimmer", "gentle sparkle".
3. NEVER describe body sensations after ingestion: "peculiar tingle", "felt something changed", "strange feeling". Instead use: "felt a burst of energy", "felt brave and strong", "felt ready for anything".
4. Frame magical powers as GIFTS or BLESSINGS earned through kindness, courage, or friendship — never as side effects of consuming unknown substances.
5. NEVER use words: "drug", "potion", "intoxicating", "addictive", "seduce", "lure", "irresistible", "inject", "swallow". Use child-safe alternatives.
6. Avoid "fight", "kill", "die", "weapon", "blood", "dark magic", "evil". Use: "challenge", "defeat", "vanish", "tool", "tricky spells", "mischievous".
7. Physical strength gains should be described as "discovering hidden talents" or "unlocking abilities" — never as "got more power" or "body transformation".
8. All conflict must be resolved through wit, kindness, teamwork, or clever thinking — never through violence.
`

/**
 * Deterministic text sanitizer — runs BEFORE any Gemini call to prevent
 * the raw input from triggering Gemini's content filter.
 * No AI involved, just regex replacements of known trigger patterns.
 */
export function sanitizePlotText(text: string): string {
  // Word/phrase replacements (case-insensitive)
  const replacements: [RegExp, string][] = [
    // Ingestion patterns — the #1 trigger for children's stories
    [/\bpicked up and eat\b/gi, 'were gifted and tasted'],
    [/\bpicked up and ate\b/gi, 'were gifted and tasted'],
    [/\beat it\b/gi, 'tasted it'],
    [/\bate it\b/gi, 'tasted it'],
    [/\bate them\b/gi, 'tasted them'],
    [/\beat them\b/gi, 'tasted them'],
    [/\bthey eat\b/gi, 'they taste'],
    [/\bthey ate\b/gi, 'they tasted'],
    [/\bswallow(?:ed|s|ing)?\b/gi, 'tasted'],
    [/\bdevour(?:ed|s|ing)?\b/gi, 'enjoyed'],
    [/\bgulp(?:ed|s|ing)?\b/gi, 'sipped'],
    [/\bconsume(?:d|s|ing)?\b/gi, 'enjoyed'],

    // Enticement / luring language
    [/\birresistible\b/gi, 'wonderful'],
    [/\bcouldn'?t resist\b/gi, 'were delighted by'],
    [/\bso attractive\b/gi, 'so inviting'],
    [/\bdrawn to\b/gi, 'curious about'],
    [/\blure(?:d|s|ing)?\b/gi, 'invited'],
    [/\bseduce(?:d|s|ing)?\b/gi, 'charmed'],
    [/\bintoxicat(?:ed|ing|es)?\b/gi, 'enchanting'],
    [/\baddictive\b/gi, 'delightful'],
    [/\bsmells? so good\b/gi, 'glowed warmly'],

    // Body sensation after ingestion
    [/\bfeel(?:s)? something changed\b/gi, 'felt a burst of energy'],
    [/\bfelt something change(?:d)?\b/gi, 'felt a burst of energy'],
    [/\bpeculiar tingle\b/gi, 'warm glow'],
    [/\bstrange feeling\b/gi, 'wonderful feeling'],
    [/\btingle(?:d|s|ing)?\b/gi, 'glow'],

    // Violence / danger words
    [/\bkill(?:ed|s|ing)?\b/gi, 'defeated'],
    [/\bdie(?:d|s)?\b/gi, 'vanished'],
    [/\bdeath\b/gi, 'defeat'],
    [/\bfight(?:s|ing)?\b/gi, 'challenge'],
    [/\bfought\b/gi, 'challenged'],
    [/\battack(?:ed|s|ing)?\b/gi, 'challenged'],
    [/\bdestroy(?:ed|s|ing)?\b/gi, 'undid'],
    [/\bweapon(?:s)?\b/gi, 'tool'],
    [/\bblood(?:y)?\b/gi, 'magic'],
    [/\bevil\b/gi, 'mischievous'],
    [/\bdark magic\b/gi, 'tricky spells'],
    [/\bpoison(?:ed|s|ous|ing)?\b/gi, 'enchanted'],
    [/\bdrug(?:s|ged|ging)?\b/gi, 'charm'],
    [/\bpotion(?:s)?\b/gi, 'magical drink'],
    [/\binject(?:ed|s|ing|ion)?\b/gi, 'gifted'],

    // Power / transformation framing
    [/\bgot more power\b/gi, 'discovered hidden talents'],
    [/\bgained? power(?:s)?\b/gi, 'discovered amazing abilities'],
    [/\bbody transform(?:ed|ation|ing)?\b/gi, 'abilities awakened'],
    [/\bsupernatural power(?:s)?\b/gi, 'magical gifts'],
  ]

  let result = text
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement)
  }
  return result
}

/**
 * Rephrase a plot to avoid Gemini safety filter false positives.
 * Rewrites the plot to be unmistakably child-friendly while preserving the
 * core story idea, characters, and narrative arc.
 */
export async function rephrasePlot(plot: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    safetySettings: storySafetySettings,
    systemInstruction: `You are a children's book editor. Your ONLY job is to rephrase a story plot so it is clearly wholesome, age-appropriate, and safe for young children (ages 3-8).

Rules:
- Keep the SAME characters, setting, and story arc
- Replace any language that could be misinterpreted as violent, scary, or inappropriate with gentle, child-friendly alternatives
- Keep the plot interesting — don't make it boring, just safe
- Return ONLY the rephrased plot text, nothing else
- Keep roughly the same length

${CONTENT_SAFETY_RULES}`,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2000,
    },
  })

  const safePlot = sanitizePlotText(plot)
  const result = await model.generateContent(`Rephrase this children's story plot to be unmistakably child-friendly:\n\n${safePlot}`)
  const text = result.response.text()
  if (!text) return plot // fallback to original if rephrase fails
  return text.trim()
}

export async function generateConcepts(input: ConceptsInput): Promise<StoryConcept> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    safetySettings: storySafetySettings,
    systemInstruction: `You are a professional children's book creative director. Given a story plot idea, generate a compelling story concept with rich detail.

Rules:
- Sections should be vivid and specific — avoid generic descriptions
- Keep each section concise (1-3 sentences max)

${CONTENT_SAFETY_RULES}`,
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
  const safePlot = sanitizePlotText(input.plot)
  let prompt = `Story idea:\n${safePlot}`

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
    safetySettings: storySafetySettings,
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
- Respond ONLY with the JSON object, no markdown code fences

${CONTENT_SAFETY_RULES}`,
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
  const { concept, seriesContext } = input
  const plot = sanitizePlotText(input.plot)

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    safetySettings: storySafetySettings,
    systemInstruction: `You are a world-building specialist for children's picture books. Given a story concept and plot, create a comprehensive Story Bible that will serve as the grounding document for writing and illustrating the book.

Your Story Bible must ensure:
- Character physical descriptions use a STRICT STRUCTURED FORMAT (see below). This is critical because the description is copied verbatim into every illustration prompt. Prose descriptions cause the AI illustrator to drift.
- Character personalities include motivations, fears, and quirks that drive behavior
- Relationships between characters are explicit and directional
- The narrative arc is broken into clear beats
- Rules capture any world-specific logic or character constraints
- Art direction provides visual coherence guidance for the illustrator

MANDATORY FORMAT for physicalDescription (use this exact structure for EVERY character):
"[Species/type, e.g. human girl, talking fox, robot]. Hair: [exact color, length, style, e.g. shoulder-length wavy auburn hair with a side part]. Eyes: [exact color and shape, e.g. large round emerald-green eyes]. Skin: [exact tone, e.g. warm olive skin with freckles across the nose]. Build: [body type, height relative to other characters, e.g. petite and slender, shorter than Sophie]. Outfit: [SPECIFIC clothing items with exact colors and details, e.g. a lavender cardigan over a white peter-pan collar blouse, navy pleated skirt, white knee socks, brown mary-jane shoes]. Accessories: [specific items, e.g. a small gold locket, round wire-rimmed glasses]. Distinguishing features: [unique identifiers, e.g. a gap between front teeth, a small birthmark on left cheek]."

This structured format MUST be followed exactly — do NOT write prose paragraphs. The illustrator needs each attribute as a discrete, reproducible detail.

Target audience: ${concept.tags.audience}
Art style: ${concept.tags.style}
Tone: ${concept.tags.tone}

${CONTENT_SAFETY_RULES}`,
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
                physicalDescription: { type: SchemaType.STRING, description: 'STRUCTURED physical appearance using this exact format: "[Species/type]. Hair: [color, length, style]. Eyes: [color, shape]. Skin: [tone, texture]. Build: [body type, relative height]. Outfit: [specific clothing items with exact colors]. Accessories: [specific items]. Distinguishing features: [unique identifiers]." This is copied verbatim into every image prompt — be precise and consistent.' },
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

  let prompt = sanitizePlotText(`Story concept: "${concept.title}"

Premise: ${concept.sections.premise}
Author's intent: ${concept.sections.authorIntent}
Narrative arc: ${concept.sections.narrativeArc}
Tone: ${concept.sections.tone}
Visual style: ${concept.sections.visualStyle}
Cover description: ${concept.coverDescription}

Original plot idea: ${plot}`)

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
  const { concept } = input
  const plot = sanitizePlotText(input.plot)
  const { style, audience, pageCount, tone } = concept.tags

  // Build character reference block from Story Bible
  const characterBlock = storyBible.characters
    .map(c => `- ${c.name} (${c.role}): ${c.physicalDescription}`)
    .join('\n')

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    safetySettings: storySafetySettings,
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
- Every imagePrompt MUST start with "${style} style" and include the FULL physicalDescription from the Story Bible for EVERY character present in the scene.
- CRITICAL: Copy the ENTIRE structured physicalDescription VERBATIM for each character in the scene — do NOT abbreviate, paraphrase, or omit ANY attribute (hair, eyes, skin, build, outfit, accessories, distinguishing features). The illustrator treats each attribute independently; omitting any causes visual drift.
- If the story text describes a character changing appearance (e.g. putting on a costume, getting muddy), the imagePrompt MUST still include the full base description and then append "MODIFICATION: [what changed]" — never replace the base description.
- ANATOMY: Every imagePrompt for scenes with humans MUST include "anatomically correct human with exactly 2 arms, 2 legs, 5 fingers per hand, normal proportioned neck". For animals, include "species-accurate anatomy with correct limb count". This prevents AI image generators from producing extra limbs or distorted body parts.
- Image prompts must follow the art direction: use the specified color palette and lighting progression
- Do not include any text, words, or letters in image prompts

${CONTENT_SAFETY_RULES}`,
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
                description: { type: SchemaType.STRING, description: 'Copy the EXACT physicalDescription from the Story Bible verbatim. Format: "[Type]. Hair: [...]. Eyes: [...]. Skin: [...]. Build: [...]. Outfit: [...]. Accessories: [...]. Distinguishing features: [...]."' },
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

  const refinementLine = input.refinementInstruction
    ? `\n\nCreative direction: ${input.refinementInstruction}`
    : ''

  const userMessage = sanitizePlotText(`Story concept: ${concept.title}

Author's intent: ${concept.sections.authorIntent}
Premise: ${concept.sections.premise}
Message to audience: ${concept.sections.messageToAudience}

Original plot idea: ${plot}${refinementLine}`)

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
    safetySettings: storySafetySettings,
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
5. Physical descriptions — imagePrompts must contain the EXACT FULL structured physicalDescription from the Story Bible for each character present (no drift, no abbreviation, no omitted attributes — every field: Hair, Eyes, Skin, Build, Outfit, Accessories, Distinguishing features must be present)
6. Art direction — imagePrompts follow the color palette and lighting progression
7. Age-appropriateness — language and themes match target audience

If the draft is perfect, return status "VALIDATED" with an empty issues array.
If issues are found, return status "NEEDS_FIX" with each issue including the corrected content in the "fix" field.
Be conservative — only flag real problems, not stylistic preferences.

${CONTENT_SAFETY_RULES}
Also flag any language that violates the content safety rules above as an issue.`,
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
