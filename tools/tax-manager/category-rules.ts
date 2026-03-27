import type { CategoryRule } from './types'

/**
 * Matches a transaction description against saved category rules.
 * Uses case-insensitive substring matching. Returns the first
 * matching category id, or null if no rule matches.
 */
export function applyRules(
  description: string,
  rules: CategoryRule[],
): string | null {
  const lower = description.toLowerCase()

  for (const rule of rules) {
    if (lower.includes(rule.pattern.toLowerCase())) {
      return rule.category
    }
  }

  return null
}

/**
 * Creates a clean pattern + category pair from a transaction description.
 * Extracts a normalised pattern (lowercase, trimmed) suitable for
 * future substring matching.
 */
export function createRule(
  description: string,
  category: string,
): { pattern: string; category: string } {
  return {
    pattern: description.toLowerCase().trim(),
    category,
  }
}
