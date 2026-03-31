'use client'

import { useState } from 'react'
import { useSlots } from '../../slots-provider'

interface AutoSpinDialogProps {
  open: boolean
  onClose: () => void
  onStart: (count: number, stopOnBigWin: boolean, stopOnBonus: boolean) => void
}

export function AutoSpinDialog({ open, onClose, onStart }: AutoSpinDialogProps) {
  const { t } = useSlots()
  const [count, setCount] = useState(10)
  const [stopOnBigWin, setStopOnBigWin] = useState(true)
  const [stopOnBonus, setStopOnBonus] = useState(true)

  if (!open) return null

  const counts = [10, 25, 50, 100, 250]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t.machine.autoSpins}
      >
        <h2 className="text-lg font-bold text-white">{t.machine.autoSpins}</h2>

        <div className="flex flex-wrap gap-2">
          {counts.map((c) => (
            <button
              key={c}
              onClick={() => setCount(c)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                count === c
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={stopOnBigWin}
            onChange={(e) => setStopOnBigWin(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          {t.machine.stopOnWin}
        </label>

        <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={stopOnBonus}
            onChange={(e) => setStopOnBonus(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          {t.machine.stopOnBonus}
        </label>

        <button
          onClick={() => { onStart(count, stopOnBigWin, stopOnBonus); onClose() }}
          className="w-full py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          {t.machine.auto} ({count})
        </button>
      </div>
    </div>
  )
}
