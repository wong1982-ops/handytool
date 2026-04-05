'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'
import { CITY_ZONES } from './climate-zones'
import type { Property } from './types'

// ─── Shared Styles ─────────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-xl bg-[#131a23] border border-[#1e2631] text-white px-3 py-2.5 min-h-[44px] text-sm focus:outline-none focus:border-[#3D6AF2] transition-colors'

const labelCls = 'block text-sm text-[#a6abb5] mb-1'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function statusColors(status: string | undefined): string {
  if (status === 'compliant') return 'bg-green-500/10 text-green-400 border-green-500/30'
  if (status === 'non-compliant') return 'bg-red-500/10 text-red-400 border-red-500/30'
  return 'bg-[#1e2631]/60 text-[#a6abb5] border-[#1e2631]'
}

function statusLabel(status: string | undefined): string {
  if (status === 'compliant') return 'Compliant'
  if (status === 'non-compliant') return 'Non-Compliant'
  return 'Not Checked'
}

function zoneColors(zone: number | undefined): string {
  if (zone === 1) return 'bg-blue-500/20 text-blue-400'
  if (zone === 2) return 'bg-purple-500/20 text-purple-400'
  if (zone === 3) return 'bg-indigo-500/20 text-indigo-400'
  return 'bg-[#1e2631] text-[#a6abb5]'
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return 'Never'
  return new Date(dateStr).toLocaleDateString('en-NZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Sign-In Gate ──────────────────────────────────────────────────────────────

function SignInGate() {
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
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-[#3D6AF2]/20 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-[#3D6AF2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">Sign in to track properties</h3>
      <p className="text-[#a6abb5] text-sm mb-6 max-w-xs">
        Save and track compliance status for multiple rental properties across devices.
      </p>
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="flex items-center gap-3 rounded-xl bg-white text-gray-900 font-medium px-6 py-2.5 min-h-[44px] hover:bg-gray-100 transition-colors disabled:opacity-60"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {loading ? 'Redirecting…' : 'Continue with Google'}
      </button>
    </div>
  )
}

// ─── Property Card ─────────────────────────────────────────────────────────────

function PropertyCard({
  property,
  onDelete,
  onRecheck,
  onStatement,
}: {
  property: Property
  onDelete: (id: string) => void
  onRecheck: (id: string) => void
  onStatement: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="bg-[#0e1520] border border-[#1e2631] rounded-xl p-4 transition-all hover:border-[#3D6AF2]/40"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start gap-3">
        {/* House icon */}
        <div className="w-9 h-9 rounded-lg bg-[#3D6AF2]/15 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-[#3D6AF2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold truncate">{property.address}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {property.city && (
              <span className="text-[#a6abb5] text-xs">{property.city}</span>
            )}
            {property.climateZone && (
              <span className={`rounded-full text-xs font-semibold px-2 py-0.5 ${zoneColors(property.climateZone)}`}>
                Zone {property.climateZone}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`rounded-full text-xs font-semibold px-2.5 py-1 border ${statusColors(property.complianceStatus)}`}>
              {statusLabel(property.complianceStatus)}
            </span>
            <span className="text-[#a6abb5] text-xs">
              Last checked: {formatDate(property.lastChecked)}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons — visible on hover */}
      {hovered && property.id && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1e2631]">
          <button
            onClick={() => onRecheck(property.id!)}
            className="rounded-xl border border-[#3D6AF2] text-[#3D6AF2] text-xs font-semibold px-3 py-2 min-h-[36px] hover:bg-[#3D6AF2]/10 transition-colors"
          >
            Re-check
          </button>
          <button
            onClick={() => onStatement(property.id!)}
            className="rounded-xl border border-[#1e2631] text-[#a6abb5] text-xs font-semibold px-3 py-2 min-h-[36px] hover:text-white hover:border-[#3D6AF2]/40 transition-colors"
          >
            Statement
          </button>
          <button
            onClick={() => onDelete(property.id!)}
            className="ml-auto text-red-400 text-xs font-semibold px-3 py-2 min-h-[36px] hover:text-red-300 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Add Form ──────────────────────────────────────────────────────────────────

function AddPropertyForm({
  onSave,
  onCancel,
  saving,
}: {
  onSave: (address: string, city: string) => void
  onCancel: () => void
  saving: boolean
}) {
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')

  const selectedZone = CITY_ZONES.find(c => c.city === city)?.zone

  return (
    <div className="bg-[#0e1520] border border-[#3D6AF2]/30 rounded-xl p-4 space-y-3">
      <h4 className="text-white text-sm font-semibold">Add Property</h4>
      <div>
        <label className={labelCls}>Property Address</label>
        <input
          className={inputCls}
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="e.g. 42 Harbour View Rd, Auckland 1010"
          autoFocus
        />
      </div>
      <div>
        <label className={labelCls}>City / Region</label>
        <div className="flex gap-2 items-center">
          <select
            className={`${inputCls} flex-1`}
            value={city}
            onChange={e => setCity(e.target.value)}
          >
            <option value="">Select city…</option>
            {CITY_ZONES.map(c => (
              <option key={c.city} value={c.city}>{c.city}</option>
            ))}
          </select>
          {selectedZone && (
            <span className="rounded-full bg-[#3D6AF2]/20 text-[#3D9DF2] text-xs font-semibold px-2.5 py-1 whitespace-nowrap">
              Zone {selectedZone}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => address.trim() && onSave(address.trim(), city)}
          disabled={!address.trim() || saving}
          className="flex-1 rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white text-sm font-semibold py-2.5 min-h-[44px] hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save Property'}
        </button>
        <button
          onClick={onCancel}
          className="rounded-xl border border-[#1e2631] text-[#a6abb5] text-sm px-4 py-2.5 min-h-[44px] hover:text-white hover:border-[#3D6AF2]/40 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-[#1e2631] flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-[#a6abb5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </div>
      <h3 className="text-white font-semibold mb-2">No properties yet</h3>
      <p className="text-[#a6abb5] text-sm mb-6 max-w-xs">
        Add your first rental property to start tracking Healthy Homes compliance.
      </p>
      <button
        onClick={onAdd}
        className="rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white text-sm font-semibold px-6 py-2.5 min-h-[44px] hover:opacity-90 transition-opacity"
      >
        Add your first rental property
      </button>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function PropertyTracker() {
  const { user, loading: authLoading } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch properties on mount (when authenticated)
  useEffect(() => {
    if (!user) return
    setLoading(true)
    setError(null)

    fetch('/api/v1/healthy-homes/properties')
      .then(res => res.json())
      .then(json => {
        setProperties(json.data ?? [])
      })
      .catch(() => setError('Failed to load properties. Please try again.'))
      .finally(() => setLoading(false))
  }, [user])

  async function handleAdd(address: string, city: string) {
    setSaving(true)
    setError(null)
    const zone = CITY_ZONES.find(c => c.city === city)?.zone

    const newProp: Partial<Property> = { address, city, climateZone: zone }

    try {
      const res = await fetch('/api/v1/healthy-homes/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProp),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Failed to add property')
      setProperties(prev => [json.data, ...prev])
      setShowAddForm(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add property')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    // Optimistic remove
    setProperties(prev => prev.filter(p => p.id !== id))
    setError(null)

    try {
      const res = await fetch(`/api/v1/healthy-homes/properties/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        // Revert on failure
        const json = await res.json()
        throw new Error(json.message || 'Failed to delete property')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete property')
      // Refresh list to restore
      fetch('/api/v1/healthy-homes/properties')
        .then(r => r.json())
        .then(j => setProperties(j.data ?? []))
        .catch(() => {})
    }
  }

  function handleRecheck(id: string) {
    // Scroll to compliance checker — app-level navigation
    document.querySelector('[data-section="compliance"]')?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleStatement(id: string) {
    // Scroll to statement generator
    document.querySelector('#statement')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Auth loading
  if (authLoading) {
    return (
      <div className="w-full max-w-lg mx-auto py-10 flex justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#3D6AF2] border-t-transparent animate-spin" />
      </div>
    )
  }

  // Not signed in
  if (!user) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="rounded-2xl bg-[#0e1520] border border-[#1e2631]">
          <SignInGate />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="rounded-2xl bg-[#0e1520] border border-[#1e2631] p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-bold">Your Properties</h2>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white text-sm font-semibold px-4 py-2 min-h-[44px] hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Property
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Add form */}
        {showAddForm && (
          <div className="mb-4">
            <AddPropertyForm
              onSave={handleAdd}
              onCancel={() => setShowAddForm(false)}
              saving={saving}
            />
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 rounded-full border-2 border-[#3D6AF2] border-t-transparent animate-spin" />
          </div>
        ) : properties.length === 0 && !showAddForm ? (
          <EmptyState onAdd={() => setShowAddForm(true)} />
        ) : (
          <div className="space-y-3">
            {properties.map(p => (
              <PropertyCard
                key={p.id}
                property={p}
                onDelete={handleDelete}
                onRecheck={handleRecheck}
                onStatement={handleStatement}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
