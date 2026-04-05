'use client'

import React from 'react'

interface DashboardToolbarProps {
  onAddWidget: () => void
  onReset: () => void
  widgetCount: number
  maxWidgets: number
}

export function DashboardToolbar({
  onAddWidget,
  onReset,
  widgetCount,
  maxWidgets,
}: DashboardToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      {/* Left: Add Widget */}
      <button
        type="button"
        onClick={onAddWidget}
        className="h-11 px-4 flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-sm font-medium text-white hover:opacity-90 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        Add Widget
      </button>

      {/* Center: Widget count */}
      <span className="text-[13px] text-[#8892a4]">
        {widgetCount} / {maxWidgets} widgets
      </span>

      {/* Right: Reset Layout */}
      <button
        type="button"
        onClick={onReset}
        className="h-11 px-4 flex items-center gap-2 rounded-lg bg-[#131a23] border border-[#1e2631] text-sm text-[#8892a4] hover:text-white hover:border-[#2e3a4d] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset Layout
      </button>
    </div>
  )
}
