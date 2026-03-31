'use client'
import { useState } from 'react'
import { useSlots } from '../../slots-provider'
import { COIN_PACKS } from '../../slots-types'

export function CoinShop() {
  const { t } = useSlots()
  const [loading, setLoading] = useState<string | null>(null)

  const handleBuy = async (packId: string) => {
    setLoading(packId)
    try {
      const res = await fetch('/api/v1/slots/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId }),
      })
      const json = await res.json()
      if (json.data?.sessionUrl) {
        window.location.href = json.data.sessionUrl
      }
    } catch {
      // handle error
    } finally {
      setLoading(null)
    }
  }

  const badges: Record<string, string | null> = {
    popular: t.shop.popular,
    'best-value': t.shop.bestValue,
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-white">{t.shop.title}</h2>

      <div className="space-y-3">
        {COIN_PACKS.map(pack => {
          const totalCoins = pack.coins + Math.floor(pack.coins * pack.bonusPercent / 100)
          const badge = badges[pack.id]

          return (
            <div key={pack.id} className="relative flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-br from-[#2d1052] to-[#1a0a2e] border border-[#d4a052]/30">
              {badge && (
                <span className="absolute -top-2 right-3 px-2 py-0.5 text-[10px] font-bold bg-[#d4a052] text-black rounded-full">
                  {badge}
                </span>
              )}
              <div>
                <div className="text-sm font-medium text-white">{pack.name}</div>
                <div className="text-lg font-bold text-[#f0d080]">{totalCoins.toLocaleString()}</div>
                {pack.bonusPercent > 0 && (
                  <div className="text-xs text-green-400">+{pack.bonusPercent}% bonus</div>
                )}
              </div>
              <button
                onClick={() => handleBuy(pack.id)}
                disabled={loading !== null}
                className="px-5 py-2 rounded-lg text-sm font-bold bg-[#22c55e] text-white hover:bg-[#16a34a] transition-colors disabled:opacity-50"
              >
                {loading === pack.id ? '...' : `$${(pack.price / 100).toFixed(2)}`}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
