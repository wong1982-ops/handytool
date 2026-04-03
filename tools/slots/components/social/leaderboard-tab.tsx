'use client'
import { useState, useEffect } from 'react'
import { useSlots } from '../../slots-provider'

type Period = 'weekly' | 'alltime'

export function LeaderboardTab() {
  const { t } = useSlots()
  const [period, setPeriod] = useState<Period>('weekly')
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/v1/slots/leaderboard?period=${period}`)
      .then(r => r.json())
      .then(json => {
        setEntries(json.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [period])

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-[17px] font-bold text-white">{t.social.leaderboard}</h2>

      {/* Period tabs */}
      <div className="flex gap-2">
        {(['weekly', 'alltime'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-[18px] py-2 min-h-[44px] rounded-lg text-[13px] font-medium transition-colors ${
              period === p ? 'bg-[#3D6AF2] text-white font-semibold' : 'bg-[#131a23] text-[#70767f] border border-[#1e2631] hover:bg-[#1e2631]'
            }`}
          >
            {p === 'weekly' ? t.social.weekly : t.social.allTime}
          </button>
        ))}
      </div>

      {/* Rankings */}
      {loading ? (
        <div className="text-center text-[#70767f] py-8 text-sm">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-center text-[#70767f] py-8 text-sm">No data yet</div>
      ) : (
        <div className="space-y-1.5">
          {entries.map((entry, i) => (
            <div
              key={entry.user_id}
              className="flex items-center gap-3 px-3 py-3 rounded-[10px] bg-[#131a23] border border-[#1e2631]"
              style={i < 3 ? { borderLeftWidth: '3px', borderLeftColor: i === 0 ? '#f0d080' : i === 1 ? '#d1d5db' : '#d4a052' } : undefined}
            >
              <span className={`w-7 text-center text-[15px] font-extrabold ${
                i === 0 ? 'text-[#f0d080]' : i === 1 ? 'text-[#d1d5db]' : i === 2 ? 'text-[#d4a052]' : 'text-[#70767f]'
              }`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-semibold text-white">User {entry.user_id?.slice(0, 8)}...</span>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-bold text-[#f0d080]" style={{ fontFamily: '"SF Mono", monospace' }}>{entry.coins_won?.toLocaleString()}</div>
                <div className="text-[10px] text-[#70767f] mt-px">{t.social.biggestWin}: {entry.biggest_win?.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
