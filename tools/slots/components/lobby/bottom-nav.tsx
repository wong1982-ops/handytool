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
    <nav className="flex items-center bg-slate-50 dark:bg-[#131a23]/96 backdrop-blur-2xl border-t border-[#3D6AF2]/20 shrink-0" role="tablist" aria-label="Casino navigation">
      {TABS.map(({ id, icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex-1 flex flex-col items-center gap-[2px] min-h-[56px] transition-colors ${
            activeTab === id
              ? 'pt-[6px] pb-2.5 gap-[1px]'
              : 'justify-center py-2 pb-2.5'
          }`}
          role="tab"
          aria-selected={activeTab === id}
        >
          {activeTab === id && (
            <span className="w-[5px] h-[5px] rounded-full bg-[#f0d080] mb-0.5" />
          )}
          <span className="text-lg leading-tight" aria-hidden="true">{icon}</span>
          <span className={`text-[10px] ${
            activeTab === id
              ? 'text-[#f0d080] font-semibold'
              : 'text-slate-400 dark:text-[#70767f] font-medium'
          }`}>{tabLabels[id]}</span>
        </button>
      ))}
    </nav>
  )
}
