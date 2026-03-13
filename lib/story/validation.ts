export class StoryValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StoryValidationError'
  }
}

export const CREDIT_COSTS = {
  // Story generation
  generateStory: 10,
  additionalPage: 2,       // per page beyond default 12
  // Illustrations
  illustrationQuality: 5,  // per page
  illustrationFast: 3,     // per page
  coverIllustration: 5,
  // Audio
  narration: 3,             // per page
  // Character
  characterRefinement: 1,
  // Export
  exportPdf: 5,
  // Legacy (kept for backward compatibility during migration)
  generate: 65,
  regenerateStory: 10,
  regenerateImage: 5,
} as const
