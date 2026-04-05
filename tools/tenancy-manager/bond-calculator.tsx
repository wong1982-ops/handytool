'use client'

import { useState } from 'react'

// ─── Bond Calculator ───────────────────────────────────────────────────────────

export default function BondCalculator() {
  const [weeklyRent, setWeeklyRent] = useState<number>(0)
  const [petBond, setPetBond] = useState<boolean>(false)

  const standardBond = weeklyRent * 4
  const petBondAmount = weeklyRent * 2
  const total = standardBond + (petBond ? petBondAmount : 0)

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="rounded-2xl bg-[#0e1520] border border-[#1e2631] p-6 space-y-6">
        <h2 className="text-white text-xl font-bold">Bond Calculator</h2>

        {/* Weekly Rent Input */}
        <div>
          <label className="block text-sm text-[#a6abb5] mb-1">
            Weekly Rent (NZD)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a6abb5] text-lg font-medium select-none">
              $
            </span>
            <input
              className="w-full rounded-xl bg-[#131a23] border border-[#1e2631] text-white text-lg pl-9 pr-4 py-3 min-h-[44px] focus:outline-none focus:border-[#3D6AF2] transition-colors"
              type="number"
              min={0}
              value={weeklyRent || ''}
              onChange={e => setWeeklyRent(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              aria-label="Weekly rent in NZD"
            />
          </div>
        </div>

        {/* Pet Bond Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white font-medium">Include Pet Bond</p>
            <p className="text-xs text-[#a6abb5] mt-0.5">
              2 weeks&apos; extra rent (2024 Amendment Act)
            </p>
          </div>
          <button
            role="switch"
            aria-checked={petBond}
            aria-label="Toggle pet bond"
            onClick={() => setPetBond(p => !p)}
            className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 ${petBond ? 'bg-[#3D6AF2]' : 'bg-[#1e2631]'}`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white transition-transform mx-0.5 ${petBond ? 'translate-x-6' : 'translate-x-0'}`}
            />
          </button>
        </div>

        {/* Results */}
        <div className="mt-4 rounded-xl bg-[#131a23] border border-[#1e2631] p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#a6abb5]">Standard Bond (4 weeks)</span>
            <span className="text-white font-medium">
              ${standardBond.toFixed(2)}
            </span>
          </div>
          {petBond && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#a6abb5]">Pet Bond (2 weeks)</span>
              <span className="text-white font-medium">
                ${petBondAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t border-[#1e2631] pt-3 flex justify-between items-center">
            <span className="text-white font-semibold">Total Bond</span>
            <span className="text-[#22c55e] text-xl font-bold">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Info Callout Cards */}
        <div className="space-y-3">
          <div className="rounded-xl border-l-4 border-[#3D6AF2] bg-[#131a23] px-4 py-3">
            <p className="text-sm text-white font-medium">Maximum bond is 4 weeks&apos; rent</p>
            <p className="text-xs text-[#a6abb5] mt-0.5">
              Landlords cannot charge more than 4 weeks&apos; rent as a standard bond under the
              Residential Tenancies Act 1986.
            </p>
          </div>
          <div className="rounded-xl border-l-4 border-amber-500 bg-[#131a23] px-4 py-3">
            <p className="text-sm text-white font-medium">
              Pet bonds (max 2 weeks extra) — 2024 Amendment Act
            </p>
            <p className="text-xs text-[#a6abb5] mt-0.5">
              An additional pet bond of up to 2 weeks&apos; rent may be charged where pets are
              permitted. The pet bond must be lodged separately.
            </p>
          </div>
          <div className="rounded-xl border-l-4 border-[#3D6AF2] bg-[#131a23] px-4 py-3">
            <p className="text-sm text-white font-medium">
              Bonds must be lodged within 23 working days
            </p>
            <p className="text-xs text-[#a6abb5] mt-0.5">
              Landlords are legally required to lodge the bond with Tenancy Services
              (Bond Centre) within 23 working days of receipt.
            </p>
          </div>
        </div>

        {/* Lodge Bond Link */}
        <a
          href="https://www.tenancy.govt.nz/bond/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#3D6AF2]/10 border border-[#3D6AF2]/30 text-[#3D9DF2] text-sm font-medium px-5 py-2.5 min-h-[44px] hover:bg-[#3D6AF2]/20 transition-colors"
        >
          Lodge bond at tenancy.govt.nz
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  )
}
