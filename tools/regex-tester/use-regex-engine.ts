'use client'

import { useMemo } from 'react'
import type { RegexMatch } from './types'

interface EngineResult {
  matches: RegexMatch[]
  error: string | null
  replaceResult: string | null
  matchCount: number
  groupCount: number
}

const MAX_MATCHES = 1000
const EXEC_TIMEOUT_MS = 100

export function useRegexEngine(
  regex: string,
  flags: string,
  testInput: string,
  replaceInput: string,
  mode: 'match' | 'replace',
): EngineResult {
  return useMemo(() => {
    const empty: EngineResult = {
      matches: [],
      error: null,
      replaceResult: null,
      matchCount: 0,
      groupCount: 0,
    }

    if (!regex || !testInput) return empty

    let re: RegExp
    try {
      re = new RegExp(regex, flags)
    } catch (err) {
      return { ...empty, error: (err as Error).message }
    }

    // For matchAll, ensure 'g' flag is present
    const matchFlags = flags.includes('g') ? flags : flags + 'g'
    let matchRe: RegExp
    try {
      matchRe = new RegExp(regex, matchFlags)
    } catch (err) {
      return { ...empty, error: (err as Error).message }
    }

    const matches: RegexMatch[] = []
    let matchCount = 0
    let groupCount = 0
    const startTime = performance.now()

    try {
      for (const m of testInput.matchAll(matchRe)) {
        matchCount++

        // Track group count from the first match
        if (matchCount === 1) {
          // Numbered groups count = total groups minus the full match
          groupCount = m.length - 1
        }

        if (matches.length < MAX_MATCHES) {
          const groups: Record<string, string | undefined> = {}

          // Add named groups
          if (m.groups) {
            for (const [key, value] of Object.entries(m.groups)) {
              groups[key] = value
            }
          }

          // Add numbered groups ($1, $2, etc.)
          for (let i = 1; i < m.length; i++) {
            groups[`$${i}`] = m[i]
          }

          matches.push({
            index: matchCount - 1,
            value: m[0],
            start: m.index ?? 0,
            end: (m.index ?? 0) + m[0].length,
            groups,
          })
        }

        // Enforce execution timeout
        if (performance.now() - startTime > EXEC_TIMEOUT_MS) {
          break
        }
      }
    } catch (err) {
      return { ...empty, error: (err as Error).message }
    }

    // Compute replace result if in replace mode
    let replaceResult: string | null = null
    if (mode === 'replace') {
      try {
        replaceResult = testInput.replace(re, replaceInput)
      } catch (err) {
        return {
          matches,
          error: `Replace error: ${(err as Error).message}`,
          replaceResult: null,
          matchCount,
          groupCount,
        }
      }
    }

    return { matches, error: null, replaceResult, matchCount, groupCount }
  }, [regex, flags, testInput, replaceInput, mode])
}
