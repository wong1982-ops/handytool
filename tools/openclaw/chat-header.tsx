'use client'

import { useChat } from './openclaw-provider'
import type { ConnectionStatus } from './openclaw-types'

const STATUS_COLORS: Record<ConnectionStatus, string> = {
  idle: 'bg-gray-400',
  connecting: 'bg-yellow-400 animate-pulse',
  connected: 'bg-green-500',
  disconnected: 'bg-red-400',
  error: 'bg-red-500',
}

export function ChatHeader() {
  const { state, dispatch, t } = useChat()
  const { status, config } = state

  const statusLabel = t.connection[status]

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status]}`} aria-hidden="true" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {statusLabel}
            {status === 'connected' && config && (
              <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
                ({config.gatewayUrl})
              </span>
            )}
          </span>
        </div>
      </div>
      <button
        onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label={t.header.settings}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="max-sm:hidden">{t.header.settings}</span>
      </button>
    </div>
  )
}
