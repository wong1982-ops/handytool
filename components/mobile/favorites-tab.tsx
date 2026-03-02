'use client'

import Link from 'next/link'
import { tools } from '@/lib/tools'
import { useFavorites } from '@/lib/hooks/use-favorites'

export function FavoritesTab() {
  const { favorites, toggle } = useFavorites()
  const favoriteTools = tools.filter((t) => {
    const slug = t.href.replace('/tools/', '')
    return favorites.includes(slug)
  })

  if (favoriteTools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
        <div className="text-5xl mb-4" aria-hidden="true">&#x2B50;</div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Favorites Yet</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Star your most-used tools for quick access. Tap the star on any tool card.
        </p>
      </div>
    )
  }

  return (
    <div className="px-4 py-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Favorites</h2>
      <div className="grid grid-cols-1 gap-2">
        {favoriteTools.map((tool) => {
          const slug = tool.href.replace('/tools/', '')
          return (
            <div key={tool.href} className="flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-white/5">
              <Link href={tool.href} className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shrink-0`}>
                  <div className="w-5 h-5 [&>svg]:w-5 [&>svg]:h-5">{tool.icon}</div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{tool.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{tool.description}</p>
                </div>
              </Link>
              <button
                onClick={() => toggle(slug)}
                className="p-2 text-amber-400 cursor-pointer shrink-0"
                aria-label={`Remove ${tool.name} from favorites`}
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
