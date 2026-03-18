# JWT Decoder Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a fully client-side JWT decoder, verifier, and generator tool at `/tools/jwt-decoder` — a jwt.io equivalent for Toolk1t.

**Architecture:** Three-section stacked layout (Decode → Verify → Generate), all processing in-browser via the `jose` library + Web Crypto API. No API routes. SEO metadata in a server layout, interactive tool in a client component. Follows existing tool pattern.

**Tech Stack:** Next.js App Router, React 19, TypeScript, `jose` (JWT library), Tailwind CSS, Web Crypto API

---

### Task 1: Install `jose` and scaffold files

**Files:**
- Modify: `package.json` (add `jose`)
- Create: `app/tools/jwt-decoder/layout.tsx`
- Create: `app/tools/jwt-decoder/page.tsx`
- Create: `tools/jwt-decoder/jwt-decoder-tool.tsx`

**Step 1: Install jose**

```bash
pnpm add jose
```

**Step 2: Create the layout with SEO metadata**

Create `app/tools/jwt-decoder/layout.tsx`:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'JWT Decoder, Verifier & Generator — Free Online Tool',
  description:
    'Decode, verify, and generate JSON Web Tokens (JWT) online. Supports HS256, RS256, ES256, EdDSA and more. Fully client-side — your tokens never leave the browser.',
  alternates: {
    canonical: '/tools/jwt-decoder',
  },
  openGraph: {
    title: 'JWT Decoder, Verifier & Generator | Toolk1t',
    description:
      'Decode, verify, and generate JWTs online. Supports HMAC, RSA, ECDSA, EdDSA. Free, client-side, no data sent to server.',
    url: '/tools/jwt-decoder',
  },
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'JWT Decoder, Verifier & Generator',
    description:
      'Decode, verify, and generate JSON Web Tokens online. Supports HMAC, RSA, ECDSA, EdDSA algorithms. Fully client-side.',
    url: 'https://toolk1t.com/tools/jwt-decoder',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    isPartOf: { '@type': 'WebSite', name: 'Toolk1t', url: 'https://toolk1t.com' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toolk1t.com' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://toolk1t.com/tools' },
      { '@type': 'ListItem', position: 3, name: 'JWT Decoder' },
    ],
  },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
```

**Step 3: Create the page route**

Create `app/tools/jwt-decoder/page.tsx`:

```tsx
'use client'

import { JwtDecoderTool } from '@/tools/jwt-decoder/jwt-decoder-tool'
import { FavoriteButton } from '@/components/ui/favorite-button'
import { BackButton } from '@/components/ui/back-button'

export default function JwtDecoderPage() {
  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">JWT Decoder</h1>
        </div>
        <FavoriteButton toolSlug="jwt-decoder" />
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Decode, verify, and generate JSON Web Tokens. Everything runs in your browser — your tokens never leave this page.
      </p>

      <JwtDecoderTool />
    </div>
  )
}
```

**Step 4: Create the main tool shell**

Create `tools/jwt-decoder/jwt-decoder-tool.tsx`:

```tsx
'use client'

import { useState } from 'react'

const SAMPLE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

export function JwtDecoderTool() {
  const [token, setToken] = useState(SAMPLE_JWT)

  return (
    <div className="space-y-4">
      {/* Decode section — Task 2 */}
      <p className="text-slate-400 text-sm">Tool shell loaded. Sections coming next.</p>
    </div>
  )
}
```

**Step 5: Verify it loads**

```bash
# Open http://localhost:3000/tools/jwt-decoder in browser
# Should see page title, subtitle, and "Tool shell loaded" text
```

**Step 6: Commit**

```bash
git add app/tools/jwt-decoder/ tools/jwt-decoder/ package.json pnpm-lock.yaml
git commit -m "feat(jwt-decoder): scaffold route, layout with SEO, and tool shell"
```

---

### Task 2: JWT utility functions

**Files:**
- Create: `tools/jwt-decoder/jwt-utils.ts`

All pure functions, no React. These power all three sections.

**Step 1: Write the utility module**

Create `tools/jwt-decoder/jwt-utils.ts`:

```ts
import * as jose from 'jose'

