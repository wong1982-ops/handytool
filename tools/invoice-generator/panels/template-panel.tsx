'use client'

import { useState } from 'react'
import { useInvoice } from '../invoice-provider'

export function TemplatePanel() {
  const { templates, saveTemplate, loadTemplate, deleteTemplate } = useInvoice()
  const [showNameInput, setShowNameInput] = useState(false)
  const [name, setName] = useState('')

  const handleSave = () => {
    if (!name.trim()) return
    saveTemplate(name.trim())
    setName('')
    setShowNameInput(false)
  }

  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70767f] mb-2 flex items-center gap-2">
        <span>Saved Templates</span>
      </div>
      <div className="bg-[#131a23] rounded-xl p-4 space-y-2">
        {templates.length === 0 && (
          <p className="text-xs text-[#70767f] text-center py-2">
            No templates saved yet. Save your current invoice as a template to reuse it later.
          </p>
        )}
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="flex items-center justify-between py-2.5 px-3 bg-[#090f16] rounded-lg"
          >
            <div className="min-w-0 flex-1">
              <span className="text-sm text-white font-medium block truncate">{tpl.name}</span>
              <span className="text-xs text-[#70767f] block">
                {new Date(tpl.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <button
                onClick={() => loadTemplate(tpl)}
                className="text-xs text-[#3D6AF2] hover:text-[#3D79F2] font-medium min-h-[44px] px-2"
              >
                Load
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete template "${tpl.name}"?`)) deleteTemplate(tpl.id)
                }}
                className="text-[#70767f] hover:text-red-400 min-h-[44px] px-2"
                aria-label="Delete template"
              >
                ×
              </button>
            </div>
          </div>
        ))}

        {showNameInput ? (
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              autoFocus
              className="flex-1 min-h-[44px] px-3.5 py-2.5 bg-[#090f16] border border-[#1e2631] rounded-lg text-white text-sm placeholder:text-[#70767f] focus:border-[#3D6AF2] outline-none"
              placeholder="Template name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') {
                  setName('')
                  setShowNameInput(false)
                }
              }}
            />
            <button
              onClick={handleSave}
              className="px-4 min-h-[44px] bg-[#3D6AF2] hover:bg-[#3D79F2] text-white text-sm font-medium rounded-lg"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNameInput(true)}
            className="w-full text-white text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 min-h-[44px] mt-2"
            style={{ background: 'linear-gradient(135deg, #3D6AF2, #3D9DF2)' }}
          >
            Save Current as Template
          </button>
        )}
      </div>
    </div>
  )
}
