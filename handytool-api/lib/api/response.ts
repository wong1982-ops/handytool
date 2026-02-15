import { NextResponse } from 'next/server'

interface ApiSuccessResponse<T> {
  data: T
}

interface ApiErrorResponse {
  error: string
  code: string
  details?: unknown
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccessResponse<T>>({ data }, { status })
}

export function apiError(
  message: string,
  code: string,
  status: number,
  details?: unknown,
) {
  return NextResponse.json<ApiErrorResponse>(
    { error: message, code, details },
    { status },
  )
}

export interface FileResult {
  data: Buffer | Uint8Array
  filename: string
  contentType: string
}

export function apiBinaryFile(
  data: Buffer | Uint8Array,
  filename: string,
  contentType: string,
): NextResponse {
  const body = new Uint8Array(data)
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Content-Length': data.length.toString(),
      'Cache-Control': 'no-store',
    },
  })
}

export function apiFileResponse(result: FileResult): NextResponse {
  return apiBinaryFile(result.data, result.filename, result.contentType)
}

export const API_ERRORS = {
  VALIDATION: (details?: unknown) => apiError('Validation failed', 'VALIDATION_ERROR', 400, details),
  UNAUTHORIZED: () => apiError('Unauthorized', 'UNAUTHORIZED', 401),
  FORBIDDEN: () => apiError('Forbidden', 'FORBIDDEN', 403),
  NOT_FOUND: (resource = 'Resource') => apiError(`${resource} not found`, 'NOT_FOUND', 404),
  RATE_LIMITED: () => apiError('Too many requests', 'RATE_LIMITED', 429),
  INTERNAL: () => apiError('Internal server error', 'INTERNAL_ERROR', 500),
} as const
