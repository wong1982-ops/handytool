'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/ui/copy-button'

interface IpHeroCardProps {
  ip: string
  ipVersion?: 'ipv4' | 'ipv6'
  ipv6?: string
  location: string
  isSecure: boolean
  onRefresh: () => void
}

export function IpHeroCard({ ip, ipVersion = 'ipv4', ipv6, location, isSecure, onRefresh }: IpHeroCardProps) {
  const label = ipVersion === 'ipv6' ? 'Your Public IPv6 Address' : 'Your Public IPv4 Address'

  return (
    <GlassCard glow className="p-8 md:p-6 text-center">
      <p className="text-[var(--tk-color-primary-500)] text-sm font-bold uppercase tracking-widest mb-3 md:mb-2">
        {label}
      </p>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-3 tracking-tight text-slate-900 dark:text-white break-all sm:break-normal">
        {ip}
      </h1>
      {ipv6 && (
        <div className="flex items-center justify-center gap-2 mb-4 md:mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">IPv6</span>
          <span className="text-sm font-mono text-slate-600 dark:text-slate-300">{ipv6}</span>
          <CopyButton text={ipv6} label="Copy IPv6" />
        </div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6 md:mb-4">
        <Badge
          variant="default"
          icon={
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          }
        >
          {location}
        </Badge>
        {isSecure && (
          <Badge
            variant="success"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
            }
          >
            Safe Connection
          </Badge>
        )}
      </div>
      <div className="flex justify-center gap-3">
        <CopyButton text={ip} label="Copy Address" />
        <button
          onClick={onRefresh}
          aria-label="Refresh IP address"
          className="flex items-center gap-2 px-6 py-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer text-slate-900 dark:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </GlassCard>
  )
}