/** Supported algorithms grouped by type */
export const ALGORITHMS = {
  HMAC: ['HS256', 'HS384', 'HS512'],
  RSA: ['RS256', 'RS384', 'RS512', 'PS256', 'PS384', 'PS512'],
  ECDSA: ['ES256', 'ES384', 'ES512'],
  EdDSA: ['EdDSA'],
} as const

export const ALL_ALGORITHMS = Object.values(ALGORITHMS).flat()
export type Algorithm = (typeof ALL_ALGORITHMS)[number]

export function getAlgorithmType(alg: string): 'HMAC' | 'RSA' | 'ECDSA' | 'EdDSA' | 'unknown' {
  if (ALGORITHMS.HMAC.includes(alg as never)) return 'HMAC'
  if (ALGORITHMS.RSA.includes(alg as never)) return 'RSA'
  if (ALGORITHMS.ECDSA.includes(alg as never)) return 'ECDSA'
  if (ALGORITHMS.EdDSA.includes(alg as never)) return 'EdDSA'
  return 'unknown'
}

/** Result of decoding a JWT (no verification) */
export interface DecodeResult {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
  isValid: true
}

export interface DecodeError {
  isValid: false
  error: string
}

/** Decode a JWT without verifying the signature */
export function decodeJwt(token: string): DecodeResult | DecodeError {
  const trimmed = token.trim()
  if (!trimmed) return { isValid: false, error: 'Paste a JWT to decode it' }

  const parts = trimmed.split('.')
  if (parts.length !== 3) {
    return { isValid: false, error: `Expected 3 parts (header.payload.signature), got ${parts.length}` }
  }

  try {
    const header = jose.decodeProtectedHeader(trimmed)
    const payload = jose.decodeJwt(trimmed)
    return {
      header: header as Record<string, unknown>,
      payload: payload as Record<string, unknown>,
      signature: parts[2],
      isValid: true,
    }
  } catch (err) {
    return {
      isValid: false,
      error: err instanceof Error ? err.message : 'Failed to decode token',
    }
  }
}

/** Format a Unix timestamp as a human-readable date string */
export function formatTimestamp(value: unknown): string | null {
  if (typeof value !== 'number') return null
  try {
    return new Date(value * 1000).toLocaleString()
  } catch {
    return null
  }
}

/** Check if a JWT is expired based on `exp` claim */
export function isExpired(payload: Record<string, unknown>): boolean {
  const exp = payload.exp
  if (typeof exp !== 'number') return false
  return exp * 1000 < Date.now()
}

