/**
 * Normalise a news title for dedup comparison.
 * Simpler than Job Radar — just lowercase, trim, collapse whitespace.
 */
export function normaliseTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '') // remove punctuation
}
