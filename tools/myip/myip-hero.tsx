'use client'

import { useState } from 'react'

interface MyIpHeroProps {
  ip: string
  ipVersion?: 'ipv4' | 'ipv6'
  isSecure: boolean
}

export function MyIpHero({ ip, ipVersion = 'ipv4', isSecure }: MyIpHeroProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(ip)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="flex flex-col items-center text-center gap-4 bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
      <h1 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
        {ipVersion === 'ipv6' ? 'Your Public IPv6 Address' : 'Your Public IPv4 Address'}
      </h1>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <p className="text-slate-900 dark:text-white text-3xl sm:text-5xl md:text-7xl font-black tracking-tight break-all sm:break-normal">
          {ip}
        </p>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center p-3 min-w-[44px] min-h-[44px] rounded-lg bg-[var(--tk-color-primary-500)]/10 hover:bg-[var(--tk-color-primary-500)] transition-all text-[var(--tk-color-primary-500)] hover:text-white cursor-pointer"
          title={copied ? 'Copied!' : 'Copy to Clipboard'}
          aria-label={copied ? 'IP address copied' : 'Copy IP address to clipboard'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {copied ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            )}
          </svg>
        </button>
      </div>
      {isSecure && (
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
          <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <span className="text-sm">Connection Secure &amp; Private</span>
        </div>
      )}
    </section>
  )
}
