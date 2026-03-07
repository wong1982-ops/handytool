export class StoryValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StoryValidationError'
  }
}

export const CREDIT_COSTS = {
  enrich: 20,
  illustrate: 5,
  regenerateStory: 10,
  regenerateImage: 5,
  exportPdf: 5,
} as const
