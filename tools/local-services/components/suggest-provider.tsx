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

  const handleSubmit = async () => {
    if (!name.trim() || !categoryId) return
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

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4" onClick={e => e.stopPropagation()}>
        {submitted ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">&#10004;</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thank you!</h3>
            <p className="text-sm text-slate-500 mt-1">Your suggestion has been submitted for review.</p>
            <button onClick={onClose} className="mt-4 px-6 py-2 rounded-xl bg-[var(--tk-color-primary-500)] text-white text-sm font-semibold">Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Suggest a Provider</h3>
              <button onClick={onClose} className="text-slate-400 text-xl leading-none">&times;</button>
            </div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Provider name *" className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]" />
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none">
              <option value="">Select category *</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]" />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Why do you recommend them?" rows={3} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none resize-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]" />
            <input value={area} onChange={e => setArea(e.target.value)} placeholder="Service areas (comma-separated)" className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]" />
            <button onClick={handleSubmit} disabled={submitting || !name.trim() || !categoryId} className="w-full py-3 rounded-xl bg-[var(--tk-color-primary-500)] text-white text-sm font-semibold disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Suggestion'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
