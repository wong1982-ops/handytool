'use client'

import type { SketchMode } from './types'

interface SketchTabNavigationProps {
  activeTab: 'create' | 'creations'
  onTabChange: (tab: 'create' | 'creations') => void
  mode: SketchMode
}

const TABS = [
  {
    id: 'create' as const,
    label: 'Create',
    funLabel: 'Create',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
      </svg>
    ),
  },
  {
    id: 'creations' as const,
    label: 'My Creations',
    funLabel: 'My Creations',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
      </svg>
    ),
  },
]

export function SketchTabNavigation({ activeTab, onTabChange, mode }: SketchTabNavigationProps) {
  const isFun = mode === 'fun'

  return (
    <nav
      className="flex overflow-x-auto border-b border-[#1e2631] bg-[#0c1219]/95 backdrop-blur-lg
        [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      aria-label="Sketch to Art navigation"
    >
      <div className="flex w-full max-w-4xl mx-auto px-4">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer
                border-b-2 ${
                  isActive
                    ? 'border-[#3D6AF2] text-[#93aaff]'
                    : 'border-transparent text-[#70767f] hover:text-[#a6abb5] hover:border-[#2a3545]'
                }`}
              style={{ minHeight: '44px' }}
            >
              {tab.icon}
              {isFun ? tab.funLabel : tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
