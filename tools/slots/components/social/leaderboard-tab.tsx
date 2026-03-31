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
      <h2 className="text-lg font-bold text-white">{t.social.leaderboard}</h2>

      {/* Period tabs */}
      <div className="flex gap-2">
        {(['weekly', 'alltime'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === p ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {p === 'weekly' ? t.social.weekly : t.social.allTime}
          </button>
        ))}
      </div>

      {/* Rankings */}
      {loading ? (
        <div className="text-center text-gray-500 py-8 text-sm">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-center text-gray-500 py-8 text-sm">No data yet</div>
      ) : (
        <div className="space-y-1">
          {entries.map((entry, i) => (
            <div key={entry.user_id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-800">
              <span className={`w-8 text-center font-bold ${
                i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'
              }`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-white">User {entry.user_id?.slice(0, 8)}...</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-yellow-300">{entry.coins_won?.toLocaleString()}</div>
                <div className="text-xs text-gray-400">{t.social.biggestWin}: {entry.biggest_win?.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
