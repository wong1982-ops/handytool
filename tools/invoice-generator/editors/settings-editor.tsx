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
        <div className="bg-[#131a23] rounded-xl p-4 space-y-2">
          {taxPresets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between py-2 px-3 bg-[#090f16] rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-white font-medium">{preset.name}</span>
                <span className="text-sm text-[#a6abb5]">{Math.round(preset.rate * 100)}%</span>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Delete tax preset "${preset.name}"?`))
                    dispatch({ type: 'REMOVE_TAX_PRESET', payload: preset.id })
                }}
                className="text-[#70767f] hover:text-red-400 min-h-[44px] px-2"
                aria-label="Delete preset"
              >
                ×
              </button>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              className={`flex-1 ${INPUT_CLASS}`}
              placeholder="Name (e.g. GST)"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
            />
            <input
              type="number"
              className={`w-24 ${INPUT_CLASS}`}
              placeholder="%"
              min={0}
              max={100}
              step="0.1"
              value={newPresetRate}
              onChange={(e) => setNewPresetRate(e.target.value)}
            />
            <button
              onClick={handleAddPreset}
              className="px-4 min-h-[44px] bg-[#3D6AF2] hover:bg-[#3D79F2] text-white text-sm font-medium rounded-lg"
            >
              Add
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
