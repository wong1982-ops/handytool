'use client'

import type { PointsBreakdown } from './types'

interface PointsCalculatorProps {
  breakdown: PointsBreakdown
}

const ROWS: { label: string; key: keyof Omit<PointsBreakdown, 'total'>; max: number }[] = [
  { label: 'Age', key: 'age', max: 30 },
  { label: 'Qualifications', key: 'qualifications', max: 70 },
  { label: 'Experience', key: 'experience', max: 20 },
  { label: 'Job Offer', key: 'jobOffer', max: 50 },
  { label: 'Green List Bonus', key: 'greenListBonus', max: 10 },
  { label: 'Partner', key: 'partnerBonus', max: 20 },
  { label: 'NZ Study', key: 'nzStudyBonus', max: 10 },
]

export default function PointsCalculator({ breakdown }: PointsCalculatorProps) {
  const { total } = breakdown

  const resultColor =
    total >= 160
      ? 'text-green-600 dark:text-green-400'
      : total >= 100
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-red-600 dark:text-red-400'

  const resultMessage =
    total >= 160
      ? 'You are likely to qualify for the Skilled Migrant Category.'
      : total >= 100
      ? 'You may qualify but may need more points. Consider a job offer or additional qualifications.'
      : 'You currently do not have enough points. Focus on gaining experience, qualifications, or a job offer.'

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Category</th>
            <th className="text-right px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Your Score</th>
            <th className="text-right px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">Max</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(({ label, key, max }) => (
            <tr
              key={key}
              className="border-b border-slate-100 dark:border-slate-800 last:border-0"
            >
              <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{label}</td>
              <td className="px-4 py-2.5 text-right font-mono font-medium text-slate-800 dark:text-slate-200">
                {breakdown[key]}
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-slate-400 dark:text-slate-500">
                {max}
              </td>
            </tr>
          ))}
          <tr className="bg-slate-50 dark:bg-slate-800 border-t-2 border-slate-200 dark:border-slate-600">
            <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">Total</td>
            <td className={`px-4 py-3 text-right font-mono font-bold text-base ${resultColor}`}>
              {total}
            </td>
            <td className="px-4 py-3 text-right font-mono font-bold text-slate-500 dark:text-slate-400">
              160+
            </td>
          </tr>
        </tbody>
      </table>
      <div className={`px-4 py-3 text-xs border-t border-slate-100 dark:border-slate-800 ${resultColor}`}>
        {resultMessage}
      </div>
    </div>
  )
}
