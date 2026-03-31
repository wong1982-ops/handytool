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
      <div className="mx-4 my-3 px-4 py-3 rounded-xl bg-[#2d1052]/60 border border-[#d4a052]/20 text-center">
        <p className="text-sm text-[#d4a052]/60">Next bonus in {hoursLeft}h</p>
      </div>
    )
  }

  return (
    <div className="mx-4 my-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#2d1052] to-[#1a0a2e] border border-[#d4a052]/40 shadow-[0_0_12px_rgba(212,160,82,0.15)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#f0d080]">
            {t.lobby.dailyBonus} — Day {player.dailyStreak + 1}
          </p>
          <p className="text-xs text-[#d4a052]/70">{amount.toLocaleString()} coins</p>
        </div>
        <button
          onClick={handleClaim}
          className="px-4 py-1.5 rounded-lg text-sm font-bold bg-[#22c55e] text-white hover:bg-[#16a34a] transition-colors"
        >
          Claim!
        </button>
      </div>
    </div>
  )
}
