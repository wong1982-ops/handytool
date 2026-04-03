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

  const inputStyle = {
    background: '#0d1420',
    border: '1px solid #1e2631',
    color: '#ffffff',
  }

  const inputErrorStyle = {
    background: '#0d1420',
    border: '1px solid rgba(239,68,68,0.5)',
    color: '#ffffff',
  }

  const inputClass = 'w-full h-12 px-4 rounded-xl text-sm outline-none transition-colors focus:ring-2 focus:ring-[#3D6AF2]'
  const labelClass = 'block text-xs font-semibold mb-1.5'
  const errorClass = 'text-xs mt-1'

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: 'rgba(9,15,22,0.85)' }} aria-hidden />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl p-6 z-10 overflow-y-auto"
        style={{ background: '#131a23', border: '1px solid #1e2631', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', maxHeight: 'calc(100vh - 60px)' }}
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <div className="text-center py-6">
            <div
              className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: 'rgba(16,185,129,0.15)' }}
            >
              <svg className="h-6 w-6" style={{ color: '#10B981' }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-lg font-bold" style={{ color: '#ffffff' }}>Thank you!</h3>
            <p className="mt-1 text-sm" style={{ color: '#a6abb5' }}>
              Your suggestion has been submitted for review.
            </p>
            <button
              onClick={onClose}
              className="mt-5 px-6 h-11 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: '#3D6AF2', color: '#ffffff' }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: '#ffffff' }}>Suggest a Local Provider</h3>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: '#1e2631', color: '#a6abb5' }}
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Provider name */}
              <div>
                <label htmlFor="sp-name" className={labelClass} style={{ color: '#a6abb5' }}>
                  Provider Name
                </label>
                <input
                  id="sp-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onBlur={() => markTouched('name')}
                  placeholder="e.g. Mike's Plumbing Solutions"
                  className={inputClass}
                  style={touched.name && !name.trim() ? inputErrorStyle : inputStyle}
                />
                {touched.name && !name.trim() && (
                  <p className={errorClass} style={{ color: '#ef4444' }}>Provider name is required</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="sp-category" className={labelClass} style={{ color: '#a6abb5' }}>
                  Category
                </label>
                <select
                  id="sp-category"
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  onBlur={() => markTouched('categoryId')}
                  className={inputClass}
                  style={touched.categoryId && !categoryId ? inputErrorStyle : { ...inputStyle, color: categoryId ? '#ffffff' : '#a6abb5' }}
                >
                  <option value="">Select a category...</option>
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
                {touched.categoryId && !categoryId && (
                  <p className={errorClass} style={{ color: '#ef4444' }}>Please select a category</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="sp-phone" className={labelClass} style={{ color: '#a6abb5' }}>
                  Phone Number
                </label>
                <input
                  id="sp-phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+64 9 000 0000"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="sp-description" className={labelClass} style={{ color: '#a6abb5' }}>
                  Description
                </label>
                <textarea
                  id="sp-description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Briefly describe this provider's services..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-colors focus:ring-2 focus:ring-[#3D6AF2]"
                  style={inputStyle}
                />
              </div>

              {/* Service areas */}
              <div>
                <label htmlFor="sp-area" className={labelClass} style={{ color: '#a6abb5' }}>
                  Service Area
                </label>
                <input
                  id="sp-area"
                  type="text"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  placeholder="e.g. Auckland CBD, Mt Eden, Ponsonby"
                  className={inputClass}
                  style={inputStyle}
                />
                <p className="text-xs mt-1" style={{ color: '#70767f' }}>Separate multiple areas with commas</p>
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full h-12 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                style={{ background: '#3D6AF2', color: '#ffffff' }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Provider'
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full text-xs text-center py-2"
                style={{ color: '#70767f' }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
