'use client'

import { useEffect, useState } from 'react'

interface Promotion {
  id: string
  source: string
  airline: string | null
  title: string
  description: string | null
  deal_url: string
  sale_ends: string | null
  scraped_at: string
}

function formatTimeLeft(saleEnds: string | null): string | null {
  if (!saleEnds) return null
  const diff = new Date(saleEnds).getTime() - Date.now()
  if (diff <= 0) return null
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `${days}d ${hours}h left`
  return `${hours}h left`
}

const SOURCE_COLORS: Record<string, string> = {
  jetstar: 'from-orange-500 to-orange-600',
  scoot: 'from-yellow-500 to-yellow-600',
  secretflying: 'from-purple-500 to-purple-600',
}

const SOURCE_LABELS: Record<string, string> = {
  jetstar: 'Jetstar',
  scoot: 'Scoot',
  secretflying: 'Secret Flying',
}

export function PromotionsCarousel() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/flights/promotions')
      .then(r => r.json())
      .then((json: { data: { promotions: Promotion[] } }) => {
        setPromotions(json.data?.promotions ?? [])
      })
      .catch(() => setPromotions([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading || promotions.length === 0) return null

  return (
    <section aria-label="Active promotions" className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-slate-900 dark:text-white">🏷️ Active Promotions</span>
        <span className="text-[11px] text-slate-400 dark:text-[#70767f]">{promotions.length} deals</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
        {promotions.map((promo) => {
          const timeLeft = formatTimeLeft(promo.sale_ends)
          const gradient = SOURCE_COLORS[promo.source] || 'from-[#3D6AF2] to-[#3D9DF2]'
          const sourceName = promo.airline || SOURCE_LABELS[promo.source] || promo.source

          return (
            <a
              key={promo.id}
              href={promo.deal_url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 w-[220px] rounded-xl overflow-hidden border border-slate-200 dark:border-[#1e2631] hover:border-[#3D6AF2]/50 transition-colors group"
            >
              {/* Gradient header */}
              <div className={`bg-gradient-to-r ${gradient} px-3.5 py-2.5`}>
                <p className="text-white text-[11px] font-bold uppercase tracking-wider">{sourceName}</p>
              </div>

              {/* Content */}
              <div className="bg-slate-50 dark:bg-[#131a23] px-3.5 py-3 space-y-2">
                <p className="text-slate-900 dark:text-white text-sm font-semibold line-clamp-2 leading-tight group-hover:text-[#3D6AF2] transition-colors">
                  {promo.title}
                </p>
                {promo.description && (
                  <p className="text-slate-400 dark:text-[#70767f] text-[11px] line-clamp-2">{promo.description}</p>
                )}
                <div className="flex items-center justify-between">
                  {timeLeft && (
                    <span className="text-[11px] font-medium text-amber-500">⏰ {timeLeft}</span>
                  )}
                  <span className="text-[11px] font-medium text-[#3D6AF2] group-hover:underline ml-auto">
                    View Deal →
                  </span>
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}
