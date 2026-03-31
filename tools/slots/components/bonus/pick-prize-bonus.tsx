'use client'
import { useState, useMemo } from 'react'
import type { BonusProps } from '../../slots-types'

export function PickPrizeBonus({ config, betAmount, onComplete }: BonusProps) {
  const pickCount = config.bonusConfig.pickCount || 5
  const [picked, setPicked] = useState<Set<number>>(new Set())
  const [totalWin, setTotalWin] = useState(0)
  const [finished, setFinished] = useState(false)

  // Generate hidden prizes (12 items)
  const prizes = useMemo(() => {
    const items: number[] = []
    for (let i = 0; i < 12; i++) {
      // Random multiplier between 2x and 50x bet
      const mult = [2, 3, 5, 8, 10, 15, 20, 25, 30, 40, 50, 5][i]
      items.push(mult * betAmount)
    }
    // Shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]]
    }
    return items
  }, [betAmount])

  const handlePick = (index: number) => {
    if (picked.has(index) || finished) return

    const newPicked = new Set(picked)
    newPicked.add(index)
    setPicked(newPicked)

    const prize = prizes[index]
    const newTotal = totalWin + prize
    setTotalWin(newTotal)

    if (newPicked.size >= pickCount) {
      setFinished(true)
      setTimeout(() => onComplete(newTotal), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <div className="text-lg font-bold text-purple-300">PICK A PRIZE!</div>
        <div className="text-sm text-gray-400">Pick {pickCount - picked.size} more</div>
      </div>

      <div className="grid grid-cols-4 gap-3 max-w-sm">
        {prizes.map((prize, i) => (
          <button
            key={i}
            onClick={() => handlePick(i)}
            disabled={picked.has(i) || finished}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl text-lg font-bold transition-all ${
              picked.has(i)
                ? 'bg-yellow-500/30 text-yellow-300 scale-95'
                : 'bg-purple-800 text-purple-300 hover:bg-purple-700 hover:scale-105 cursor-pointer'
            }`}
          >
            {picked.has(i) ? prize.toLocaleString() : '?'}
          </button>
        ))}
      </div>

      <div className="mt-6 text-center">
        <div className="text-sm text-gray-400">Total Win</div>
        <div className="text-3xl font-bold text-yellow-300">{totalWin.toLocaleString()}</div>
      </div>
    </div>
  )
}
