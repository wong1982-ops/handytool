'use client'
import { useSlots } from '../../slots-provider'
import { DAILY_BONUS_AMOUNTS } from '../../slots-types'

export function DailyBonus() {
  const { player, dispatch, t } = useSlots()

  const canClaim = !player.lastDailyClaimAt ||
    (Date.now() - new Date(player.lastDailyClaimAt).getTime()) > 24 * 60 * 60 * 1000

  const nextStreak = Math.min(player.dailyStreak, DAILY_BONUS_AMOUNTS.length - 1)
  const amount = DAILY_BONUS_AMOUNTS[nextStreak]

  const handleClaim = () => {
    if (!canClaim) return
    const newStreak = canClaim && player.lastDailyClaimAt &&
      (Date.now() - new Date(player.lastDailyClaimAt).getTime()) < 48 * 60 * 60 * 1000
      ? player.dailyStreak + 1
      : 1
    dispatch({ type: 'CLAIM_DAILY', payload: { streak: Math.min(newStreak, 7), amount } })
  }

  if (!canClaim) {
    const hoursLeft = player.lastDailyClaimAt
      ? Math.max(0, Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - new Date(player.lastDailyClaimAt).getTime())) / 3600000))
      : 0
    return (
      <div className="mx-4 my-3 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-center">
        <p className="text-sm text-gray-400">Next bonus in {hoursLeft}h</p>
      </div>
    )
  }

  return (
    <div className="mx-4 my-3 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-900/40 to-amber-900/40 border border-yellow-700/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-yellow-300">
            {t.lobby.dailyBonus} — Day {player.dailyStreak + 1}
          </p>
          <p className="text-xs text-yellow-200/70">{amount.toLocaleString()} coins</p>
        </div>
        <button
          onClick={handleClaim}
          className="px-4 py-1.5 rounded-lg text-sm font-bold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors"
        >
          Claim!
        </button>
      </div>
    </div>
  )
}
