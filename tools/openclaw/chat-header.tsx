'use client'

import { useChat } from './openclaw-provider'
import type { ConnectionStatus } from './openclaw-types'

const STATUS_DOT_STYLES: Record<ConnectionStatus, { bg: string; className?: string }> = {
  idle: { bg: '#70767f' },
  connecting: { bg: '#F59E0B', className: 'animate-pulse' },
  connected: { bg: '#10B981' },
  disconnected: { bg: '#EF4444' },
  error: { bg: '#EF4444' },
}

export function ChatHeader() {
  const { state, dispatch, t } = useChat()
  const { status, config } = state

  const statusLabel = t.connection[status]

  const dotStyle = STATUS_DOT_STYLES[status]

  return (
    <div className="flex items-center justify-between px-4 shrink-0" style={{ height: 40, background: '#090f16', borderBottom: '1px solid #1e2631' }}>
      <div className="flex items-center gap-2">
        <div
          className={`shrink-0 rounded-full ${dotStyle.className || ''}`}
          style={{ width: 10, height: 10, background: dotStyle.bg }}
          aria-hidden="true"
        />
        <span style={{ fontSize: 13, color: '#a6abb5' }}>
          {statusLabel}
        </span>
        {status === 'connected' && config && (
          <span style={{ fontSize: 11, color: '#70767f', marginLeft: 2 }}>
            {config.gatewayUrl}
          </span>
        )}
      </div>
      <button
        onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
        className="flex items-center gap-1.5 rounded-lg px-2 transition-colors"
        style={{ minHeight: 32, color: '#a6abb5' }}
        onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1e2631' }}
        onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
        aria-label={t.header.settings}
      >
        <svg className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="max-sm:hidden" style={{ fontSize: 13, fontWeight: 500 }}>{t.header.settings}</span>
      </button>
    </div>
  )
}
