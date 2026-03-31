import type { SlotGameConfig, SpinResult, PaylineWin } from '../slots-types'
import { generateReelStops, generateGrid } from './reel-generator'

/**
 * Perform a complete spin: generate grid, evaluate wins, check bonus
 */
export function spin(config: SlotGameConfig, betPerLine: number): SpinResult {
  const stops = generateReelStops(config.reelStrips)
  const gridIndices = generateGrid(config.reelStrips, stops, config.rows)

  // Convert indices to symbol IDs
  const grid: string[][] = gridIndices.map((reel) =>
    reel.map((idx) => config.symbols[idx].id)
  )

  // Evaluate wins
  const wins: PaylineWin[] = config.useWays
    ? evaluateWays(config, grid, betPerLine)
    : evaluatePaylines(config, grid, betPerLine)

  // Check scatter wins
  const scatterWins = evaluateScatters(config, grid, betPerLine)
  wins.push(...scatterWins)

  const totalWin = wins.reduce((sum, w) => sum + w.winAmount, 0)

  // Count scatters for bonus trigger
  const scatterCount = countSymbol(grid, config.specialSymbols.scatter)
  const bonusTriggered = config.specialSymbols.scatter
    ? scatterCount >= config.bonusConfig.triggerCount
    : false

  return { grid, wins, totalWin, bonusTriggered, scatterCount }
}

/**
 * Evaluate wins using traditional payline patterns
 */
function evaluatePaylines(config: SlotGameConfig, grid: string[][], betPerLine: number): PaylineWin[] {
  const wins: PaylineWin[] = []
  const wildId = config.specialSymbols.wild

  for (let pIdx = 0; pIdx < config.paylines.length; pIdx++) {
    const payline = config.paylines[pIdx]
    // Get symbols on this payline
    const lineSymbols = payline.map((row, reel) => grid[reel][row])
    const positions = payline.map((row, reel) => [reel, row] as [number, number])

    // Find leftmost non-wild symbol
    let baseSymbol: string | null = null
    for (const sym of lineSymbols) {
      if (sym !== wildId) {
        baseSymbol = sym
        break
      }
    }

    if (!baseSymbol) {
      // All wilds — use highest paying symbol
      baseSymbol = wildId || lineSymbols[0]
    }

    // Count consecutive matches from left
    let count = 0
    const winPositions: [number, number][] = []
    for (let r = 0; r < lineSymbols.length; r++) {
      if (lineSymbols[r] === baseSymbol || lineSymbols[r] === wildId) {
        count++
        winPositions.push(positions[r])
      } else {
        break
      }
    }

    // Look up payout
    const symbolConfig = config.symbols.find((s) => s.id === baseSymbol)
    if (symbolConfig && count >= 3 && symbolConfig.payouts[count]) {
      const multiplier = symbolConfig.payouts[count]
      wins.push({
        paylineIndex: pIdx,
        symbolId: baseSymbol,
        count,
        multiplier,
        winAmount: multiplier * betPerLine,
        positions: winPositions,
      })
    }
  }

  return wins
}

/**
 * Evaluate wins using 243-ways system (any matching symbols on consecutive reels from left)
 */
function evaluateWays(config: SlotGameConfig, grid: string[][], betPerLine: number): PaylineWin[] {
  const wins: PaylineWin[] = []
  const wildId = config.specialSymbols.wild

  // For each non-scatter, non-wild symbol, check ways wins
  const checkedSymbols = new Set<string>()

  for (const symbol of config.symbols) {
    if (symbol.isScatter || symbol.isWild || checkedSymbols.has(symbol.id)) continue
    checkedSymbols.add(symbol.id)

    // Count matching positions per reel (symbol or wild)
    let consecutiveReels = 0
    let wayCount = 1
    const allPositions: [number, number][] = []

    for (let reel = 0; reel < config.reels; reel++) {
      let matchesOnReel = 0
      const reelPositions: [number, number][] = []

      for (let row = 0; row < config.rows; row++) {
        if (grid[reel][row] === symbol.id || grid[reel][row] === wildId) {
          matchesOnReel++
          reelPositions.push([reel, row])
        }
      }

      if (matchesOnReel > 0) {
        consecutiveReels++
        wayCount *= matchesOnReel
        allPositions.push(...reelPositions)
      } else {
        break
      }
    }

    if (consecutiveReels >= 3 && symbol.payouts[consecutiveReels]) {
      const multiplier = symbol.payouts[consecutiveReels]
      // For ways: total bet is betPerLine (which represents total bet / ways divisor)
      wins.push({
        paylineIndex: -1,
        symbolId: symbol.id,
        count: consecutiveReels,
        multiplier: multiplier * wayCount,
        winAmount: multiplier * wayCount * betPerLine,
        positions: allPositions,
      })
    }
  }

  return wins
}

/**
 * Evaluate scatter wins (pay in any position)
 */
function evaluateScatters(config: SlotGameConfig, grid: string[][], betPerLine: number): PaylineWin[] {
  const scatterId = config.specialSymbols.scatter
  if (!scatterId) return []

  const scatterConfig = config.symbols.find((s) => s.id === scatterId)
  if (!scatterConfig) return []

  const positions: [number, number][] = []
  for (let reel = 0; reel < config.reels; reel++) {
    for (let row = 0; row < config.rows; row++) {
      if (grid[reel][row] === scatterId) {
        positions.push([reel, row])
      }
    }
  }

  const count = positions.length
  if (count >= 3 && scatterConfig.payouts[count]) {
    const totalBet = config.useWays ? betPerLine : betPerLine * config.paylines.length
    return [{
      paylineIndex: -1,
      symbolId: scatterId,
      count,
      multiplier: scatterConfig.payouts[count],
      winAmount: scatterConfig.payouts[count] * totalBet,
      positions,
    }]
  }

  return []
}

/**
 * Count occurrences of a symbol in the grid
 */
function countSymbol(grid: string[][], symbolId: string | undefined): number {
  if (!symbolId) return 0
  let count = 0
  for (const reel of grid) {
    for (const sym of reel) {
      if (sym === symbolId) count++
    }
  }
  return count
}
