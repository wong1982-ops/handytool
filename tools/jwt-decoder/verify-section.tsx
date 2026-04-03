'use client'

import { useEffect, useState } from 'react'
import { ALL_ALGORITHMS, getAlgorithmType, verifyJwt } from './jwt-utils'

interface VerifySectionProps {
  token: string
  detectedAlg: string
}

export function VerifySection({ token, detectedAlg }: VerifySectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [algorithm, setAlgorithm] = useState(detectedAlg)
  const [secret, setSecret] = useState('')
  const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Auto-open when token is present
  useEffect(() => {
    if (token.trim().length > 0) {
      setIsOpen(true)
    }
  }, [token])

  // Sync algorithm when detectedAlg changes
  useEffect(() => {
    setAlgorithm(detectedAlg)
  }, [detectedAlg])

  // Auto-verify with debounce
  useEffect(() => {
    if (!secret.trim()) {
      setStatus('idle')
      setErrorMessage('')
      return
    }

    let cancelled = false
    const timer = setTimeout(async () => {
      if (cancelled) return
      const result = await verifyJwt(token, secret, algorithm)
      if (cancelled) return
      if (result.valid) {
        setStatus('valid')
        setErrorMessage('')
      } else {
        setStatus('invalid')
        setErrorMessage(result.error)
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [token, secret, algorithm])

  const algType = getAlgorithmType(algorithm)
  const isAsymmetric = algType !== 'HMAC' && algType !== 'unknown'

  const inputClass =
    'w-full rounded-lg border border-[#1e2631] bg-[#0d1420] text-white px-3 py-2 text-sm font-mono focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/30 focus:outline-none resize-y placeholder:text-[#70767f] transition-colors'

  return (
    <section
      aria-label="Verify JWT Signature"
      className="rounded-2xl border border-[#1e2631] bg-[#131a23] overflow-hidden"
    >
      {/* Collapsible header */}
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-[#1a2230]"
        style={{ minHeight: '44px' }}
      >
        <div className="flex items-center gap-2">
          <svg className="w-[18px] h-[18px] text-[#3D6AF2]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-semibold text-white">Verify Signature</span>
        </div>
        <svg
          className={`w-4 h-4 text-[#70767f] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Collapsible content */}
      {isOpen && (
        <div className="px-5 pb-5 pt-4 space-y-4 border-t border-[#1e2631]">
          {/* Algorithm dropdown */}
          <div>
            <label
              htmlFor="verify-algorithm"
              className="mb-1.5 block text-xs font-medium text-[#a6abb5]"
            >
              Algorithm
            </label>
            <select
              id="verify-algorithm"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full rounded-lg border border-[#1e2631] bg-[#0d1420] text-white px-3 py-2 text-sm font-mono focus:border-[#3D6AF2] focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]/30 transition-colors appearance-none"
              style={{ minHeight: '44px' }}
            >
              {ALL_ALGORITHMS.map((alg) => (
                <option key={alg} value={alg}>
                  {alg}
                </option>
              ))}
            </select>
          </div>

          {/* Secret / Key input */}
          <div>
            <label
              htmlFor="verify-secret"
              className="mb-1.5 block text-xs font-medium text-[#a6abb5]"
            >
              {isAsymmetric ? 'Public Key (PEM)' : 'Secret'}
            </label>
            {isAsymmetric ? (
              <textarea
                id="verify-secret"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                rows={6}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                placeholder={`-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----`}
                className={inputClass}
              />
            ) : (
              <input
                id="verify-secret"
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                placeholder="your-256-bit-secret"
                className={`${inputClass} min-h-[44px]`}
              />
            )}
          </div>

          {/* Status banner */}
          {status === 'valid' && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium"
              style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.3)', color: '#10B981' }}
            >
              <svg
                className="w-5 h-5 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Signature verified</span>
            </div>
          )}

          {status === 'invalid' && (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}
            >
              <svg
                className="mt-0.5 w-4 h-4 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{errorMessage || 'Invalid signature'}</span>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
