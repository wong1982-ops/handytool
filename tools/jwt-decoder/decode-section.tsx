'use client'

import { useMemo } from 'react'
import { CopyButton } from '@/components/ui/copy-button'
import { decodeToken, formatTimestamp, isExpired } from './jwt-utils'

// Timestamp claim keys to annotate
const TIMESTAMP_CLAIMS = ['exp', 'iat', 'nbf', 'auth_time'] as const
type TimestampClaim = (typeof TIMESTAMP_CLAIMS)[number]

interface DecodeSectionProps {
  token: string
  onTokenChange: (token: string) => void
  onAlgorithmDetected?: (alg: string) => void
}

export function DecodeSection({ token, onTokenChange, onAlgorithmDetected }: DecodeSectionProps) {
  const result = useMemo(() => {
    const decoded = decodeToken(token)
    if (decoded.ok && onAlgorithmDetected && decoded.header.alg) {
      // We use a timeout to avoid setState-in-render issues
      Promise.resolve().then(() => onAlgorithmDetected(decoded.header.alg as string))
    }
    return decoded
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const headerJson = result.ok ? JSON.stringify(result.header, null, 2) : ''
  const payloadJson = result.ok ? JSON.stringify(result.payload, null, 2) : ''
  const expired = result.ok ? isExpired(result.payload) : false

  return (
    <section aria-label="Decode JWT">
      {/* Token input */}
      <div className="mb-4">
        <label
          htmlFor="jwt-input"
          className="block text-sm font-medium text-[var(--tk-color-text-secondary)] mb-1"
        >
          Paste your JWT
        </label>
        <textarea
          id="jwt-input"
          value={token}
          onChange={(e) => onTokenChange(e.target.value)}
          rows={5}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          className="w-full font-mono text-xs sm:text-sm rounded-xl border border-[var(--tk-color-border)] bg-[var(--tk-color-bg-secondary)] text-[var(--tk-color-text-primary)] px-4 py-3 resize-y focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)] placeholder:text-[var(--tk-color-text-tertiary,#888)] min-h-[80px]"
        />
      </div>

      {/* Error banner */}
      {!result.ok && token.trim().length > 0 && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 mb-4"
        >
          <svg className="mt-0.5 w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
          <span>{result.error}</span>
        </div>
      )}

      {/* Decoded blocks */}
      {result.ok && (
        <div className="space-y-4">
          {/* Header block */}
          <DecodedBlock
            label="Header"
            borderColor="border-red-400"
            labelColor="text-red-400"
            content={headerJson}
          />

          {/* Payload block */}
          <div
            className="rounded-xl border border-[var(--tk-color-border)] bg-[var(--tk-color-bg-secondary)] overflow-hidden"
            style={{ borderLeftWidth: '4px', borderLeftColor: 'rgb(129 140 248)' /* indigo-400 */ }}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--tk-color-border)]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Payload
                </span>
                {expired && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                    Expired
                  </span>
                )}
              </div>
              <CopyButton text={payloadJson} label="Copy" className="!px-3 !py-1.5 !text-xs !rounded-lg !shadow-none" />
            </div>
            <div className="px-4 py-3 overflow-x-auto">
              <pre className="font-mono text-xs sm:text-sm text-[var(--tk-color-text-primary)] whitespace-pre-wrap break-all">
                <PayloadWithTimestamps payload={result.payload} payloadJson={payloadJson} />
              </pre>
            </div>
          </div>

          {/* Signature block */}
          <DecodedBlock
            label="Signature"
            borderColor="border-teal-400"
            labelColor="text-teal-400"
            content={result.signature}
            mono
          />
        </div>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface DecodedBlockProps {
  label: string
  borderColor: string
  labelColor: string
  content: string
  mono?: boolean
}

function DecodedBlock({ label, borderColor, labelColor, content, mono = false }: DecodedBlockProps) {
  return (
    <div
      className={`rounded-xl border border-[var(--tk-color-border)] bg-[var(--tk-color-bg-secondary)] overflow-hidden`}
      style={{ borderLeftWidth: '4px' }}
      // Use inline style for the dynamic left border color since Tailwind JIT can't always
      // generate arbitrary border-left-color values at runtime from props
      ref={(el) => {
        if (el) {
          const colorMap: Record<string, string> = {
            'border-red-400': 'rgb(248 113 113)',
            'border-teal-400': 'rgb(45 212 191)',
          }
          el.style.borderLeftColor = colorMap[borderColor] ?? ''
        }
      }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--tk-color-border)]">
        <span className={`text-xs font-semibold uppercase tracking-wider ${labelColor}`}>
          {label}
        </span>
        <CopyButton text={content} label="Copy" className="!px-3 !py-1.5 !text-xs !rounded-lg !shadow-none" />
      </div>
      <div className="px-4 py-3 overflow-x-auto">
        <pre className={`text-xs sm:text-sm text-[var(--tk-color-text-primary)] whitespace-pre-wrap break-all ${mono ? 'font-mono' : 'font-mono'}`}>
          {content}
        </pre>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Payload renderer with timestamp annotations
// ---------------------------------------------------------------------------

interface PayloadWithTimestampsProps {
  payload: Record<string, unknown>
  payloadJson: string
}

function PayloadWithTimestamps({ payload, payloadJson }: PayloadWithTimestampsProps) {
  // Render JSON line by line; when we hit a timestamp claim, append human date
  const lines = payloadJson.split('\n')

  return (
    <>
      {lines.map((line, i) => {
        const matchedClaim = (TIMESTAMP_CLAIMS as readonly string[]).find((claim) => {
          const key = `"${claim}"`
          return line.includes(key)
        }) as TimestampClaim | undefined

        if (matchedClaim && typeof payload[matchedClaim] === 'number') {
          const humanDate = formatTimestamp(payload[matchedClaim] as number)
          return (
            <span key={i}>
              {line}
              {humanDate && (
                <span className="ml-2 text-[var(--tk-color-text-tertiary,#888)] text-xs not-italic">
                  {/* inline comment style */}
                  {'// '}{humanDate}
                </span>
              )}
              {'\n'}
            </span>
          )
        }

        return <span key={i}>{line}{'\n'}</span>
      })}
    </>
  )
}
