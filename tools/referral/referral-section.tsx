'use client'

import { useEffect, useState } from 'react'

interface RecentReferral {
  id: string
  date: string
  credits: number
}

interface ReferralStats {
  totalReferrals: number
  creditsEarned: number
  thisMonth: number
  maxPerMonth: number
  recent: RecentReferral[]
}

export default function ReferralSection() {
  const [code, setCode] = useState('')
  const [url, setUrl] = useState('')
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [codeRes, statsRes] = await Promise.all([
          fetch('/api/v1/referral/code'),
          fetch('/api/v1/referral/stats'),
        ])
        const [codeJson, statsJson] = await Promise.all([
          codeRes.json(),
          statsRes.json(),
        ])
        const codeData = codeJson.data ?? codeJson
        const statsData = statsJson.data ?? statsJson

        setCode(codeData.code ?? '')
        setUrl(codeData.url ?? '')
        setStats(statsData)
      } catch {
        // silently fail — UI shows empty state
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  function handleCopy() {
    if (!url) return
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const shareText =
    'Check out Toolk1t — free AI tools for devs and creators! Sign up with my link and we both get free credits: ' +
    url

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton referral link card */}
        <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-6 max-w-2xl animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 rounded bg-[#1e2631]" />
            <div className="h-5 w-48 rounded bg-[#1e2631]" />
            <div className="h-5 w-24 rounded-full bg-[#1e2631]" />
          </div>
          <div className="h-4 w-80 rounded bg-[#1e2631] mb-4" />
          <div className="flex gap-2 mb-3">
            <div className="flex-1 h-11 rounded-lg bg-[#1e2631]" />
            <div className="w-20 h-11 rounded-lg bg-[#1e2631]" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-36 rounded-lg bg-[#1e2631]" />
            <div className="h-10 w-40 rounded-lg bg-[#1e2631]" />
          </div>
        </div>

        {/* Skeleton stats row */}
        <div className="grid grid-cols-3 gap-3 max-w-2xl animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl bg-[#131a23] border border-[#1e2631] p-4">
              <div className="h-7 w-12 rounded bg-[#1e2631] mb-2" />
              <div className="h-3 w-20 rounded bg-[#1e2631]" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const thisMonthMax = stats?.maxPerMonth ?? 10
  const thisMonth = stats?.thisMonth ?? 0
  const progressPct = Math.min((thisMonth / thisMonthMax) * 100, 100)

  return (
    <div className="space-y-6">
      {/* Referral link card */}
      <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-6 max-w-2xl">
        {/* Header row */}
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#3D6AF2] shrink-0"
            aria-hidden="true"
          >
            <polyline points="20 12 20 22 4 22 4 12" />
            <rect x="2" y="7" width="20" height="5" />
            <line x1="12" y1="22" x2="12" y2="7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
          <h2 className="text-[18px] font-bold text-white leading-tight">
            Invite Friends, Earn Credits
          </h2>
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 whitespace-nowrap">
            15 credits each
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-[14px] text-[#a6abb5] mb-4">
          Share your link — you both get 15 credits when they sign up
        </p>

        {/* URL row */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            readOnly
            value={url}
            aria-label="Your referral link"
            className="flex-1 min-h-[44px] px-3 text-[14px] text-white bg-[#1e2631] border border-[#1e2631] rounded-lg outline-none select-all cursor-text"
          />
          <button
            onClick={handleCopy}
            className="min-h-[44px] px-4 text-[14px] font-semibold text-white rounded-lg whitespace-nowrap bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] hover:opacity-90 active:opacity-80 transition-opacity"
            aria-label={copied ? 'Copied to clipboard' : 'Copy referral link'}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>

        {/* Share buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              window.open(
                'https://twitter.com/intent/tweet?text=' +
                  encodeURIComponent(shareText),
                '_blank',
                'noopener,noreferrer'
              )
            }
            className="min-h-[40px] px-4 text-[13px] font-medium bg-[#131a23] border border-[#1e2631] text-[#a6abb5] hover:bg-[#1e2631] rounded-lg transition-colors"
            aria-label="Share on Twitter"
          >
            𝕏 Share on Twitter
          </button>
          <button
            onClick={() =>
              window.open(
                'https://www.linkedin.com/sharing/share-offsite/?url=' +
                  encodeURIComponent(url),
                '_blank',
                'noopener,noreferrer'
              )
            }
            className="min-h-[40px] px-4 text-[13px] font-medium bg-[#131a23] border border-[#1e2631] text-[#a6abb5] hover:bg-[#1e2631] rounded-lg transition-colors"
            aria-label="Share on LinkedIn"
          >
            in Share on LinkedIn
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 max-w-2xl">
        {/* Total Referrals */}
        <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-4">
          <p
            className="text-[28px] font-bold text-white leading-none mb-1"
            aria-label={`Total referrals: ${stats?.totalReferrals ?? 0}`}
          >
            {stats?.totalReferrals ?? 0}
          </p>
          <p className="text-[12px] text-[#a6abb5]">Total Referrals</p>
        </div>

        {/* Credits Earned */}
        <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-4">
          <p
            className="text-[28px] font-bold text-[#10B981] leading-none mb-1"
            aria-label={`Credits earned: ${stats?.creditsEarned ?? 0}`}
          >
            {stats?.creditsEarned ?? 0}
          </p>
          <p className="text-[12px] text-[#a6abb5]">Credits Earned</p>
        </div>

        {/* This Month */}
        <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-4">
          <p
            className="text-[28px] font-bold text-white leading-none mb-1"
            aria-label={`This month: ${thisMonth} of ${thisMonthMax}`}
          >
            {thisMonth}{' '}
            <span className="text-[16px] font-normal text-[#a6abb5]">
              / {thisMonthMax}
            </span>
          </p>
          <p className="text-[12px] text-[#a6abb5] mb-2">This Month</p>
          <div
            className="h-[4px] rounded-full bg-[#1e2631] overflow-hidden"
            role="progressbar"
            aria-valuenow={thisMonth}
            aria-valuemin={0}
            aria-valuemax={thisMonthMax}
            aria-label={`${thisMonth} of ${thisMonthMax} referrals this month`}
          >
            <div
              className="h-full rounded-full bg-[#3D6AF2] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent referrals */}
      <div className="rounded-xl bg-[#131a23] border border-[#1e2631] overflow-hidden max-w-2xl">
        <div className="px-4 py-3 border-b border-[#1e2631]">
          <h3 className="text-[14px] font-semibold text-white">Recent Referrals</h3>
        </div>

        {stats?.recent && stats.recent.length > 0 ? (
          <ul>
            {stats.recent.map((item, idx) => (
              <li
                key={item.id}
                className={`flex items-center justify-between px-4 py-3 ${
                  idx < stats.recent.length - 1 ? 'border-b border-[#1e2631]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Circle avatar placeholder */}
                  <div
                    className="w-8 h-8 rounded-full bg-[#1e2631] shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-[14px] text-white leading-tight">
                      Referral #{item.id.slice(-6)}
                    </p>
                    <p className="text-[12px] text-[#a6abb5]">{item.date}</p>
                  </div>
                </div>
                <span className="text-[13px] font-semibold text-[#10B981]">
                  +{item.credits} credits
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#a6abb5] mb-3"
              aria-hidden="true"
            >
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
            <p className="text-[14px] text-white font-medium mb-1">No referrals yet</p>
            <p className="text-[13px] text-[#a6abb5]">Share your link to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}
