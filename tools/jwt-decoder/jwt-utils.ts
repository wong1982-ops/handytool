import * as jose from 'jose'

// ---------------------------------------------------------------------------
// Algorithm catalogue
// ---------------------------------------------------------------------------

export const ALGORITHMS = {
  HMAC: ['HS256', 'HS384', 'HS512'] as const,
  RSA: ['RS256', 'RS384', 'RS512', 'PS256', 'PS384', 'PS512'] as const,
  ECDSA: ['ES256', 'ES384', 'ES512'] as const,
  EdDSA: ['EdDSA'] as const,
} as const

export const ALL_ALGORITHMS = [
  ...ALGORITHMS.HMAC,
  ...ALGORITHMS.RSA,
  ...ALGORITHMS.ECDSA,
  ...ALGORITHMS.EdDSA,
] as const

export type Algorithm = (typeof ALL_ALGORITHMS)[number]

export type AlgorithmType = 'HMAC' | 'RSA' | 'ECDSA' | 'EdDSA' | 'unknown'

export function getAlgorithmType(alg: string): AlgorithmType {
  if ((ALGORITHMS.HMAC as readonly string[]).includes(alg)) return 'HMAC'
  if ((ALGORITHMS.RSA as readonly string[]).includes(alg)) return 'RSA'
  if ((ALGORITHMS.ECDSA as readonly string[]).includes(alg)) return 'ECDSA'
  if ((ALGORITHMS.EdDSA as readonly string[]).includes(alg)) return 'EdDSA'
  return 'unknown'
}

// ---------------------------------------------------------------------------
// Decode
// ---------------------------------------------------------------------------

export interface DecodeResult {
  ok: true
  header: jose.ProtectedHeaderParameters
  payload: jose.JWTPayload
  signature: string
}

export interface DecodeError {
  ok: false
  error: string
}

/**
 * Decode a JWT token without verification.
 * Named `decodeToken` to avoid collision with jose's `decodeJwt` export.
 */
export function decodeToken(token: string): DecodeResult | DecodeError {
  try {
    const trimmed = token.trim()
    const parts = trimmed.split('.')
    if (parts.length !== 3) {
      return { ok: false, error: 'Invalid JWT structure: expected 3 dot-separated parts.' }
    }
    const header = jose.decodeProtectedHeader(trimmed)
    const payload = jose.decodeJwt(trimmed)
    const signature = parts[2]
    return { ok: true, header, payload, signature }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to decode token.',
    }
  }
}

// ---------------------------------------------------------------------------
// Timestamp helpers
// ---------------------------------------------------------------------------

/**
 * Format a JWT numeric date (seconds since epoch) as a human-readable string.
 * Returns null if the value cannot be converted to a valid date.
 */
export function formatTimestamp(value: unknown): string | null {
  if (typeof value !== 'number') return null
  try {
    const d = new Date(value * 1000)
    if (isNaN(d.getTime())) return null
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    })
  } catch {
    return null
  }
}

/**
 * Returns true if the token's `exp` claim is in the past.
 */
export function isExpired(payload: jose.JWTPayload): boolean {
  if (typeof payload.exp !== 'number') return false
  return Date.now() / 1000 > payload.exp
}

// ---------------------------------------------------------------------------
// Verify
// ---------------------------------------------------------------------------

export interface VerifySuccess {
  valid: true
}

export interface VerifyFailure {
  valid: false
  error: string
}

export type VerifyResult = VerifySuccess | VerifyFailure

/**
 * Verify a JWT using the provided secret/key and algorithm.
 * - HMAC  (HS*): secret is a UTF-8 string shared secret
 * - RSA   (RS*, PS*): secret is a PEM-encoded public key (SPKI)
 * - ECDSA (ES*): secret is a PEM-encoded public key (SPKI)
 * - EdDSA: secret is a PEM-encoded public key (SPKI)
 */
export async function verifyJwt(
  token: string,
  secret: string,
  algorithm: string,
): Promise<VerifyResult> {
  try {
    const algType = getAlgorithmType(algorithm)
    let key: Uint8Array | CryptoKey

    if (algType === 'HMAC') {
      key = new TextEncoder().encode(secret)
    } else {
      key = await jose.importSPKI(secret, algorithm) as unknown as CryptoKey
    }

    await jose.jwtVerify(token, key, { algorithms: [algorithm] })
    return { valid: true }
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Verification failed.',
    }
  }
}

// ---------------------------------------------------------------------------
// Sign / Generate
// ---------------------------------------------------------------------------

export interface SignSuccess {
  token: string
}

export interface SignError {
  error: string
}

export type SignResult = SignSuccess | SignError

/**
 * Sign a new JWT with the given header, payload, secret, and algorithm.
 * - HMAC  (HS*): secret is a UTF-8 shared secret string
 * - RSA   (RS*, PS*): secret is a PEM-encoded private key (PKCS8)
 * - ECDSA (ES*): secret is a PEM-encoded private key (PKCS8)
 * - EdDSA: secret is a PEM-encoded private key (PKCS8)
 */
export async function signJwt(
  header: Record<string, unknown>,
  payload: jose.JWTPayload,
  secret: string,
  algorithm: string,
): Promise<SignResult> {
  try {
    const algType = getAlgorithmType(algorithm)
    let key: Uint8Array | CryptoKey

    if (algType === 'HMAC') {
      key = new TextEncoder().encode(secret)
    } else {
      key = await jose.importPKCS8(secret, algorithm) as unknown as CryptoKey
    }

    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ ...header, alg: algorithm })
      .sign(key)

    return { token: jwt }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Signing failed.',
    }
  }
}
