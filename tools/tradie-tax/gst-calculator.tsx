'use client'

import { useState } from 'react'
import { gstExclusive, gstInclusive, gstAmount } from './tax-calculator'
import { GST_RATE } from './tax-data'

export default function GstCalculator() {
  const [inclusiveInput, setInclusiveInput] = useState('')
  const [exclusiveInput, setExclusiveInput] = useState('')
  const [mode, setMode] = useState<'inclusive' | 'exclusive'>('inclusive')

  const incVal = parseFloat(inclusiveInput) || 0
  const excVal = parseFloat(exclusiveInput) || 0

  const result =
    mode === 'inclusive'
      ? {
          inclusive: incVal,
          exclusive: gstExclusive(incVal),
          gst: gstAmount(incVal),
        }
      : {
          inclusive: gstInclusive(excVal),
          exclusive: excVal,
          gst: gstInclusive(excVal) - excVal,
        }

  const hasInput = mode === 'inclusive' ? incVal > 0 : excVal > 0

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {([
          { key: 'inclusive', label: 'GST Inclusive → Exclusive' },
          { key: 'exclusive', label: 'GST Exclusive → Inclusive' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`flex-1 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
              mode === key
                ? 'bg-[#3D6AF2] text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="rounded-xl border border-white/10 bg-[#1e2631] p-5 space-y-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">
            {mode === 'inclusive' ? 'Enter GST-inclusive amount (NZD)' : 'Enter GST-exclusive amount (NZD)'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={mode === 'inclusive' ? inclusiveInput : exclusiveInput}
              onChange={(e) =>
                mode === 'inclusive'
                  ? setInclusiveInput(e.target.value)
                  : setExclusiveInput(e.target.value)
              }
              placeholder="0.00"
              className="w-full min-h-[44px] rounded-lg bg-white/5 border border-white/10 pl-7 pr-3 text-lg text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] tabular-nums"
            />
          </div>
        </div>

        {/* Result */}
        {hasInput && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">GST Exclusive</p>
              <p className="text-xl font-bold text-white tabular-nums">
                ${result.exclusive.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="rounded-lg border border-[#3D6AF2]/30 bg-[#3D6AF2]/10 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-[#3D9DF2] mb-1">GST ({(GST_RATE * 100).toFixed(0)}%)</p>
              <p className="text-xl font-bold text-[#3D9DF2] tabular-nums">
                ${result.gst.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">GST Inclusive</p>
              <p className="text-xl font-bold text-white tabular-nums">
                ${result.inclusive.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-[#1e2631] p-4 space-y-2">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#3D6AF2]/20 flex items-center justify-center text-xs">📋</span>
            NZ GST Basics
          </h3>
          <ul className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
            <li>&bull; GST rate is <strong className="text-white">15%</strong></li>
            <li>&bull; You must register for GST if your turnover exceeds <strong className="text-white">$60,000</strong> in 12 months</li>
            <li>&bull; File GST returns 1, 2, or 6-monthly</li>
            <li>&bull; Claim GST back on business expenses</li>
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#1e2631] p-4 space-y-2">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-green-500/20 flex items-center justify-center text-xs">💡</span>
            Quick Formulas
          </h3>
          <ul className="text-xs text-slate-400 space-y-1.5 leading-relaxed font-mono">
            <li>GST excl = incl &divide; 1.15</li>
            <li>GST incl = excl &times; 1.15</li>
            <li>GST amount = incl &minus; (incl &divide; 1.15)</li>
            <li>GST amount = incl &times; 3 &divide; 23</li>
          </ul>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-slate-500 dark:text-[#70767f] text-center leading-relaxed">
        This tool provides estimates only. Tax obligations may vary. Consult a qualified accountant or visit{' '}
        <a href="https://www.ird.govt.nz" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400">ird.govt.nz</a>{' '}
        for official information.
      </p>
    </div>
  )
}
