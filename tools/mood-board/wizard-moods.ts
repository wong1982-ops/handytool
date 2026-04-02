import type { MoodOption } from './types'

export interface MoodCard {
  id: MoodOption
  label: string
  description: string
  emoji: string
}

export const MOOD_CARDS: MoodCard[] = [
  { id: 'cozy', label: 'Cozy', description: 'Warm, inviting, comfortable', emoji: '🧶' },
  { id: 'bold', label: 'Bold', description: 'Strong, vibrant, eye-catching', emoji: '⚡' },
  { id: 'elegant', label: 'Elegant', description: 'Refined, sophisticated, luxe', emoji: '✨' },
  { id: 'playful', label: 'Playful', description: 'Fun, whimsical, colorful', emoji: '🎨' },
  { id: 'minimal', label: 'Minimal', description: 'Clean, simple, focused', emoji: '◻️' },
  { id: 'vintage', label: 'Vintage', description: 'Retro, nostalgic, timeless', emoji: '📷' },
  { id: 'luxurious', label: 'Luxurious', description: 'Premium, opulent, rich', emoji: '💎' },
  { id: 'natural', label: 'Natural', description: 'Organic, earthy, serene', emoji: '🌿' },
]

export const TEMPLATES = [
  { id: 'wedding', label: 'Wedding', theme: 'Romantic wedding with soft florals and elegant details' },
  { id: 'brand', label: 'Brand Identity', theme: 'Modern tech startup branding with clean lines' },
  { id: 'interior', label: 'Interior Design', theme: 'Scandinavian-inspired living room with warm neutrals' },
  { id: 'fashion', label: 'Fashion', theme: 'Streetwear collection with urban aesthetic' },
  { id: 'food', label: 'Food & Drink', theme: 'Artisan cafe with rustic charm and fresh ingredients' },
  { id: 'travel', label: 'Travel', theme: 'Tropical island getaway with turquoise waters' },
]
