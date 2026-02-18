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