/** Verify a JWT signature. Returns { valid: true } or { valid: false, error: string } */
export async function verifyJwt(
  token: string,
  secret: string,
  algorithm: string,
): Promise<{ valid: true } | { valid: false; error: string }> {
  const trimmed = token.trim()
  if (!trimmed || !secret.trim()) {
    return { valid: false, error: 'Token and secret/key are required' }
  }

  const algType = getAlgorithmType(algorithm)

  try {
    if (algType === 'HMAC') {
      const key = new TextEncoder().encode(secret)
      await jose.jwtVerify(trimmed, key, { algorithms: [algorithm] })
      return { valid: true }
    }

    // RSA, ECDSA, EdDSA — expect PEM public key
    const key = await jose.importSPKI(secret.trim(), algorithm)
    await jose.jwtVerify(trimmed, key, { algorithms: [algorithm] })
    return { valid: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Verification failed'
    // Friendlier messages
    if (msg.includes('signature')) return { valid: false, error: 'Invalid signature' }
    if (msg.includes('expired')) return { valid: false, error: 'Token is expired' }
    return { valid: false, error: msg }
  }
}

/** Sign a JWT and return the encoded token string */
export async function signJwt(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  secret: string,
  algorithm: string,
): Promise<{ token: string } | { error: string }> {
  const algType = getAlgorithmType(algorithm)

  try {
    let key: jose.KeyLike | Uint8Array

    if (algType === 'HMAC') {
      key = new TextEncoder().encode(secret)
    } else {
      // RSA, ECDSA, EdDSA — expect PEM private key
      key = await jose.importPKCS8(secret.trim(), algorithm)
    }

    const jwt = await new jose.SignJWT(payload as jose.JWTPayload)
      .setProtectedHeader({ ...header, alg: algorithm })
      .sign(key)

    return { token: jwt }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to sign token' }
  }
}
```

**Step 2: Verify module compiles**

```bash
pnpm tsc --noEmit tools/jwt-decoder/jwt-utils.ts 2>&1 || echo "Check imports"
```

**Step 3: Commit**

```bash
git add tools/jwt-decoder/jwt-utils.ts
git commit -m "feat(jwt-decoder): add JWT utility functions (decode, verify, sign)"
```

---

### Task 3: Decode Section

**Files:**
- Create: `tools/jwt-decoder/decode-section.tsx`
- Modify: `tools/jwt-decoder/jwt-decoder-tool.tsx`

**Step 1: Build the decode section component**

Create `tools/jwt-decoder/decode-section.tsx`:

```tsx
'use client'

import { useMemo } from 'react'
import { decodeJwt, formatTimestamp, isExpired, type DecodeResult } from './jwt-utils'
import { CopyButton } from '@/components/ui/copy-button'

interface DecodeSectionProps {
  token: string
  onTokenChange: (token: string) => void
  onAlgorithmDetected?: (alg: string) => void
}

/** Timestamp claims that should show human-readable dates */
const TIMESTAMP_CLAIMS = ['exp', 'iat', 'nbf', 'auth_time']

export function DecodeSection({ token, onTokenChange, onAlgorithmDetected }: DecodeSectionProps) {
  const result = useMemo(() => {
    const r = decodeJwt(token)
    if (r.isValid && onAlgorithmDetected && typeof r.header.alg === 'string') {
      onAlgorithmDetected(r.header.alg)
    }
    return r
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Decode</h2>
      <p className="text-xs text-slate-400 mb-4">Paste a JWT to see what's inside</p>

      {/* Token input */}
      <textarea
        value={token}
        onChange={(e) => onTokenChange(e.target.value)}
        placeholder="Paste your JWT here..."
        className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700
          bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white
          text-sm font-mono resize-none h-28
          focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none
          placeholder:text-slate-400 transition-all break-all"
        spellCheck={false}
      />

      {/* Error state */}
      {!result.isValid && (
        <div className="mt-3 px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20
          border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
          {result.error}
        </div>
      )}

      {/* Decoded output */}
      {result.isValid && (
        <div className="mt-4 space-y-3">
          <JsonBlock
            label="Header"
            data={result.header}
            colorClass="border-l-red-400"
          />
          <JsonBlock
            label="Payload"
            data={result.payload}
            colorClass="border-l-indigo-400"
            showTimestamps
            expired={isExpired(result.payload)}
          />
          <div className="rounded-xl border border-slate-200 dark:border-slate-700
            border-l-4 border-l-teal-400 bg-slate-50 dark:bg-slate-800/60 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-400 uppercase">Signature</span>
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 break-all">
              {result.signature}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function JsonBlock({
  label,
  data,
  colorClass,
  showTimestamps,
  expired,
}: {
  label: string
  data: Record<string, unknown>
  colorClass: string
  showTimestamps?: boolean
  expired?: boolean
}) {
  const json = JSON.stringify(data, null, 2)

  return (
    <div className={`rounded-xl border border-slate-200 dark:border-slate-700
      border-l-4 ${colorClass} bg-slate-50 dark:bg-slate-800/60 p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">{label}</span>
          {expired && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full
              bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              Expired
            </span>
          )}
        </div>
        <CopyButton text={json} label="" className="!p-1.5 !bg-transparent !shadow-none text-slate-400 hover:text-slate-600 dark:hover:text-white !rounded-lg" />
      </div>

      <pre className="text-sm font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-all leading-relaxed">
        {json}
      </pre>

      {/* Timestamp annotations */}
      {showTimestamps && (
        <div className="mt-2 space-y-0.5">
          {TIMESTAMP_CLAIMS.map((claim) => {
            const formatted = formatTimestamp(data[claim])
            if (!formatted) return null
            return (
              <p key={claim} className="text-[11px] text-slate-400">
                <span className="font-mono">{claim}</span>: {formatted}
              </p>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Wire it into the main tool**

Update `tools/jwt-decoder/jwt-decoder-tool.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { DecodeSection } from './decode-section'

const SAMPLE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

export function JwtDecoderTool() {
  const [token, setToken] = useState(SAMPLE_JWT)
  const [detectedAlg, setDetectedAlg] = useState<string>('HS256')

  return (
    <div className="space-y-4">
      <DecodeSection
        token={token}
        onTokenChange={setToken}
        onAlgorithmDetected={setDetectedAlg}
      />
      {/* Verify section — Task 4 */}
      {/* Generate section — Task 5 */}
    </div>
  )
}
```

**Step 3: Verify in browser**

```
Open http://localhost:3000/tools/jwt-decoder
Should see the sample JWT decoded with header, payload, signature blocks
Paste a different JWT — should decode instantly
Paste invalid text — should show error message
```

**Step 4: Commit**

```bash
git add tools/jwt-decoder/decode-section.tsx tools/jwt-decoder/jwt-decoder-tool.tsx
git commit -m "feat(jwt-decoder): add decode section with color-coded output and timestamps"
```

---

### Task 4: Verify Section

**Files:**
- Create: `tools/jwt-decoder/verify-section.tsx`
- Modify: `tools/jwt-decoder/jwt-decoder-tool.tsx`

**Step 1: Build the verify section component**

Create `tools/jwt-decoder/verify-section.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { verifyJwt, getAlgorithmType, ALL_ALGORITHMS } from './jwt-utils'

interface VerifySectionProps {
  token: string
  detectedAlg: string
}

type VerifyStatus = 'idle' | 'valid' | 'invalid' | 'error'

export function VerifySection({ token, detectedAlg }: VerifySectionProps) {
  const [open, setOpen] = useState(false)
  const [algorithm, setAlgorithm] = useState(detectedAlg)
  const [secret, setSecret] = useState('')
  const [status, setStatus] = useState<VerifyStatus>('idle')
  const [message, setMessage] = useState('')

  // Sync algorithm when header changes
  useEffect(() => {
    setAlgorithm(detectedAlg)
  }, [detectedAlg])

  // Auto-open when a token is present
  useEffect(() => {
    if (token.trim() && token.includes('.')) setOpen(true)
  }, [token])

  // Verify on input change
  useEffect(() => {
    if (!token.trim() || !secret.trim()) {
      setStatus('idle')
      setMessage('')
      return
    }

    let cancelled = false
    const timer = setTimeout(async () => {
      const result = await verifyJwt(token, secret, algorithm)
      if (cancelled) return
      if (result.valid) {
        setStatus('valid')
        setMessage('Signature verified')
      } else {
        setStatus('invalid')
        setMessage(result.error)
      }
    }, 300) // debounce

    return () => { cancelled = true; clearTimeout(timer) }
  }, [token, secret, algorithm])

  const algType = getAlgorithmType(algorithm)
  const keyLabel = algType === 'HMAC' ? 'Secret' : 'Public Key (PEM)'
  const keyPlaceholder = algType === 'HMAC'
    ? 'your-256-bit-secret'
    : '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----'

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Collapsible header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 cursor-pointer"
        style={{ minHeight: '44px' }}
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Verify</h2>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4">
          {/* Algorithm selector */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Algorithm
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700
                bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white
                focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            >
              {ALL_ALGORITHMS.map((alg) => (
                <option key={alg} value={alg}>{alg}</option>
              ))}
            </select>
          </div>

          {/* Secret / Public Key input */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              {keyLabel}
            </label>
            {algType === 'HMAC' ? (
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder={keyPlaceholder}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700
                  bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white
                  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none
                  placeholder:text-slate-400"
                style={{ minHeight: '44px' }}
              />
            ) : (
              <textarea
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder={keyPlaceholder}
                rows={5}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700
                  bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white
                  resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none
                  placeholder:text-slate-400"
                spellCheck={false}
              />
            )}
          </div>

          {/* Status banner */}
          {status === 'valid' && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20
              border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {message}
            </div>
          )}
          {status === 'invalid' && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20
              border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Wire into main tool**

In `tools/jwt-decoder/jwt-decoder-tool.tsx`, add after `DecodeSection`:

```tsx
import { VerifySection } from './verify-section'

// Inside JwtDecoderTool return, after DecodeSection:
<VerifySection token={token} detectedAlg={detectedAlg} />
```

**Step 3: Verify in browser**

```
Open http://localhost:3000/tools/jwt-decoder
Paste the sample JWT
Type "your-256-bit-secret" in the secret field
Should see green "Signature verified" banner
Type a wrong secret → red "Invalid signature" banner
Switch algorithm to RS256 → textarea for public key appears
```

**Step 4: Commit**

```bash
git add tools/jwt-decoder/verify-section.tsx tools/jwt-decoder/jwt-decoder-tool.tsx
git commit -m "feat(jwt-decoder): add verify section with auto-detect and instant verification"
```

---

### Task 5: Generate Section

**Files:**
- Create: `tools/jwt-decoder/generate-section.tsx`
- Modify: `tools/jwt-decoder/jwt-decoder-tool.tsx`

**Step 1: Build the generate section component**

Create `tools/jwt-decoder/generate-section.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { signJwt, getAlgorithmType, ALL_ALGORITHMS } from './jwt-utils'
import { CopyButton } from '@/components/ui/copy-button'

const DEFAULT_HEADER = JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2)
const DEFAULT_PAYLOAD = JSON.stringify({
  sub: '1234567890',
  name: 'John Doe',
  iat: Math.floor(Date.now() / 1000),
}, null, 2)

function isValidJson(str: string): boolean {
  try { JSON.parse(str); return true } catch { return false }
}

export function GenerateSection() {
  const [open, setOpen] = useState(false)
  const [algorithm, setAlgorithm] = useState('HS256')
  const [headerStr, setHeaderStr] = useState(DEFAULT_HEADER)
  const [payloadStr, setPayloadStr] = useState(DEFAULT_PAYLOAD)
  const [secret, setSecret] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)

  const headerValid = isValidJson(headerStr)
  const payloadValid = isValidJson(payloadStr)
  const algType = getAlgorithmType(algorithm)
  const keyLabel = algType === 'HMAC' ? 'Secret' : 'Private Key (PEM)'
  const keyPlaceholder = algType === 'HMAC'
    ? 'your-256-bit-secret'
    : '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----'

  function handleAlgorithmChange(alg: string) {
    setAlgorithm(alg)
    // Update header JSON to match
    try {
      const h = JSON.parse(headerStr)
      h.alg = alg
      setHeaderStr(JSON.stringify(h, null, 2))
    } catch {
      // If header is invalid JSON, just set a fresh one
      setHeaderStr(JSON.stringify({ alg, typ: 'JWT' }, null, 2))
    }
    setOutput('')
    setError('')
  }

  async function handleGenerate() {
    if (!headerValid || !payloadValid || !secret.trim()) return
    setGenerating(true)
    setError('')
    setOutput('')

    const result = await signJwt(
      JSON.parse(headerStr),
      JSON.parse(payloadStr),
      secret,
      algorithm,
    )

    if ('token' in result) {
      setOutput(result.token)
    } else {
      setError(result.error)
    }
    setGenerating(false)
  }

  const canGenerate = headerValid && payloadValid && secret.trim() && !generating

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Collapsible header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 cursor-pointer"
        style={{ minHeight: '44px' }}
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Generate</h2>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4">
          {/* Algorithm */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Algorithm
            </label>
            <select
              value={algorithm}
              onChange={(e) => handleAlgorithmChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700
                bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white
                focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            >
              {ALL_ALGORITHMS.map((alg) => (
                <option key={alg} value={alg}>{alg}</option>
              ))}
            </select>
          </div>

          {/* Header */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Header
            </label>
            <textarea
              value={headerStr}
              onChange={(e) => { setHeaderStr(e.target.value); setOutput('') }}
              rows={4}
              spellCheck={false}
              className={`w-full px-3 py-2 rounded-lg border text-sm font-mono resize-none
                bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white
                focus:ring-2 focus:outline-none placeholder:text-slate-400
                ${headerValid
                  ? 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                  : 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500/20'
                }`}
            />
            {!headerValid && (
              <p className="text-[11px] text-red-500 mt-0.5">Invalid JSON</p>
            )}
          </div>

          {/* Payload */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Payload
            </label>
            <textarea
              value={payloadStr}
              onChange={(e) => { setPayloadStr(e.target.value); setOutput('') }}
              rows={6}
              spellCheck={false}
              className={`w-full px-3 py-2 rounded-lg border text-sm font-mono resize-none
                bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white
                focus:ring-2 focus:outline-none placeholder:text-slate-400
                ${payloadValid
                  ? 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                  : 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500/20'
                }`}
            />
            {!payloadValid && (
              <p className="text-[11px] text-red-500 mt-0.5">Invalid JSON</p>
            )}
          </div>

          {/* Secret / Private Key */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              {keyLabel}
            </label>
            {algType === 'HMAC' ? (
              <input
                type="text"
                value={secret}
                onChange={(e) => { setSecret(e.target.value); setOutput('') }}
                placeholder={keyPlaceholder}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700
                  bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white
                  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none
                  placeholder:text-slate-400"
                style={{ minHeight: '44px' }}
              />
            ) : (
              <textarea
                value={secret}
                onChange={(e) => { setSecret(e.target.value); setOutput('') }}
                placeholder={keyPlaceholder}
                rows={5}
                spellCheck={false}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700
                  bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white
                  resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none
                  placeholder:text-slate-400"
              />
            )}
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
              text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white
              transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
            style={{ minHeight: '44px' }}
          >
            {generating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
              </svg>
            )}
            {generating ? 'Generating...' : 'Generate Token'}
          </button>

          {/* Error */}
          {error && (
            <div className="px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20
              border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Output */}
          {output && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700
              bg-slate-50 dark:bg-slate-800/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Token</span>
                <CopyButton text={output} label="" className="!p-1.5 !bg-transparent !shadow-none text-slate-400 hover:text-slate-600 dark:hover:text-white !rounded-lg" />
              </div>
              <p className="text-sm font-mono text-slate-700 dark:text-slate-300 break-all leading-relaxed">
                {output}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Wire into main tool**

Final `tools/jwt-decoder/jwt-decoder-tool.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { DecodeSection } from './decode-section'
import { VerifySection } from './verify-section'
import { GenerateSection } from './generate-section'

const SAMPLE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

export function JwtDecoderTool() {
  const [token, setToken] = useState(SAMPLE_JWT)
  const [detectedAlg, setDetectedAlg] = useState<string>('HS256')

  return (
    <div className="space-y-4">
      <DecodeSection
        token={token}
        onTokenChange={setToken}
        onAlgorithmDetected={setDetectedAlg}
      />
      <VerifySection token={token} detectedAlg={detectedAlg} />
      <GenerateSection />
    </div>
  )
}
```

**Step 3: Verify in browser**

```
Open http://localhost:3000/tools/jwt-decoder
Click "Generate" section to expand
Leave HS256 selected, type a secret, click Generate Token
Should see a JWT output with copy button
Edit payload JSON to invalid → red border, "Invalid JSON" message
Button should be disabled when fields are incomplete
```

**Step 4: Commit**

```bash
git add tools/jwt-decoder/generate-section.tsx tools/jwt-decoder/jwt-decoder-tool.tsx
git commit -m "feat(jwt-decoder): add generate section with algorithm selection and token output"
```

---

### Task 6: Browser testing with webapp-testing

**Files:** None (test-only)

Use the `webapp-testing` skill to verify the complete tool.

**Step 1: Write and run Playwright test**

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    # 1. Page loads with decoded sample JWT
    page.goto("http://localhost:3000/tools/jwt-decoder")
    page.wait_for_load_state("networkidle")
    page.screenshot(path="/tmp/jwt_1_loaded.png")

    # Verify decode section shows header and payload
    assert page.locator("text=HS256").is_visible(), "Algorithm not shown"
    assert page.locator("text=John Doe").is_visible(), "Payload not decoded"

    # 2. Paste invalid token
    textarea = page.locator("textarea").first
    textarea.fill("not-a-jwt")
    page.wait_for_timeout(300)
    assert page.locator("text=Expected 3 parts").is_visible(), "Error not shown for invalid token"
    page.screenshot(path="/tmp/jwt_2_invalid.png")

    # 3. Restore valid token and verify
    textarea.fill("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c")
    page.wait_for_timeout(300)

    # Verify section should be auto-opened
    secret_input = page.locator('input[placeholder="your-256-bit-secret"]')
    secret_input.fill("your-256-bit-secret")
    page.wait_for_timeout(500)
    assert page.locator("text=Signature verified").is_visible(), "Valid signature not detected"
    page.screenshot(path="/tmp/jwt_3_verified.png")

    # Wrong secret
    secret_input.fill("wrong-secret")
    page.wait_for_timeout(500)
    assert page.locator("text=Invalid signature").is_visible(), "Invalid signature not detected"

    # 4. Generate section
    page.locator("text=Generate").click()
    page.wait_for_timeout(300)
    gen_secret = page.locator('input[placeholder="your-256-bit-secret"]').last
    gen_secret.fill("test-secret")
    page.locator("text=Generate Token").click()
    page.wait_for_timeout(500)
    page.screenshot(path="/tmp/jwt_4_generated.png")

    # 5. Mobile responsive
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto("http://localhost:3000/tools/jwt-decoder")
    page.wait_for_load_state("networkidle")
    page.screenshot(path="/tmp/jwt_5_mobile.png")

    print("All JWT decoder tests passed!")
    browser.close()
```

**Step 2: Review screenshots**

Check all 5 screenshots for:
- Correct layout and color coding
- Readable on mobile
- No overflow or broken styles

**Step 3: Commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix(jwt-decoder): address issues found during browser testing"
```

---

### Task 7: Add to tools registry

**Files:**
- Modify: whichever file registers tools for the tools index page (check `app/tools/page.tsx` or similar config)

**Step 1: Find and update the tools list**

Search for where other tools like "json-converter" or "svg-converter" are listed. Add a new entry:

```ts
{
  name: 'JWT Decoder',
  slug: 'jwt-decoder',
  description: 'Decode, verify, and generate JSON Web Tokens',
  icon: 'key',         // or appropriate icon
  category: 'developer',
}
```

**Step 2: Verify on the tools index page**

```
Open http://localhost:3000/tools
JWT Decoder should appear in the developer tools category
Clicking it should navigate to /tools/jwt-decoder
```

**Step 3: Commit**

```bash
git add app/tools/
git commit -m "feat(jwt-decoder): add to tools registry"
```

---

Plan complete and saved to `docs/plans/2026-03-17-jwt-decoder.md`. Two execution options:

**1. Subagent-Driven (this session)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** — Open a new session with executing-plans, batch execution with checkpoints

Which approach?