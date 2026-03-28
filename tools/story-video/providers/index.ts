// tools/story-video/providers/index.ts

import type { VideoProvider, VideoProviderType } from '../types'
import { GeminiVideoProvider } from './gemini'

/**
 * Provider registry — returns a VideoProvider for the given type.
 * Currently only Gemini is implemented; Kling and Runway are planned.
 */
export function getProvider(type: VideoProviderType): VideoProvider {
  switch (type) {
    case 'gemini':
      return new GeminiVideoProvider()
    case 'kling':
      throw new Error('Kling video provider coming soon')
    case 'runway':
      throw new Error('Runway video provider coming soon')
    default:
      throw new Error(`Unknown video provider: ${type}`)
  }
}
