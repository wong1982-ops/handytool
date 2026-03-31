'use client'

import type { SlotGameConfig } from '../../slots-types'
import { useSlots } from '../../slots-provider'

interface PaytableModalProps {
  config: SlotGameConfig
  open: boolean
  onClose: () => void
}

export function PaytableModal({ config, open, onClose }: PaytableModalProps) {
  const { t } = useSlots()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t.machine.paytable}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">{t.machine.paytable}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl" aria-label="Close">×</button>
        </div>

        {/* Symbol payouts */}
        <div className="space-y-3">
          {config.symbols.map((sym) => (
            <div key={sym.id} className="flex items-center gap-3 bg-gray-800 rounded-lg px-3 py-2">
              <span className="text-2xl w-10 text-center">{sym.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">
                  {sym.name}
                  {sym.isWild && <span className="ml-2 text-xs text-amber-400">(Wild)</span>}
                  {sym.isScatter && <span className="ml-2 text-xs text-purple-400">(Scatter)</span>}
                </div>
                <div className="flex gap-3 text-xs text-gray-400 mt-1">
                  {Object.entries(sym.payouts).map(([count, mult]) => (
                    <span key={count}>×{count}: {mult}x</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bonus rules */}
        <div className="mt-6 p-3 bg-purple-900/30 rounded-lg border border-purple-700/50">
          <h3 className="text-sm font-bold text-purple-300 mb-2">{t.machine.bonus}</h3>
          <p className="text-xs text-gray-300">
            {config.bonusConfig.triggerCount}+ Scatter symbols trigger the bonus round.
            {config.bonusConfig.type === 'free_spins' && ` ${config.bonusConfig.freeSpinsCount} free spins with ${config.bonusConfig.multiplier}x multiplier.`}
            {config.bonusConfig.type === 'pick_prize' && ` Pick ${config.bonusConfig.pickCount} items to reveal prizes.`}
            {config.bonusConfig.type === 'wheel' && ' Spin the prize wheel for multipliers and coins.'}
            {config.bonusConfig.type === 'expanding_wilds' && ` ${config.bonusConfig.freeSpinsCount} free spins with expanding wilds.`}
            {config.bonusConfig.retriggerable && ' Can be retriggered!'}
          </p>
        </div>
      </div>
    </div>
  )
}
