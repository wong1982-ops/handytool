export type FilterCategory = 'warm' | 'cool' | 'vintage' | 'bw' | 'dramatic' | 'basic'

export interface FilterPresetConfig {
  id: string
  name: string
  category: FilterCategory
  filters: { type: string; params: Record<string, number> }[]
}

export const FILTER_CATEGORIES: { id: FilterCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'warm', label: 'Warm' },
  { id: 'cool', label: 'Cool' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'bw', label: 'B&W' },
  { id: 'dramatic', label: 'Dramatic' },
]

/**
 * Convert a filter preset's Fabric.js filters to an equivalent CSS filter string.
 * Used for lightweight previews without needing Fabric or a loaded image.
 */
export function presetToCssFilter(preset: FilterPresetConfig): string {
  if (preset.filters.length === 0) return 'none'
  return preset.filters
    .map((f) => {
      switch (f.type) {
        case 'Brightness':
          return `brightness(${1 + (f.params.brightness ?? 0)})`
        case 'Contrast':
          return `contrast(${1 + (f.params.contrast ?? 0)})`
        case 'Saturation':
          return `saturate(${1 + (f.params.saturation ?? 0)})`
        case 'HueRotation': {
          const deg = (f.params.rotation ?? 0) * (180 / Math.PI)
          return `hue-rotate(${deg.toFixed(1)}deg)`
        }
        case 'Grayscale':
          return 'grayscale(1)'
        case 'Sepia':
          return 'sepia(0.6)'
        default:
          return ''
      }
    })
    .filter(Boolean)
    .join(' ')
}

/** Beautiful sunset landscape SVG used as the default filter preview sample */
export const SAMPLE_IMAGE_URI = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
<defs>
<linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#0d1b2a"/>
<stop offset="20%" stop-color="#1b3a5c"/>
<stop offset="40%" stop-color="#e76f51"/>
<stop offset="52%" stop-color="#f4a261"/>
<stop offset="62%" stop-color="#e9c46a"/>
</linearGradient>
<linearGradient id="w" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#264653" stop-opacity="0.5"/>
<stop offset="100%" stop-color="#1d3557"/>
</linearGradient>
<radialGradient id="g" cx="0.5" cy="0.7" r="0.45">
<stop offset="0%" stop-color="#f4a261" stop-opacity="0.4"/>
<stop offset="100%" stop-color="#f4a261" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="200" height="200" fill="url(#s)"/>
<circle cx="130" cy="78" r="22" fill="#f4a261" opacity="0.95"/>
<circle cx="130" cy="78" r="17" fill="#e9c46a"/>
<rect y="125" width="200" height="75" fill="url(#w)"/>
<rect y="124" width="200" height="3" fill="#e9c46a" opacity="0.25"/>
<ellipse cx="130" cy="145" rx="35" ry="3" fill="#f4a261" opacity="0.2"/>
<ellipse cx="130" cy="155" rx="25" ry="2" fill="#f4a261" opacity="0.12"/>
<rect x="40" y="115" width="3" height="25" fill="#264653" opacity="0.6"/>
<ellipse cx="41" cy="108" rx="12" ry="9" fill="#2a9d8f" opacity="0.7"/>
<rect x="155" y="110" width="2" height="20" fill="#264653" opacity="0.5"/>
<ellipse cx="156" cy="105" rx="8" ry="6" fill="#2a9d8f" opacity="0.6"/>
<rect width="200" height="200" fill="url(#g)"/>
</svg>`
)}`

