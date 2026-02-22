'use client'

import { useState } from 'react'
import { z } from 'zod'
import { GlassCard } from '@/components/ui/glass-card'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

const inputClassName =
  'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)] focus:border-transparent transition-colors'

export default function ContactPage() {
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
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      <GlassCard className="w-full p-6 sm:p-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
          Contact Support
        </h1>

        {status === 'success' ? (
          <div className="text-center py-8">
            <p className="text-lg text-slate-700 dark:text-slate-200 mb-6">
              Your message has been sent! We&apos;ll get back to you soon.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="py-3 px-6 rounded-xl bg-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-600)] text-white font-medium transition-colors"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {status === 'error' && (
              <div
                className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                role="alert"
              >
                Failed to send message. Please try again.
              </div>
            )}

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  aria-describedby="name-error"
                  className={inputClassName}
                  placeholder="Your name"
                />
                {errors.name && (
                  <p id="name-error" role="alert" className="text-sm text-red-500 mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  aria-describedby="email-error"
                  className={inputClassName}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p id="email-error" role="alert" className="text-sm text-red-500 mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  aria-describedby="subject-error"
                  className={inputClassName}
                  placeholder="What is this about?"
                />
                {errors.subject && (
                  <p id="subject-error" role="alert" className="text-sm text-red-500 mt-1">
                    {errors.subject}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  aria-describedby="message-error"
                  className={inputClassName}
                  placeholder="Describe your issue or question..."
                />
                {errors.message && (
                  <p id="message-error" role="alert" className="text-sm text-red-500 mt-1">
                    {errors.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3 px-6 rounded-xl bg-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-600)] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </GlassCard>
    </main>
  )
}
