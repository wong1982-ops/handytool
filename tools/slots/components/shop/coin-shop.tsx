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
      <h2 className="text-[17px] font-bold text-white">{t.shop.title}</h2>

      <div className="space-y-2.5">
        {COIN_PACKS.map(pack => {
          const totalCoins = pack.coins + Math.floor(pack.coins * pack.bonusPercent / 100)
          const badge = badges[pack.id]

          return (
            <div key={pack.id} className="relative flex items-center justify-between px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-[#1e2631]">
              {badge && (
                <span className="absolute -top-2.5 right-3 px-2 py-[3px] text-[9px] font-extrabold tracking-[0.05em] rounded-full" style={{
                  background: pack.id === 'best-value' ? '#10B981' : '#F59E0B',
                  color: pack.id === 'best-value' ? '#fff' : '#000',
                }}>
                  {badge}
                </span>
              )}
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-[#a6abb5]">{pack.name}</div>
                <div className="text-lg font-extrabold text-[#f0d080] mt-0.5" style={{ fontFamily: '"SF Mono", monospace' }}>{totalCoins.toLocaleString()}</div>
                {pack.bonusPercent > 0 ? (
                  <div className="text-[10px] font-semibold text-[#10B981] mt-px">+{pack.bonusPercent}% bonus</div>
                ) : (
                  <div className="text-[10px] text-slate-400 dark:text-[#70767f] mt-px">coins</div>
                )}
              </div>
              <button
                onClick={() => handleBuy(pack.id)}
                disabled={loading !== null}
                className="px-5 py-2.5 min-h-[44px] rounded-lg text-sm font-bold bg-[#10B981] text-white hover:bg-[#0d9668] transition-colors disabled:opacity-50"
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
