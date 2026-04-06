'use client'

import { useState } from 'react'
import { useInvoice } from '../invoice-provider'
import { CurrencySelect } from '../shared/currency-select'
import { TemplatePanel } from '../panels/template-panel'
import { HistoryPanel } from '../panels/history-panel'
import type { TaxPreset } from '../invoice-types'

const INPUT_CLASS =
  'w-full min-h-[44px] px-3.5 py-2.5 bg-[#090f16] border border-[#1e2631] rounded-lg text-white text-sm placeholder:text-[#70767f] focus:border-[#3D6AF2] outline-none transition-colors'

export function SettingsEditor() {
  const { state, dispatch } = useInvoice()
  const { defaultCurrency, taxPresets, notes, invoiceNumber } = state.invoice

  const [newPresetName, setNewPresetName] = useState('')
  const [newPresetRate, setNewPresetRate] = useState('')

  // Extract prefix and next number from current invoice number
  const prefixMatch = invoiceNumber.match(/^(.*?)(\d+)$/)
  const prefix = prefixMatch ? prefixMatch[1] : invoiceNumber
  const nextNumber = prefixMatch ? prefixMatch[2] : '0001'

  const handleAddPreset = () => {
    const name = newPresetName.trim()
    const rate = parseFloat(newPresetRate)
    if (!name || isNaN(rate) || rate < 0 || rate > 100) return
    const preset: TaxPreset = {
      id: crypto.randomUUID(),
      name,
      rate: rate / 100,
    }
    dispatch({ type: 'ADD_TAX_PRESET', payload: preset })
    setNewPresetName('')
    setNewPresetRate('')
  }

  const handleUpdatePrefix = (newPrefix: string) => {
    dispatch({ type: 'SET_INVOICE_NUMBER', payload: `${newPrefix}${nextNumber}` })
  }

  const handleUpdateNumber = (newNumber: string) => {
    dispatch({ type: 'SET_INVOICE_NUMBER', payload: `${prefix}${newNumber}` })
  }

  return (
    <div className="space-y-6">
      {/* Defaults */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70767f] mb-2">
          Defaults
        </div>
        <div className="bg-[#131a23] rounded-xl p-4 space-y-3">
          <div>
            <label className="text-xs text-[#70767f] mb-1 block">Default Currency</label>
            <CurrencySelect
              value={defaultCurrency}
              onChange={(currency) => dispatch({ type: 'SET_DEFAULT_CURRENCY', payload: currency })}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#70767f] mb-1 block">Invoice # Prefix</label>
              <input
                type="text"
                className={INPUT_CLASS}
                value={prefix}
                onChange={(e) => handleUpdatePrefix(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-[#70767f] mb-1 block">Next Number</label>
              <input
                type="text"
                className={INPUT_CLASS}
                value={nextNumber}
                onChange={(e) => handleUpdateNumber(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tax Presets */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70767f] mb-2">
          Tax Presets
        </div>
        <div className="bg-[#131a23] rounded-xl p-4 space-y-3">
          {taxPresets.length > 0 && (
            <div className="space-y-2">
              {taxPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between gap-3 py-2.5 px-3 bg-[#090f16] border border-[#1e2631] rounded-lg"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-white font-medium truncate">{preset.name}</span>
                    <span className="shrink-0 text-xs text-[#3D9DF2] bg-[#3D6AF2]/10 border border-[#3D6AF2]/20 rounded-full px-2 py-0.5 font-medium">
                      {(preset.rate * 100).toFixed(preset.rate * 100 % 1 === 0 ? 0 : 1)}%
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Delete tax preset "${preset.name}"?`))
                        dispatch({ type: 'REMOVE_TAX_PRESET', payload: preset.id })
                    }}
                    className="shrink-0 w-9 h-9 flex items-center justify-center text-[#70767f] hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                    aria-label={`Delete ${preset.name} preset`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {taxPresets.length === 0 && (
            <p className="text-xs text-[#70767f] text-center py-3">
              No tax presets yet. Add one below.
            </p>
          )}

          <div className="pt-1 border-t border-[#1e2631]">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70767f] mt-3 mb-2">
              Add New Preset
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-2">
              <div className="min-w-0">
                <label className="text-xs text-[#70767f] mb-1 block">Name</label>
                <input
                  type="text"
                  className={INPUT_CLASS}
                  placeholder="e.g. GST"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddPreset()
                  }}
                />
              </div>
              <div className="min-w-0">
                <label className="text-xs text-[#70767f] mb-1 block">Rate (%)</label>
                <input
                  type="number"
                  className={INPUT_CLASS}
                  placeholder="15"
                  min={0}
                  max={100}
                  step="0.1"
                  value={newPresetRate}
                  onChange={(e) => setNewPresetRate(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddPreset()
                  }}
                />
              </div>
            </div>
            <button
              onClick={handleAddPreset}
              disabled={!newPresetName.trim() || !newPresetRate}
              className="mt-3 w-full min-h-[44px] flex items-center justify-center gap-2 bg-[#3D6AF2] hover:bg-[#3D79F2] disabled:bg-[#1e2631] disabled:text-[#70767f] disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Preset
            </button>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70767f] mb-2">
          Default Notes / Footer
        </div>
        <div className="bg-[#131a23] rounded-xl p-4">
          <textarea
            className={`${INPUT_CLASS} h-24 resize-none`}
            placeholder="e.g. Payment via bank transfer to account 12-3456-7890123-00. Thank you for your business."
            value={notes}
            onChange={(e) => dispatch({ type: 'SET_NOTES', payload: e.target.value })}
          />
        </div>
      </div>

      {/* Templates */}
      <TemplatePanel />

      {/* History */}
      <HistoryPanel />
    </div>
  )
}
