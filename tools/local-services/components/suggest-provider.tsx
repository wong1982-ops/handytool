'use client'

import { useState } from 'react'
import { CATEGORIES } from '../local-services-categories'

interface SuggestProviderProps {
  onClose: () => void
}

export function SuggestProvider({ onClose }: SuggestProviderProps) {
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [area, setArea] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const markTouched = (field: string) =>
    setTouched(prev => ({ ...prev, [field]: true }))

  const isValid = name.trim().length > 0 && categoryId.length > 0

  const handleSubmit = async () => {
    setTouched({ name: true, categoryId: true })
    if (!isValid) return
    setSubmitting(true)
    try {
      await fetch('/api/v1/local-services/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerName: name,
          categoryId,
          phone,
          description,
          serviceArea: area.split(',').map(s => s.trim()).filter(Boolean),
        }),
      })
      setSubmitted(true)
    } catch {} finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2.5 rounded-xl bg-slate-50 border text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:ring-2 focus:ring-[var(--tk-color-primary-500)] focus:border-[var(--tk-color-primary-500)]'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'
  const errorClass = 'text-xs text-red-500 mt-1'

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Thank you!</h3>
            <p className="mt-1 text-sm text-slate-500">
              Your suggestion has been submitted for review.
            </p>
            <button
              onClick={onClose}
              className="mt-5 px-6 py-2.5 rounded-xl bg-[var(--tk-color-primary-500)] text-white text-sm font-semibold transition-colors hover:bg-blue-600"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-slate-900 pr-8">Suggest a Provider</h3>
            <p className="mt-1 text-sm text-slate-500">
              Know a great local service? Help the community by recommending them.
            </p>

            <div className="mt-5 space-y-4">
              {/* Provider name */}
              <div>
                <label htmlFor="sp-name" className={labelClass}>
                  Provider name <span className="text-red-400">*</span>
                </label>
                <input
                  id="sp-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onBlur={() => markTouched('name')}
                  placeholder="e.g. Mike's Plumbing"
                  className={`${inputClass} ${touched.name && !name.trim() ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : 'border-slate-200'}`}
                />
                {touched.name && !name.trim() && (
                  <p className={errorClass}>Provider name is required</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="sp-category" className={labelClass}>
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  id="sp-category"
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  onBlur={() => markTouched('categoryId')}
                  className={`${inputClass} ${!categoryId ? 'text-slate-400' : 'text-slate-900'} ${touched.categoryId && !categoryId ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : 'border-slate-200'}`}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
                {touched.categoryId && !categoryId && (
                  <p className={errorClass}>Please select a category</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="sp-phone" className={labelClass}>
                  Phone number
                </label>
                <input
                  id="sp-phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. 021 123 4567"
                  className={`${inputClass} border-slate-200`}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="sp-description" className={labelClass}>
                  Why do you recommend them?
                </label>
                <textarea
                  id="sp-description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Share your experience..."
                  rows={3}
                  className={`${inputClass} border-slate-200 resize-none`}
                />
              </div>

              {/* Service areas */}
              <div>
                <label htmlFor="sp-area" className={labelClass}>
                  Service areas
                </label>
                <input
                  id="sp-area"
                  type="text"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  placeholder="e.g. Auckland CBD, Mt Eden, Ponsonby"
                  className={`${inputClass} border-slate-200`}
                />
                <p className="text-xs text-slate-400 mt-1">Separate multiple areas with commas</p>
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[var(--tk-color-primary-500)] text-white text-sm font-semibold transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Suggestion'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
