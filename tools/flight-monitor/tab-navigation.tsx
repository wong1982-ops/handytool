'use client'

import type { FlightTab } from './types'

interface FlightTabNavigationProps {
  activeTab: FlightTab
  onTabChange: (tab: FlightTab) => void
  alertCount: number
}

const TABS = [
  {
    id: 'search' as const,
    label: 'Search',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
  },
  {
    id: 'alerts' as const,
    label: 'My Alerts',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
      </svg>
    ),
  },
  {
    id: 'deals' as const,
    label: 'Deals',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
      </svg>
    ),
  },
]

export function FlightTabNavigation({ activeTab, onTabChange, alertCount }: FlightTabNavigationProps) {
  return (
    <nav
      className="flex overflow-x-auto border-b border-[#1e2631] bg-[#0c1219]/95 backdrop-blur-lg
        [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      aria-label="Flight Monitor navigation"
    >
      <div className="flex w-full max-w-5xl mx-auto px-4">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer
                border-b-2 ${
                  isActive
                    ? 'border-[#3D6AF2] text-[#93aaff]'
                    : 'border-transparent text-[#70767f] hover:text-[#a6abb5] hover:border-[#2a3545]'
                }`}
              style={{ minHeight: '44px' }}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'alerts' && alertCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#10B981] text-white text-[10px] font-bold leading-none">
                  {alertCount > 99 ? '99+' : alertCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
