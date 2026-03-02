'use client'

import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'toolk1t-install-dismissed'
const DISMISS_DAYS = 30

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [iosPrompt, setIosPrompt] = useState(false)

  useEffect(() => {
    // Register service worker for PWA support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    if (window.matchMedia('(display-mode: standalone)').matches) return
    if ((navigator as unknown as { standalone?: boolean }).standalone) return

    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10)
      if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return
    }

    // iOS Safari: show manual install guidance
    if (isIOS()) {
      setIosPrompt(true)
      setShow(true)
      return
    }

    // Android/Chrome: use beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
    }
    setDeferredPrompt(null)
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setShow(false)
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
    setDeferredPrompt(null)
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[70] mx-auto max-w-md animate-in slide-in-from-bottom fade-in duration-300">
      <div className="flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-900/95 backdrop-blur-lg p-4 shadow-2xl">
        <img src="/icon-192.png" alt="Toolk1t" className="h-10 w-10 rounded-lg shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white text-sm">Install Toolk1t</p>
          {iosPrompt ? (
            <p className="text-xs text-slate-400 leading-relaxed">
              In Safari: tap{' '}
              <svg className="inline w-4 h-4 -mt-0.5 text-blue-400" fill="currentColor" viewBox="0 0 24 24" aria-label="Share icon">
                <path d="M12 2l3.5 3.5-1.06 1.06L13 5.12V15h-2V5.12L9.56 6.56 8.5 5.5 12 2zM5 10v10a2 2 0 002 2h10a2 2 0 002-2V10h-2v10H7V10H5z" />
              </svg>
              {' '}below, then <strong className="text-white">&quot;Add to Home Screen&quot;</strong>
            </p>
          ) : (
            <p className="text-xs text-slate-400 truncate">Quick access from your home screen</p>
          )}
        </div>
        {!iosPrompt && (
          <button
            onClick={handleInstall}
            className="shrink-0 rounded-lg bg-[#3D6AF2] px-4 py-2 text-sm font-medium text-white hover:bg-[#3D79F2] transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            Install
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="shrink-0 p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Dismiss install prompt"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          &#x2715;
        </button>
      </div>
    </div>
  )
}
