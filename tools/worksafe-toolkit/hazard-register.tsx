'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'
import { INDUSTRY_HAZARDS } from './industry-data'
import type { HazardEntry, RiskLevel, IndustryId } from './types'

const RISK_BADGE: Record<RiskLevel, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  critical: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
}

const LIKELIHOODS = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'] as const
const CONSEQUENCES = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic'] as const

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

function todayStr() {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

const EMPTY_FORM: Omit<HazardEntry, 'id' | 'createdAt'> = {
  hazard: '',
  riskLevel: 'medium',
  likelihood: 'Possible',
  consequence: 'Moderate',
  controls: '',
  responsible: '',
  reviewDate: todayStr(),
}

interface HazardFormProps {
  initial?: Partial<Omit<HazardEntry, 'id' | 'createdAt'>>
  onSave: (data: Omit<HazardEntry, 'id' | 'createdAt'>) => void
  onCancel: () => void
}

function HazardForm({ initial, onSave, onCancel }: HazardFormProps) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial })

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.hazard.trim() || !form.controls.trim()) return
    onSave(form)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-[#3D6AF2]/40 bg-blue-50/30 dark:bg-blue-950/10 rounded-xl p-4 flex flex-col gap-4"
      aria-label="Hazard entry form"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="hazard-desc" className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Hazard Description *
        </label>
        <textarea
          id="hazard-desc"
          value={form.hazard}
          onChange={(e) => set('hazard', e.target.value)}
          required
          rows={2}
          placeholder="Describe the hazard or risk…"
          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="risk-level" className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Risk Level *
          </label>
          <select
            id="risk-level"
            value={form.riskLevel}
            onChange={(e) => set('riskLevel', e.target.value as RiskLevel)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] min-h-[44px]"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="likelihood" className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Likelihood
          </label>
          <select
            id="likelihood"
            value={form.likelihood}
            onChange={(e) => set('likelihood', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] min-h-[44px]"
          >
            {LIKELIHOODS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="consequence" className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Consequence
          </label>
          <select
            id="consequence"
            value={form.consequence}
            onChange={(e) => set('consequence', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] min-h-[44px]"
          >
            {CONSEQUENCES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="controls" className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Controls / Mitigations *
        </label>
        <textarea
          id="controls"
          value={form.controls}
          onChange={(e) => set('controls', e.target.value)}
          required
          rows={2}
          placeholder="Describe controls in place or planned…"
          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="responsible" className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Responsible Person / Role
          </label>
          <input
            id="responsible"
            type="text"
            value={form.responsible}
            onChange={(e) => set('responsible', e.target.value)}
            placeholder="e.g. Site Supervisor"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] min-h-[44px]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="review-date" className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Next Review Date
          </label>
          <input
            id="review-date"
            type="date"
            value={form.reviewDate}
            onChange={(e) => set('reviewDate', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] min-h-[44px]"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors min-h-[44px]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#3D6AF2] to-[#32A9D9] text-white text-sm font-semibold hover:opacity-90 transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2]"
        >
          Save Hazard
        </button>
      </div>
    </form>
  )
}

export default function HazardRegister() {
  const { user } = useAuth()
  const [hazards, setHazards] = useState<HazardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingHazard, setEditingHazard] = useState<HazardEntry | null>(null)
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryId | null>(null)
  const [showPrePopulate, setShowPrePopulate] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    fetch('/api/v1/worksafe/hazards')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setHazards(data)
        } else {
          setShowPrePopulate(true)
        }
      })
      .catch(() => setShowPrePopulate(true))
      .finally(() => setLoading(false))
  }, [user])

  const handlePrePopulate = useCallback((industryId: IndustryId) => {
    const templates = INDUSTRY_HAZARDS[industryId] ?? []
    const now = new Date().toISOString()
    const nextYear = todayStr()
    const newHazards: HazardEntry[] = templates.map((t) => ({
      id: makeId(),
      hazard: t.hazard,
      riskLevel: t.riskLevel,
      likelihood: t.likelihood,
      consequence: t.consequence,
      controls: t.controls,
      responsible: '',
      reviewDate: nextYear,
      createdAt: now,
    }))
    setHazards(newHazards)
    setShowPrePopulate(false)
  }, [])

  const handleSave = useCallback((formData: Omit<HazardEntry, 'id' | 'createdAt'>) => {
    if (editingHazard) {
      setHazards((prev) =>
        prev.map((h) => h.id === editingHazard.id ? { ...h, ...formData } : h)
      )
      setEditingHazard(null)
    } else {
      const newEntry: HazardEntry = {
        id: makeId(),
        ...formData,
        createdAt: new Date().toISOString(),
      }
      setHazards((prev) => [newEntry, ...prev])
      setShowForm(false)
    }
  }, [editingHazard])

  const handleDelete = useCallback((id: string) => {
    setHazards((prev) => prev.filter((h) => h.id !== id))
  }, [])

  const handleGoogleSignIn = useCallback(async () => {
    try { await signInWithOAuth('google') } catch {}
  }, [])

  const INDUSTRY_OPTIONS: { id: IndustryId; name: string; icon: string }[] = [
    { id: 'construction', name: 'Construction', icon: '🏗️' },
    { id: 'hospitality', name: 'Hospitality', icon: '🍽️' },
    { id: 'office', name: 'Office', icon: '🏢' },
    { id: 'retail', name: 'Retail', icon: '🛒' },
    { id: 'agriculture', name: 'Agriculture', icon: '🌾' },
    { id: 'manufacturing', name: 'Manufacturing', icon: '🏭' },
  ]

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Hazard Register</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Document and manage workplace hazards, risks, and controls.
          </p>
        </div>
        <button
          onClick={() => {
            if (!user) { handleGoogleSignIn(); return }
            setEditingHazard(null)
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#32A9D9] text-white text-sm font-semibold hover:opacity-90 transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Hazard
        </button>
      </div>

      {/* Pre-populate prompt */}
      {showPrePopulate && user && !loading && hazards.length === 0 && (
        <div className="border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/10 rounded-xl p-5">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
            Pre-populate from industry templates?
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
            Select your industry to load common hazards as a starting point. You can edit or delete them anytime.
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {INDUSTRY_OPTIONS.map((ind) => (
              <button
                key={ind.id}
                onClick={() => setSelectedIndustry(ind.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all min-h-[36px] border ${
                  selectedIndustry === ind.id
                    ? 'border-[#3D6AF2] bg-[#3D6AF2]/10 text-[#3D6AF2] dark:text-blue-300'
                    : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-[#3D6AF2]/50'
                }`}
                aria-pressed={selectedIndustry === ind.id}
              >
                <span aria-hidden="true">{ind.icon}</span>
                {ind.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => selectedIndustry && handlePrePopulate(selectedIndustry)}
              disabled={!selectedIndustry}
              className="px-4 py-2 rounded-lg bg-[#3D6AF2] text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
            >
              Load Templates
            </button>
            <button
              onClick={() => setShowPrePopulate(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors min-h-[44px]"
            >
              Start Empty
            </button>
          </div>
        </div>
      )}

      {/* Sign-in prompt */}
      {!user && (
        <div className="border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Sign in to save your hazard register across sessions.
          </p>
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-white/10 transition-colors min-h-[44px]"
          >
            Sign in with Google
          </button>
        </div>
      )}

      {/* Add/Edit form */}
      {(showForm && !editingHazard) && (
        <HazardForm onSave={handleSave} onCancel={() => setShowForm(false)} />
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-[#3D6AF2] border-t-transparent rounded-full animate-spin" aria-label="Loading" />
        </div>
      )}

      {/* Empty state */}
      {!loading && hazards.length === 0 && !showPrePopulate && (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
          </svg>
          <p className="text-sm font-medium">No hazards recorded yet</p>
          <p className="text-xs mt-1">Add your first hazard using the button above.</p>
        </div>
      )}

      {/* Hazard list */}
      {hazards.length > 0 && (
        <div className="flex flex-col gap-3">
          {hazards.map((hazard) => (
            <div key={hazard.id}>
              {editingHazard?.id === hazard.id ? (
                <HazardForm
                  initial={editingHazard}
                  onSave={handleSave}
                  onCancel={() => setEditingHazard(null)}
                />
              ) : (
                <div className="card-bg border border-slate-200 dark:border-white/10 rounded-xl p-4 group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${RISK_BADGE[hazard.riskLevel]}`}
                        >
                          {hazard.riskLevel}
                        </span>
                        {hazard.likelihood && (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {hazard.likelihood} / {hazard.consequence}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1 leading-snug">
                        {hazard.hazard}
                      </p>
                      {hazard.controls && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
                          <span className="font-medium text-slate-600 dark:text-slate-300">Controls: </span>
                          {hazard.controls}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                        {hazard.responsible && (
                          <span>Responsible: <span className="text-slate-600 dark:text-slate-300">{hazard.responsible}</span></span>
                        )}
                        {hazard.reviewDate && (
                          <span>Review: <span className="text-slate-600 dark:text-slate-300">{hazard.reviewDate}</span></span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingHazard(hazard)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2]"
                        aria-label="Edit hazard"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(hazard.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                        aria-label="Delete hazard"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
