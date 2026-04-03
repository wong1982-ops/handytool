'use client'

import { useEffect, useMemo, useState } from 'react'
import type { FaviconConfig } from './types'
import { renderFaviconDataUrl } from './favicon-canvas'

interface PreviewPanelProps {
  config: FaviconConfig
}

export default function PreviewPanel({ config }: PreviewPanelProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const favicon16 = useMemo(() => mounted ? renderFaviconDataUrl(config, 16) : '', [config, mounted])
  const favicon60 = useMemo(() => mounted ? renderFaviconDataUrl(config, 60) : '', [config, mounted])

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[#1e2631] bg-slate-50 dark:bg-[#131a23] overflow-hidden">
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-white min-h-[44px]"
        aria-expanded={!collapsed}
      >
        Preview
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${collapsed ? '' : 'rotate-180'}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Desktop label */}
      <div className="hidden lg:block px-4 pt-4 pb-2">
        <h2 className="text-sm font-semibold text-white">Preview</h2>
      </div>

      {/* Preview content */}
      <div className={`px-4 pb-4 space-y-4 ${collapsed ? 'hidden lg:block' : ''}`}>
        {/* Browser Tab */}
        <PreviewCard label="Browser Tab">
          <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-[#1e2631]">
            {/* Tab bar */}
            <div className="flex items-end gap-px bg-[#0d1520] px-2 pt-2">
              {/* Active tab */}
              <div className="flex items-center gap-1.5 bg-slate-200 dark:bg-[#1e2631] rounded-t-md px-3 py-1.5 max-w-[160px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={favicon16} alt="" width={14} height={14} className="shrink-0" />
                <span className="text-[10px] font-medium text-slate-500 dark:text-[#a6abb5] truncate">
                  My Website
                </span>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-400 dark:text-[#70767f] shrink-0">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              {/* Inactive tab */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#131a23] rounded-t-md px-3 py-1.5 opacity-50">
                <span className="text-[10px] text-slate-400 dark:text-[#70767f]">New Tab</span>
              </div>
            </div>
            {/* URL bar */}
            <div className="bg-slate-50 dark:bg-[#131a23] px-3 py-2">
              <div className="flex items-center gap-1.5 bg-white dark:bg-[#090f16] rounded px-2 py-1 border border-slate-200 dark:border-[#1e2631]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-[#70767f] shrink-0">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="text-[9px] text-slate-400 dark:text-[#70767f]">mywebsite.com</span>
              </div>
            </div>
          </div>
        </PreviewCard>

        {/* Bookmarks Bar */}
        <PreviewCard label="Bookmarks">
          <div className="bg-white dark:bg-[#090f16] rounded-lg px-3 py-2 border border-slate-200 dark:border-[#1e2631]">
            <div className="border-b border-slate-200 dark:border-[#1e2631] mb-1.5 pb-1" />
            <div className="flex items-center gap-2 overflow-hidden">
              <BookmarkPill icon={<img src={favicon16} alt="" width={12} height={12} />} label="My Site" active />
              <BookmarkPill icon={<FolderIcon />} label="News" />
              <BookmarkPill icon={<FolderIcon />} label="GitHub" />
              <BookmarkPill icon={<FolderIcon />} label="Gmail" />
            </div>
          </div>
        </PreviewCard>

        {/* Mobile Home Screen */}
        <PreviewCard label="Mobile Home Screen">
          <div className="flex justify-center">
            <div className="w-[120px] h-[200px] rounded-2xl border-2 border-slate-200 dark:border-[#1e2631] bg-white dark:bg-[#090f16] flex flex-col items-center justify-center p-3 relative">
              {/* Status bar notch */}
              <div className="absolute top-1.5 w-12 h-1 rounded-full bg-slate-200 dark:bg-[#1e2631]" />
              {/* App grid */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    {i === 4 ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={favicon60}
                          alt="Your favicon"
                          width={24}
                          height={24}
                          className="rounded-md"
                        />
                        <span className="text-[5px] text-slate-500 dark:text-[#a6abb5] leading-tight">My App</span>
                      </>
                    ) : (
                      <>
                        <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-[#1e2631]" />
                        <span className="text-[5px] text-slate-400 dark:text-[#70767f] leading-tight">App</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PreviewCard>

        {/* Google Search */}
        <PreviewCard label="Google Search Result">
          <div className="bg-white dark:bg-[#090f16] rounded-lg p-3 border border-slate-200 dark:border-[#1e2631]">
            <div className="flex items-center gap-2 mb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={favicon16} alt="" width={14} height={14} className="shrink-0 rounded-sm" />
              <span className="text-[10px] text-slate-400 dark:text-[#70767f]">mywebsite.com</span>
            </div>
            <p className="text-xs font-medium text-[#3D9DF2] mb-0.5">
              My Website &mdash; Home
            </p>
            <p className="text-[9px] text-slate-400 dark:text-[#70767f] leading-relaxed">
              Welcome to My Website. Discover great tools and resources for your everyday needs.
            </p>
          </div>
        </PreviewCard>
      </div>
    </div>
  )
}

// -- Sub-components --

function PreviewCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] font-semibold text-slate-400 dark:text-[#70767f] uppercase tracking-[0.08em]">
        {label}
      </span>
      {children}
    </div>
  )
}

function BookmarkPill({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-1 rounded px-2 py-0.5 text-[9px] shrink-0 ${
        active
          ? 'bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-[#1e2631] text-slate-500 dark:text-[#a6abb5] font-medium'
          : 'text-slate-400 dark:text-[#70767f]'
      }`}
    >
      <span className="shrink-0 w-3 h-3 flex items-center justify-center">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  )
}

function FolderIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-[#70767f]">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )
}
