export class StoryValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StoryValidationError'
  }
}

export const CREDIT_COSTS = {
  generate: 50,
  regenerateStory: 10,
  regenerateImage: 5,
  exportPdf: 5,
} as const
