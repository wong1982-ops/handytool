'use client'

import { useState } from 'react'
import { GREEN_LIST } from './green-list'

export default function GreenListSearch() {
  const [search, setSearch] = useState('')

  const query = search.trim().toLowerCase()

  const results = query
    ? GREEN_LIST.filter(
        (occ) =>
          occ.title.toLowerCase().includes(query) ||
          occ.anzsco.startsWith(query)
      )
    : GREEN_LIST

  return (
    <div className="space-y-3">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by job title or ANZSCO code..."
          className="w-full min-h-[44px] pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
          aria-label="Search Green List occupations"
        />
      </div>

      {query && results.length === 0 ? (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-4 text-sm text-slate-500 dark:text-slate-400 text-center space-y-1">
          <p>This occupation is not currently on the Green List.</p>
          <a
            href="https://www.immigration.govt.nz/new-zealand-visas/options/work/green-list-occupations"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View the full Green List on immigration.govt.nz
          </a>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {results.map((occ) => (
            <div
              key={`${occ.anzsco}-${occ.title}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                  {occ.title}
                </p>
                <p className="text-xs text-slate-400 font-mono">ANZSCO {occ.anzsco}</p>
              </div>
              <span
                className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${
                  occ.tier === 1
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                    : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                }`}
              >
                {occ.tier === 1 ? 'Tier 1 — Straight to Residence' : 'Tier 2 — Work to Residence'}
              </span>
            </div>
          ))}
        </div>
      )}

      {!query && (
        <p className="text-xs text-slate-400 text-center">
          Showing all {GREEN_LIST.length} Green List occupations
        </p>
      )}
    </div>
  )
}
