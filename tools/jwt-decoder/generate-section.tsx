'use client'

import { useState } from 'react'
import { ALL_ALGORITHMS, getAlgorithmType, signJwt } from './jwt-utils'
import { CopyButton } from '@/components/ui/copy-button'

const DEFAULT_ALGORITHM = 'HS256'

const DEFAULT_HEADER = JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2)

const DEFAULT_PAYLOAD = JSON.stringify(
  {
    sub: '1234567890',
    name: 'John Doe',
    iat: Math.floor(Date.now() / 1000),
  },
  null,
  2,
)

function isValidJson(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

export function GenerateSection() {
  const [isOpen, setIsOpen] = useState(false)
  const [algorithm, setAlgorithm] = useState(DEFAULT_ALGORITHM)
  const [headerStr, setHeaderStr] = useState(DEFAULT_HEADER)
  const [payloadStr, setPayloadStr] = useState(DEFAULT_PAYLOAD)
  const [secret, setSecret] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)

  const headerValid = isValidJson(headerStr)
  const payloadValid = isValidJson(payloadStr)
  const algType = getAlgorithmType(algorithm)
  const isAsymmetric = algType !== 'HMAC' && algType !== 'unknown'
  const canGenerate = headerValid && payloadValid && secret.trim().length > 0 && !generating

  function handleAlgorithmChange(newAlg: string) {
    setAlgorithm(newAlg)
    // Auto-update the alg field in headerStr
    try {
      const parsed = JSON.parse(headerStr)
      parsed.alg = newAlg
      setHeaderStr(JSON.stringify(parsed, null, 2))
    } catch {
      // If header is invalid JSON, just leave it — user will see the validation error
    }
    setOutput('')
    setError('')
  }

  function handleHeaderChange(value: string) {
    setHeaderStr(value)
    setOutput('')
    setError('')
  }

  function handlePayloadChange(value: string) {
    setPayloadStr(value)
    setOutput('')
    setError('')
  }

  function handleSecretChange(value: string) {
    setSecret(value)
    setOutput('')
    setError('')
  }

  async function handleGenerate() {
    if (!canGenerate) return
    setGenerating(true)
    setError('')
    setOutput('')

    try {
      const header = JSON.parse(headerStr)
      const payload = JSON.parse(payloadStr)
      const result = await signJwt(header, payload, secret, algorithm)
      if ('token' in result) {
        setOutput(result.token)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate token.')
    } finally {
      setGenerating(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[var(--tk-color-text-primary)] px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-y'

  const invalidInputClass =
    'w-full rounded-lg border border-red-500 bg-slate-50 dark:bg-slate-800 text-[var(--tk-color-text-primary)] px-3 py-2 text-sm font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none resize-y'

  return (
    <section
      aria-label="Generate JWT"
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
    >
      {/* Collapsible header */}
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-5 py-3 min-h-[44px] text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
      >
        <span className="text-sm font-semibold text-[var(--tk-color-text-primary)]">Generate</span>
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
              htmlFor="generate-algorithm"
              className="block text-xs font-medium text-[var(--tk-color-text-secondary)] mb-1"
            >
              Algorithm
            </label>
            <select
              id="generate-algorithm"
              value={algorithm}
              onChange={(e) => handleAlgorithmChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[var(--tk-color-text-primary)] px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none min-h-[44px]"
            >
              {ALL_ALGORITHMS.map((alg) => (
                <option key={alg} value={alg}>
                  {alg}
                </option>
              ))}
            </select>
          </div>

          {/* Header textarea */}
          <div>
            <label
              htmlFor="generate-header"
              className="block text-xs font-medium text-[var(--tk-color-text-secondary)] mb-1"
            >
              Header
            </label>
            <textarea
              id="generate-header"
              value={headerStr}
              onChange={(e) => handleHeaderChange(e.target.value)}
              rows={4}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              className={headerValid ? inputClass : invalidInputClass}
            />
            {!headerValid && (
              <p className="mt-1 text-xs text-red-500" role="alert">
                Invalid JSON
              </p>
            )}
          </div>

          {/* Payload textarea */}
          <div>
            <label
              htmlFor="generate-payload"
              className="block text-xs font-medium text-[var(--tk-color-text-secondary)] mb-1"
            >
              Payload
            </label>
            <textarea
              id="generate-payload"
              value={payloadStr}
              onChange={(e) => handlePayloadChange(e.target.value)}
              rows={6}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              className={payloadValid ? inputClass : invalidInputClass}
            />
            {!payloadValid && (
              <p className="mt-1 text-xs text-red-500" role="alert">
                Invalid JSON
              </p>
            )}
          </div>

          {/* Secret / Private Key input */}
          <div>
            <label
              htmlFor="generate-secret"
              className="block text-xs font-medium text-[var(--tk-color-text-secondary)] mb-1"
            >
              {isAsymmetric ? 'Private Key (PEM)' : 'Secret'}
            </label>
            {isAsymmetric ? (
              <textarea
                id="generate-secret"
                value={secret}
                onChange={(e) => handleSecretChange(e.target.value)}
                rows={6}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                placeholder={`-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----`}
                className={inputClass}
              />
            ) : (
              <input
                id="generate-secret"
                type="text"
                value={secret}
                onChange={(e) => handleSecretChange(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                placeholder="your-256-bit-secret"
                className={`${inputClass} min-h-[44px]`}
              />
            )}
          </div>

          {/* Generate button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white min-h-[44px] transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating && (
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            {generating ? 'Generating…' : 'Generate Token'}
          </button>

          {/* Error banner */}
          {error && (
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
              <span>{error}</span>
            </div>
          )}

          {/* Output block */}
          {output && (
            <div>
              <label className="block text-xs font-medium text-[var(--tk-color-text-secondary)] mb-1">
                Generated Token
              </label>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm font-mono text-[var(--tk-color-text-primary)] break-all leading-relaxed">
                {output}
              </div>
              <div className="mt-2 flex justify-end">
                <CopyButton
                  text={output}
                  label="Copy Token"
                  className="text-sm px-4 py-2"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
