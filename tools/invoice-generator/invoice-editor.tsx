'use client'

import { useInvoice } from './invoice-provider'
import type { TabId } from './invoice-types'
import { SenderEditor } from './editors/sender-editor'
import { ClientEditor } from './editors/client-editor'
import { InvoiceInfoEditor } from './editors/invoice-info-editor'
import { LineItemsEditor } from './editors/line-items-editor'
import { StylingEditor } from './editors/styling-editor'
import { SettingsEditor } from './editors/settings-editor'

const TABS: { id: TabId; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'items', label: 'Line Items' },
  { id: 'styling', label: 'Styling' },
  { id: 'settings', label: 'Settings' },
]

export function InvoiceEditor() {
  const { state, dispatch } = useInvoice()
  const { activeTab } = state

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex gap-1 p-3 border-b border-[#1e2631] bg-[#131a23]/50 shrink-0 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
            className={`text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap min-h-[44px] transition-colors ${
              activeTab === tab.id
                ? 'bg-[#3D6AF2] text-white'
                : 'bg-[#131a23] text-[#70767f] hover:bg-[#1e2631] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'details' && (
          <div className="space-y-6">
            <SenderEditor />
            <ClientEditor />
            <InvoiceInfoEditor />
          </div>
        )}
        {activeTab === 'items' && <LineItemsEditor />}
        {activeTab === 'styling' && <StylingEditor />}
        {activeTab === 'settings' && <SettingsEditor />}
      </div>
    </div>
  )
}
