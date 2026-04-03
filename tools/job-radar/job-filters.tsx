'use client'

import { useState } from 'react'
import type { JobFilters, EmploymentType, WorkMode } from './types'
import { EMPLOYMENT_TYPE_LABELS, WORK_MODE_LABELS, DAYS_OPTIONS } from './types'

interface JobFiltersProps {
  filters: JobFilters
  onFilterChange: (updates: Partial<JobFilters>) => void
  mode?: 'mobile' | 'desktop'
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
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold text-[#70767f] uppercase tracking-widest">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 px-3 rounded-lg border border-[#1e2631] bg-[#090f16] text-sm text-white focus:outline-none focus:border-[rgba(61,106,242,0.6)] focus:shadow-[0_0_0_3px_rgba(61,106,242,0.12)]"
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

export function JobFiltersPanel({ filters, onFilterChange, mode }: JobFiltersProps) {
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-4">
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
      <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold text-[#70767f] uppercase tracking-widest">
          Salary Range (Annual)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.salary_min ?? ''}
            onChange={(e) => onFilterChange({ salary_min: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            className="w-full h-10 px-3 rounded-lg border border-[#1e2631] bg-[#090f16] text-sm text-white placeholder:text-[#70767f] focus:outline-none focus:border-[rgba(61,106,242,0.6)] focus:shadow-[0_0_0_3px_rgba(61,106,242,0.12)]"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.salary_max ?? ''}
            onChange={(e) => onFilterChange({ salary_max: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            className="w-full h-10 px-3 rounded-lg border border-[#1e2631] bg-[#090f16] text-sm text-white placeholder:text-[#70767f] focus:outline-none focus:border-[rgba(61,106,242,0.6)] focus:shadow-[0_0_0_3px_rgba(61,106,242,0.12)]"
          />
        </div>
      </div>

      {/* Hourly rate range */}
      <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold text-[#70767f] uppercase tracking-widest">
          Hourly Rate (Contract)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.hourly_min ?? ''}
            onChange={(e) => onFilterChange({ hourly_min: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            className="w-full h-10 px-3 rounded-lg border border-[#1e2631] bg-[#090f16] text-sm text-white placeholder:text-[#70767f] focus:outline-none focus:border-[rgba(61,106,242,0.6)] focus:shadow-[0_0_0_3px_rgba(61,106,242,0.12)]"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.hourly_max ?? ''}
            onChange={(e) => onFilterChange({ hourly_max: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            className="w-full h-10 px-3 rounded-lg border border-[#1e2631] bg-[#090f16] text-sm text-white placeholder:text-[#70767f] focus:outline-none focus:border-[rgba(61,106,242,0.6)] focus:shadow-[0_0_0_3px_rgba(61,106,242,0.12)]"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="col-span-2 sm:col-span-3 lg:col-span-1 h-10 rounded-lg text-sm font-medium text-[#EF4444] hover:bg-[rgba(239,68,68,0.08)] transition-colors cursor-pointer"
        >
          Clear all filters
        </button>
      )}
    </div>
  )

  if (mode === 'desktop') {
    return (
      <aside className="w-60 shrink-0">
        <div className="sticky top-24 p-4 rounded-xl border border-[#1e2631] bg-[#131a23]">
          <h2 className="text-sm font-semibold text-white mb-4">Filters</h2>
          {filterContent}
        </div>
      </aside>
    )
  }

  // Mobile: collapsible drawer
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-2 px-4 rounded-xl border border-[#1e2631] bg-[#131a23] text-sm font-medium text-[#a6abb5] hover:bg-[#1e2631] transition-colors cursor-pointer min-h-[44px]"
        aria-expanded={isOpen}
        aria-controls="job-filters-panel"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
        {hasActiveFilters && (
          <span className="w-2 h-2 rounded-full bg-[#3D6AF2]" />
        )}
      </button>

      {isOpen && (
        <div id="job-filters-panel" className="mt-2 p-4 rounded-xl border border-[#1e2631] bg-[#131a23]">
          {filterContent}
        </div>
      )}
    </>
  )
}
