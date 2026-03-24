export interface Transform {
  x: number
  y: number
  scale: number
  rotation: number
}

export interface Adjustments {
  brightness: number
  contrast: number
  sharpness: number
}

export interface PhotoFormat {
  id: string
  name: string
  country: string
  widthMm: number
  heightMm: number
  dimensions: string
}

export type ComplianceStatus = 'pass' | 'warn' | 'fail' | 'pending'

export interface Compliance {
  centered: ComplianceStatus
  faceSize: ComplianceStatus
  headStraight: ComplianceStatus
  eyesOpen: ComplianceStatus
  lighting: ComplianceStatus
}

export const DEFAULT_TRANSFORM: Transform = { x: 0, y: 0, scale: 1, rotation: 0 }

export const DEFAULT_ADJUSTMENTS: Adjustments = { brightness: 0, contrast: 0, sharpness: 0 }

export const DEFAULT_COMPLIANCE: Compliance = {
  centered: 'pending',
  faceSize: 'pending',
  headStraight: 'pending',
  eyesOpen: 'pending',
  lighting: 'pending',
}

// --- Face analysis API response types ---

export interface FaceBox {
  x: number
  y: number
  width: number
  height: number
}

export interface FaceAngle {
  roll: number
  pitch: number
  yaw: number
}

export type ComplianceLevel = 'pass' | 'warn' | 'fail'

export interface ComplianceCheck {
  pass: boolean
  level: ComplianceLevel
  message: string
}

export interface FaceCompliance {
  centered: ComplianceCheck
  faceSize: ComplianceCheck
  headStraight: ComplianceCheck
  eyesOpen: ComplianceCheck
  lighting: ComplianceCheck
}

export interface FaceAnalysisResult {
  faceBox: FaceBox
  angle: FaceAngle
  compliance: FaceCompliance
  score: number
  confidence: number
  processingTimeMs: number
}

export const PHOTO_FORMATS: PhotoFormat[] = [
  { id: 'us-passport', name: 'US Passport', country: 'United States', widthMm: 51, heightMm: 51, dimensions: '2 × 2 in (51 × 51 mm)' },
  { id: 'uk-visa', name: 'UK Visa', country: 'United Kingdom', widthMm: 35, heightMm: 45, dimensions: '35 × 45 mm' },
  { id: 'schengen-visa', name: 'Schengen Visa', country: 'Europe', widthMm: 35, heightMm: 45, dimensions: '35 × 45 mm' },
  { id: 'driving-license', name: 'Driving License', country: 'International', widthMm: 35, heightMm: 45, dimensions: 'ID-1 (35 × 45 mm)' },
  { id: 'canada-passport', name: 'Canada Passport', country: 'Canada', widthMm: 50, heightMm: 70, dimensions: '50 × 70 mm' },
  { id: 'australia-passport', name: 'Australia Passport', country: 'Australia', widthMm: 35, heightMm: 45, dimensions: '35 × 45 mm' },
  { id: 'nz-passport', name: 'New Zealand Passport', country: 'New Zealand', widthMm: 35, heightMm: 45, dimensions: '35 × 45 mm' },
  { id: 'china-visa', name: 'China Visa', country: 'China', widthMm: 33, heightMm: 48, dimensions: '33 × 48 mm' },
  { id: 'india-passport', name: 'India Passport', country: 'India', widthMm: 35, heightMm: 35, dimensions: '35 × 35 mm' },
  { id: 'japan-visa', name: 'Japan Visa', country: 'Japan', widthMm: 35, heightMm: 45, dimensions: '35 × 45 mm' },
  { id: 'korea-passport', name: 'Korea Passport', country: 'South Korea', widthMm: 35, heightMm: 45, dimensions: '35 × 45 mm' },
]

/** AI analysis result from Gemini */
export interface AIPhotoAnalysis {
  face_detected: boolean
  face_angle: { yaw: number; pitch: number }
  face_bounds: { x: number; y: number; width: number; height: number }
  eye_line_y?: number       // normalized 0-1 Y position of eyes
  chin_y?: number           // normalized 0-1 Y position of chin
  head_top_y?: number       // normalized 0-1 Y position of head top
  face_center_x?: number    // normalized 0-1 X position of face center
  brightness_score: number
  sharpness_score: number
  contrast_score: number
  background_complexity: 'clean' | 'cluttered' | 'busy'
  obstructions: string[]
  face_rotation_needed: boolean
  overall_quality: 'good' | 'fixable' | 'reject'
  reject_reason: string | null
}

/** Result from the enhance API */
export interface EnhanceResult {
  analysis: AIPhotoAnalysis
  enhancedImageUrl: string | null
  adjustments: Adjustments
  cropTransform: Transform
  faceRotationAvailable: boolean
}
