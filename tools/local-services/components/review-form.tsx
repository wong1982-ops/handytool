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
    <div className="p-4 rounded-xl space-y-3" style={{ background: '#0d1420', border: '1px solid #1e2631' }}>
      <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>Write a Review</p>
      {/* Star selector */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button key={star} onClick={() => setRating(star)} className="p-0.5">
            <svg className={`w-6 h-6 ${star <= rating ? 'text-amber-400' : ''}`} style={star > rating ? { color: '#1e2631' } : {}} fill="currentColor" viewBox="0 0 20 20">
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
        className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-[#3D6AF2]"
        style={{ background: '#131a23', border: '1px solid #1e2631', color: '#ffffff' }}
      />
      <div className="flex gap-2">
        <button
          onClick={onDone}
          className="flex-1 h-11 rounded-xl text-sm font-medium"
          style={{ background: '#1e2631', color: '#a6abb5' }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 h-11 rounded-xl text-sm font-medium disabled:opacity-50"
          style={{ background: '#3D6AF2', color: '#ffffff' }}
        >
          {submitting ? 'Posting...' : 'Post Review'}
        </button>
      </div>
    </div>
  )
}
