'use client'

import { useInvoice } from '../invoice-provider'
import { ContactForm } from './contact-form'

export function ClientEditor() {
  const { state, dispatch } = useInvoice()

  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70767f] mb-2">
        Bill To (Client)
      </div>
      <div className="bg-[#131a23] rounded-xl p-4">
        <ContactForm
          value={state.invoice.client}
          onChange={(changes) => dispatch({ type: 'SET_CLIENT', payload: changes })}
        />
      </div>
    </div>
  )
}
