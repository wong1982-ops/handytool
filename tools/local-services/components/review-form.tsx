'use client'

import { useState } from 'react'

interface ReviewFormProps {
  providerId: string
  onDone: () => void
}

export function ReviewForm({ providerId, onDone }: ReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await fetch('/api/v1/local-services/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, rating, text }),
      })
      onDone()
    } catch {} finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">Write a Review</p>
      {/* Star selector */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button key={star} onClick={() => setRating(star)} className="p-0.5">
            <svg className={`w-6 h-6 ${star <= rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Share your experience..."
        rows={3}
        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 resize-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)] outline-none"
      />
      <div className="flex gap-2">
        <button onClick={onDone} className="flex-1 py-2 rounded-lg text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-700">Cancel</button>
        <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-2 rounded-lg text-sm font-medium text-white bg-[var(--tk-color-primary-500)] disabled:opacity-50">
          {submitting ? 'Posting...' : 'Post Review'}
        </button>
      </div>
    </div>
  )
}
