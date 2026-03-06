'use client'

import { useEffect, useState } from 'react'

interface ToolCost {
  id: string
  displayName: string
  creditCost: number
}

export function ToolPricing() {
  const [tools, setTools] = useState<ToolCost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editedCosts, setEditedCosts] = useState<Record<string, number>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTools() {
      try {
        const res = await fetch('/api/tools/pricing')
        if (!res.ok) throw new Error('Failed to fetch tool pricing')
        const data = await res.json()
        setTools(data.tools ?? data ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tools')
      } finally {
        setLoading(false)
      }
    }
    fetchTools()
  }, [])

  function handleCostChange(toolId: string, value: number) {
    setEditedCosts((prev) => ({ ...prev, [toolId]: value }))
  }

  async function handleSave(tool: ToolCost) {
    const newCost = editedCosts[tool.id]
    if (newCost === undefined || newCost === tool.creditCost) return

    setSavingId(tool.id)
    try {
      const res = await fetch(`/api/tools/${tool.id}/pricing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creditCost: newCost }),
      })
      if (!res.ok) throw new Error('Failed to update pricing')
      setTools((prev) =>
        prev.map((t) => (t.id === tool.id ? { ...t, creditCost: newCost } : t))
      )
      setEditedCosts((prev) => {
        const next = { ...prev }
        delete next[tool.id]
        return next
      })
    } catch {
      setError('Failed to save pricing for ' + tool.displayName)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Tool Pricing</h1>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="text-left px-4 py-3 font-medium text-zinc-400">Tool ID</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-400">Display Name</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-400">Credit Cost</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">Loading...</td>
              </tr>
            ) : tools.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">No tools found</td>
              </tr>
            ) : (
              tools.map((tool) => {
                const currentCost = editedCosts[tool.id] ?? tool.creditCost
                const isModified = editedCosts[tool.id] !== undefined && editedCosts[tool.id] !== tool.creditCost

                return (
                  <tr key={tool.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{tool.id}</td>
                    <td className="px-4 py-3 text-white">{tool.displayName}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        value={currentCost}
                        onChange={(e) => handleCostChange(tool.id, Number(e.target.value))}
                        className="w-24 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-blue-500 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleSave(tool)}
                        disabled={!isModified || savingId === tool.id}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors min-h-[36px]"
                      >
                        {savingId === tool.id ? 'Saving...' : 'Save'}
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
