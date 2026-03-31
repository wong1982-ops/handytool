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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t.settings.title}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t.settings.title}</h2>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
            aria-label={t.settings.close}
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.settings.gatewayUrl}
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.settings.gatewayUrlPlaceholder}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={isConnected}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.settings.authToken}
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={t.settings.authTokenPlaceholder}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={isConnected}
            />
          </div>
        </div>

        <div className="flex gap-3">
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              {t.settings.disconnect}
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={!url.trim() || !token.trim()}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.settings.connect}
            </button>
          )}
        </div>

        {/* Clear history */}
        <button
          onClick={() => {
            dispatch({ type: 'CLEAR_HISTORY' })
            dispatch({ type: 'TOGGLE_SETTINGS' })
          }}
          className="w-full px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {t.settings.clearHistory}
        </button>
      </div>
    </div>
  )
}
