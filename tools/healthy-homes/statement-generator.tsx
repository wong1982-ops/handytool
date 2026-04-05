'use client'

import { useState } from 'react'
import { generateStatementPdf } from './pdf-statement'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'
import type { StatementData, StandardId } from './types'

// ─── Shared Styles ─────────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-xl bg-[#131a23] border border-[#1e2631] text-white px-3 py-2.5 min-h-[44px] text-sm focus:outline-none focus:border-[#3D6AF2] transition-colors'

const labelCls = 'block text-sm text-[#a6abb5] mb-1'

// ─── Constants ─────────────────────────────────────────────────────────────────

const STANDARD_ORDER: StandardId[] = ['heating', 'insulation', 'ventilation', 'moisture', 'draught']

const STANDARD_NAMES: Record<StandardId, string> = {
  heating: 'Heating Standard',
  insulation: 'Insulation Standard',
  ventilation: 'Ventilation Standard',
  moisture: 'Moisture Ingress & Drainage Standard',
  draught: 'Draught Stopping Standard',
}

const DECLARATION_TEXTS: Record<StandardId, string> = {
  heating:
    'The property has a fixed heater in the main living area capable of heating to at least 18°C.',
  insulation:
    'Ceiling and underfloor insulation meets or exceeds 2008 Building Code requirements.',
  ventilation:
    'Extractor fans are installed in kitchen and bathroom, venting to outside.',
  moisture:
    'The property has effective drainage, guttering, and downpipes with no moisture issues.',
  draught:
    'All unused chimneys/fireplaces are blocked and gaps/holes in walls, ceilings, and floors are sealed.',
}

// ─── Default state ─────────────────────────────────────────────────────────────

const today = new Date().toISOString().split('T')[0]

function defaultData(): StatementData {
  return {
    property: { address: '' },
    landlord: { name: '' },
    tenants: { names: [''] },
    tenancyStartDate: '',
    declarations: {
      heating: true,
      insulation: true,
      ventilation: true,
      moisture: true,
      draught: true,
    },
  }
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
          Create a free account to generate and download the compliance statement as a PDF.
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

// ─── Main Component ────────────────────────────────────────────────────────────

export default function StatementGenerator() {
  const { user } = useAuth()
  const [data, setData] = useState<StatementData>(defaultData())
  const [showSignIn, setShowSignIn] = useState(false)
  const [signatureDate, setSignatureDate] = useState(today)

  function patchLandlord(name: string) {
    setData(prev => ({ ...prev, landlord: { name } }))
  }

  function patchAddress(address: string) {
    setData(prev => ({ ...prev, property: { address } }))
  }

  function patchTenants(raw: string) {
    // Accept comma-separated names
    const names = raw.split(',').map(s => s.trim()).filter(Boolean)
    setData(prev => ({ ...prev, tenants: { names: names.length ? names : [''] } }))
  }

  function patchTenancyStart(date: string) {
    setData(prev => ({ ...prev, tenancyStartDate: date }))
  }

  function patchDeclaration(id: StandardId, checked: boolean) {
    setData(prev => ({
      ...prev,
      declarations: { ...prev.declarations, [id]: checked },
    }))
  }

  function handleGenerate() {
    if (!user) {
      setShowSignIn(true)
      return
    }
    generateStatementPdf(data)
  }

  return (
    <div className="w-full max-w-lg mx-auto" id="statement">
      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}

      <div className="rounded-2xl bg-[#0e1520] border border-[#1e2631] p-6 space-y-5">
        {/* ── Property details ── */}
        <div>
          <h3 className="text-white text-sm font-semibold mb-3">Property Details</h3>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Landlord Name</label>
              <input
                className={inputCls}
                value={data.landlord.name}
                onChange={e => patchLandlord(e.target.value)}
                placeholder="Full legal name of landlord"
              />
            </div>
            <div>
              <label className={labelCls}>Property Address</label>
              <input
                className={inputCls}
                value={data.property.address}
                onChange={e => patchAddress(e.target.value)}
                placeholder="Full rental property address"
              />
            </div>
            <div>
              <label className={labelCls}>Tenant Name(s) — comma separated</label>
              <input
                className={inputCls}
                value={data.tenants.names.join(', ')}
                onChange={e => patchTenants(e.target.value)}
                placeholder="e.g. Jane Smith, John Doe"
              />
            </div>
          </div>
        </div>

        {/* ── Dates ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Tenancy Start Date</label>
            <input
              className={inputCls}
              type="date"
              value={data.tenancyStartDate}
              onChange={e => patchTenancyStart(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Signature Date</label>
            <input
              className={inputCls}
              type="date"
              value={signatureDate}
              onChange={e => setSignatureDate(e.target.value)}
            />
          </div>
        </div>

        {/* ── Declarations ── */}
        <div>
          <h3 className="text-white text-sm font-semibold mb-3">Compliance Declarations</h3>
          <p className="text-[#a6abb5] text-xs mb-3 leading-relaxed">
            Tick each standard the landlord declares the property meets as of the tenancy start date.
          </p>
          <div className="space-y-2">
            {STANDARD_ORDER.map(id => (
              <label
                key={id}
                className="flex items-start gap-3 cursor-pointer group rounded-xl border border-[#1e2631] p-3 hover:border-[#3D6AF2]/40 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={data.declarations[id]}
                  onChange={e => patchDeclaration(id, e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#3D6AF2] shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium">{STANDARD_NAMES[id]}</p>
                  <p className="text-[#a6abb5] text-[13px] leading-relaxed mt-0.5">
                    {DECLARATION_TEXTS[id]}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <div className="rounded-xl border-l-4 border-amber-500 bg-amber-500/10 px-4 py-3">
          <p className="text-amber-400 text-xs font-semibold mb-1">Important Disclaimer</p>
          <p className="text-[#a6abb5] text-xs leading-relaxed">
            This statement is a template only and does not constitute legal advice. Landlords are
            legally responsible for ensuring their property meets all Healthy Homes Standards. For
            complex situations seek independent legal advice or contact Tenancy Services on{' '}
            <span className="text-white">0800 836 262</span>.
          </p>
        </div>

        {/* ── Generate button ── */}
        <button
          onClick={handleGenerate}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white font-semibold py-3 min-h-[44px] hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Generate Compliance Statement
        </button>
      </div>
    </div>
  )
}