export const FILTER_PRESETS: FilterPresetConfig[] = [
  // Basic
  { id: 'natural', name: 'Natural', category: 'basic', filters: [] },

  // Warm
  { id: 'valencia', name: 'Valencia', category: 'warm', filters: [
    { type: 'Brightness', params: { brightness: 0.08 } },
    { type: 'Saturation', params: { saturation: 0.15 } },
    { type: 'HueRotation', params: { rotation: -0.028 } },
  ]},
  { id: 'nashville', name: 'Nashville', category: 'warm', filters: [
    { type: 'Brightness', params: { brightness: 0.05 } },
    { type: 'Contrast', params: { contrast: 0.10 } },
    { type: 'Saturation', params: { saturation: 0.20 } },
    { type: 'HueRotation', params: { rotation: -0.056 } },
  ]},
  { id: 'gingham', name: 'Gingham', category: 'warm', filters: [
    { type: 'Brightness', params: { brightness: 0.05 } },
    { type: 'Contrast', params: { contrast: -0.05 } },
    { type: 'Saturation', params: { saturation: -0.15 } },
  ]},
  { id: 'lark', name: 'Lark', category: 'warm', filters: [
    { type: 'Brightness', params: { brightness: 0.10 } },
    { type: 'Contrast', params: { contrast: 0.05 } },
    { type: 'Saturation', params: { saturation: -0.10 } },
  ]},

  // Cool
  { id: 'clarendon', name: 'Clarendon', category: 'cool', filters: [
    { type: 'Brightness', params: { brightness: 0.05 } },
    { type: 'Contrast', params: { contrast: 0.20 } },
    { type: 'Saturation', params: { saturation: 0.15 } },
  ]},
  { id: 'hudson', name: 'Hudson', category: 'cool', filters: [
    { type: 'Brightness', params: { brightness: -0.05 } },
    { type: 'Contrast', params: { contrast: 0.10 } },
    { type: 'Saturation', params: { saturation: -0.20 } },
    { type: 'HueRotation', params: { rotation: 0.056 } },
  ]},
  { id: 'brooklyn', name: 'Brooklyn', category: 'cool', filters: [
    { type: 'Brightness', params: { brightness: -0.05 } },
    { type: 'Contrast', params: { contrast: 0.05 } },
    { type: 'Saturation', params: { saturation: -0.15 } },
    { type: 'HueRotation', params: { rotation: 0.028 } },
  ]},
  { id: 'willow', name: 'Willow', category: 'cool', filters: [
    { type: 'Grayscale', params: {} },
    { type: 'Brightness', params: { brightness: 0.05 } },
    { type: 'Contrast', params: { contrast: 0.10 } },
  ]},

  // Vintage
  { id: '1977', name: '1977', category: 'vintage', filters: [
    { type: 'Brightness', params: { brightness: 0.10 } },
    { type: 'Contrast', params: { contrast: -0.10 } },
    { type: 'Saturation', params: { saturation: 0.30 } },
    { type: 'HueRotation', params: { rotation: -0.083 } },
  ]},
  { id: 'earlybird', name: 'Earlybird', category: 'vintage', filters: [
    { type: 'Brightness', params: { brightness: 0.05 } },
    { type: 'Contrast', params: { contrast: -0.05 } },
    { type: 'Saturation', params: { saturation: 0.20 } },
    { type: 'Sepia', params: {} },
  ]},
  { id: 'toaster', name: 'Toaster', category: 'vintage', filters: [
    { type: 'Brightness', params: { brightness: 0.15 } },
    { type: 'Contrast', params: { contrast: 0.15 } },
    { type: 'Saturation', params: { saturation: 0.10 } },
    { type: 'HueRotation', params: { rotation: -0.111 } },
  ]},
  { id: 'walden', name: 'Walden', category: 'vintage', filters: [
    { type: 'Brightness', params: { brightness: 0.10 } },
    { type: 'Contrast', params: { contrast: -0.05 } },
    { type: 'Saturation', params: { saturation: 0.10 } },
    { type: 'HueRotation', params: { rotation: 0.056 } },
  ]},

  // B&W
  { id: 'inkwell', name: 'Inkwell', category: 'bw', filters: [
    { type: 'Grayscale', params: {} },
    { type: 'Contrast', params: { contrast: 0.20 } },
  ]},
  { id: 'moon', name: 'Moon', category: 'bw', filters: [
    { type: 'Grayscale', params: {} },
    { type: 'Brightness', params: { brightness: 0.10 } },
    { type: 'Contrast', params: { contrast: 0.10 } },
  ]},
  { id: 'reyes', name: 'Reyes', category: 'bw', filters: [
    { type: 'Grayscale', params: {} },
    { type: 'Brightness', params: { brightness: 0.15 } },
    { type: 'Contrast', params: { contrast: -0.10 } },
  ]},

  // Dramatic
  { id: 'juno', name: 'Juno', category: 'dramatic', filters: [
    { type: 'Contrast', params: { contrast: 0.25 } },
    { type: 'Saturation', params: { saturation: 0.20 } },
  ]},
  { id: 'lofi', name: 'Lo-Fi', category: 'dramatic', filters: [
    { type: 'Contrast', params: { contrast: 0.30 } },
    { type: 'Saturation', params: { saturation: 0.25 } },
    { type: 'Brightness', params: { brightness: -0.05 } },
  ]},
  { id: 'aden', name: 'Aden', category: 'dramatic', filters: [
    { type: 'Brightness', params: { brightness: 0.10 } },
    { type: 'Saturation', params: { saturation: -0.20 } },
    { type: 'HueRotation', params: { rotation: 0.083 } },
  ]},
  { id: 'perpetua', name: 'Perpetua', category: 'dramatic', filters: [
    { type: 'Brightness', params: { brightness: 0.05 } },
    { type: 'Saturation', params: { saturation: 0.10 } },
    { type: 'HueRotation', params: { rotation: 0.111 } },
    { type: 'Contrast', params: { contrast: -0.05 } },
  ]},
]
