'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'
import { generateIncidentPdf } from './pdf-incident'
import type { IncidentData, IncidentType } from './types'

const today = new Date().toISOString().slice(0, 10)
const now = new Date().toTimeString().slice(0, 5)

const DEFAULTS: IncidentData = {
  date: today,
  time: now,
  location: '',
  type: 'near-miss',
  description: '',
  people: '',
  injuries: '',
  immediateActions: '',
  rootCause: '',
  correctiveActions: '',
  reportedBy: '',
}

const INCIDENT_TYPES: { value: IncidentType; label: string; description: string }[] = [
  { value: 'near-miss', label: 'Near Miss', description: 'Incident that could have caused harm but did not' },
  { value: 'minor', label: 'Minor Injury / Illness', description: 'First-aid-level injury or minor illness' },
  { value: 'serious', label: 'Serious Harm', description: 'Injury or illness requiring medical treatment' },
  { value: 'notifiable', label: 'Notifiable Event', description: 'Death, serious injury, or dangerous incident' },
]

export default function IncidentReport() {
  const { user } = useAuth()
  const [form, setForm] = useState<IncidentData>(DEFAULTS)
  const [showSignIn, setShowSignIn] = useState(false)

  const set = <K extends keyof IncidentData>(key: K, value: IncidentData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const isNotifiable = form.type === 'notifiable'

  const handleGenerate = useCallback(() => {
    if (!user) {
      setShowSignIn(true)
      return
    }
    generateIncidentPdf(form)
  }, [user, form])

  const handleGoogleSignIn = useCallback(async () => {
    try { await signInWithOAuth('google') } catch {}
  }, [])

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Incident Report</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Record workplace incidents, near misses, and notifiable events. Download as a signed PDF.
        </p>
      </div>

      {/* Notifiable warning banner */}
      {isNotifiable && (
        <div
          role="alert"
          className="flex items-start gap-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl p-4"
        >
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <div>
            <p className="text-sm font-bold text-red-700 dark:text-red-400">
              Serious injuries, deaths, and dangerous incidents MUST be reported to WorkSafe NZ immediately.
            </p>
            <p className="text-sm text-red-600 dark:text-red-500 mt-0.5">
              Call <a href="tel:0800030040" className="font-bold underline">0800 030 040</a>. Do not disturb the scene unless necessary to prevent further harm.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleGenerate() }}
        className="flex flex-col gap-5"
        aria-label="Incident report form"
        noValidate
      >
        {/* Date, Time, Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="incident-date" className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Date of Incident *
            </label>
            <input
              id="incident-date"
              type="date"
              required
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] min-h-[44px]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="incident-time" className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Time
            </label>
            <input
              id="incident-time"
              type="time"
              value={form.time}
              onChange={(e) => set('time', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] min-h-[44px]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="incident-location" className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Location *
            </label>
            <input
              id="incident-location"
              type="text"
              required
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="e.g. Warehouse, Level 2"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] min-h-[44px]"
            />
          </div>
        </div>

        {/* Incident type */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Incident Type *
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INCIDENT_TYPES.map((t) => (
              <label
                key={t.value}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  form.type === t.value
                    ? t.value === 'notifiable'
                      ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                      : 'border-[#3D6AF2] bg-blue-50/30 dark:bg-blue-950/10'
                    : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <input
                  type="radio"
                  name="incident-type"
                  value={t.value}
                  checked={form.type === t.value}
                  onChange={() => set('type', t.value)}
                  className="mt-0.5 accent-[#3D6AF2]"
                />
                <div>
                  <p className={`text-sm font-semibold ${t.value === 'notifiable' ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                    {t.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="incident-desc" className="text-xs font-medium text-slate-600 dark:text-slate-400">
            What happened? *
          </label>
          <textarea
            id="incident-desc"
            required
            rows={3}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Describe the sequence of events…"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] resize-y"
          />
        </div>

        {/* People involved */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="incident-people" className="text-xs font-medium text-slate-600 dark:text-slate-400">
            People Involved
          </label>
          <input
            id="incident-people"
            type="text"
            value={form.people}
            onChange={(e) => set('people', e.target.value)}
            placeholder="Names, roles, or 'Not applicable'"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] min-h-[44px]"
          />
        </div>

        {/* Injuries */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="incident-injuries" className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Injuries or Illness Sustained
          </label>
          <input
            id="incident-injuries"
            type="text"
            value={form.injuries}
            onChange={(e) => set('injuries', e.target.value)}
            placeholder="e.g. Laceration to left hand, or 'None'"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] min-h-[44px]"
          />
        </div>

        {/* Immediate actions */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="incident-actions" className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Immediate Actions Taken
          </label>
          <textarea
            id="incident-actions"
            rows={2}
            value={form.immediateActions}
            onChange={(e) => set('immediateActions', e.target.value)}
            placeholder="e.g. First aid applied, area cordoned off, emergency services called…"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] resize-y"
          />
        </div>

        {/* Root cause */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="incident-root" className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Root Cause
          </label>
          <textarea
            id="incident-root"
            rows={2}
            value={form.rootCause}
            onChange={(e) => set('rootCause', e.target.value)}
            placeholder="Why did this happen? What underlying factors contributed?"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] resize-y"
          />
        </div>

        {/* Corrective actions */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="incident-corrective" className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Corrective Actions
          </label>
          <textarea
            id="incident-corrective"
            rows={2}
            value={form.correctiveActions}
            onChange={(e) => set('correctiveActions', e.target.value)}
            placeholder="What will be done to prevent recurrence?"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] resize-y"
          />
        </div>

        {/* Reported by */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="incident-reporter" className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Reported By *
          </label>
          <input
            id="incident-reporter"
            type="text"
            required
            value={form.reportedBy}
            onChange={(e) => set('reportedBy', e.target.value)}
            placeholder="Full name and role"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] min-h-[44px]"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#32A9D9] text-white font-semibold text-base hover:opacity-90 active:scale-[0.98] transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2] focus-visible:ring-offset-2 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Generate Report PDF
          {!user && <span className="text-xs opacity-80">(sign in required)</span>}
        </button>
      </form>

      {/* Sign-in modal */}
      {showSignIn && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="signin-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSignIn(false) }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4">
            <h2 id="signin-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white text-center">
              Sign in to generate report
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              Sign in to download your incident report as a PDF.
            </p>
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/10 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
            <button
              onClick={() => setShowSignIn(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
