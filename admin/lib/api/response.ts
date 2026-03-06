import { NextResponse } from 'next/server'

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status })
}

export function apiError(message: string, code: string, status: number, details?: unknown) {
  return NextResponse.json({ error: message, code, details }, { status })
}

export const API_ERRORS = {
  VALIDATION: (details?: unknown) => apiError('Validation failed', 'VALIDATION_ERROR', 400, details),
  UNAUTHORIZED: () => apiError('Unauthorized', 'UNAUTHORIZED', 401),
  NOT_FOUND: (resource = 'Resource') => apiError(`${resource} not found`, 'NOT_FOUND', 404),
  INTERNAL: () => apiError('Internal server error', 'INTERNAL_ERROR', 500),
} as const
