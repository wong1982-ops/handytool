'use client'

import { useState } from 'react'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

const inputClassName =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)] focus:border-transparent transition-colors text-sm'

export function ContactSheetContent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const result = contactSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string
        if (!fieldErrors[field]) fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setStatus('sending')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  function handleReset() {
    setFormData({ name: '', email: '', subject: '', message: '' })
    setErrors({})
    setStatus('idle')
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Contact Support</h2>

      {status === 'success' ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200 mb-4">
            Message sent! We&apos;ll get back to you soon.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="py-2.5 px-5 rounded-xl bg-[var(--tk-color-primary-500)] text-white text-sm font-medium cursor-pointer"
          >
            Send another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
          {status === 'error' && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm" role="alert">
              Failed to send. Please try again.
            </div>
          )}

          <div>
            <label htmlFor="sheet-name" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
            <input id="sheet-name" name="name" type="text" value={formData.name} onChange={handleChange} className={inputClassName} placeholder="Your name" aria-describedby="sheet-name-error" />
            {errors.name && <p id="sheet-name-error" role="alert" className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="sheet-email" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input id="sheet-email" name="email" type="email" value={formData.email} onChange={handleChange} className={inputClassName} placeholder="you@example.com" aria-describedby="sheet-email-error" />
            {errors.email && <p id="sheet-email-error" role="alert" className="text-xs text-red-500 mt-0.5">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="sheet-subject" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
            <input id="sheet-subject" name="subject" type="text" value={formData.subject} onChange={handleChange} className={inputClassName} placeholder="What is this about?" aria-describedby="sheet-subject-error" />
            {errors.subject && <p id="sheet-subject-error" role="alert" className="text-xs text-red-500 mt-0.5">{errors.subject}</p>}
          </div>

          <div>
            <label htmlFor="sheet-message" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
            <textarea id="sheet-message" name="message" rows={3} value={formData.message} onChange={handleChange} className={inputClassName} placeholder="Describe your issue..." aria-describedby="sheet-message-error" />
            {errors.message && <p id="sheet-message-error" role="alert" className="text-xs text-red-500 mt-0.5">{errors.message}</p>}
          </div>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full py-2.5 rounded-xl bg-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-600)] text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      )}
    </div>
  )
}
