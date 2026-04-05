'use client'

import { useState } from 'react'
import type { AgreementData, AgreementStep } from './types'
import {
  CHATTELS,
  PROPERTY_TYPES,
  PAYMENT_METHODS,
  PAYMENT_DAYS,
} from './tenancy-data'
import { generateAgreementPdf } from './pdf-agreement'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS: AgreementStep[] = [
  { id: 1, title: 'Property & Landlord', description: 'Property and landlord details' },
  { id: 2, title: 'Tenancy Details', description: 'Rent, bond, and tenancy type' },
  { id: 3, title: 'Terms', description: 'Rules, chattels, and conditions' },
]

const DEFAULT_DATA: AgreementData = {
  landlordName: '',
  landlordAddress: '',
  landlordPhone: '',
  landlordEmail: '',
  tenantNames: [''],
  propertyAddress: '',
  propertyType: 'House',
  bedrooms: 1,
  hasParking: false,
  isInsured: true,
  tenancyType: 'periodic',
  startDate: '',
  endDate: '',
  weeklyRent: 0,
  paymentMethod: 'Bank Transfer',
  paymentDay: 'Monday',
  bondAmount: 0,
  petBond: 0,
  chattels: [],
  smokingAllowed: false,
  maxOccupants: 2,
  additionalConditions: '',
}

// ─── Shared Input Styles ───────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-xl bg-[#131a23] border border-[#1e2631] text-white px-3 py-2.5 min-h-[44px] text-sm focus:outline-none focus:border-[#3D6AF2] transition-colors'

const labelCls = 'block text-sm text-[#a6abb5] mb-1'

