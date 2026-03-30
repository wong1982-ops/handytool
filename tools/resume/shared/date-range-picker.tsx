'use client'

import { useResume } from '../resume-provider'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
}

export function DateRangePicker({ startDate, endDate, onStartChange, onEndChange }: DateRangePickerProps) {
  const { t } = useResume()

  // Use a generic label approach since different modules use different field names
  const startLabel = t.education.startDate
  const endLabel = t.education.endDate

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {startLabel}
        </label>
        <input
          type="month"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {endLabel}
        </label>
        <input
          type="month"
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
        />
      </div>
    </div>
  )
}
