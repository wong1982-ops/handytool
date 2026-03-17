'use client'

import { useEffect, useRef, useState } from 'react'
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
    'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[var(--tk-color-text-primary)] px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-y'

  return (
    <section
      aria-label="Verify JWT Signature"
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
    >
      {/* Collapsible header */}
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-5 py-3 min-h-[44px] text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
      >
        <span className="text-sm font-semibold text-[var(--tk-color-text-primary)]">Verify</span>
        <svg
          className={`w-4 h-4 text-[var(--tk-color-text-secondary)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
        <div className="px-5 pb-5 pt-2 space-y-4 border-t border-slate-200 dark:border-slate-800">
          {/* Algorithm dropdown */}
          <div>
            <label
              htmlFor="verify-algorithm"
              className="block text-xs font-medium text-[var(--tk-color-text-secondary)] mb-1"
            >
              Algorithm
            </label>
            <select
              id="verify-algorithm"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[var(--tk-color-text-primary)] px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none min-h-[44px]"
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
              className="block text-xs font-medium text-[var(--tk-color-text-secondary)] mb-1"
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
              className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-500 dark:text-green-400"
            >
              <svg
                className="w-4 h-4 shrink-0"
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
              <span className="font-medium">Signature verified</span>
            </div>
          )}

          {status === 'invalid' && (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
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
