import { PdfValidationError } from './validation'

export async function parseFormData(request: Request): Promise<FormData> {
  const contentType = request.headers.get('content-type')
  if (!contentType?.includes('multipart/form-data')) {
    throw new PdfValidationError('Content-Type must be multipart/form-data')
  }
  return await request.formData()
}

export function getFileFromFormData(formData: FormData, fieldName: string): File {
  const file = formData.get(fieldName)
  if (!file || !(file instanceof File)) {
    throw new PdfValidationError(`Missing or invalid file field: "${fieldName}"`)
  }
  return file
}

export function getFilesFromFormData(formData: FormData, fieldName: string): File[] {
  const entries = formData.getAll(fieldName)
  if (entries.length === 0) {
    throw new PdfValidationError(`No files provided for field: "${fieldName}"`)
  }

  const files = entries.filter((e): e is File => e instanceof File)
  if (files.length !== entries.length) {
    throw new PdfValidationError(`Some entries in "${fieldName}" are not files`)
  }

  return files
}

export function getStringField(
  formData: FormData,
  fieldName: string,
  defaultValue?: string,
): string {
  const value = formData.get(fieldName)
  if (value === null || value === undefined) {
    if (defaultValue !== undefined) return defaultValue
    throw new PdfValidationError(`Missing required field: "${fieldName}"`)
  }
  if (typeof value !== 'string') {
    throw new PdfValidationError(`Field "${fieldName}" must be a string`)
  }
  return value
}
