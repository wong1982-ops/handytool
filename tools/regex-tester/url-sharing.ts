import type { RegexState } from './types'

function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function fromBase64(str: string): string {
  const binary = atob(str)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeStateToHash(state: RegexState): string {
  const params = new URLSearchParams()
  params.set('r', toBase64(state.regex))
  params.set('f', state.flags)
  params.set('t', toBase64(state.testInput))
  params.set('m', state.mode)
  if (state.replaceInput) {
    params.set('rp', toBase64(state.replaceInput))
  }
  return '#' + params.toString()
}

export function decodeStateFromHash(hash: string): Partial<RegexState> | null {
  if (!hash || hash.length <= 1) return null

  try {
    const params = new URLSearchParams(hash.slice(1))
    const result: Partial<RegexState> = {}

    const r = params.get('r')
    if (r) result.regex = fromBase64(r)

    const f = params.get('f')
    if (f) result.flags = f

    const t = params.get('t')
    if (t) result.testInput = fromBase64(t)

    const m = params.get('m')
    if (m === 'match' || m === 'replace') result.mode = m

    const rp = params.get('rp')
    if (rp) result.replaceInput = fromBase64(rp)

    return Object.keys(result).length > 0 ? result : null
  } catch {
    return null
  }
}

export async function copyShareUrl(state: RegexState): Promise<void> {
  if (typeof window === 'undefined') return

  const hash = encodeStateToHash(state)
  const url = window.location.origin + window.location.pathname + hash
  await navigator.clipboard.writeText(url)
}