// ─── Step Indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number | 'preview' }) {
  const activeStep = current === 'preview' ? 4 : current
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((s, idx) => {
        const isComplete = activeStep > s.id
        const isActive = activeStep === s.id
        return (
          <div key={s.id} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isComplete
                    ? 'bg-[#3D6AF2] text-white'
                    : isActive
                      ? 'bg-[#3D6AF2]/20 border-2 border-[#3D6AF2] text-[#3D6AF2]'
                      : 'bg-[#131a23] border border-[#1e2631] text-[#a6abb5]'
                }`}
              >
                {isComplete ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s.id
                )}
              </div>
              <span
                className={`text-xs mt-1 ${isActive ? 'text-[#3D6AF2]' : 'text-[#a6abb5]'}`}
              >
                {s.title}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-12 h-px mb-4 ${isComplete ? 'bg-[#3D6AF2]' : 'bg-[#1e2631]'}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
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
          Create a free account to download your tenancy agreement as a PDF.
        </p>
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-xl bg-white text-gray-900 font-medium py-2.5 min-h-[44px] hover:bg-gray-100 transition-colors disabled:opacity-60"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
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

// ─── Step 1: Property & Landlord ───────────────────────────────────────────────

function Step1({
  data,
  onChange,
}: {
  data: AgreementData
  onChange: (patch: Partial<AgreementData>) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-semibold mb-4">Landlord Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Full Name</label>
            <input
              className={inputCls}
              value={data.landlordName}
              onChange={e => onChange({ landlordName: e.target.value })}
              placeholder="e.g. Jane Smith"
            />
          </div>
          <div>
            <label className={labelCls}>Email Address</label>
            <input
              className={inputCls}
              type="email"
              value={data.landlordEmail}
              onChange={e => onChange({ landlordEmail: e.target.value })}
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <label className={labelCls}>Phone Number</label>
            <input
              className={inputCls}
              type="tel"
              value={data.landlordPhone}
              onChange={e => onChange({ landlordPhone: e.target.value })}
              placeholder="021 000 0000"
            />
          </div>
          <div>
            <label className={labelCls}>Landlord Address</label>
            <input
              className={inputCls}
              value={data.landlordAddress}
              onChange={e => onChange({ landlordAddress: e.target.value })}
              placeholder="123 Main Street, Auckland"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-4">Property Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelCls}>Property Address</label>
            <input
              className={inputCls}
              value={data.propertyAddress}
              onChange={e => onChange({ propertyAddress: e.target.value })}
              placeholder="45 Rental Road, Wellington 6011"
            />
          </div>
          <div>
            <label className={labelCls}>Property Type</label>
            <select
              className={inputCls}
              value={data.propertyType}
              onChange={e => onChange({ propertyType: e.target.value })}
            >
              {PROPERTY_TYPES.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Bedrooms</label>
            <input
              className={inputCls}
              type="number"
              min={0}
              max={20}
              value={data.bedrooms}
              onChange={e => onChange({ bedrooms: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className={labelCls}>Parking Spaces</label>
            <input
              className={inputCls}
              type="number"
              min={0}
              max={10}
              value={data.hasParking ? 1 : 0}
              onChange={e =>
                onChange({ hasParking: parseInt(e.target.value) > 0 })
              }
            />
          </div>
          <div>
            <label className={labelCls}>Contents Insurance</label>
            <div className="flex gap-3 mt-1">
              {[
                { label: 'Insured', value: true },
                { label: 'Not Insured', value: false },
              ].map(opt => (
                <label key={String(opt.value)} className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="radio"
                    className="accent-[#3D6AF2]"
                    checked={data.isInsured === opt.value}
                    onChange={() => onChange({ isInsured: opt.value })}
                  />
                  <span className="text-sm text-white">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step 2: Tenancy Details ───────────────────────────────────────────────────

function Step2({
  data,
  onChange,
}: {
  data: AgreementData
  onChange: (patch: Partial<AgreementData>) => void
}) {
  const standardBond = data.weeklyRent * 4
  const petBondAmount = data.weeklyRent * 2
  const hasPetBond = data.petBond > 0

  function updateTenant(idx: number, value: string) {
    const names = [...data.tenantNames]
    names[idx] = value
    onChange({ tenantNames: names })
  }

  function addTenant() {
    if (data.tenantNames.length < 4) {
      onChange({ tenantNames: [...data.tenantNames, ''] })
    }
  }

  function removeTenant(idx: number) {
    if (data.tenantNames.length > 1) {
      const names = data.tenantNames.filter((_, i) => i !== idx)
      onChange({ tenantNames: names })
    }
  }

  return (
    <div className="space-y-6">
      {/* Tenant Names */}
      <div>
        <h3 className="text-white font-semibold mb-4">Tenants</h3>
        <div className="space-y-3">
          {data.tenantNames.map((name, idx) => (
            <div key={idx} className="flex gap-2">
              <div className="flex-1">
                <label className={labelCls}>Tenant {idx + 1} Full Name</label>
                <input
                  className={inputCls}
                  value={name}
                  onChange={e => updateTenant(idx, e.target.value)}
                  placeholder={`Tenant ${idx + 1} name`}
                />
              </div>
              {data.tenantNames.length > 1 && (
                <button
                  onClick={() => removeTenant(idx)}
                  className="mt-6 px-3 rounded-xl border border-[#1e2631] text-[#a6abb5] hover:text-red-400 hover:border-red-400/30 transition-colors min-h-[44px]"
                  aria-label="Remove tenant"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          {data.tenantNames.length < 4 && (
            <button
              onClick={addTenant}
              className="text-sm text-[#3D6AF2] hover:text-[#3D79F2] transition-colors min-h-[44px] flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add tenant (up to 4)
            </button>
          )}
        </div>
      </div>

      {/* Tenancy Type */}
      <div>
        <h3 className="text-white font-semibold mb-3">Tenancy Type</h3>
        <div className="flex gap-3">
          {(['periodic', 'fixed'] as const).map(type => (
            <button
              key={type}
              onClick={() => onChange({ tenancyType: type })}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium min-h-[44px] transition-colors border ${
                data.tenancyType === type
                  ? 'bg-[#3D6AF2] border-[#3D6AF2] text-white'
                  : 'bg-[#131a23] border-[#1e2631] text-[#a6abb5] hover:border-[#3D6AF2]/50'
              }`}
            >
              {type === 'periodic' ? 'Periodic' : 'Fixed Term'}
            </button>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Start Date</label>
          <input
            className={inputCls}
            type="date"
            value={data.startDate}
            onChange={e => onChange({ startDate: e.target.value })}
          />
        </div>
        {data.tenancyType === 'fixed' && (
          <div>
            <label className={labelCls}>End Date</label>
            <input
              className={inputCls}
              type="date"
              value={data.endDate || ''}
              onChange={e => onChange({ endDate: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* Rent & Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Weekly Rent (NZD)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a6abb5] text-sm">$</span>
            <input
              className={`${inputCls} pl-7`}
              type="number"
              min={0}
              value={data.weeklyRent || ''}
              onChange={e => {
                const rent = parseFloat(e.target.value) || 0
                onChange({ weeklyRent: rent, bondAmount: rent * 4 })
              }}
              placeholder="0.00"
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Payment Method</label>
          <select
            className={inputCls}
            value={data.paymentMethod}
            onChange={e => onChange({ paymentMethod: e.target.value })}
          >
            {PAYMENT_METHODS.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Payment Day</label>
          <select
            className={inputCls}
            value={data.paymentDay}
            onChange={e => onChange({ paymentDay: e.target.value })}
          >
            {PAYMENT_DAYS.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Bond (auto-calculated)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a6abb5] text-sm">$</span>
            <input
              className={`${inputCls} pl-7 opacity-60`}
              readOnly
              value={standardBond.toFixed(2)}
            />
          </div>
          <p className="text-xs text-[#a6abb5] mt-1">4 weeks' rent = ${standardBond.toFixed(2)}</p>
        </div>
      </div>

      {/* Pet Bond */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm text-white font-medium">Pet Bond</p>
            <p className="text-xs text-[#a6abb5]">2024 Amendment — max 2 weeks' rent</p>
          </div>
          <button
            role="switch"
            aria-checked={hasPetBond}
            onClick={() =>
              onChange({ petBond: hasPetBond ? 0 : petBondAmount })
            }
            className={`w-12 h-6 rounded-full transition-colors ${hasPetBond ? 'bg-[#3D6AF2]' : 'bg-[#1e2631]'}`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white transition-transform mx-0.5 ${hasPetBond ? 'translate-x-6' : 'translate-x-0'}`}
            />
          </button>
        </div>
        {hasPetBond && (
          <div className="rounded-xl bg-[#131a23] border border-[#1e2631] px-4 py-3 text-sm text-[#a6abb5]">
            Pet bond: <span className="text-white">${petBondAmount.toFixed(2)}</span> (2 weeks' rent)
          </div>
        )}
      </div>

      {/* Pets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-white font-medium">Pets Allowed</p>
          <button
            role="switch"
            aria-checked={!!data.additionalConditions.includes('Pets:')}
            onClick={() => {
              const hasPets = data.additionalConditions.includes('Pets:')
              if (hasPets) {
                onChange({
                  additionalConditions: data.additionalConditions
                    .replace(/\nPets:.*/, '')
                    .trim(),
                })
              } else {
                onChange({
                  additionalConditions: data.additionalConditions
                    ? `${data.additionalConditions}\nPets: `
                    : 'Pets: ',
                })
              }
            }}
            className={`w-12 h-6 rounded-full transition-colors ${data.additionalConditions.includes('Pets:') ? 'bg-[#3D6AF2]' : 'bg-[#1e2631]'}`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white transition-transform mx-0.5 ${data.additionalConditions.includes('Pets:') ? 'translate-x-6' : 'translate-x-0'}`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Step 3: Terms ─────────────────────────────────────────────────────────────

function Step3({
  data,
  onChange,
}: {
  data: AgreementData
  onChange: (patch: Partial<AgreementData>) => void
}) {
  function toggleChattel(chattel: string) {
    const current = data.chattels
    const next = current.includes(chattel)
      ? current.filter(c => c !== chattel)
      : [...current, chattel]
    onChange({ chattels: next })
  }

  return (
    <div className="space-y-6">
      {/* Smoking */}
      <div>
        <h3 className="text-white font-semibold mb-3">Smoking Policy</h3>
        <div className="flex gap-3">
          {[
            { label: 'No Smoking', value: false },
            { label: 'Smoking Allowed', value: true },
          ].map(opt => (
            <label key={String(opt.value)} className="flex items-center gap-2 cursor-pointer min-h-[44px]">
              <input
                type="radio"
                className="accent-[#3D6AF2]"
                checked={data.smokingAllowed === opt.value}
                onChange={() => onChange({ smokingAllowed: opt.value })}
              />
              <span className="text-sm text-white">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Max Occupants */}
      <div>
        <h3 className="text-white font-semibold mb-3">Maximum Occupants</h3>
        <input
          className={`${inputCls} max-w-[180px]`}
          type="number"
          min={1}
          max={20}
          value={data.maxOccupants}
          onChange={e => onChange({ maxOccupants: parseInt(e.target.value) || 1 })}
        />
      </div>

      {/* Chattels */}
      <div>
        <h3 className="text-white font-semibold mb-3">Chattels Included</h3>
        <div className="grid grid-cols-2 gap-2">
          {CHATTELS.map(chattel => {
            const checked = data.chattels.includes(chattel)
            return (
              <label key={chattel} className="flex items-center gap-2 cursor-pointer min-h-[44px] rounded-xl px-3 hover:bg-[#131a23] transition-colors">
                <input
                  type="checkbox"
                  className="accent-[#3D6AF2] w-4 h-4 flex-shrink-0"
                  checked={checked}
                  onChange={() => toggleChattel(chattel)}
                />
                <span className="text-sm text-white">{chattel}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Additional Conditions */}
      <div>
        <h3 className="text-white font-semibold mb-3">Additional Conditions</h3>
        <textarea
          className={`${inputCls} min-h-[120px] resize-y`}
          value={data.additionalConditions}
          onChange={e => onChange({ additionalConditions: e.target.value })}
          placeholder="Any additional terms or conditions for this tenancy…"
        />
      </div>

      {/* Healthy Homes */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="accent-[#3D6AF2] w-4 h-4 mt-0.5 flex-shrink-0"
            defaultChecked
          />
          <span className="text-sm text-[#a6abb5]">
            The landlord confirms this property complies with the{' '}
            <span className="text-white">Healthy Homes Standards</span> and a
            compliance statement has been provided to the tenant(s).
          </span>
        </label>
      </div>
    </div>
  )
}

// ─── Preview ───────────────────────────────────────────────────────────────────

function Preview({
  data,
  onEdit,
  onDownload,
}: {
  data: AgreementData
  onEdit: () => void
  onDownload: () => void
}) {
  function fmt(val: string | undefined) {
    return val || '—'
  }

  function fmtDate(d: string | undefined) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-NZ', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const row = (label: string, value: string) => (
    <div key={label} className="flex justify-between py-2 border-b border-[#1e2631]">
      <span className="text-[#a6abb5] text-sm">{label}</span>
      <span className="text-white text-sm font-medium text-right max-w-[60%]">{value}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="text-center pb-4 border-b border-[#1e2631]">
        <h2 className="text-white text-xl font-bold">Residential Tenancy Agreement</h2>
        <p className="text-[#a6abb5] text-sm mt-1">Under the Residential Tenancies Act 1986</p>
      </div>

      <section>
        <h3 className="text-[#3D6AF2] text-sm font-semibold uppercase tracking-wider mb-3">
          Landlord
        </h3>
        <div className="space-y-0">
          {row('Name', fmt(data.landlordName))}
          {row('Address', fmt(data.landlordAddress))}
          {row('Phone', fmt(data.landlordPhone))}
          {row('Email', fmt(data.landlordEmail))}
        </div>
      </section>

      <section>
        <h3 className="text-[#3D6AF2] text-sm font-semibold uppercase tracking-wider mb-3">
          Tenants
        </h3>
        <div className="space-y-0">
          {data.tenantNames.filter(Boolean).length > 0
            ? data.tenantNames
                .filter(Boolean)
                .map((name, i) => row(`Tenant ${i + 1}`, name))
            : row('Tenants', '—')}
        </div>
      </section>

      <section>
        <h3 className="text-[#3D6AF2] text-sm font-semibold uppercase tracking-wider mb-3">
          Property
        </h3>
        <div className="space-y-0">
          {row('Address', fmt(data.propertyAddress))}
          {row('Type', fmt(data.propertyType))}
          {row('Bedrooms', String(data.bedrooms))}
          {row('Parking', data.hasParking ? 'Yes' : 'No')}
          {row('Insured', data.isInsured ? 'Yes' : 'No')}
        </div>
      </section>

      <section>
        <h3 className="text-[#3D6AF2] text-sm font-semibold uppercase tracking-wider mb-3">
          Tenancy
        </h3>
        <div className="space-y-0">
          {row('Type', data.tenancyType === 'fixed' ? 'Fixed Term' : 'Periodic')}
          {row('Start Date', fmtDate(data.startDate))}
          {data.tenancyType === 'fixed' && row('End Date', fmtDate(data.endDate))}
          {row('Weekly Rent', `$${data.weeklyRent.toFixed(2)}`)}
          {row('Payment Method', fmt(data.paymentMethod))}
          {row('Payment Day', fmt(data.paymentDay))}
        </div>
      </section>

      <section>
        <h3 className="text-[#3D6AF2] text-sm font-semibold uppercase tracking-wider mb-3">
          Bond
        </h3>
        <div className="space-y-0">
          {row('Standard Bond', `$${data.bondAmount.toFixed(2)}`)}
          {data.petBond > 0 && row('Pet Bond', `$${data.petBond.toFixed(2)}`)}
          {row('Total Bond', `$${(data.bondAmount + data.petBond).toFixed(2)}`)}
        </div>
      </section>

      <section>
        <h3 className="text-[#3D6AF2] text-sm font-semibold uppercase tracking-wider mb-3">
          Terms
        </h3>
        <div className="space-y-0">
          {row('Smoking', data.smokingAllowed ? 'Allowed' : 'Not permitted')}
          {row('Max Occupants', String(data.maxOccupants))}
          {row(
            'Chattels',
            data.chattels.length > 0 ? data.chattels.join(', ') : 'None',
          )}
          {data.additionalConditions &&
            row('Additional Conditions', data.additionalConditions)}
        </div>
      </section>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          onClick={onDownload}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white font-semibold py-3 min-h-[44px] hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </button>
        <button
          onClick={onEdit}
          className="flex-1 rounded-xl border border-[#1e2631] text-[#a6abb5] font-medium py-3 min-h-[44px] hover:text-white hover:border-[#3D6AF2]/50 transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AgreementWizard() {
  const { user } = useAuth()
  const [step, setStep] = useState<1 | 2 | 3 | 'preview'>(1)
  const [data, setData] = useState<AgreementData>(DEFAULT_DATA)
  const [showSignIn, setShowSignIn] = useState(false)

  function patch(update: Partial<AgreementData>) {
    setData(prev => ({ ...prev, ...update }))
  }

  function handleNext() {
    if (step === 1) setStep(2)
    else if (step === 2) setStep(3)
    else if (step === 3) setStep('preview')
  }

  function handleBack() {
    if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
    else if (step === 'preview') setStep(3)
  }

  function handleDownload() {
    if (!user) {
      setShowSignIn(true)
      return
    }
    generateAgreementPdf(data)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}

      {step !== 'preview' && <StepIndicator current={step} />}

      <div className="rounded-2xl bg-[#0e1520] border border-[#1e2631] p-6">
        {step === 1 && <Step1 data={data} onChange={patch} />}
        {step === 2 && <Step2 data={data} onChange={patch} />}
        {step === 3 && <Step3 data={data} onChange={patch} />}
        {step === 'preview' && (
          <Preview data={data} onEdit={() => setStep(3)} onDownload={handleDownload} />
        )}

        {step !== 'preview' && (
          <div className="flex justify-between mt-8 pt-6 border-t border-[#1e2631]">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="rounded-xl border border-[#1e2631] text-[#a6abb5] px-6 py-2.5 min-h-[44px] text-sm font-medium disabled:opacity-30 hover:text-white hover:border-[#3D6AF2]/50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white px-8 py-2.5 min-h-[44px] text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {step === 3 ? 'Generate Preview' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
