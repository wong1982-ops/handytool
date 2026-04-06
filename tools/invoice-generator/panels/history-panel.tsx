'use client'

// Stub for invoice history. Server persistence is wired up in a later phase
// when Supabase tables and the user-auth gating land.

export function HistoryPanel() {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70767f] mb-2 flex items-center gap-2">
        <span>Invoice History</span>
        <span className="text-[10px] bg-[#3D6AF2]/20 text-[#3D6AF2] px-2 py-0.5 rounded-full font-medium normal-case tracking-normal">
          Sign in required
        </span>
      </div>
      <div className="bg-[#131a23] rounded-xl p-4">
        <p className="text-xs text-[#70767f] text-center py-2">
          Sign in to save and view your invoice history.
        </p>
      </div>
    </div>
  )
}
