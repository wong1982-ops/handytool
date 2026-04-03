'use client'
import { SlotsProvider, useSlots } from '@/tools/slots/slots-provider'
import { ALL_GAMES } from '@/tools/slots/games'
import { GameCard } from '@/tools/slots/components/lobby/game-card'
import { CoinDisplay } from '@/tools/slots/components/lobby/coin-display'
import { DailyBonus } from '@/tools/slots/components/lobby/daily-bonus'
import { BottomNav } from '@/tools/slots/components/lobby/bottom-nav'
import { EventsBanner } from '@/tools/slots/components/social/events-banner'
import { FriendsTab } from '@/tools/slots/components/social/friends-tab'
import { LeaderboardTab } from '@/tools/slots/components/social/leaderboard-tab'
import { GiftsTab } from '@/tools/slots/components/social/gifts-tab'
import { CoinShop } from '@/tools/slots/components/shop/coin-shop'
import { BackButton } from '@/components/ui/back-button'

function LobbyInner() {
  const { activeTab } = useSlots()

  return (
    <div className="flex flex-col h-[100dvh] bg-white dark:bg-[#090f16]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-[#3D6AF2]/30 bg-slate-50 dark:bg-[#131a23] shrink-0">
        <div className="flex items-center gap-2.5">
          <BackButton />
          <h1 className="text-[15px] font-extrabold text-[#f0d080] tracking-[0.06em]">TOOLK1T CASINO</h1>
        </div>
        <div className="flex items-center gap-2">
          <CoinDisplay />
          <button
            onClick={() => {}}
            className="px-3 py-1.5 min-h-[32px] rounded-lg text-[11px] font-bold tracking-[0.04em] bg-[#10B981] text-white hover:bg-[#0d9668] transition-colors"
          >
            Store
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'lobby' && (
          <>
            <EventsBanner />
            <DailyBonus />
            <div className="overflow-x-auto flex gap-3 snap-x snap-mandatory px-4 py-6">
              {ALL_GAMES.map((game) => (
                <div key={game.id} className="snap-center shrink-0">
                  <GameCard game={game} />
                </div>
              ))}
            </div>
          </>
        )}
        {activeTab === 'friends' && <FriendsTab />}
        {activeTab === 'leaderboard' && <LeaderboardTab />}
        {activeTab === 'gifts' && <GiftsTab />}
        {activeTab === 'shop' && <CoinShop />}
      </div>

      <BottomNav />
    </div>
  )
}

export default function SlotsLobbyPage() {
  return (
    <SlotsProvider>
      <LobbyInner />
    </SlotsProvider>
  )
}
