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
  const { activeTab, t } = useSlots()

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-950">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900 shrink-0">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-white">{t.lobby.title}</h1>
        </div>
        <CoinDisplay />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'lobby' && (
          <>
            <EventsBanner />
            <DailyBonus />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4">
              {ALL_GAMES.map((game) => (
                <GameCard key={game.id} game={game} />
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
