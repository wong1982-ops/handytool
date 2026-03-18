'use client'

import { useState } from 'react'
import type { JobFilters, EmploymentType, WorkMode } from './types'
import { EMPLOYMENT_TYPE_LABELS, WORK_MODE_LABELS, DAYS_OPTIONS } from './types'

interface JobFiltersProps {
  filters: JobFilters
  onFilterChange: (updates: Partial<JobFilters>) => void
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { label: string; value: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/50"
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function JobFiltersPanel({ filters, onFilterChange }: JobFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hasActiveFilters =
    filters.employment_type ||
    filters.work_mode ||
    filters.country ||
    filters.days ||
    filters.salary_min ||
    filters.salary_max ||
    filters.hourly_min ||
    filters.hourly_max

  const clearAll = () =>
    onFilterChange({
      employment_type: undefined,
      work_mode: undefined,
      country: undefined,
      days: undefined,
      salary_min: undefined,
      salary_max: undefined,
      hourly_min: undefined,
      hourly_max: undefined,
    })

  const filterContent = (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-4">
      <FilterSelect
        label="Employment"
        value={filters.employment_type ?? ''}
        options={Object.entries(EMPLOYMENT_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
        onChange={(v) => onFilterChange({ employment_type: (v || undefined) as EmploymentType | undefined, page: 1 })}
      />
      <FilterSelect
        label="Work Mode"
        value={filters.work_mode ?? ''}
        options={Object.entries(WORK_MODE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
        onChange={(v) => onFilterChange({ work_mode: (v || undefined) as WorkMode | undefined, page: 1 })}
      />
      <FilterSelect
        label="Country"
        value={filters.country ?? ''}
        options={[
          { value: 'AU', label: '\u{1F1E6}\u{1F1FA} Australia' },
          { value: 'NZ', label: '\u{1F1F3}\u{1F1FF} New Zealand' },
        ]}
        onChange={(v) => onFilterChange({ country: (v || undefined) as 'AU' | 'NZ' | undefined, page: 1 })}
      />
      <FilterSelect
        label="Posted Within"
        value={filters.days?.toString() ?? ''}
        options={DAYS_OPTIONS.map((o) => ({ value: o.value.toString(), label: o.label }))}
        onChange={(v) => onFilterChange({ days: v ? Number(v) : undefined, page: 1 })}
      />

      {/* Salary range */}
      <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Salary Range (Annual)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.salary_min ?? ''}
            onChange={(e) => onFilterChange({ salary_min: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/50"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.salary_max ?? ''}
            onChange={(e) => onFilterChange({ salary_max: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/50"
          />
        </div>
      </div>

      {/* Hourly rate range */}
      <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Hourly Rate (Contract)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.hourly_min ?? ''}
            onChange={(e) => onFilterChange({ hourly_min: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/50"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.hourly_max ?? ''}
            onChange={(e) => onFilterChange({ hourly_max: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/50"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="col-span-2 sm:col-span-3 lg:col-span-1 h-10 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile: collapsible drawer toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        aria-expanded={isOpen}
        aria-controls="job-filters-panel"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
        {hasActiveFilters && (
          <span className="w-2 h-2 rounded-full bg-[var(--tk-color-primary-500)]" />
        )}
      </button>

      {/* Mobile: collapsible panel */}
      {isOpen && (
        <div id="job-filters-panel" className="lg:hidden p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          {filterContent}
        </div>
      )}

      {/* Desktop: always-visible sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 h-fit sticky top-24">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Filters</h2>
        {filterContent}
      </aside>
    </>
  )
}
