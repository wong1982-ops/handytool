'use client'

import { useInvoice } from '../invoice-provider'
import { createEmptyLineItem } from '../invoice-defaults'
import {
  calcLineItemTotal,
  calcGroupedTotals,
  formatCurrency,
} from '../shared/invoice-calculations'
import { CurrencySelect } from '../shared/currency-select'
import { TaxPresetSelect } from '../shared/tax-preset-select'
import { DiscountInput } from '../shared/discount-input'
import type { LineItem } from '../invoice-types'

const INPUT_CLASS =
  'w-full min-h-[44px] px-3.5 py-2.5 bg-[#090f16] border border-[#1e2631] rounded-lg text-white text-sm placeholder:text-[#70767f] focus:border-[#3D6AF2] outline-none transition-colors'

export function LineItemsEditor() {
  const { state, dispatch } = useInvoice()
  const { lineItems, taxPresets, defaultCurrency } = state.invoice

  const totals = calcGroupedTotals(lineItems, taxPresets)
  const isMultiCurrency = totals.length > 1

  const handleAdd = () => {
    dispatch({ type: 'ADD_LINE_ITEM', payload: createEmptyLineItem(defaultCurrency) })
  }

  const handleUpdate = (id: string, changes: Partial<LineItem>) => {
    dispatch({ type: 'UPDATE_LINE_ITEM', payload: { id, changes } })
  }

  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE_LINE_ITEM', payload: id })
  }

  return (
    <div className="space-y-3">
      {lineItems.map((item) => (
        <div key={item.id} className="bg-[#090f16] border border-[#1e2631] rounded-xl p-4">
          <div className="space-y-3">
            <input
              type="text"
              className={INPUT_CLASS}
              placeholder="Description"
              value={item.description}
              onChange={(e) => handleUpdate(item.id, { description: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-[#70767f] mb-1 block">Qty</label>
                <input
                  type="number"
                  className={`${INPUT_CLASS} text-center`}
                  min={0}
                  step="any"
                  value={item.quantity || ''}
                  onChange={(e) => handleUpdate(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-xs text-[#70767f] mb-1 block">Rate</label>
                <input
                  type="number"
                  className={`${INPUT_CLASS} text-right`}
                  min={0}
                  step="0.01"
                  value={item.rate || ''}
                  onChange={(e) => handleUpdate(item.id, { rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-xs text-[#70767f] mb-1 block">Currency</label>
                <CurrencySelect
                  value={item.currency}
                  onChange={(currency) => handleUpdate(item.id, { currency })}
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-[#70767f] mb-1 block">Tax</label>
                <TaxPresetSelect
                  value={item.taxPresetId}
                  taxPresets={taxPresets}
                  onChange={(taxPresetId) => handleUpdate(item.id, { taxPresetId })}
                />
              </div>
              <div>
                <label className="text-xs text-[#70767f] mb-1 block">Discount</label>
                <DiscountInput
                  type={item.discountType}
                  value={item.discountValue}
                  onTypeChange={(discountType) => handleUpdate(item.id, { discountType })}
                  onValueChange={(discountValue) => handleUpdate(item.id, { discountValue })}
                />
              </div>
            </div>
            <div className="flex justify-between items-center pt-1">
              <button
                onClick={() => handleRemove(item.id)}
                className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 min-h-[44px] px-2"
              >
                <span>×</span> Remove
              </button>
              <span className="text-sm font-semibold text-white">
                {formatCurrency(calcLineItemTotal(item, taxPresets), item.currency)}
              </span>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={handleAdd}
        className="w-full border-2 border-dashed border-[#1e2631] rounded-xl p-4 text-[#70767f] hover:border-[#3D6AF2]/50 hover:text-white transition-colors flex items-center justify-center gap-2 min-h-[60px]"
      >
        <span className="text-lg">+</span> Add Line Item
      </button>

      {totals.length > 0 && (
        <div className="bg-[#131a23] rounded-xl p-4 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70767f] mb-2">
            Summary
          </div>
          {totals.map((group) => (
            <div key={group.currency} className="space-y-1.5">
              {isMultiCurrency && (
                <div className="text-xs text-[#32A9D9] font-semibold uppercase tracking-wider mt-3">
                  {group.currency}
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[#a6abb5]">Subtotal</span>
                <span className="text-white">{formatCurrency(group.subtotal, group.currency)}</span>
              </div>
              {group.taxBreakdown.map((tax) => (
                <div key={tax.name} className="flex justify-between text-sm">
                  <span className="text-[#a6abb5]">{tax.name}</span>
                  <span className="text-white">{formatCurrency(tax.amount, group.currency)}</span>
                </div>
              ))}
              {group.totalDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#a6abb5]">Discount</span>
                  <span className="text-red-400">
                    -{formatCurrency(group.totalDiscount, group.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-[#1e2631]">
                <span className="text-white">Total{isMultiCurrency ? ` (${group.currency})` : ''}</span>
                <span className="text-base text-[#3D6AF2]">
                  {formatCurrency(group.grandTotal, group.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
