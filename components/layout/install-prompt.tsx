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
              Tap{' '}
              <svg className="inline w-4 h-4 -mt-0.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Share icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {' '}Share then &quot;Add to Home Screen&quot;
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
