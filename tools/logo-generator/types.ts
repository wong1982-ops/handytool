export type LogoStyle =
  | 'modern'
  | 'playful'
  | 'elegant'
  | 'bold'
  | 'vintage'
  | 'minimalist'

export type WizardStep = 1 | 2 | 3 | 4 | 5

export interface LogoConcept {
  imageUrl: string
  variation: string
}

export interface LogoProject {
  businessName: string
  tagline: string
  industry: string
  style: LogoStyle
  colors: string[]
  colorMode: 'palette' | 'custom'
  concepts: LogoConcept[]
  selectedIndex: number | null
  step: WizardStep
  loading: boolean
  error: string | null
}

export const LOGO_STYLES: {
  id: LogoStyle
  name: string
  description: string
  gradient: string
}[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean lines, geometric shapes, and a contemporary feel',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'playful',
    name: 'Playful',
    description: 'Fun, friendly, and approachable with vibrant energy',
    gradient: 'from-yellow-400 to-orange-400',
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Refined, sophisticated, and luxurious with timeless appeal',
    gradient: 'from-purple-500 to-pink-400',
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Strong, impactful, and confident with high contrast',
    gradient: 'from-red-600 to-orange-500',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    description: 'Classic, nostalgic, and timeless with retro charm',
    gradient: 'from-amber-600 to-yellow-500',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Simple, understated, and focused with purposeful whitespace',
    gradient: 'from-gray-600 to-gray-400',
  },
]

export const INDUSTRIES: string[] = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Food & Beverage',
  'Fashion & Apparel',
  'Real Estate',
  'Travel & Hospitality',
  'Fitness & Wellness',
  'Beauty & Cosmetics',
  'Legal Services',
  'Consulting',
  'Marketing & Advertising',
  'E-commerce & Retail',
  'Entertainment & Media',
  'Non-profit & Charity',
  'Construction & Architecture',
  'Automotive',
  'Sports & Recreation',
  'Photography & Design',
  'Music & Audio',
  'Pet Care',
  'Home & Garden',
  'Agriculture & Farming',
  'Environmental & Sustainability',
]

export const COLOR_PALETTES: {
  name: string
  colors: string[]
}[] = [
  {
    name: 'Ocean',
    colors: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#03045E'],
  },
  {
    name: 'Sunset',
    colors: ['#FF6B6B', '#FF8E53', '#FFC300', '#FF5733', '#C70039'],
  },
  {
    name: 'Forest',
    colors: ['#2D6A4F', '#40916C', '#74C69D', '#B7E4C7', '#1B4332'],
  },
  {
    name: 'Royal',
    colors: ['#4A0E8F', '#7B2FBE', '#9D4EDD', '#C77DFF', '#240046'],
  },
  {
    name: 'Monochrome',
    colors: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'],
  },
  {
    name: 'Coral',
    colors: ['#E63946', '#F4A261', '#E9C46A', '#2A9D8F', '#264653'],
  },
]

export const GOOGLE_FONTS: Record<string, string[]> = {
  'sans-serif': ['Inter', 'Poppins', 'Nunito', 'Montserrat'],
  serif: ['Playfair Display', 'Merriweather', 'Lora', 'EB Garamond'],
  display: ['Bebas Neue', 'Righteous', 'Fredoka One', 'Paytone One'],
  handwritten: ['Pacifico', 'Dancing Script', 'Caveat', 'Sacramento'],
}

export const DEFAULT_PROJECT: LogoProject = {
  businessName: '',
  tagline: '',
  industry: '',
  style: 'modern',
  colors: COLOR_PALETTES[0].colors,
  colorMode: 'palette',
  concepts: [],
  selectedIndex: null,
  step: 1,
  loading: false,
  error: null,
}
