import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAuth } from 'google-auth-library'
import { uploadToR2 } from '@/lib/storage/r2'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Vertex AI config for Imagen 3
const VERTEX_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID
const VERTEX_REGION = process.env.GOOGLE_CLOUD_REGION || 'us-central1'

// Fallback providers
const FAL_API_KEY = process.env.FAL_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export interface CharacterReference {
  name: string
  description: string
  buffer: Buffer
}

export interface IllustrateInput {
  imagePrompt: string
  characters?: { name: string; description: string }[]
  referenceImage?: Buffer    // single character reference sheet (Strategy 3, standalone mode)
  characterReferences?: CharacterReference[] // per-character portraits (Strategy 3, series mode)
  previousPageImage?: Buffer // previous page image for continuity (Strategy 5)
  seed?: number              // locked seed for consistency (Strategy 1)
  style?: string             // art style for style reference
}

export interface IllustrateResult {
  url: string
  buffer: Buffer | null // raw image buffer for chaining to next page
}

// ---------- Vertex AI Auth ----------

let vertexAuth: GoogleAuth | null = null

function getVertexAuth(): GoogleAuth {
  if (vertexAuth) return vertexAuth

  const serviceKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  const adcJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON

  if (serviceKey) {
    // Service account key (JSON)
    vertexAuth = new GoogleAuth({
      credentials: JSON.parse(serviceKey),
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })
  } else if (adcJson) {
    // User OAuth credentials (from gcloud auth application-default login)
    // Works on Vercel where ADC file doesn't exist
    vertexAuth = new GoogleAuth({
      credentials: JSON.parse(adcJson),
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })
  } else {
    // Fall back to Application Default Credentials (local dev)
    vertexAuth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })
  }
  return vertexAuth
}

async function getVertexAccessToken(): Promise<string> {
  const auth = getVertexAuth()
  const client = await auth.getClient()
  const { token } = await client.getAccessToken()
  if (!token) throw new Error('Failed to get Vertex AI access token')
  return token
}

// ---------- Subject Type Detection ----------

/**
 * Common animal keywords for species-specific anatomy prompts.
 * Maps keyword → { anatomy description, Imagen 3 subject type }.
 */
