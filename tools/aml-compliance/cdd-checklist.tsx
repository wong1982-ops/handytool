'use client'

import { useState, useCallback } from 'react'
import { CDD_ITEMS } from './aml-data'
import type { CDDLevel } from './types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<CDDLevel, { label: string; description: string; color: string; border: string; bg: string }> = {
  standard: {
    label: 'Standard CDD',
    description: 'Required for all customers. Must be completed before establishing a business relationship.',
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
  },
  enhanced: {
    label: 'Enhanced CDD',
    description: 'Required for high-risk clients including PEPs, clients from high-risk countries, and complex or unusually large transactions.',
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
  },
  simplified: {
    label: 'Simplified CDD',
    description: 'May be applied for low-risk clients such as NZ government bodies, NZ-listed companies, or regulated financial institutions.',
    color: 'text-green-400',
    border: 'border-green-500/30',
    bg: 'bg-green-500/10',
  },
}

const LEVELS: CDDLevel[] = ['standard', 'enhanced', 'simplified']

// ─── Component ───────────────────────────────────────────────────────────────

export default function CDDChecklist() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  const toggleItem = useCallback((id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleClearAll = useCallback(() => {
    setCheckedItems(new Set())
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Customer Due Diligence Checklist</h3>
          <p className="text-sm text-slate-400 mt-1">
            Track CDD requirements for your clients. Tick off items as you complete them.
          </p>
        </div>
        {checkedItems.size > 0 && (
          <button
            onClick={handleClearAll}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-[#1e2631] bg-[#131a23] text-xs font-medium text-slate-400 hover:bg-[#1e2631] transition-colors shrink-0"
          >
            Clear All
          </button>
        )}
      </div>

      {/* CDD Levels */}
      {LEVELS.map((level) => {
        const config = LEVEL_CONFIG[level]
        const items = CDD_ITEMS.filter((item) => item.level === level)
        const completedCount = items.filter((item) => checkedItems.has(item.id)).length

        return (
          <div key={level} className="space-y-3">
            {/* Level Header */}
            <div className={`rounded-xl border ${config.border} ${config.bg} p-4`}>
              <div className="flex items-center justify-between mb-1">
                <h4 className={`text-sm font-bold ${config.color}`}>{config.label}</h4>
                <span className="text-xs text-slate-400">
                  {completedCount}/{items.length} completed
                </span>
              </div>
              <p className="text-xs text-slate-400">{config.description}</p>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#3D6AF2] to-[#32A9D9] transition-all duration-300"
                  style={{ width: `${items.length > 0 ? (completedCount / items.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              {items.map((item) => {
                const isChecked = checkedItems.has(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`w-full min-h-[44px] px-4 py-3 rounded-xl border text-left transition-all duration-200 ${
                      isChecked
                        ? 'border-[#3D6AF2]/30 bg-[#3D6AF2]/5'
                        : 'border-[#1e2631] bg-[#131a23] hover:border-[#3D6AF2]/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div className={`mt-0.5 w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'border-[#3D6AF2] bg-[#3D6AF2]'
                          : 'border-slate-600'
                      }`}>
                        {isChecked && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium block ${isChecked ? 'text-slate-400 line-through' : 'text-white'}`}>
                          {item.label}
                        </span>
                        <span className="text-xs text-slate-500 block mt-1 leading-relaxed">
                          {item.description}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Disclaimer */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <p className="text-xs text-amber-400/80">
          <strong>Disclaimer:</strong> This tool provides general guidance only. It is not legal advice and does not replace the requirement for independent AML/CFT compliance advice. Contact the DIA AML/CFT team for specific guidance.
        </p>
      </div>
    </div>
  )
}
