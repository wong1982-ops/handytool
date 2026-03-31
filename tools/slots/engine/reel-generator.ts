/**
 * Generate random stop positions for each reel using crypto.getRandomValues()
 * Each reel strip is an array of symbol indices (weighted — rarer symbols appear fewer times)
 * Returns an array of stop indices, one per reel
 */
export function generateReelStops(reelStrips: number[][]): number[] {
  const stops: number[] = []
  const randomValues = new Uint32Array(reelStrips.length)
  crypto.getRandomValues(randomValues)

  for (let i = 0; i < reelStrips.length; i++) {
    const stripLength = reelStrips[i].length
    stops.push(randomValues[i] % stripLength)
  }

  return stops
}

/**
 * Get visible symbols for a reel given a stop position
 * Returns `rows` symbols starting from the stop position, wrapping around
 */
export function getVisibleSymbols(reelStrip: number[], stopPosition: number, rows: number): number[] {
  const symbols: number[] = []
  for (let r = 0; r < rows; r++) {
    const idx = (stopPosition + r) % reelStrip.length
    symbols.push(reelStrip[idx])
  }
  return symbols
}

/**
 * Generate the full visible grid from reel strips and stop positions
 * Returns grid[reel][row] of symbol indices
 */
export function generateGrid(reelStrips: number[][], stops: number[], rows: number): number[][] {
  return reelStrips.map((strip, reelIdx) => getVisibleSymbols(strip, stops[reelIdx], rows))
}
