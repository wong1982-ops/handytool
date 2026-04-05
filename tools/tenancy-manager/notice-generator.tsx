'use client'

import { useState } from 'react'
import type { NoticeType, NoticeData } from './types'
import { NOTICE_TYPES } from './tenancy-data'
import { generateNoticePdf } from './pdf-notice'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'

// ─── Shared Styles ─────────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-xl bg-[#131a23] border border-[#1e2631] text-white px-3 py-2.5 min-h-[44px] text-sm focus:outline-none focus:border-[#3D6AF2] transition-colors'

const labelCls = 'block text-sm text-[#a6abb5] mb-1'

// ─── 42-day Reasons ────────────────────────────────────────────────────────────

const REASONS_42 = [
  'Owner or family member intends to move in',
  'Property has been sold and the purchaser requires vacant possession',
  'Extensive renovations or repairs require the property to be vacant',
  'The property is to be demolished or converted to another use',
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function calculateEffectiveDate(noticeDate: string, days: number): string {
  if (!noticeDate) return '—'
  const ms = new Date(noticeDate).getTime() + days * 86400000
  return new Date(ms).toLocaleDateString('en-NZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// ─── Sign-In Modal ─────────────────────────────────────────────────────────────

function SignInModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)

  async function handleSignIn() {
    setLoading(true)
    try {
      await signInWithOAuth('google')
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0e1520] border border-[#1e2631] rounded-2xl p-6 w-full max-w-sm mx-4">
        <h2 className="text-white font-semibold text-lg mb-2">Sign in to download</h2>
        <p className="text-[#a6abb5] text-sm mb-6">
          Create a free account to download the notice as a PDF.
        </p>
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-xl bg-white text-gray-900 font-medium py-2.5 min-h-[44px] hover:bg-gray-100 transition-colors disabled:opacity-60"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? 'Redirecting…' : 'Continue with Google'}
        </button>
        <button
          onClick={onClose}
          className="w-full mt-3 text-[#a6abb5] text-sm py-2 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Step 1: Select Notice Type ────────────────────────────────────────────────

function SelectType({
  selected,
  onSelect,
}: {
  selected: NoticeType | null
  onSelect: (type: NoticeType) => void
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-white font-semibold mb-4">Select Notice Type</h3>
      {(Object.entries(NOTICE_TYPES) as [NoticeType, (typeof NOTICE_TYPES)[string]][]).map(
        ([key, info]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`w-full text-left rounded-xl border p-4 transition-colors min-h-[44px] ${
              selected === key
                ? 'border-[#3D6AF2] bg-[#3D6AF2]/10'
                : 'border-[#1e2631] bg-[#131a23] hover:border-[#3D6AF2]/40'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-full bg-[#3D6AF2]/20 text-[#3D9DF2] text-xs font-semibold px-2.5 py-0.5">
                    {info.days} days
                  </span>
                  <span className="text-xs text-[#a6abb5]">{info.actSection}</span>
                </div>
                <p className="text-white text-sm font-medium">{info.label}</p>
                <p className="text-[#a6abb5] text-xs mt-1 leading-relaxed">{info.description}</p>
              </div>
              {selected === key && (
                <div className="w-5 h-5 rounded-full bg-[#3D6AF2] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ),
      )}
    </div>
  )
}

// ─── Step 2: Form ──────────────────────────────────────────────────────────────

function NoticeForm({
  type,
  data,
  onChange,
}: {
  type: NoticeType
  data: Partial<NoticeData>
  onChange: (patch: Partial<NoticeData>) => void
}) {
  const typeInfo = NOTICE_TYPES[type]

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-[#3D6AF2]/10 border border-[#3D6AF2]/30 px-4 py-3">
        <p className="text-[#3D9DF2] text-sm font-semibold">{typeInfo.label}</p>
        <p className="text-[#a6abb5] text-xs mt-0.5">{typeInfo.actSection}</p>
      </div>

      {/* Sender */}
      <div>
        <h4 className="text-white text-sm font-semibold mb-3">From (Sender)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Full Name</label>
            <input
              className={inputCls}
              value={data.fromName || ''}
              onChange={e => onChange({ fromName: e.target.value })}
              placeholder="Sender's full name"
            />
          </div>
          <div>
            <label className={labelCls}>Address</label>
            <input
              className={inputCls}
              value={data.fromAddress || ''}
              onChange={e => onChange({ fromAddress: e.target.value })}
              placeholder="Sender's address"
            />
          </div>
        </div>
      </div>

      {/* Recipient */}
      <div>
        <h4 className="text-white text-sm font-semibold mb-3">To (Recipient)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Full Name</label>
            <input
              className={inputCls}
              value={data.toName || ''}
              onChange={e => onChange({ toName: e.target.value })}
              placeholder="Recipient's full name"
            />
          </div>
          <div>
            <label className={labelCls}>Address</label>
            <input
              className={inputCls}
              value={data.toAddress || ''}
              onChange={e => onChange({ toAddress: e.target.value })}
              placeholder="Recipient's address"
            />
          </div>
        </div>
      </div>

      {/* Property & Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={labelCls}>Property Address</label>
          <input
            className={inputCls}
            value={data.propertyAddress || ''}
            onChange={e => onChange({ propertyAddress: e.target.value })}
            placeholder="Rental property address"
          />
        </div>
        <div>
          <label className={labelCls}>Notice Date</label>
          <input
            className={inputCls}
            type="date"
            value={data.noticeDate || ''}
            onChange={e => onChange({ noticeDate: e.target.value })}
          />
        </div>
        <div>
          <label className={labelCls}>Effective Date (calculated)</label>
          <input
            className={`${inputCls} opacity-60`}
            readOnly
            value={calculateEffectiveDate(data.noticeDate || '', typeInfo.days)}
          />
        </div>
      </div>

      {/* 42-day: reason */}
      {type === '42-day' && (
        <div>
          <label className={labelCls}>Reason for Termination</label>
          <select
            className={inputCls}
            value={data.reason || ''}
            onChange={e => onChange({ reason: e.target.value })}
          >
            <option value="">Select a reason…</option>
            {REASONS_42.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 14-day rent arrears */}
      {type === '14-day-rent' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Amount Owed (NZD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a6abb5] text-sm">
                $
              </span>
              <input
                className={`${inputCls} pl-7`}
                type="number"
                min={0}
                value={data.amountOwed || ''}
                onChange={e =>
                  onChange({ amountOwed: parseFloat(e.target.value) || 0 })
                }
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Arrears From Date</label>
            <input
              className={inputCls}
              type="date"
              value={data.arrearsPeriod || ''}
              onChange={e => onChange({ arrearsPeriod: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Step 3: Preview ───────────────────────────────────────────────────────────

function NoticePreview({
  type,
  data,
  onDownload,
}: {
  type: NoticeType
  data: Partial<NoticeData>
  onDownload: () => void
}) {
  const typeInfo = NOTICE_TYPES[type]
  const effectiveDate = calculateEffectiveDate(data.noticeDate || '', typeInfo.days)

  const row = (label: string, value: string | undefined) =>
    value ? (
      <div key={label} className="flex justify-between py-2 border-b border-[#1e2631]">
        <span className="text-[#a6abb5] text-sm">{label}</span>
        <span className="text-white text-sm font-medium text-right max-w-[60%]">{value}</span>
      </div>
    ) : null

  return (
    <div className="space-y-5">
      <div className="text-center pb-4 border-b border-[#1e2631]">
        <h2 className="text-white text-lg font-bold uppercase tracking-wide">
          {typeInfo.label}
        </h2>
        <p className="text-[#a6abb5] text-xs mt-1">
          Under the Residential Tenancies Act 1986 — {typeInfo.actSection}
        </p>
      </div>

      <section>
        <h3 className="text-[#3D6AF2] text-xs font-semibold uppercase tracking-wider mb-2">
          From
        </h3>
        {row('Name', data.fromName)}
        {row('Address', data.fromAddress)}
      </section>

      <section>
        <h3 className="text-[#3D6AF2] text-xs font-semibold uppercase tracking-wider mb-2">
          To
        </h3>
        {row('Name', data.toName)}
        {row('Address', data.toAddress)}
      </section>

      <section>
        {row('Property', data.propertyAddress)}
        {row('Notice Date', data.noticeDate ? new Date(data.noticeDate).toLocaleDateString('en-NZ', { day: '2-digit', month: 'long', year: 'numeric' }) : undefined)}
        {row('Effective Date', effectiveDate !== '—' ? effectiveDate : undefined)}
        {type === '42-day' && row('Reason', data.reason)}
        {type === '14-day-rent' && row('Amount Owed', data.amountOwed !== undefined ? `$${data.amountOwed.toFixed(2)}` : undefined)}
        {type === '14-day-rent' && row('Arrears From', data.arrearsPeriod)}
      </section>

      {/* Disclaimer */}
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3">
        <p className="text-amber-400 text-xs font-semibold mb-1">Important Notice</p>
        <p className="text-[#a6abb5] text-xs leading-relaxed">
          This notice is generated as a template only and does not constitute legal advice. Ensure
          all details are correct before serving. For complex disputes, seek independent legal
          advice or contact Tenancy Services on{' '}
          <span className="text-white">0800 836 262</span>.
        </p>
      </div>

      <button
        onClick={onDownload}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white font-semibold py-3 min-h-[44px] hover:opacity-90 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download PDF
      </button>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function NoticeGenerator() {
  const { user } = useAuth()
  const [step, setStep] = useState<'select' | 'form' | 'preview'>('select')
  const [selectedType, setSelectedType] = useState<NoticeType | null>(null)
  const [formData, setFormData] = useState<Partial<NoticeData>>({})
  const [showSignIn, setShowSignIn] = useState(false)

  function patch(update: Partial<NoticeData>) {
    setFormData(prev => ({ ...prev, ...update }))
  }

  function handleSelectNext() {
    if (selectedType) setStep('form')
  }

  function handleFormNext() {
    setStep('preview')
  }

  function handleBack() {
    if (step === 'form') setStep('select')
    else if (step === 'preview') setStep('form')
  }

  function handleDownload() {
    if (!user) {
      setShowSignIn(true)
      return
    }
    if (!selectedType) return
    generateNoticePdf({ ...formData, type: selectedType } as NoticeData)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}

      <div className="rounded-2xl bg-[#0e1520] border border-[#1e2631] p-6">
        {step === 'select' && (
          <SelectType selected={selectedType} onSelect={setSelectedType} />
        )}
        {step === 'form' && selectedType && (
          <NoticeForm type={selectedType} data={formData} onChange={patch} />
        )}
        {step === 'preview' && selectedType && (
          <NoticePreview type={selectedType} data={formData} onDownload={handleDownload} />
        )}

        {step !== 'preview' && (
          <div className="flex justify-between mt-8 pt-6 border-t border-[#1e2631]">
            <button
              onClick={handleBack}
              disabled={step === 'select'}
              className="rounded-xl border border-[#1e2631] text-[#a6abb5] px-6 py-2.5 min-h-[44px] text-sm font-medium disabled:opacity-30 hover:text-white hover:border-[#3D6AF2]/50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={step === 'select' ? handleSelectNext : handleFormNext}
              disabled={step === 'select' && !selectedType}
              className="rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white px-8 py-2.5 min-h-[44px] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {step === 'form' ? 'Preview Notice' : 'Next'}
            </button>
          </div>
        )}

        {step === 'preview' && (
          <button
            onClick={handleBack}
            className="mt-4 w-full rounded-xl border border-[#1e2631] text-[#a6abb5] py-2.5 min-h-[44px] text-sm font-medium hover:text-white hover:border-[#3D6AF2]/50 transition-colors"
          >
            Edit Notice
          </button>
        )}
      </div>
    </div>
  )
}
