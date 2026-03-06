'use client'

import { useEffect, useState, useCallback } from 'react'

interface Tier {
  id: string
  name: string
  monthlyCredits: number
  stripePriceId: string
  features: string[]
  active: boolean
}

type TierForm = Omit<Tier, 'id'> & { id?: string }

const EMPTY_FORM: TierForm = {
  name: '',
  monthlyCredits: 0,
  stripePriceId: '',
  features: [],
  active: true,
}

export function TierManagement() {
  const [tiers, setTiers] = useState<Tier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTier, setEditingTier] = useState<TierForm | null>(null)
  const [featuresInput, setFeaturesInput] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchTiers = useCallback(async () => {
    try {
      const res = await fetch('/api/tiers')
      if (!res.ok) throw new Error('Failed to fetch tiers')
      const data = await res.json()
      setTiers(data.tiers ?? data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tiers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTiers()
  }, [fetchTiers])

  function openCreateForm() {
    setEditingTier({ ...EMPTY_FORM })
    setFeaturesInput('')
  }

  function openEditForm(tier: Tier) {
    setEditingTier({ ...tier })
    setFeaturesInput(tier.features.join('\n'))
  }

  function closeForm() {
    setEditingTier(null)
    setFeaturesInput('')
  }

  async function handleSave() {
    if (!editingTier || !editingTier.name.trim()) return

    setSaving(true)
    const features = featuresInput
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean)

    const payload = { ...editingTier, features }

    try {
      const isEdit = !!editingTier.id
      const url = isEdit ? `/api/tiers/${editingTier.id}` : '/api/tiers'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to save tier')
      closeForm()
      fetchTiers()
    } catch {
      setError('Failed to save tier')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Subscription Tiers</h1>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium min-h-[44px]"
        >
          + New Tier
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Tier Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 animate-pulse">
              <div className="h-6 w-32 bg-zinc-700/50 rounded mb-4" />
              <div className="h-4 w-24 bg-zinc-700/50 rounded mb-2" />
              <div className="h-4 w-40 bg-zinc-700/50 rounded" />
            </div>
          ))}
        </div>
      ) : tiers.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-500">
          No tiers configured yet
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-xl border p-6 ${
                tier.active
                  ? 'border-blue-500/30 bg-blue-500/5'
                  : 'border-zinc-800 bg-zinc-900/50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    tier.active
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-zinc-700/50 text-zinc-500'
                  }`}
                >
                  {tier.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <p className="text-2xl font-bold text-blue-400 mb-1">
                {tier.monthlyCredits.toLocaleString()}
                <span className="text-sm font-normal text-zinc-400 ml-1">credits/mo</span>
              </p>

              <p className="text-xs text-zinc-500 font-mono mb-4 truncate" title={tier.stripePriceId}>
                {tier.stripePriceId || 'No Stripe Price ID'}
              </p>

              {tier.features.length > 0 && (
                <ul className="space-y-1 mb-4">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                      <svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => openEditForm(tier)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 text-sm font-medium transition-colors min-h-[44px]"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {editingTier && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">
              {editingTier.id ? 'Edit Tier' : 'Create Tier'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Name</label>
                <input
                  type="text"
                  value={editingTier.name}
                  onChange={(e) => setEditingTier((t) => t ? { ...t, name: e.target.value } : null)}
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm"
                  placeholder="e.g. Pro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Monthly Credits</label>
                <input
                  type="number"
                  min={0}
                  value={editingTier.monthlyCredits}
                  onChange={(e) =>
                    setEditingTier((t) => t ? { ...t, monthlyCredits: Number(e.target.value) } : null)
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Stripe Price ID</label>
                <input
                  type="text"
                  value={editingTier.stripePriceId}
                  onChange={(e) =>
                    setEditingTier((t) => t ? { ...t, stripePriceId: e.target.value } : null)
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm"
                  placeholder="price_..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Features (one per line)
                </label>
                <textarea
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm resize-none"
                  placeholder="Unlimited tools&#10;Priority support&#10;API access"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setEditingTier((t) => t ? { ...t, active: !t.active } : null)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    editingTier.active ? 'bg-blue-600' : 'bg-zinc-700'
                  }`}
                  type="button"
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      editingTier.active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-zinc-300">Active</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeForm}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white text-sm font-medium min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editingTier.name.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium min-h-[44px]"
              >
                {saving ? 'Saving...' : editingTier.id ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
