'use client'

import { useState, useRef } from 'react'
import type { TaxEntity, EntityType, GstBasis, GstPeriod } from './types'

// ─── Props ─────────────────────────────────────────────────────────

interface SettingsPanelProps {
  entities: TaxEntity[]
  selectedEntityId: string | null
  onEntityCreated: (entity: TaxEntity) => void
  onEntityUpdated: (entity: TaxEntity) => void
  onEntitySelect: (id: string) => void
}

// ─── IRD Number Formatting ─────────────────────────────────────────

function formatIrdNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
}

function isValidIrdNumber(value: string): boolean {
  return /^\d{3}-\d{3}-\d{3}$/.test(value)
}

// ─── Component ─────────────────────────────────────────────────────

export default function SettingsPanel({
  entities,
  selectedEntityId,
  onEntityCreated,
  onEntityUpdated,
  onEntitySelect,
}: SettingsPanelProps) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [entityType, setEntityType] = useState<EntityType>('sole-trader')
  const [irdNumber, setIrdNumber] = useState('')
  const irdInputRef = useRef<HTMLInputElement>(null)
  const [gstRegistered, setGstRegistered] = useState(false)
  const [gstBasis, setGstBasis] = useState<GstBasis>('invoice')
  const [gstPeriod, setGstPeriod] = useState<GstPeriod>('2-monthly')

  const [editingEntityId, setEditingEntityId] = useState<string | null>(null)

  const showSetupForm = entities.length === 0 || editing

  function resetForm() {
    setName('')
    setEntityType('sole-trader')
    setIrdNumber('')
    setGstRegistered(false)
    setGstBasis('invoice')
    setGstPeriod('2-monthly')
    setEditingEntityId(null)
    setError(null)
  }

  function populateForm(entity: TaxEntity) {
    setName(entity.name)
    setEntityType(entity.type)
    const ird = entity.ird_number ?? ''
    setIrdNumber(ird)
    if (irdInputRef.current) irdInputRef.current.value = ird
    setGstRegistered(entity.gst_registered)
    setGstBasis(entity.gst_basis)
    setGstPeriod(entity.gst_period)
    setEditingEntityId(entity.id)
  }

  function handleEdit() {
    const entity = entities.find((e) => e.id === selectedEntityId)
    if (entity) {
      populateForm(entity)
      setEditing(true)
    }
  }

  function handleCancel() {
    resetForm()
    setEditing(false)
  }

  async function handleSave() {
    setError(null)

    if (!name.trim()) {
      setError('Entity name is required')
      return
    }

    if (irdNumber && !isValidIrdNumber(irdNumber)) {
      setError('IRD number must be in format XXX-XXX-XXX')
      return
    }

    setSaving(true)

    const payload = {
      name: name.trim(),
      type: entityType,
      ird_number: irdNumber || null,
      gst_registered: gstRegistered,
      gst_basis: gstBasis,
      gst_period: gstPeriod,
    }

    try {
      const isEdit = !!editingEntityId
      const url = '/api/v1/tax-manager/entities'
      const method = isEdit ? 'PATCH' : 'POST'
      const body = isEdit ? { ...payload, id: editingEntityId } : payload

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? `Failed to ${isEdit ? 'update' : 'create'} entity`)
      }

      const json = await res.json()
      const entity = (json.data?.entity ?? json.data) as TaxEntity

      if (isEdit) {
        onEntityUpdated(entity)
      } else {
        onEntityCreated(entity)
      }

      resetForm()
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  // ─── Entity Selector (when entities exist and not editing) ───────

  if (!showSetupForm) {
    return (
      <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <label htmlFor="entity-select" className="text-sm font-medium text-[#a6abb5]">
            Entity
          </label>
          <select
            id="entity-select"
            value={selectedEntityId ?? ''}
            onChange={(e) => onEntitySelect(e.target.value)}
            className="flex-1 min-w-[200px] rounded-xl bg-[#131a23] border border-[#1e2631] text-white text-sm px-4 py-3 focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2] outline-none transition-colors cursor-pointer min-h-[44px]"
          >
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.type === 'sole-trader' ? 'Sole Trader' : 'Company'})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleEdit}
            className="border border-[#3D6AF2] text-[#3D6AF2] rounded-xl min-h-[44px] px-4 font-semibold text-sm hover:bg-[#3D6AF2]/10 transition-colors cursor-pointer"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => {
              resetForm()
              setEditing(true)
            }}
            className="border border-[#1e2631] text-[#a6abb5] rounded-xl min-h-[44px] px-4 font-semibold text-sm hover:bg-[#1e2631] transition-colors cursor-pointer"
          >
            + Add Entity
          </button>
        </div>

        {/* Show current entity details summary */}
        {selectedEntityId && (() => {
          const entity = entities.find((e) => e.id === selectedEntityId)
          if (!entity) return null
          return (
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#70767f]">
              {entity.ird_number && <span>IRD: {entity.ird_number}</span>}
              <span>{entity.gst_registered ? `GST: ${entity.gst_basis} basis, ${entity.gst_period}` : 'Not GST registered'}</span>
            </div>
          )
        })()}
      </div>
    )
  }

  // ─── Setup / Edit Form ───────────────────────────────────────────

  return (
    <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-4 sm:p-6">
      <h2 className="text-lg font-bold text-white mb-1">
        {editingEntityId ? 'Edit Entity' : entities.length === 0 ? 'Set Up Your Tax Entity' : 'Add New Entity'}
      </h2>
      <p className="text-sm text-[#a6abb5] mb-6">
        {entities.length === 0
          ? 'Enter your business details to get started with NZ tax management.'
          : 'Update the entity details below.'}
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Entity Name */}
        <div>
          <label htmlFor="entity-name" className="block text-sm font-medium text-[#a6abb5] mb-1.5">
            Entity Name
          </label>
          <input
            id="entity-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My Freelance Business"
            className="w-full rounded-xl bg-[#131a23] border border-[#1e2631] text-white text-sm px-4 py-3 placeholder:text-[#4a5060] focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2] outline-none transition-colors"
          />
        </div>

        {/* Entity Type */}
        <fieldset>
          <legend className="block text-sm font-medium text-[#a6abb5] mb-2">Entity Type</legend>
          <div className="flex gap-3">
            {([
              { value: 'sole-trader' as EntityType, label: 'Sole Trader' },
              { value: 'company' as EntityType, label: 'Company' },
            ]).map((opt) => (
              <label
                key={opt.value}
                className={`flex-1 flex items-center justify-center rounded-xl border min-h-[44px] px-4 text-sm font-semibold cursor-pointer transition-all ${
                  entityType === opt.value
                    ? 'border-[#3D6AF2] text-white bg-[#3D6AF2]/10 shadow-[0_0_0_3px_#3D6AF2,0_0_20px_rgba(61,106,242,0.4)]'
                    : 'border-[#1e2631] text-[#a6abb5] hover:border-[#3D6AF2]/50'
                }`}
              >
                <input
                  type="radio"
                  name="entity-type"
                  value={opt.value}
                  checked={entityType === opt.value}
                  onChange={() => setEntityType(opt.value)}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* IRD Number */}
        <div>
          <label htmlFor="ird-number" className="block text-sm font-medium text-[#a6abb5] mb-1.5">
            IRD Number
          </label>
          <input
            id="ird-number"
            ref={irdInputRef}
            type="text"
            defaultValue={irdNumber}
            onChange={(e) => {
              const input = e.target
              const cursorPos = input.selectionStart ?? 0

              // Count digits before cursor in the raw input
              const digitsBefore = input.value.slice(0, cursorPos).replace(/\D/g, '').length

              // Format
              const formatted = formatIrdNumber(input.value)

              // Find new cursor position: skip to where the same number of digits are
              let newCursor = 0
              let counted = 0
              for (let i = 0; i < formatted.length && counted < digitsBefore; i++) {
                newCursor = i + 1
                if (/\d/.test(formatted[i])) counted++
              }

              // Set value directly on the DOM element (bypass React controlled input)
              input.value = formatted
              input.setSelectionRange(newCursor, newCursor)

              // Sync to React state (for form submission)
              setIrdNumber(formatted)
            }}
            placeholder="XXX-XXX-XXX"
            maxLength={11}
            className="w-full rounded-xl bg-[#131a23] border border-[#1e2631] text-white text-sm px-4 py-3 placeholder:text-[#4a5060] focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2] outline-none transition-colors"
          />
        </div>

        {/* GST Registered Toggle */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
            <button
              type="button"
              role="switch"
              aria-checked={gstRegistered}
              onClick={() => setGstRegistered(!gstRegistered)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors cursor-pointer ${
                gstRegistered ? 'bg-[#3D6AF2]' : 'bg-[#1e2631]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  gstRegistered ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm font-medium text-[#a6abb5]">GST Registered</span>
          </label>
        </div>

        {/* GST Options (conditional) */}
        {gstRegistered && (
          <div className="space-y-5 pl-4 border-l-2 border-[#3D6AF2]/30">
            {/* Filing Basis */}
            <fieldset>
              <legend className="block text-sm font-medium text-[#a6abb5] mb-2">Filing Basis</legend>
              <div className="flex gap-3">
                {([
                  { value: 'invoice' as GstBasis, label: 'Invoice' },
                  { value: 'payments' as GstBasis, label: 'Payments' },
                ]).map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex-1 flex items-center justify-center rounded-xl border min-h-[44px] px-4 text-sm font-semibold cursor-pointer transition-all ${
                      gstBasis === opt.value
                        ? 'border-[#3D6AF2] text-white bg-[#3D6AF2]/10'
                        : 'border-[#1e2631] text-[#a6abb5] hover:border-[#3D6AF2]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gst-basis"
                      value={opt.value}
                      checked={gstBasis === opt.value}
                      onChange={() => setGstBasis(opt.value)}
                      className="sr-only"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Filing Period */}
            <div>
              <label htmlFor="gst-period" className="block text-sm font-medium text-[#a6abb5] mb-1.5">
                Filing Period
              </label>
              <select
                id="gst-period"
                value={gstPeriod}
                onChange={(e) => setGstPeriod(e.target.value as GstPeriod)}
                className="w-full rounded-xl bg-[#131a23] border border-[#1e2631] text-white text-sm px-4 py-3 focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2] outline-none transition-colors cursor-pointer min-h-[44px]"
              >
                <option value="1-monthly">Monthly</option>
                <option value="2-monthly">2-Monthly</option>
                <option value="6-monthly">6-Monthly</option>
              </select>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {(entities.length > 0) && (
            <button
              type="button"
              onClick={handleCancel}
              className="border border-[#3D6AF2] text-[#3D6AF2] rounded-xl min-h-[44px] px-6 font-semibold text-sm hover:bg-[#3D6AF2]/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white font-semibold rounded-xl min-h-[44px] px-6 text-sm transition-opacity cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? 'Saving...' : editingEntityId ? 'Update Entity' : 'Create Entity'}
          </button>
        </div>
      </div>
    </div>
  )
}