const ANIMAL_ANATOMY: Record<string, { anatomy: string; subjectType: string }> = {
  dog:       { anatomy: '4 legs, 1 tail, 2 ears, 1 snout, 4 paws with paw pads', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  puppy:     { anatomy: '4 legs, 1 tail, 2 ears, 1 snout, 4 paws with paw pads', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  cat:       { anatomy: '4 legs, 1 tail, 2 ears, 4 paws with retractable claws, whiskers', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  kitten:    { anatomy: '4 legs, 1 tail, 2 ears, 4 paws with retractable claws, whiskers', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  rabbit:    { anatomy: '4 legs, 1 short fluffy tail, 2 long ears, 4 paws', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  bunny:     { anatomy: '4 legs, 1 short fluffy tail, 2 long ears, 4 paws', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  horse:     { anatomy: '4 legs with hooves, 1 long tail, 2 ears, 1 mane', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  pony:      { anatomy: '4 legs with hooves, 1 long tail, 2 ears, 1 mane', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  unicorn:   { anatomy: '4 legs with hooves, 1 long tail, 2 ears, 1 mane, 1 horn on forehead', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  bear:      { anatomy: '4 legs, 1 short tail, 2 rounded ears, 4 paws with claws', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  fox:       { anatomy: '4 legs, 1 bushy tail, 2 pointed ears, 4 paws, pointed snout', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  wolf:      { anatomy: '4 legs, 1 bushy tail, 2 pointed ears, 4 paws, elongated snout', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  bird:      { anatomy: '2 wings, 2 legs with talons, 1 beak, 1 tail fan, feathered body', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  owl:       { anatomy: '2 wings, 2 legs with talons, 1 beak, large round eyes, feathered body, can rotate head', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  eagle:     { anatomy: '2 large wings, 2 legs with talons, 1 hooked beak, 1 tail fan', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  penguin:   { anatomy: '2 flippers (not flying wings), 2 legs with webbed feet, 1 beak, upright posture', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  dragon:    { anatomy: '4 legs with claws, 2 wings, 1 long tail, 2 horns, scales covering body', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  frog:      { anatomy: '4 legs (2 long hind legs for jumping, 2 shorter front legs), no tail, wide mouth, bulging eyes', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  turtle:    { anatomy: '4 legs, 1 shell (dome top, flat bottom), 1 small tail, 1 head that can retract', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  fish:      { anatomy: 'fins (dorsal, pectoral, caudal/tail), scales, gills, no legs', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  elephant:  { anatomy: '4 thick legs, 1 trunk, 2 large ears, 1 thin tail, 2 tusks (if adult)', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  lion:      { anatomy: '4 legs, 1 tail with tuft, 2 ears, 4 paws with claws, mane (if male)', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  mouse:     { anatomy: '4 legs, 1 long thin tail, 2 large round ears, 4 tiny paws, whiskers', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  deer:      { anatomy: '4 legs with hooves, 1 short tail, 2 ears, antlers (if male/stag)', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  butterfly: { anatomy: '2 pairs of wings (4 wings total), 6 legs, 2 antennae, proboscis', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  spider:    { anatomy: '8 legs, no wings, multiple eyes (usually 8), spinnerets', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  snake:     { anatomy: 'no legs, no arms, long cylindrical body, forked tongue, scales', subjectType: 'SUBJECT_TYPE_ANIMAL' },
  monkey:    { anatomy: '2 arms, 2 legs, 1 long tail (prehensile), 5 fingers per hand, 5 toes per foot', subjectType: 'SUBJECT_TYPE_ANIMAL' },
}

/** Object/item keywords for Imagen 3 subject type detection */
const OBJECT_KEYWORDS = [
  'wand', 'sword', 'staff', 'crown', 'ring', 'amulet', 'book', 'lamp',
  'mirror', 'key', 'chest', 'potion', 'crystal', 'orb', 'shield', 'gem',
  'robot', 'machine', 'vehicle', 'ship', 'castle', 'house', 'toy',
]

/**
 * Detect the Imagen 3 subject type and species-specific anatomy from a character description.
 * Returns { subjectType, anatomyHint } for use in prompts and API calls.
 */
function detectSubjectInfo(description: string): { subjectType: string; anatomyHint: string } {
  const lower = description.toLowerCase()

  // Check animal keywords first (more specific)
  for (const [keyword, info] of Object.entries(ANIMAL_ANATOMY)) {
    if (lower.includes(keyword)) {
      return {
        subjectType: info.subjectType,
        anatomyHint: `${keyword} anatomy: ${info.anatomy}`,
      }
    }
  }

  // Check object keywords
  for (const kw of OBJECT_KEYWORDS) {
    if (lower.includes(kw)) {
      return {
        subjectType: 'SUBJECT_TYPE_PRODUCT',
        anatomyHint: '',
      }
    }
  }

  // Default to person (humans, humanoids, fairies, elves, etc.)
  return {
    subjectType: 'SUBJECT_TYPE_PERSON',
    anatomyHint: 'human anatomy: exactly 2 arms, 2 legs, 5 fingers per hand, 5 toes per foot, normal proportioned neck',
  }
}

// ---------- Prompt Building ----------

/**
 * Build a structured prompt with full character descriptions repeated every time.
 *
 * Strategy 2: Consistent Base Prompt — same core character descriptions in every prompt.
 * Strategy 4: Specific Details — use the detailed descriptions from story generation.
 * Strategy 6: Prompt Repetition — copy the ENTIRE physical description into each prompt.
 *             Do NOT assume the model remembers characters from previous turns.
 * Strategy 7: Use Specific Terms — "messy charcoal-grey hair" not "grey hair".
 *             Specific modifiers help the AI repeatedly produce similar visuals.
 */
function buildPrompt(input: IllustrateInput): string {
  let prompt = ''

  // Strategy 6: Full character descriptions repeated in EVERY prompt
  // Strategy 7: Descriptions should already contain specific terms from story generation
  if (input.characters?.length) {
    prompt += 'CHARACTER CONSISTENCY RULES (MANDATORY):\n'
    prompt += '- You MUST reproduce EVERY attribute listed below EXACTLY as specified.\n'
    prompt += '- Do NOT change, omit, or reinterpret ANY detail: hair color/length/style, eye color/shape, skin tone, body type, outfit (every clothing item with exact colors), accessories, and distinguishing features.\n'
    prompt += '- Each character MUST be visually distinguishable and match their description on EVERY page.\n'
    prompt += '- If a character appeared on a previous page, they MUST look IDENTICAL here.\n\n'
    prompt += 'CHARACTERS:\n'
    prompt += input.characters.map(c => `• ${c.name}: ${c.description}`).join('\n')
    prompt += '\n\n'
  }

  if (input.style) {
    prompt += `ART STYLE: ${input.style}. `
  }

  // Anatomical correctness rules — species-specific when possible
  prompt += 'ANATOMY RULES (MANDATORY):\n'
  if (input.characters?.length) {
    const anatomyHints = input.characters
      .map(c => {
        const info = detectSubjectInfo(c.description)
        return info.anatomyHint ? `- ${c.name}: ${info.anatomyHint}` : null
      })
      .filter(Boolean)
    if (anatomyHints.length) {
      prompt += anatomyHints.join('\n') + '\n'
    }
  }
  prompt += '- No extra limbs, merged fingers, elongated/snake-like necks, or distorted body proportions.\n'
  prompt += '- Hands must have natural proportions with correct finger count.\n\n'

  prompt += `SCENE: ${input.imagePrompt}`
  prompt += '\n\nIMPORTANT: Do not include any text, words, letters, or writing in the image. Illustration only.'
  return prompt
}

/**
 * Build an Imagen 3 prompt that references subjects using [N] bracket notation.
 * When using subject references, the prompt must contain [referenceId] markers.
 *
 * Strategy 6: Full character descriptions repeated every time (Prompt Repetition).
 * Strategy 7: Specific physical terms for visual consistency.
 */
function buildImagen3Prompt(input: IllustrateInput, subjectRefCount: number): string {
  let prompt = ''

  if (input.style) {
    prompt += `${input.style} style. `
  }

  if (input.characters?.length && subjectRefCount > 0) {
    // With subject references, use [N] notation to link each character to their portrait
    // Strategy 6: Still include full descriptions even with reference images
    if (subjectRefCount === 1) {
      prompt += `Illustrate [1] in this scene: ${input.imagePrompt}. `
    } else {
      // Multiple character references: [1], [2], etc.
      const refTags = Array.from({ length: subjectRefCount }, (_, i) => `[${i + 1}]`).join(' and ')
      prompt += `Illustrate ${refTags} in this scene: ${input.imagePrompt}. `
    }
    prompt += `CRITICAL — reproduce EVERY physical attribute exactly as described. Do NOT change hair, eyes, skin, outfit, or accessories: ${input.characters.map(c => `${c.name} — ${c.description}`).join('. ')}. `
  } else if (input.characters?.length) {
    // Strategy 6+7: Full specific descriptions repeated in every prompt
    prompt += input.characters.map(c => `${c.name}: ${c.description}`).join('. ') + '. '
    prompt += input.imagePrompt + '. '
  } else {
    prompt += input.imagePrompt + '. '
  }

  // Species-specific anatomy for Imagen 3 prompts
  if (input.characters?.length) {
    const hints = input.characters
      .map(c => detectSubjectInfo(c.description).anatomyHint)
      .filter(Boolean)
    if (hints.length) {
      prompt += `Anatomically correct: ${hints.join('. ')}. `
    }
  } else {
    prompt += 'Anatomically correct: humans have exactly 2 arms, 2 legs, 5 fingers per hand, normal neck. Animals have species-accurate limb count. '
  }
  prompt += 'No text, words, letters, or writing in the image. Children\'s book illustration.'
  return prompt
}

// ---------- Character Reference (Gemini Flash) ----------

/**
 * Generate a character reference sheet showing all main characters side by side.
 * Strategy 3: Character Reference — generate a base reference image.
 * Uses Gemini Flash for image generation (supports multi-modal output).
 */
export async function generateCharacterReference(
  characters: { name: string; description: string }[],
  style: string,
  styleReferenceImage?: Buffer,
): Promise<Buffer | null> {
  // Build prompt based on single character vs multiple
  const isSingle = characters.length === 1
  const charDescs = characters.map(c => `${c.name}: ${c.description}`).join('. ')

  const anatomyRules = 'Anatomically correct: humans have exactly 2 arms, 2 legs, 5 fingers per hand, 5 toes per foot, normal proportioned neck. Animals have species-accurate limb count. No extra limbs, merged fingers, or distorted proportions.'

  const buildRefPrompt = (suffix: string) => isSingle
    ? `${style} style full body character portrait of ${characters[0].name}. ${characters[0].description}. Standing pose, clear details, clean background. ${anatomyRules} ${suffix}`
    : `${style} style character reference sheet showing all main characters side by side, full body, clear distinct appearances, white background. Characters: ${charDescs}. ${anatomyRules} ${suffix}`

  // Try Imagen 3 with style reference first (best consistency with existing portraits)
  if (characters.length && VERTEX_PROJECT_ID && styleReferenceImage) {
    try {
      console.log(`[illustrate] Generating character ${isSingle ? 'portrait' : 'reference sheet'} via Imagen 3 with style reference...`)
      const prompt = buildRefPrompt('No text, words, or letters in the image.')

      const token = await getVertexAccessToken()
      const url = `https://${VERTEX_REGION}-aiplatform.googleapis.com/v1/projects/${VERTEX_PROJECT_ID}/locations/${VERTEX_REGION}/publishers/google/models/imagen-3.0-capability-001:predict`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{
            prompt,
            referenceImages: [{
              referenceType: 'REFERENCE_TYPE_STYLE',
              referenceId: 1,
              referenceImage: {
                bytesBase64Encoded: styleReferenceImage.toString('base64'),
              },
              styleImageConfig: {
                styleDescription: `Match this exact ${style} art style, color palette, line weight, shading technique, and visual mood`,
              },
            }],
          }],
          parameters: {
            sampleCount: 1,
            personGeneration: 'allow_all',
            safetySetting: 'block_only_high',
          },
        }),
      })

      if (!response.ok) {
        const err = await response.text()
        throw new Error(`Imagen 3 capability error: ${response.status} ${err}`)
      }

      const data = await response.json()
      const prediction = data.predictions?.[0]
      if (!prediction?.bytesBase64Encoded) {
        throw new Error('No image returned from Imagen 3 capability')
      }

      const buffer = Buffer.from(prediction.bytesBase64Encoded, 'base64')
      console.log(`[illustrate] Character ${isSingle ? 'portrait' : 'reference'} via Imagen 3 + style ref (${(buffer.length / 1024).toFixed(0)} KB)`)
      return buffer
    } catch (err) {
      console.warn('[illustrate] Imagen 3 capability with style ref failed, trying standard:', err)
    }
  }

  // Try Imagen 3 standard (no style reference)
  if (characters.length && VERTEX_PROJECT_ID) {
    try {
      console.log(`[illustrate] Generating character ${isSingle ? 'portrait' : 'reference sheet'} via Imagen 3...`)
      const prompt = buildRefPrompt('No text, words, or letters in the image.')

      const buffer = await generateWithImagen3Standard(prompt)
      console.log(`[illustrate] Character ${isSingle ? 'portrait' : 'reference'} via Imagen 3 (${(buffer.length / 1024).toFixed(0)} KB)`)
      return buffer
    } catch (err) {
      console.warn('[illustrate] Imagen 3 character reference failed, trying Gemini Flash:', err)
    }
  }

  if (!characters.length || !process.env.GEMINI_API_KEY) {
    console.log('[illustrate] Skipping character reference: no characters or no API key')
    return null
  }

  try {
    const prompt = buildRefPrompt('No text.')

    console.log('[illustrate] Generating character reference sheet via Gemini Flash...')
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp-image-generation',
      generationConfig: {
        // @ts-expect-error — responseModalities is valid for image generation models
        responseModalities: ['IMAGE', 'TEXT'],
      },
    })

    const result = await model.generateContent(prompt)
    const response = result.response
    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData?.mimeType?.startsWith('image/')
    )

    if (!imagePart?.inlineData?.data) {
      console.warn('[illustrate] Character reference: no image in response')
      return null
    }

    const buf = Buffer.from(imagePart.inlineData.data, 'base64')
    console.log(`[illustrate] Character reference via Gemini Flash (${(buf.length / 1024).toFixed(0)} KB)`)
    return buf
  } catch (err) {
    console.error('[illustrate] Character reference generation failed:', err)
    return null
  }
}

// ---------- Imagen 3 via Vertex AI ----------

/**
 * Generate with Imagen 3 standard model (imagen-3.0-generate-002).
 * Supports: seed for deterministic output, aspect ratio, negative prompts.
 * Strategy 1: Lock the Seed.
 */
async function generateWithImagen3Standard(
  prompt: string,
  seed?: number,
): Promise<Buffer> {
  const token = await getVertexAccessToken()
  const url = `https://${VERTEX_REGION}-aiplatform.googleapis.com/v1/projects/${VERTEX_PROJECT_ID}/locations/${VERTEX_REGION}/publishers/google/models/imagen-3.0-generate-002:predict`

  console.log(`[illustrate] Imagen 3 standard generation${seed != null ? ` (seed=${seed})` : ''}`)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: '3:4', // portrait for book pages
        addWatermark: false, // required for seed to work
        personGeneration: 'allow_all',
        safetySetting: 'block_only_high',
        negativePrompt: 'text, words, letters, writing, watermark, signature, blurry, low quality, inconsistent character appearance, different hairstyle, different clothing, different eye color, character redesign, wrong outfit color, extra arms, extra legs, extra fingers, six fingers, four arms, three arms, merged fingers, fused fingers, deformed hands, malformed hands, extra limbs, missing limbs, elongated neck, snake neck, distorted anatomy, extra ears, three eyes, deformed face, mutated body',
        ...(seed != null ? { seed } : {}),
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Imagen 3 error: ${response.status} ${err}`)
  }

  const data = await response.json()
  const prediction = data.predictions?.[0]

  if (!prediction?.bytesBase64Encoded) {
    throw new Error('No image returned from Imagen 3 (possibly filtered by safety)')
  }

  return Buffer.from(prediction.bytesBase64Encoded, 'base64')
}

/**
 * Generate with Imagen 3 capability model (imagen-3.0-capability-001).
 * Supports: subject reference images for character consistency.
 * Strategy 3: Character Reference — pass reference sheet as subject reference.
 * Strategy 5: Re-use Successful Images — pass previous page as style reference.
 */
async function generateWithImagen3WithReference(
  prompt: string,
  characterRefs: CharacterReference[],
  previousPageImage?: Buffer,
): Promise<Buffer> {
  const token = await getVertexAccessToken()
  const url = `https://${VERTEX_REGION}-aiplatform.googleapis.com/v1/projects/${VERTEX_PROJECT_ID}/locations/${VERTEX_REGION}/publishers/google/models/imagen-3.0-capability-001:predict`

  // Build reference images array — one subject reference per character portrait
  // Detect correct subject type (person, animal, product) from character description
  const referenceImages: Record<string, unknown>[] = characterRefs.map((ref, idx) => {
    const { subjectType } = detectSubjectInfo(ref.description)
    return {
      referenceType: 'REFERENCE_TYPE_SUBJECT',
      referenceId: idx + 1,
      referenceImage: {
        bytesBase64Encoded: ref.buffer.toString('base64'),
      },
      subjectImageConfig: {
        subjectDescription: `${ref.name} — MUST match exactly: ${ref.description}`,
        subjectType,
      },
    }
  })

  // Add previous page as style reference for visual continuity (Strategy 5)
  // Style reference ID comes after all subject references
  if (previousPageImage) {
    referenceImages.push({
      referenceType: 'REFERENCE_TYPE_STYLE',
      referenceId: characterRefs.length + 1,
      referenceImage: {
        bytesBase64Encoded: previousPageImage.toString('base64'),
      },
      styleImageConfig: {
        styleDescription: 'Maintain the same art style, color palette, visual mood, AND character appearances (identical hair, clothing, features) as this previous page',
      },
    })
  }

  console.log(`[illustrate] Imagen 3 capability generation (${characterRefs.length} subject ref${characterRefs.length > 1 ? 's' : ''}${previousPageImage ? ' + style ref' : ''})`)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      instances: [{
        prompt,
        referenceImages,
      }],
      parameters: {
        sampleCount: 1,
        personGeneration: 'allow_all',
        safetySetting: 'block_only_high',
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Imagen 3 capability error: ${response.status} ${err}`)
  }

  const data = await response.json()
  const prediction = data.predictions?.[0]

  if (!prediction?.bytesBase64Encoded) {
    throw new Error('No image returned from Imagen 3 capability (possibly filtered)')
  }

  return Buffer.from(prediction.bytesBase64Encoded, 'base64')
}

// ---------- Gemini Flash (fallback with reference support) ----------

/** Extract image base64 from a Gemini response */
function extractBase64FromGeminiResponse(response: { candidates?: { content?: { parts?: { inlineData?: { mimeType: string; data: string } }[] } }[] }): string {
  const imagePart = response.candidates?.[0]?.content?.parts?.find(
    (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData?.mimeType?.startsWith('image/')
  )

  if (!imagePart?.inlineData?.data) {
    throw new Error('No image returned from Gemini')
  }

  return imagePart.inlineData.data
}

async function generateWithGemini(
  prompt: string,
  referenceImage?: Buffer,
  previousPageImage?: Buffer,
  seed?: number,
): Promise<Buffer> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp-image-generation',
    generationConfig: {
      // @ts-expect-error — responseModalities is valid for image generation models
      responseModalities: ['IMAGE', 'TEXT'],
      ...(seed != null ? { seed } : {}),
    },
  })

  const hasImages = referenceImage || previousPageImage
  if (hasImages) {
    const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = []

    if (referenceImage) {
      parts.push({ inlineData: { mimeType: 'image/png', data: referenceImage.toString('base64') } })
    }
    if (previousPageImage) {
      parts.push({ inlineData: { mimeType: 'image/png', data: previousPageImage.toString('base64') } })
    }

    let instruction = ''
    if (referenceImage && previousPageImage) {
      instruction = 'IMAGE 1 is the character reference sheet. IMAGE 2 is the previous page illustration. '
        + 'CHARACTER CONSISTENCY IS THE #1 PRIORITY. You MUST match EVERY attribute from the reference sheet: '
        + 'exact hair color, length, and style; exact eye color and shape; exact skin tone; exact clothing items with their specific colors; '
        + 'exact accessories; exact body proportions and build. Do NOT change ANY of these attributes. '
        + 'Maintain the same art style, color palette, and lighting as the previous page for visual continuity. '
    } else if (referenceImage) {
      instruction = 'The image above is the character reference sheet. '
        + 'CHARACTER CONSISTENCY IS THE #1 PRIORITY. You MUST match EVERY attribute from this reference: '
        + 'exact hair color, length, and style; exact eye color and shape; exact skin tone; exact clothing items with their specific colors; '
        + 'exact accessories; exact body proportions and build. Do NOT change ANY of these attributes. '
    } else if (previousPageImage) {
      instruction = 'The image above is the previous page illustration. '
        + 'CHARACTER CONSISTENCY IS THE #1 PRIORITY. Maintain IDENTICAL character appearances — same hair, eyes, skin, outfit, accessories. '
        + 'Also maintain the same art style, color palette, and visual mood for continuity. '
    }

    instruction += 'ANATOMY: Humans must have exactly 2 arms, 2 legs, 5 fingers per hand, normal neck. Animals must have species-correct limb count. No extra limbs or merged fingers. '

    parts.push({ text: instruction + prompt })

    console.log(`[illustrate] Gemini Flash with${referenceImage ? ' reference' : ''}${previousPageImage ? ' + prev page' : ''}${seed != null ? ` (seed=${seed})` : ''}`)
    const result = await model.generateContent({ contents: [{ role: 'user' as const, parts }] })
    const base64 = extractBase64FromGeminiResponse(result.response)
    return Buffer.from(base64, 'base64')
  }

  console.log(`[illustrate] Gemini Flash without reference${seed != null ? ` (seed=${seed})` : ''}`)
  const result = await model.generateContent(prompt)
  const base64 = extractBase64FromGeminiResponse(result.response)
  return Buffer.from(base64, 'base64')
}

// ---------- Other Fallbacks ----------

async function generateWithFal(prompt: string): Promise<Buffer> {
  const response = await fetch('https://fal.run/fal-ai/flux/dev', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_size: 'landscape_16_9',
      num_inference_steps: 28,
      guidance_scale: 3.5,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`fal.ai error: ${response.status} ${err}`)
  }

  const data = await response.json()
  const imageUrl = data.images?.[0]?.url
  if (!imageUrl) throw new Error('No image returned from fal.ai')

  const imageResponse = await fetch(imageUrl)
  if (!imageResponse.ok) throw new Error('Failed to download generated image')
  const ab = await imageResponse.arrayBuffer()
  return Buffer.from(ab)
}

async function generateWithDalle(prompt: string): Promise<{ buffer: Buffer | null; url: string }> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
      response_format: 'url',
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`DALL-E error: ${response.status} ${err}`)
  }

  const data = await response.json()
  const imageUrl = data.data?.[0]?.url
  if (!imageUrl) throw new Error('No image returned from DALL-E')

  // In dev mode, return the URL directly (skip Supabase upload)
  if (process.env.NODE_ENV === 'development') {
    return { buffer: null, url: imageUrl as string }
  }

  const imageResponse = await fetch(imageUrl)
  if (!imageResponse.ok) throw new Error('Failed to download generated image')
  const ab = await imageResponse.arrayBuffer()
  return { buffer: Buffer.from(ab), url: '' }
}

// ---------- Upload Helper ----------

async function uploadToStorage(buffer: Buffer): Promise<string> {
  const filename = `illustrations/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`
  return uploadToR2(filename, buffer, 'image/png')
}

// ---------- Main Entry Point ----------

/**
 * Generate a single illustration. Returns URL + raw buffer for chaining.
 *
 * Provider priority: Imagen 3 with reference → Imagen 3 standard → Gemini Flash → fal.ai → DALL-E
 *
 * All 5 consistency strategies:
 * 1. Lock the Seed — same seed across all pages (Imagen 3 standard)
 * 2. Consistent Base Prompt — character descriptions lead every prompt
 * 3. Character Reference — reference sheet passed as subject reference (Imagen 3 capability)
 * 4. Specific Details — detailed character descriptions from story generation
 * 5. Re-use Successful Images — previous page buffer passed as style reference
 */
export async function generateIllustration(input: IllustrateInput): Promise<IllustrateResult> {
  let buffer: Buffer | null = null

  // Resolve character references: prefer per-character portraits (series mode),
  // fall back to single reference image (standalone mode)
  const charRefs: CharacterReference[] = input.characterReferences?.length
    ? input.characterReferences
    : input.referenceImage && input.characters?.length
      ? [{ name: 'characters', description: input.characters.map(c => `${c.name}: ${c.description}`).join('. '), buffer: input.referenceImage }]
      : []

  // --- Priority 1: Imagen 3 with subject/style reference (best consistency) ---
  if (VERTEX_PROJECT_ID && charRefs.length > 0) {
    try {
      const prompt = buildImagen3Prompt(input, charRefs.length)
      buffer = await generateWithImagen3WithReference(
        prompt,
        charRefs,
        input.previousPageImage,
      )
      const url = process.env.NODE_ENV === 'development'
        ? `data:image/png;base64,${buffer.toString('base64')}`
        : await uploadToStorage(buffer)
      return { url, buffer }
    } catch (err) {
      console.warn('[illustrate] Imagen 3 capability failed, trying standard:', err)
    }
  }

  // --- Priority 2: Imagen 3 standard with seed (deterministic, no reference) ---
  if (VERTEX_PROJECT_ID) {
    try {
      const prompt = buildImagen3Prompt(input, 0)
      buffer = await generateWithImagen3Standard(prompt, input.seed)
      const url = process.env.NODE_ENV === 'development'
        ? `data:image/png;base64,${buffer.toString('base64')}`
        : await uploadToStorage(buffer)
      return { url, buffer }
    } catch (err) {
      console.warn('[illustrate] Imagen 3 standard failed, falling back to Gemini Flash:', err)
    }
  }

  // --- Priority 3: Gemini Flash (supports inline reference images, uses first ref only) ---
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = buildPrompt(input)
      const firstRef = charRefs.length > 0 ? charRefs[0].buffer : undefined
      buffer = await generateWithGemini(prompt, firstRef, input.previousPageImage, input.seed)
      const url = process.env.NODE_ENV === 'development'
        ? `data:image/png;base64,${buffer.toString('base64')}`
        : await uploadToStorage(buffer)
      return { url, buffer }
    } catch (err) {
      console.warn('[illustrate] Gemini Flash failed, falling back:', err)
    }
  }

  // --- Priority 4: fal.ai (no reference support) ---
  if (FAL_API_KEY) {
    const prompt = buildPrompt(input)
    buffer = await generateWithFal(prompt)
    const url = process.env.NODE_ENV === 'development'
      ? `data:image/png;base64,${buffer.toString('base64')}`
      : await uploadToStorage(buffer)
    return { url, buffer }
  }

  // --- Priority 5: DALL-E (no reference support) ---
  const prompt = buildPrompt(input)
  const dalleResult = await generateWithDalle(prompt)
  if (dalleResult.url) {
    return { url: dalleResult.url, buffer: dalleResult.buffer }
  }
  buffer = dalleResult.buffer!
  const url = await uploadToStorage(buffer)
  return { url, buffer }
}
