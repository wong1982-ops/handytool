// ── Creation modes ──────────────────────────────────────────────
export type CreationMode = 'upload' | 'text' | 'icon' | 'ai'

// ── Shape & background ─────────────────────────────────────────
export type FaviconShape = 'circle' | 'square' | 'rounded' | 'hexagon'

export type BgType = 'solid' | 'gradient' | 'transparent'

// ── Typography ─────────────────────────────────────────────────
export type FontFamily = 'sans' | 'serif' | 'mono' | 'rounded' | 'handwritten'

// ── Sub-configs ────────────────────────────────────────────────
export interface GradientConfig {
  from: string
  to: string
  angle: number
}

export interface BorderConfig {
  enabled: boolean
  color: string
  width: number
}

export interface ShadowConfig {
  enabled: boolean
  color: string
  blur: number
  offsetX: number
  offsetY: number
}

// ── Main config ────────────────────────────────────────────────
export interface FaviconConfig {
  mode: CreationMode
  imageData?: string        // base64 data URL (upload / ai)
  text?: string             // text mode content
  iconSvg?: string          // raw SVG string (icon mode)

  // Crop / zoom for uploaded images
  cropX: number
  cropY: number
  cropZoom: number

  // Appearance
  shape: FaviconShape
  bgType: BgType
  bgColor: string
  bgGradient: GradientConfig
  fgColor: string
  fontSize: number
  fontFamily: FontFamily
  padding: number

  // Effects
  border: BorderConfig
  shadow: ShadowConfig
}

// ── Defaults ───────────────────────────────────────────────────
export const DEFAULT_CONFIG: FaviconConfig = {
  mode: 'text',
  text: 'A',

  cropX: 0,
  cropY: 0,
  cropZoom: 1,

  shape: 'rounded',
  bgType: 'solid',
  bgColor: '#3D6AF2',
  bgGradient: { from: '#3D6AF2', to: '#32D9D9', angle: 135 },
  fgColor: '#FFFFFF',
  fontSize: 70,
  fontFamily: 'sans',
  padding: 15,

  border: { enabled: false, color: '#FFFFFF', width: 2 },
  shadow: { enabled: false, color: 'rgba(0,0,0,0.3)', blur: 8, offsetX: 0, offsetY: 2 },
}

// ── Export sizes ───────────────────────────────────────────────
export interface ExportSize {
  width: number
  height: number
  label: string
  filename: string
  checked: boolean
}

export const EXPORT_SIZES: ExportSize[] = [
  { width: 16,  height: 16,  label: '16×16',           filename: 'favicon-16x16.png',       checked: true },
  { width: 32,  height: 32,  label: '32×32',           filename: 'favicon-32x32.png',       checked: true },
  { width: 48,  height: 48,  label: '48×48',           filename: 'favicon-48x48.png',       checked: true },
  { width: 180, height: 180, label: '180×180 (Apple)',  filename: 'apple-touch-icon.png',    checked: true },
  { width: 192, height: 192, label: '192×192 (Android)',filename: 'android-chrome-192x192.png', checked: true },
  { width: 512, height: 512, label: '512×512 (PWA)',    filename: 'android-chrome-512x512.png', checked: true },
]

// ── Font map ───────────────────────────────────────────────────
export const FONT_MAP: Record<FontFamily, string> = {
  sans:        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  serif:       'Georgia, "Times New Roman", Times, serif',
  mono:        'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  rounded:     'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  handwritten: '"Segoe Script", "Bradley Hand", Chilanka, cursive',
}

// ── Shape labels ───────────────────────────────────────────────
export const SHAPE_LABELS: Record<FaviconShape, string> = {
  circle:  'Circle',
  square:  'Square',
  rounded: 'Rounded',
  hexagon: 'Hexagon',
}
