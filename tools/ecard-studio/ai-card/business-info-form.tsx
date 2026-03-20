'use client'

import { useState, useMemo } from 'react'
import type { BusinessInfo } from '@/tools/ecard-studio/ai-card/types'
import { INDUSTRY_OPTIONS, FIELD_SUGGESTIONS } from '@/tools/ecard-studio/ai-card/types'

interface BusinessInfoFormProps {
  info: BusinessInfo
  onChange: (info: BusinessInfo) => void
  onNext: () => void
}

const OPTIONAL_FIELD_META: {
  key: keyof BusinessInfo
  label: string
  type: string
  placeholder: string
}[] = [
  { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 (555) 000-0000' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'you@company.com' },
  { key: 'website', label: 'Website', type: 'url', placeholder: 'https://example.com' },
  { key: 'address', label: 'Address', type: 'text', placeholder: '123 Main St, City' },
  { key: 'linkedin', label: 'LinkedIn', type: 'url', placeholder: 'linkedin.com/in/yourname' },
  { key: 'twitter', label: 'Twitter / X', type: 'text', placeholder: '@handle' },
  { key: 'instagram', label: 'Instagram', type: 'text', placeholder: '@handle' },
]

export function BusinessInfoForm({ info, onChange, onNext }: BusinessInfoFormProps) {
  const [showAllOptional, setShowAllOptional] = useState(false)

  const requiredFilled =
    info.name.trim() !== '' &&
    info.title.trim() !== '' &&
    info.company.trim() !== ''

  // Determine which optional fields to show based on title keywords
  const suggestedFieldKeys = useMemo(() => {
    const titleLower = info.title.toLowerCase()
    const matched = new Set<string>()

    for (const [keyword, fields] of Object.entries(FIELD_SUGGESTIONS)) {
      if (titleLower.includes(keyword)) {
        fields.forEach((f) => matched.add(f))
      }
    }

    // Always include phone, email, website as base optional fields
    matched.add('phone')
    matched.add('email')
    matched.add('website')

    return matched
  }, [info.title])

  const visibleOptionalFields = showAllOptional
    ? OPTIONAL_FIELD_META
    : OPTIONAL_FIELD_META.filter((f) => suggestedFieldKeys.has(f.key))

  function updateField(key: keyof BusinessInfo, value: string) {
    onChange({ ...info, [key]: value })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--tk-color-text-primary)]">
          Business Information
        </h2>
        <p className="mt-1 text-sm text-[var(--tk-color-text-secondary)]">
          Tell us about yourself and your business.
        </p>
      </div>

      {/* Required fields */}
      <div className="flex flex-col gap-4">
        <InputField
          label="Full Name"
          value={info.name}
          onChange={(v) => updateField('name', v)}
          placeholder="Jane Smith"
          required
        />
        <InputField
          label="Job Title"
          value={info.title}
          onChange={(v) => updateField('title', v)}
          placeholder="Senior Product Designer"
          required
        />
        <InputField
          label="Company"
          value={info.company}
          onChange={(v) => updateField('company', v)}
          placeholder="Acme Inc."
          required
        />
      </div>

      {/* Optional fields — revealed after required are filled */}
      <div
        className={`flex flex-col gap-4 overflow-hidden transition-all duration-500 ease-in-out ${
          requiredFilled ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="h-px bg-[var(--tk-color-border)]" />
        <p className="text-sm font-medium text-[var(--tk-color-text-secondary)]">
          Additional Details
        </p>

        {visibleOptionalFields.map((field) => (
          <InputField
            key={field.key}
            label={field.label}
            type={field.type}
            value={info[field.key]}
            onChange={(v) => updateField(field.key, v)}
            placeholder={field.placeholder}
          />
        ))}

        {!showAllOptional && visibleOptionalFields.length < OPTIONAL_FIELD_META.length && (
          <button
            type="button"
            onClick={() => setShowAllOptional(true)}
            className="self-start rounded-lg px-4 py-2 text-sm font-medium
              text-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-500)]/10
              transition-colors min-h-[44px]"
          >
            + Add more fields
          </button>
        )}

        {/* Tagline */}
        <InputField
          label="Tagline"
          value={info.tagline}
          onChange={(v) => updateField('tagline', v)}
          placeholder="Building the future of design"
        />

        {/* Industry select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--tk-color-text-primary)]">
            Industry
          </label>
          <select
            value={info.industry}
            onChange={(e) => updateField('industry', e.target.value)}
            className="min-h-[44px] w-full rounded-xl border border-[var(--tk-color-border)]
              bg-[var(--tk-color-bg-secondary)] px-4 py-2.5 text-sm
              text-[var(--tk-color-text-primary)]
              focus:border-[var(--tk-color-primary-500)] focus:outline-none focus:ring-2
              focus:ring-[var(--tk-color-primary-500)]/20 transition-colors"
          >
            <option value="">Select an industry...</option>
            {INDUSTRY_OPTIONS.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Next button */}
      <button
        type="button"
        onClick={onNext}
        disabled={!requiredFilled}
        className="mt-2 min-h-[44px] w-full rounded-xl bg-gradient-to-r
          from-[var(--tk-color-primary-500)] to-[var(--tk-color-primary-600)]
          px-6 py-3 text-sm font-semibold text-white shadow-md
          transition-all hover:shadow-lg hover:brightness-110
          disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-md
          disabled:hover:brightness-100"
      >
        Next
      </button>
    </div>
  )
}

// ── Reusable input ────────────────────────────────────────────

interface InputFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  required?: boolean
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--tk-color-text-primary)]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[44px] w-full rounded-xl border border-[var(--tk-color-border)]
          bg-[var(--tk-color-bg-secondary)] px-4 py-2.5 text-sm
          text-[var(--tk-color-text-primary)] placeholder:text-[var(--tk-color-text-muted)]
          focus:border-[var(--tk-color-primary-500)] focus:outline-none focus:ring-2
          focus:ring-[var(--tk-color-primary-500)]/20 transition-colors"
      />
    </div>
  )
}
