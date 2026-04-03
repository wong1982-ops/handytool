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
          className="mb-1.5 block text-sm font-medium text-[#a6abb5]"
        >
          Paste your JWT
        </label>
        <textarea
          id="jwt-input"
          value={token}
          onChange={(e) => onTokenChange(e.target.value)}
          rows={4}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          className={`w-full font-mono text-xs leading-relaxed rounded-xl border bg-[#0d1420] text-[#a6abb5] px-4 py-3 resize-y focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]/30 focus:border-[#3D6AF2] placeholder:text-[#70767f] transition-colors ${!result.ok && token.trim().length > 0 ? 'border-[#EF4444]/50' : 'border-[#1e2631]'}`}
          style={{ minHeight: '80px' }}
        />
      </div>

      {/* Error banner */}
      {!result.ok && token.trim().length > 0 && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm mb-4"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}
        >
          <svg className="mt-0.5 w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
          <span>{result.error}</span>
        </div>
      )}

      {/* Decoded blocks */}
      {result.ok && (
        <div className="space-y-3">
          {/* Header block */}
          <DecodedBlock
            label="Header"
            borderColor="border-red-400"
            labelColor="text-red-400"
            content={headerJson}
          />

          {/* Payload block */}
          <div
            className="rounded-xl border border-[#1e2631] bg-[#131a23] overflow-hidden"
            style={{ borderLeft: '4px solid #818cf8' }}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e2631] bg-[#0d1420]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400">
                  Payload
                </span>
                {expired && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                    Expired
                  </span>
                )}
              </div>
              <CopyButton text={payloadJson} label="Copy" className="!px-3 !py-1.5 !text-xs !rounded-lg !shadow-none !border !border-[#1e2631] !bg-transparent !text-[#a6abb5] hover:!border-[#3D6AF2] hover:!text-white" />
            </div>
            <div className="px-4 py-3 overflow-x-auto">
              <pre className="font-mono text-xs leading-relaxed sm:text-sm text-white whitespace-pre-wrap break-all">
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
  const borderColorMap: Record<string, string> = {
    'border-red-400': '#f87171',
    'border-teal-400': '#2dd4bf',
  }

  return (
    <div
      className="rounded-xl border border-[#1e2631] bg-[#131a23] overflow-hidden"
      style={{ borderLeft: `4px solid ${borderColorMap[borderColor] ?? '#1e2631'}` }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e2631] bg-[#0d1420]">
        <span className={`text-[11px] font-semibold uppercase tracking-widest ${labelColor}`}>
          {label}
        </span>
        <CopyButton text={content} label="Copy" className="!px-3 !py-1.5 !text-xs !rounded-lg !shadow-none !border !border-[#1e2631] !bg-transparent !text-[#a6abb5] hover:!border-[#3D6AF2] hover:!text-white" />
      </div>
      <div className="px-4 py-3 overflow-x-auto">
        <pre className={`text-xs leading-relaxed sm:text-sm whitespace-pre-wrap break-all ${mono ? 'font-mono text-[#a6abb5]' : 'font-mono text-white'}`}>
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
                <span className="ml-2 text-[#70767f] text-xs italic">
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
