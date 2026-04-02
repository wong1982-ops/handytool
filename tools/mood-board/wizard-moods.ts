import type { MoodOption } from './types'

export interface MoodCard {
  id: MoodOption
  label: string
  description: string
  /** CSS gradient for the card background */
  gradient: string
  /** CSS background for an overlaid abstract pattern */
  pattern: string
  /** Accent color for selected ring glow */
  accent: string
}

export const MOOD_CARDS: MoodCard[] = [
  {
    id: 'cozy',
    label: 'Cozy',
    description: 'Warm, inviting, comfortable',
    gradient: 'linear-gradient(135deg, #D4845A 0%, #C4633A 35%, #8B4513 100%)',
    pattern: `radial-gradient(circle at 20% 80%, rgba(255,200,150,0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,170,100,0.25) 0%, transparent 45%)`,
    accent: '#D4845A',
  },
  {
    id: 'bold',
    label: 'Bold',
    description: 'Strong, vibrant, eye-catching',
    gradient: 'linear-gradient(135deg, #FF3366 0%, #E61E50 40%, #CC0033 100%)',
    pattern: `linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.08) 75%, transparent 75%)`,
    accent: '#FF3366',
  },
  {
    id: 'elegant',
    label: 'Elegant',
    description: 'Refined, sophisticated, luxe',
    gradient: 'linear-gradient(135deg, #C9B8A8 0%, #A89888 40%, #887868 100%)',
    pattern: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 40%),
              radial-gradient(circle at 70% 70%, rgba(255,255,255,0.1) 0%, transparent 35%)`,
    accent: '#C9B8A8',
  },
  {
    id: 'playful',
    label: 'Playful',
    description: 'Fun, whimsical, colorful',
    gradient: 'linear-gradient(135deg, #FF6B9D 0%, #C468FF 50%, #6C63FF 100%)',
    pattern: `radial-gradient(circle at 15% 85%, rgba(255,255,100,0.2) 0%, transparent 40%),
              radial-gradient(circle at 85% 15%, rgba(100,255,200,0.2) 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
    accent: '#C468FF',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Clean, simple, focused',
    gradient: 'linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 50%, #BDBDBD 100%)',
    pattern: `linear-gradient(0deg, rgba(0,0,0,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
    accent: '#9E9E9E',
  },
  {
    id: 'vintage',
    label: 'Vintage',
    description: 'Retro, nostalgic, timeless',
    gradient: 'linear-gradient(135deg, #D4A574 0%, #B8956A 40%, #8B7355 100%)',
    pattern: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0.1) 0%, transparent 60%),
              repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 6px)`,
    accent: '#D4A574',
  },
  {
    id: 'luxurious',
    label: 'Luxurious',
    description: 'Premium, opulent, rich',
    gradient: 'linear-gradient(135deg, #2C2C2C 0%, #1A1A2E 40%, #16213E 100%)',
    pattern: `radial-gradient(circle at 30% 70%, rgba(212,175,55,0.25) 0%, transparent 50%),
              radial-gradient(circle at 70% 30%, rgba(212,175,55,0.15) 0%, transparent 45%),
              linear-gradient(135deg, rgba(212,175,55,0.05) 0%, transparent 50%)`,
    accent: '#D4AF37',
  },
  {
    id: 'natural',
    label: 'Natural',
    description: 'Organic, earthy, serene',
    gradient: 'linear-gradient(135deg, #5B8C5A 0%, #3D7B5F 40%, #2D6A4F 100%)',
    pattern: `radial-gradient(circle at 25% 75%, rgba(144,238,144,0.2) 0%, transparent 45%),
              radial-gradient(circle at 75% 25%, rgba(255,255,200,0.15) 0%, transparent 40%)`,
    accent: '#5B8C5A',
  },
]

export const TEMPLATES = [
  { id: 'wedding', label: 'Wedding', theme: 'Romantic wedding with soft florals and elegant details' },
  { id: 'brand', label: 'Brand Identity', theme: 'Modern tech startup branding with clean lines' },
  { id: 'interior', label: 'Interior Design', theme: 'Scandinavian-inspired living room with warm neutrals' },
  { id: 'fashion', label: 'Fashion', theme: 'Streetwear collection with urban aesthetic' },
  { id: 'food', label: 'Food & Drink', theme: 'Artisan cafe with rustic charm and fresh ingredients' },
  { id: 'travel', label: 'Travel', theme: 'Tropical island getaway with turquoise waters' },
]
