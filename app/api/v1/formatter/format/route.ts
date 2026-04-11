import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { z } from 'zod'
import * as prettier from 'prettier'
import { minify as minifyHtml } from 'html-minifier-terser'
import { minify as minifyJs } from 'terser'
import * as csso from 'csso'

export const maxDuration = 30

const MAX_BYTES = 1_048_576 // 1 MB

const schema = z.object({
  format: z.enum(['html', 'css', 'javascript', 'typescript', 'markdown', 'graphql']),
  action: z.enum(['format', 'minify']),
  content: z.string(),
})

const PARSER_MAP: Record<string, string> = {
  html: 'html',
  css: 'css',
  javascript: 'babel',
  typescript: 'typescript',
  markdown: 'markdown',
  graphql: 'graphql',
}

export async function POST(request: NextRequest) {
  // No auth required — public utility
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return apiError('Invalid request', 'VALIDATION_ERROR', 400)
  }

  const { format, action, content } = parsed.data

  // Privacy: no logging of content; only validate size
  if (Buffer.byteLength(content, 'utf8') > MAX_BYTES) {
    return apiError('Input exceeds 1MB limit', 'TOO_LARGE', 413)
  }

  if (!content.trim()) {
    return apiError('Input is empty', 'EMPTY_INPUT', 400)
  }

  try {
    let result: string

    if (action === 'format') {
      const parser = PARSER_MAP[format]
      result = await prettier.format(content, {
        parser,
        tabWidth: 2,
        semi: true,
        singleQuote: true,
      })
    } else {
      // action === 'minify'
      switch (format) {
        case 'html':
          result = await minifyHtml(content, {
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true,
            minifyJS: true,
          })
          break
        case 'css': {
          const minified = csso.minify(content)
          result = minified.css
          break
        }
        case 'javascript':
        case 'typescript': {
          const minified = await minifyJs(content)
          result = minified.code ?? ''
          break
        }
        default:
          return apiError(`Minify not supported for ${format}`, 'UNSUPPORTED', 400)
      }
    }

    return apiSuccess({ result })
  } catch (err) {
    // Privacy: log only the error message and format, never the content
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[formatter] ${action} ${format} failed:`, message.slice(0, 200))
    return apiError(message, 'PARSE_ERROR', 400)
  }
}
