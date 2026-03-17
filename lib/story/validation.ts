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
  generate: 50,
  regenerateStory: 10,
  regenerateImage: 5,
  // Mode-based pricing
  speedGenerate: 10,         // Speed mode: story text only
  professionalGenerate: 50,  // Professional mode: full pipeline
  illustratePage: 5,         // Per-page illustration (bulk add-on)
  narratePage: 3,            // Per-page narration (bulk add-on)
} as const
