'use client'

import type { ContactInfo } from '../invoice-types'

interface ContactFormProps {
  value: ContactInfo
  onChange: (changes: Partial<ContactInfo>) => void
}

const INPUT_CLASS =
  'w-full min-h-[44px] px-3.5 py-2.5 bg-[#090f16] border border-[#1e2631] rounded-lg text-white text-sm placeholder:text-[#70767f] focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 outline-none transition-colors'

export function ContactForm({ value, onChange }: ContactFormProps) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        className={INPUT_CLASS}
        placeholder="Business / Client name"
        value={value.name}
        onChange={(e) => onChange({ name: e.target.value })}
      />
      <input
        type="email"
        className={INPUT_CLASS}
        placeholder="Email"
        value={value.email}
        onChange={(e) => onChange({ email: e.target.value })}
      />
      <input
        type="tel"
        className={INPUT_CLASS}
        placeholder="Phone"
        value={value.phone}
        onChange={(e) => onChange({ phone: e.target.value })}
      />
      <input
        type="text"
        className={INPUT_CLASS}
        placeholder="Address line 1"
        value={value.address1}
        onChange={(e) => onChange({ address1: e.target.value })}
      />
      <input
        type="text"
        className={INPUT_CLASS}
        placeholder="Address line 2"
        value={value.address2}
        onChange={(e) => onChange({ address2: e.target.value })}
      />
      <div className="grid grid-cols-3 gap-2">
        <input
          type="text"
          className={INPUT_CLASS}
          placeholder="City"
          value={value.city}
          onChange={(e) => onChange({ city: e.target.value })}
        />
        <input
          type="text"
          className={INPUT_CLASS}
          placeholder="State"
          value={value.state}
          onChange={(e) => onChange({ state: e.target.value })}
        />
        <input
          type="text"
          className={INPUT_CLASS}
          placeholder="ZIP"
          value={value.zip}
          onChange={(e) => onChange({ zip: e.target.value })}
        />
      </div>
      <input
        type="text"
        className={INPUT_CLASS}
        placeholder="Country"
        value={value.country}
        onChange={(e) => onChange({ country: e.target.value })}
      />
      <input
        type="text"
        className={INPUT_CLASS}
        placeholder="Tax ID / GST / ABN"
        value={value.taxId}
        onChange={(e) => onChange({ taxId: e.target.value })}
      />
    </div>
  )
}
