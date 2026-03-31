'use client'
import { useSlots } from '../../slots-provider'
import type { LobbyTab } from '../../slots-types'

const TABS: { id: LobbyTab; icon: string }[] = [
  { id: 'lobby', icon: '🎰' },
  { id: 'friends', icon: '👥' },
  { id: 'leaderboard', icon: '🏆' },
  { id: 'gifts', icon: '🎁' },
  { id: 'shop', icon: '🛒' },
]

export function BottomNav() {
  const { activeTab, setActiveTab, t } = useSlots()

  const tabLabels: Record<LobbyTab, string> = {
    lobby: t.lobby.tabs.lobby,
    friends: t.lobby.tabs.friends,
    leaderboard: t.lobby.tabs.leaderboard,
    gifts: t.lobby.tabs.gifts,
    shop: t.lobby.tabs.shop,
  }

  return (
    <nav className="flex items-center bg-[#1a0a2e]/95 backdrop-blur-xl border-t border-[#d4a052]/20 shrink-0" role="tablist" aria-label="Casino navigation">
      {TABS.map(({ id, icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition-colors ${
            activeTab === id
              ? 'text-[#f0d080]'
              : 'text-[#d4a052]/40 hover:text-[#d4a052]/70'
          }`}
          role="tab"
          aria-selected={activeTab === id}
        >
          {activeTab === id && (
            <span className="w-1 h-1 rounded-full bg-[#f0d080] mb-0.5" />
          )}
          <span className="text-lg" aria-hidden="true">{icon}</span>
          <span>{tabLabels[id]}</span>
        </button>
      ))}
    </nav>
  )
}
