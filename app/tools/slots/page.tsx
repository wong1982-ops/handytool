'use client'
import { SlotsProvider, useSlots } from '@/tools/slots/slots-provider'
import { ALL_GAMES } from '@/tools/slots/games'
import { GameCard } from '@/tools/slots/components/lobby/game-card'
import { CoinDisplay } from '@/tools/slots/components/lobby/coin-display'
import { DailyBonus } from '@/tools/slots/components/lobby/daily-bonus'
import { BottomNav } from '@/tools/slots/components/lobby/bottom-nav'
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
            <DailyBonus />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4">
              {ALL_GAMES.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </>
        )}
        {activeTab === 'friends' && (
          <div className="flex items-center justify-center h-64 text-gray-500 text-sm">Friends — coming soon</div>
        )}
        {activeTab === 'leaderboard' && (
          <div className="flex items-center justify-center h-64 text-gray-500 text-sm">Leaderboard — coming soon</div>
        )}
        {activeTab === 'gifts' && (
          <div className="flex items-center justify-center h-64 text-gray-500 text-sm">Gifts — coming soon</div>
        )}
        {activeTab === 'shop' && (
          <div className="flex items-center justify-center h-64 text-gray-500 text-sm">Shop — coming soon</div>
        )}
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
