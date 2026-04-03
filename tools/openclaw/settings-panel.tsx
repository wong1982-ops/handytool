'use client'

import { useState, useEffect } from 'react'
import { useChat } from './openclaw-provider'

interface SettingsPanelProps {
  onConnect: () => void
  onDisconnect: () => void
}

export function SettingsPanel({ onConnect, onDisconnect }: SettingsPanelProps) {
  const { state, dispatch, t } = useChat()
  const { config, status, showSettings } = state

  const [url, setUrl] = useState(config?.gatewayUrl || '')
  const [token, setToken] = useState(config?.authToken || '')

  useEffect(() => {
    if (config) {
      setUrl(config.gatewayUrl)
      setToken(config.authToken)
    }
  }, [config])

  if (!showSettings) return null

  const handleConnect = () => {
    if (!url.trim() || !token.trim()) return
    dispatch({ type: 'SET_CONFIG', payload: { gatewayUrl: url.trim(), authToken: token.trim() } })
    // Connect will be triggered by the parent via effect
    setTimeout(() => onConnect(), 100)
    dispatch({ type: 'TOGGLE_SETTINGS' })
  }

  const handleDisconnect = () => {
    onDisconnect()
    dispatch({ type: 'SET_CONFIG', payload: null })
  }

  const isConnected = status === 'connected'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(2px)', padding: 24 }}
      onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
    >
      <div
        className="w-full max-w-[400px] flex flex-col"
        style={{ background: '#131a23', border: '1px solid #1e2631', borderRadius: 20, padding: 24, gap: 20 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t.settings.title}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white" style={{ fontSize: 18 }}>{t.settings.title}</h2>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
            className="flex items-center justify-center transition-colors"
            style={{ width: 44, height: 44, borderRadius: 10, color: '#70767f' }}
            onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1e2631' }}
            onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            aria-label={t.settings.close}
          >
            <svg className="w-5.5 h-5.5" style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col" style={{ gap: 16 }}>
          <div className="flex flex-col" style={{ gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#a6abb5' }}>
              {t.settings.gatewayUrl}
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.settings.gatewayUrlPlaceholder}
              className="w-full text-sm text-white outline-none disabled:opacity-45 disabled:cursor-not-allowed"
              style={{ height: 44, background: '#090f16', border: '1px solid #1e2631', borderRadius: 10, padding: '0 14px', fontFamily: 'inherit' }}
              onFocus={(e) => { if (!isConnected) e.target.style.borderColor = '#3D6AF2' }}
              onBlur={(e) => { e.target.style.borderColor = '#1e2631' }}
              disabled={isConnected}
            />
          </div>

          <div className="flex flex-col" style={{ gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#a6abb5' }}>
              {t.settings.authToken}
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={t.settings.authTokenPlaceholder}
              className="w-full text-sm text-white outline-none disabled:opacity-45 disabled:cursor-not-allowed"
              style={{ height: 44, background: '#090f16', border: '1px solid #1e2631', borderRadius: 10, padding: '0 14px', fontFamily: 'inherit' }}
              onFocus={(e) => { if (!isConnected) e.target.style.borderColor = '#3D6AF2' }}
              onBlur={(e) => { e.target.style.borderColor = '#1e2631' }}
              disabled={isConnected}
            />
          </div>
        </div>

        {isConnected ? (
          <button
            onClick={handleDisconnect}
            className="w-full font-semibold text-sm transition-colors"
            style={{ height: 44, background: 'transparent', border: '1px solid #EF4444', borderRadius: 10, color: '#EF4444' }}
            onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)' }}
            onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
          >
            {t.settings.disconnect}
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={!url.trim() || !token.trim()}
            className="w-full font-semibold text-sm text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ height: 44, background: '#3D6AF2', borderRadius: 10 }}
            onMouseOver={(e) => { if (!e.currentTarget.disabled) (e.currentTarget as HTMLButtonElement).style.background = '#2f5be0' }}
            onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#3D6AF2' }}
          >
            {t.settings.connect}
          </button>
        )}

        {/* Clear history */}
        <button
          onClick={() => {
            dispatch({ type: 'CLEAR_HISTORY' })
            dispatch({ type: 'TOGGLE_SETTINGS' })
          }}
          className="w-full text-sm transition-colors"
          style={{ background: 'transparent', color: '#70767f', padding: 4, border: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
          onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#EF4444' }}
          onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#70767f' }}
        >
          {t.settings.clearHistory}
        </button>
      </div>
    </div>
  )
}
