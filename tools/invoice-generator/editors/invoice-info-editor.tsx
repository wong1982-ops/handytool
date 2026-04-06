'use client'

import { useInvoice } from '../invoice-provider'
import type { PaymentTerms } from '../invoice-types'

const INPUT_CLASS =
  'w-full min-h-[44px] px-3.5 py-2.5 bg-[#090f16] border border-[#1e2631] rounded-lg text-white text-sm placeholder:text-[#70767f] focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 outline-none transition-colors'

const SELECT_CLASS =
  'w-full min-h-[44px] px-3.5 py-2.5 pr-10 bg-[#090f16] border border-[#1e2631] rounded-lg text-white text-sm appearance-none focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 outline-none transition-colors bg-[right_12px_center] bg-no-repeat bg-[length:16px]'

const CHEVRON_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2370767f'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`

const TERMS_OPTIONS: { value: PaymentTerms; label: string }[] = [
  { value: 'net7', label: 'Net 7' },
  { value: 'net14', label: 'Net 14' },
  { value: 'net30', label: 'Net 30' },
  { value: 'net60', label: 'Net 60' },
  { value: 'net90', label: 'Net 90' },
  { value: 'custom', label: 'Custom' },
]

export function InvoiceInfoEditor() {
  const { state, dispatch } = useInvoice()
  const { invoiceNumber, issueDate, dueDate, paymentTerms, reference } = state.invoice

  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70767f] mb-2">
        Invoice Details
      </div>
      <div className="bg-[#131a23] rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#70767f] mb-1 block">Invoice Number</label>
            <input
              type="text"
              className={INPUT_CLASS}
              value={invoiceNumber}
              onChange={(e) => dispatch({ type: 'SET_INVOICE_NUMBER', payload: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-[#70767f] mb-1 block">Reference / PO #</label>
            <input
              type="text"
              className={INPUT_CLASS}
              placeholder="Optional"
              value={reference}
              onChange={(e) => dispatch({ type: 'SET_REFERENCE', payload: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#70767f] mb-1 block">Issue Date</label>
            <input
              type="date"
              className={INPUT_CLASS}
              value={issueDate}
              onChange={(e) => dispatch({ type: 'SET_ISSUE_DATE', payload: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-[#70767f] mb-1 block">Due Date</label>
            <input
              type="date"
              className={INPUT_CLASS}
              value={dueDate}
              onChange={(e) => dispatch({ type: 'SET_DUE_DATE', payload: e.target.value })}
              disabled={paymentTerms !== 'custom'}
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-[#70767f] mb-1 block">Payment Terms</label>
          <select
            className={SELECT_CLASS}
            style={{ backgroundImage: CHEVRON_BG }}
            value={paymentTerms}
            onChange={(e) =>
              dispatch({ type: 'SET_PAYMENT_TERMS', payload: e.target.value as PaymentTerms })
            }
          >
            {TERMS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
