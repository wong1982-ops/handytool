export type SketchMode = 'fun' | 'pro'
export type InputMethod = 'upload' | 'camera' | 'draw'
export type WizardStep = 1 | 2 | 3 | 4 | 5
export type ArtStyleCategory = 'classic' | 'modern' | 'fantasy'

export interface ArtStyle {
  id: string
  name: string
  category: ArtStyleCategory
  funLabel: string
  gradient: string // Tailwind gradient classes for card bg
}

export interface GeneratedVariation {
  imageUrl: string
  prompt: string
}

export interface RefinementMessage {
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
}

export interface GalleryEntry {
  id: string
  title: string
  original_sketch_url: string
  result_image_url: string
  style: string
  created_at: string
}

export interface WizardState {
  step: WizardStep
  sketchDataUrl: string | null
  inputMethod: InputMethod
  selectedStyle: string | null
  customStyle: string
  variations: GeneratedVariation[]
  selectedIndex: number | null
  currentImage: GeneratedVariation | null
  chatHistory: RefinementMessage[]
  refinementCount: number
  loading: boolean
  error: string | null
}

export const MAX_REFINEMENTS = 5

export const STYLE_CATEGORIES: { id: ArtStyleCategory; label: string }[] = [
  { id: 'classic', label: 'Classic Art' },
  { id: 'modern', label: 'Modern / Digital' },
  { id: 'fantasy', label: 'Fantasy / Creative' },
]

export const ART_STYLES: ArtStyle[] = [
  // Classic
  { id: 'watercolor', name: 'Watercolor', category: 'classic', funLabel: 'Watercolor', gradient: 'from-sky-300 to-blue-400' },
  { id: 'oil-painting', name: 'Oil Painting', category: 'classic', funLabel: 'Oil Painting', gradient: 'from-amber-600 to-yellow-700' },
  { id: 'impressionist', name: 'Impressionist', category: 'classic', funLabel: 'Impressionist', gradient: 'from-pink-300 to-purple-400' },
  { id: 'van-gogh', name: 'Van Gogh', category: 'classic', funLabel: 'Van Gogh', gradient: 'from-blue-500 to-yellow-400' },
  { id: 'picasso', name: 'Picasso', category: 'classic', funLabel: 'Picasso', gradient: 'from-red-400 to-blue-500' },
  { id: 'chalk-pastel', name: 'Chalk / Pastel', category: 'classic', funLabel: 'Chalk', gradient: 'from-rose-300 to-orange-300' },
  // Modern
  { id: 'cartoon', name: 'Cartoon', category: 'modern', funLabel: 'Cartoon', gradient: 'from-yellow-400 to-orange-400' },
  { id: 'anime', name: 'Anime / Manga', category: 'modern', funLabel: 'Anime', gradient: 'from-pink-500 to-rose-500' },
  { id: 'pixel-art', name: 'Pixel Art', category: 'modern', funLabel: 'Pixel Art', gradient: 'from-green-400 to-emerald-500' },
  { id: '3d-render', name: '3D Render', category: 'modern', funLabel: '3D Render', gradient: 'from-cyan-400 to-blue-500' },
  { id: 'comic-book', name: 'Comic Book', category: 'modern', funLabel: 'Comic Book', gradient: 'from-red-500 to-yellow-500' },
  { id: 'pop-art', name: 'Pop Art', category: 'modern', funLabel: 'Pop Art', gradient: 'from-fuchsia-500 to-cyan-400' },
  // Fantasy
  { id: 'ghibli', name: 'Studio Ghibli', category: 'fantasy', funLabel: 'Ghibli', gradient: 'from-green-300 to-sky-400' },
  { id: 'stained-glass', name: 'Stained Glass', category: 'fantasy', funLabel: 'Stained Glass', gradient: 'from-violet-500 to-amber-400' },
  { id: 'steampunk', name: 'Steampunk', category: 'fantasy', funLabel: 'Steampunk', gradient: 'from-amber-700 to-stone-500' },
  { id: 'cyberpunk', name: 'Cyberpunk', category: 'fantasy', funLabel: 'Cyberpunk', gradient: 'from-purple-600 to-pink-500' },
  { id: 'claymation', name: 'Claymation', category: 'fantasy', funLabel: 'Claymation', gradient: 'from-orange-300 to-yellow-300' },
  { id: 'fantasy', name: 'Fantasy Illustration', category: 'fantasy', funLabel: 'Fantasy', gradient: 'from-indigo-500 to-purple-600' },
]

export const FUN_LOADING_MESSAGES = [
  'Mixing paint...',
  'Adding sparkles...',
  'Waving the magic wand...',
  'Splashing colors...',
  'Almost ready...',
  'Creating your masterpiece...',
]

export const QUICK_REFINEMENTS = [
  { label: 'More colorful', funLabel: 'More color!', value: 'Make it more colorful and vibrant' },
  { label: 'Add background', funLabel: 'Add nature!', value: 'Add a detailed scenic background' },
  { label: 'Make darker', funLabel: 'Darker', value: 'Make the overall tone darker and moodier' },
  { label: 'More detailed', funLabel: 'More detail!', value: 'Add more fine details and textures' },
  { label: 'Simpler', funLabel: 'Simpler', value: 'Simplify the design, reduce clutter' },
  { label: 'Add sparkles', funLabel: 'Sparkles!', value: 'Add magical sparkle and glow effects' },
]

export const DEFAULT_WIZARD_STATE: WizardState = {
  step: 1,
  sketchDataUrl: null,
  inputMethod: 'upload',
  selectedStyle: null,
  customStyle: '',
  variations: [],
  selectedIndex: null,
  currentImage: null,
  chatHistory: [],
  refinementCount: 0,
  loading: false,
  error: null,
}
