'use client'

import { useEffect, useState, useCallback } from 'react'

interface User {
  id: string
  name: string
  email: string
  subscriptionBalance: number
  purchasedBalance: number
}

interface AdjustModal {
  user: User
  amount: string
  reason: string
  submitting: boolean
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [modal, setModal] = useState<AdjustModal | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/users?${params}`)
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data.users ?? [])
      setTotalPages(data.totalPages ?? 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  function openAdjustModal(user: User) {
    setModal({ user, amount: '', reason: '', submitting: false })
  }

  async function handleAdjust() {
    if (!modal || !modal.reason.trim()) return
    const amount = Number(modal.amount)
    if (isNaN(amount) || amount === 0) return

    setModal((m) => m ? { ...m, submitting: true } : null)
    try {
      const res = await fetch(`/api/users/${modal.user.id}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, reason: modal.reason.trim() }),
      })
      if (!res.ok) throw new Error('Failed to adjust balance')
      setModal(null)
      fetchUsers()
    } catch {
      setModal((m) => m ? { ...m, submitting: false } : null)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">User Management</h1>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full max-w-md px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="text-left px-4 py-3 font-medium text-zinc-400">User</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-400">Subscription</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-400">Purchased</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-400">Total</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">Loading...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No users found</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-zinc-500 text-xs">{user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-right text-blue-400 font-mono">
                    {user.subscriptionBalance.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-green-400 font-mono">
                    {user.purchasedBalance.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-white font-mono font-medium">
                    {(user.subscriptionBalance + user.purchasedBalance).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openAdjustModal(user)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs font-medium transition-colors min-h-[36px]"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-zinc-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-sm min-h-[36px]"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-sm min-h-[36px]"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1">Adjust Balance</h2>
            <p className="text-sm text-zinc-400 mb-4">
              {modal.user.name} ({modal.user.email})
            </p>

            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Amount (positive to add, negative to deduct)
            </label>
            <input
              type="number"
              value={modal.amount}
              onChange={(e) => setModal((m) => m ? { ...m, amount: e.target.value } : null)}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm mb-4"
              placeholder="e.g. 100 or -50"
            />

            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={modal.reason}
              onChange={(e) => setModal((m) => m ? { ...m, reason: e.target.value } : null)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm mb-4 resize-none"
              placeholder="Reason for adjustment..."
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white text-sm font-medium min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjust}
                disabled={modal.submitting || !modal.reason.trim() || !modal.amount || Number(modal.amount) === 0}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium min-h-[44px]"
              >
                {modal.submitting ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
