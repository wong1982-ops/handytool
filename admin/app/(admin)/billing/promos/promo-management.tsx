'use client'

import { useEffect, useState, useCallback } from 'react'

interface Promo {
  id: string
  code: string
  credits: number
  maxRedemptions: number
  used: number
  expiresAt: string | null
  active: boolean
}

export function PromoManagement() {
  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create form state
  const [newCode, setNewCode] = useState('')
  const [newCredits, setNewCredits] = useState('')
  const [newMaxRedemptions, setNewMaxRedemptions] = useState('')
  const [newExpiry, setNewExpiry] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchPromos = useCallback(async () => {
    try {
      const res = await fetch('/api/promos')
      if (!res.ok) throw new Error('Failed to fetch promos')
      const data = await res.json()
      setPromos(data.promos ?? data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPromos()
  }, [fetchPromos])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newCode.trim() || !newCredits) return

    setCreating(true)
    try {
      const res = await fetch('/api/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode.trim().toUpperCase(),
          credits: Number(newCredits),
          maxRedemptions: newMaxRedemptions ? Number(newMaxRedemptions) : null,
          expiresAt: newExpiry || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to create promo')
      setNewCode('')
      setNewCredits('')
      setNewMaxRedemptions('')
      setNewExpiry('')
      fetchPromos()
    } catch {
      setError('Failed to create promo code')
    } finally {
      setCreating(false)
    }
  }

  async function toggleActive(promo: Promo) {
    try {
      const res = await fetch(`/api/promos/${promo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !promo.active }),
      })
      if (!res.ok) throw new Error('Failed to toggle promo')
      setPromos((prev) =>
        prev.map((p) => (p.id === promo.id ? { ...p, active: !p.active } : p))
      )
    } catch {
      setError('Failed to toggle promo status')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Promo Codes</h1>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Create Form */}
      <form onSubmit={handleCreate} className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <h2 className="text-sm font-medium text-zinc-300 mb-3">Create New Promo Code</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Code (e.g. WELCOME50)"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            required
            className="px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm"
          />
          <input
            type="number"
            placeholder="Credits"
            value={newCredits}
            onChange={(e) => setNewCredits(e.target.value)}
            min={1}
            required
            className="px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm"
          />
          <input
            type="number"
            placeholder="Max redemptions"
            value={newMaxRedemptions}
            onChange={(e) => setNewMaxRedemptions(e.target.value)}
            min={1}
            className="px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm"
          />
          <input
            type="date"
            placeholder="Expiry date"
            value={newExpiry}
            onChange={(e) => setNewExpiry(e.target.value)}
            className="px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm"
          />
          <button
            type="submit"
            disabled={creating || !newCode.trim() || !newCredits}
            className="px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium min-h-[44px]"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="text-left px-4 py-3 font-medium text-zinc-400">Code</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-400">Credits</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-400">Max Redemptions</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-400">Used</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-400">Expires</th>
              <th className="text-center px-4 py-3 font-medium text-zinc-400">Active</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">Loading...</td>
              </tr>
            ) : promos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">No promo codes found</td>
              </tr>
            ) : (
              promos.map((promo) => (
                <tr key={promo.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-4 py-3 font-mono font-medium text-white">{promo.code}</td>
                  <td className="px-4 py-3 text-right text-green-400 font-mono">{promo.credits}</td>
                  <td className="px-4 py-3 text-right text-zinc-300 font-mono">
                    {promo.maxRedemptions ?? 'Unlimited'}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-300 font-mono">{promo.used}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {promo.expiresAt
                      ? new Date(promo.expiresAt).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(promo)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        promo.active ? 'bg-blue-600' : 'bg-zinc-700'
                      }`}
                      aria-label={promo.active ? 'Deactivate promo' : 'Activate promo'}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                          promo.active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
