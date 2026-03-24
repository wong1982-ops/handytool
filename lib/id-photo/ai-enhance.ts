import type { AIPhotoAnalysis, Adjustments, Transform } from '@/tools/id-photo/types'

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

function getGeminiKey(): string {
  return (
    process.env.SKETCH_TO_ART_GEMINI_KEY ||
    (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
  )
}

/**
 * Enhanced prompt that asks for precise face landmark positions
 * needed for proper ID photo compliance (eye line, chin, head top).
 */
const ANALYSIS_PROMPT = `Analyze this portrait photo for passport/ID photo compliance.

Return ONLY valid JSON with this exact structure:
{
  "face_detected": boolean,
  "face_angle": { "yaw": number, "pitch": number },
  "face_bounds": { "x": number, "y": number, "width": number, "height": number },
  "eye_line_y": number,
  "chin_y": number,
  "head_top_y": number,
  "face_center_x": number,
  "brightness_score": number,
  "sharpness_score": number,
  "contrast_score": number,
  "background_complexity": "clean" | "cluttered" | "busy",
  "obstructions": string[],
  "face_rotation_needed": boolean,
  "overall_quality": "good" | "fixable" | "reject",
  "reject_reason": string | null
}

Field details:
- face_bounds: normalized 0-1 bounding box of the entire head (from top of hair to chin)
- eye_line_y: normalized 0-1 Y position of the center of both eyes
- chin_y: normalized 0-1 Y position of the bottom of the chin
- head_top_y: normalized 0-1 Y position of the top of the head/hair
- face_center_x: normalized 0-1 X position of the face center
- face_angle.yaw: degrees, 0 = perfectly front-facing, positive = turned right
- face_angle.pitch: degrees, 0 = level, positive = looking up
- brightness_score: -100 (too dark) to 100 (too bright), 0 = ideal
- sharpness_score: 0 (blurry) to 100 (sharp)
- contrast_score: 0 (flat) to 100 (high), 60 = ideal for ID photos
- face_rotation_needed: true if |yaw| > 15
- overall_quality: "good" if usable, "fixable" if adjustable, "reject" if unusable
- reject_reason: only if reject (e.g. "No face detected", "Multiple faces", "Extreme side profile")`

export async function analyzePhoto(
  imageBase64: string,
  imageMime: string,
): Promise<AIPhotoAnalysis> {
  const key = getGeminiKey()

  const response = await fetch(`${GEMINI_API_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inlineData: { mimeType: imageMime, data: imageBase64 } },
          { text: ANALYSIS_PROMPT },
        ],
      }],
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

/**
 * Calculate proper ID photo crop transform based on ICAO 9303 standards:
 * - Face (chin to crown) should be 70-80% of photo height
 * - Eyes should be at ~55-65% from bottom (or ~35-45% from top)
 * - Face horizontally centered
 * - Head straight, not tilted
 *
 * Uses eye_line_y, chin_y, head_top_y, face_center_x from Gemini analysis.
 */
export function calculateCropTransform(analysis: AIPhotoAnalysis): Transform {
  const eyeY = analysis.eye_line_y ?? (analysis.face_bounds.y + analysis.face_bounds.height * 0.35)
  const chinY = analysis.chin_y ?? (analysis.face_bounds.y + analysis.face_bounds.height)
  const headTopY = analysis.head_top_y ?? analysis.face_bounds.y
  const faceCenterX = analysis.face_center_x ?? (analysis.face_bounds.x + analysis.face_bounds.width / 2)

  // Head height = chin to top of head (normalized)
  const headHeight = chinY - headTopY
  if (headHeight <= 0) {
    return { x: 0, y: 0, scale: 1, rotation: 0 }
  }

  // Target: head should be ~75% of frame height (ICAO standard)
  const targetHeadRatio = 0.75
  const scale = clamp(targetHeadRatio / headHeight, 0.5, 2.5)

  // Target: eyes at ~40% from top of frame (60% from bottom)
  // After scaling, the eye position in frame = eyeY * scale
  // We need to offset so that eyeY maps to 0.40 in the frame
  const targetEyeFromTop = 0.40
  const offsetY = (targetEyeFromTop - eyeY * scale) * 200 / scale

  // Horizontal centering: face center should be at 0.5
  const offsetX = (0.5 - faceCenterX) * 200

  return {
    x: Math.round(offsetX),
    y: Math.round(offsetY),
    scale: Math.round(scale * 100) / 100,
    rotation: 0,
  }
}
