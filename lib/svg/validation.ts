export class SvgValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SvgValidationError'
  }
}

const MAX_IMAGE_SIZE = 20 * 1024 * 1024 // 20 MB
const VALID_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

export function validateImageFile(file: File): void {
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    throw new SvgValidationError(
      `Invalid image type: ${file.type}. Expected PNG, JPEG, WebP, or GIF`,
    )
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new SvgValidationError(`Image exceeds 20 MB limit`)
  }
}
