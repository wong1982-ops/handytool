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
      <div className="mx-4 my-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-[#1e2631] text-center">
        <p className="text-sm text-slate-400 dark:text-[#70767f]">Next bonus in {hoursLeft}h</p>
      </div>
    )
  }

  return (
    <div className="mx-4 my-2.5 px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-[#131a23] border border-[#3D6AF2]/40">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold text-[#f0d080]">
            {t.lobby.dailyBonus} — Day {player.dailyStreak + 1}
          </p>
          <p className="text-[11px] text-[#d4a052] mt-0.5">{amount.toLocaleString()} coins</p>
        </div>
        <button
          onClick={handleClaim}
          className="px-[18px] py-2 min-h-[44px] rounded-lg text-[13px] font-bold bg-[#10B981] text-white hover:bg-[#0d9668] transition-colors"
        >
          Claim!
        </button>
      </div>
    </div>
  )
}
