import type { AIPhotoAnalysis, Adjustments, Transform } from '@/tools/id-photo/types'

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

function getGeminiKey(): string {
  return (
    process.env.SKETCH_TO_ART_GEMINI_KEY ||
    (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
  )
}

const ANALYSIS_PROMPT = `Analyze this ID photo and return a JSON object with the following fields:
- face_detected (boolean): whether a face is clearly visible
- face_angle (object): { yaw: number, pitch: number } — head rotation angles in degrees, 0 = straight
- face_bounds (object): { x: number, y: number, width: number, height: number } — normalized 0-1 bounding box of the face within the image
- brightness_score (number): -100 to 100, where 0 = ideal, negative = underexposed, positive = overexposed
- sharpness_score (number): 0 to 100, where 100 = perfectly sharp, below 60 = unacceptably blurry
- contrast_score (number): 0 to 100, where 60 = ideal contrast for ID photos
- background_complexity ("clean" | "cluttered" | "busy"): how complex the background is
- obstructions (string[]): list of any obstructions detected (e.g. "glasses", "hat", "hair covering face")
- face_rotation_needed (boolean): whether the face tilt is significant enough to require correction
- overall_quality ("good" | "fixable" | "reject"): overall assessment — "good" means usable as-is, "fixable" means adjustments can improve it, "reject" means photo cannot be used for ID
- reject_reason (string | null): if overall_quality is "reject", explain why; otherwise null

Return ONLY valid JSON, no markdown or extra text.`

export async function analyzePhoto(
  imageBase64: string,
  imageMime: string
): Promise<AIPhotoAnalysis> {
  const key = getGeminiKey()

  const response = await fetch(`${GEMINI_API_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: imageMime,
                data: imageBase64,
              },
            },
            {
              text: ANALYSIS_PROMPT,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  return JSON.parse(text) as AIPhotoAnalysis
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function calculateAdjustments(analysis: AIPhotoAnalysis): Adjustments {
  const rawBrightness = Math.round(-analysis.brightness_score * 0.4)
  const rawContrast = Math.round((60 - analysis.contrast_score) * 0.3)
  const rawSharpness =
    analysis.sharpness_score < 60
      ? Math.round((60 - analysis.sharpness_score) * 0.5)
      : 0

  return {
    brightness: clamp(rawBrightness, -50, 50),
    contrast: clamp(rawContrast, -50, 50),
    sharpness: clamp(rawSharpness, 0, 50),
  }
}

export function calculateCropTransform(analysis: AIPhotoAnalysis): Transform {
  const { x, y, width, height } = analysis.face_bounds

  // Face center in normalized coordinates
  const faceCenterX = x + width / 2
  const faceCenterY = y + height / 2

  // Offset from target position (0.5, 0.4) scaled to pixels
  const offsetX = (0.5 - faceCenterX) * 200
  const offsetY = (0.4 - faceCenterY) * 200

  // Scale so face height fills 70% of frame
  const targetFaceHeight = 0.7
  const rawScale = height > 0 ? targetFaceHeight / height : 1
  const scale = clamp(rawScale, 0.5, 2)

  return {
    x: offsetX,
    y: offsetY,
    scale,
    rotation: 0,
  }
}
