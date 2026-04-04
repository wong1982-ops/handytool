'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

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
  iknowthepilot: 'from-[#3D6AF2] to-[#3D9DF2]',
}

const SOURCE_LABELS: Record<string, string> = {
  jetstar: 'Jetstar',
  scoot: 'Scoot',
  secretflying: 'Secret Flying',
  iknowthepilot: 'I Know The Pilot',
}

export function PromotionsCarousel() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/v1/flights/promotions')
      .then(r => r.json())
      .then((json: { data: { promotions: Promotion[] } }) => {
        setPromotions(json.data?.promotions ?? [])
      })
      .catch(() => setPromotions([]))
      .finally(() => setLoading(false))
  }, [])

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el || promotions.length === 0) return
    // Initial check after render
    const timer = setTimeout(updateScrollState, 100)
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      clearTimeout(timer)
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [promotions, updateScrollState])

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = 220 + 12 // card width + gap
    const distance = direction === 'left' ? -cardWidth * 2 : cardWidth * 2
    el.scrollBy({ left: distance, behavior: 'smooth' })
  }, [])

  if (loading || promotions.length === 0) return null

  return (
    <section aria-label="Active promotions" className="mb-5 sticky top-[46px] z-20 md:static bg-white dark:bg-[#090f16] -mx-4 px-4 pt-4 pb-1 md:mx-0 md:px-0 md:pt-0 md:pb-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">🏷️ Active Promotions</span>
          <span className="text-[11px] text-slate-400 dark:text-[#70767f]">{promotions.length} deals</span>
        </div>

        {/* Arrow buttons — visible on md+ */}
        <div className="hidden md:flex items-center gap-1">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-[#1e2631] text-slate-500 dark:text-[#a6abb5] hover:bg-slate-200 dark:hover:bg-[#2a3545] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Scroll promotions left"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-[#1e2631] text-slate-500 dark:text-[#a6abb5] hover:bg-slate-200 dark:hover:bg-[#2a3545] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Scroll promotions right"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable container */}
      <div className="relative">
        {/* Left fade — visible on md+ when scrollable */}
        {canScrollLeft && (
          <div className="hidden md:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-[#090f16] to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1"
          style={{ scrollbarWidth: 'none' }}
        >
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

        {/* Right fade — visible on md+ when scrollable */}
        {canScrollRight && (
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-[#090f16] to-transparent z-10 pointer-events-none" />
        )}
      </div>
    </section>
  )
}
