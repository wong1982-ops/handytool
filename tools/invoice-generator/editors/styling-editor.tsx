'use client'

import { useInvoice } from '../invoice-provider'
import { COLOR_PRESETS, DEFAULT_LABELS } from '../invoice-defaults'
import type {
  InvoiceTemplateId,
  LogoPosition,
  FontFamily,
  FontSize,
  InvoiceLabels,
} from '../invoice-types'

const INPUT_CLASS =
  'w-full min-h-[44px] px-3.5 py-2.5 bg-[#090f16] border border-[#1e2631] rounded-lg text-white text-sm placeholder:text-[#70767f] focus:border-[#3D6AF2] outline-none transition-colors'

const SELECT_CLASS =
  'w-full min-h-[44px] px-3.5 py-2.5 pr-10 bg-[#090f16] border border-[#1e2631] rounded-lg text-white text-sm appearance-none focus:border-[#3D6AF2] outline-none transition-colors bg-[right_12px_center] bg-no-repeat bg-[length:16px]'

const CHEVRON_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2370767f'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`

const TEMPLATES: { id: InvoiceTemplateId; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'modern', label: 'Modern' },
  { id: 'minimal', label: 'Minimal' },
]

const LOGO_POSITIONS: { id: LogoPosition; label: string }[] = [
  { id: 'top-left', label: 'Top Left' },
  { id: 'top-center', label: 'Top Center' },
  { id: 'top-right', label: 'Top Right' },
]

const FONT_SIZES: { id: FontSize; label: string }[] = [
  { id: 'sm', label: 'Small' },
  { id: 'md', label: 'Medium' },
  { id: 'lg', label: 'Large' },
]

const LABEL_FIELDS: { key: keyof InvoiceLabels; label: string }[] = [
  { key: 'invoice', label: 'Title' },
  { key: 'from', label: 'From' },
  { key: 'billTo', label: 'Bill To' },
  { key: 'date', label: 'Date' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'description', label: 'Description' },
  { key: 'qty', label: 'Qty' },
  { key: 'rate', label: 'Rate' },
  { key: 'amount', label: 'Amount' },
  { key: 'subtotal', label: 'Subtotal' },
  { key: 'tax', label: 'Tax' },
  { key: 'discount', label: 'Discount' },
  { key: 'total', label: 'Total' },
  { key: 'notes', label: 'Notes' },
]

export function StylingEditor() {
  const { state, dispatch } = useInvoice()
  const { theme, labels } = state.invoice

  const setTheme = (changes: Parameters<typeof dispatch>[0] extends { type: 'SET_THEME'; payload: infer P } ? P : never) => {
    dispatch({ type: 'SET_THEME', payload: changes })
  }

  const setLabels = (changes: Partial<InvoiceLabels>) => {
    dispatch({ type: 'SET_LABELS', payload: changes })
  }

  return (
    <div className="space-y-6">
      {/* Template Picker */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70767f] mb-2">
          Invoice Template
        </div>
        <div className="grid grid-cols-3 gap-3">
          {TEMPLATES.map((tpl) => {
            const active = theme.templateId === tpl.id
            return (
              <button
                key={tpl.id}
                onClick={() => setTheme({ templateId: tpl.id })}
                className={`bg-white p-2 rounded-lg flex flex-col items-center transition-colors min-h-[44px] ${
                  active ? 'border-2 border-[#3D6AF2]' : 'border-2 border-transparent hover:border-[#1e2631]'
                }`}
              >
                <div className="w-full h-20 bg-gray-100 rounded mb-2 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">{tpl.label}</span>
                </div>
                <span className={`text-xs font-medium ${active ? 'text-[#3D6AF2]' : 'text-gray-500'}`}>
                  {tpl.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Logo Position */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70767f] mb-2">
          Logo Position
        </div>
        <div className="flex gap-2">
          {LOGO_POSITIONS.map((pos) => {
            const active = theme.logoPosition === pos.id
            return (
              <button
                key={pos.id}
                onClick={() => setTheme({ logoPosition: pos.id })}
                className={`flex-1 min-h-[44px] px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-[#3D6AF2]/20 border border-[#3D6AF2] text-white'
                    : 'bg-[#090f16] border border-[#1e2631] text-[#a6abb5] hover:text-white'
                }`}
              >
                {pos.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Colors */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70767f] mb-2">
          Colors
        </div>
        <div className="bg-[#131a23] rounded-xl p-4 space-y-3">
          {(
            [
              { key: 'primaryColor' as const, label: 'Primary' },
              { key: 'accentColor' as const, label: 'Accent' },
              { key: 'textColor' as const, label: 'Text' },
              { key: 'backgroundColor' as const, label: 'Background' },
            ]
          ).map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="text-sm text-[#a6abb5]">{label}</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme[key]}
                  onChange={(e) => setTheme({ [key]: e.target.value })}
                  className="w-9 h-9 rounded cursor-pointer bg-transparent border border-[#1e2631]"
                />
                <input
                  type="text"
                  value={theme[key]}
                  onChange={(e) => setTheme({ [key]: e.target.value })}
                  className={`${INPUT_CLASS} !w-24 text-center text-xs uppercase`}
                />
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-[#1e2631]">
            <div className="text-xs text-[#70767f] mb-2">Presets</div>
            <div className="flex gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setTheme({ primaryColor: preset.primary, accentColor: preset.accent })}
                  className="w-9 h-9 rounded-lg border-2 border-[#1e2631] hover:border-[#3D6AF2] transition-colors"
                  style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.accent})` }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70767f] mb-2">
          Typography
        </div>
        <div className="bg-[#131a23] rounded-xl p-4 space-y-3">
          <div>
            <label className="text-xs text-[#70767f] mb-1 block">Font Family</label>
            <select
              className={SELECT_CLASS}
              style={{ backgroundImage: CHEVRON_BG }}
              value={theme.fontFamily}
              onChange={(e) => setTheme({ fontFamily: e.target.value as FontFamily })}
            >
              <option value="system">System Sans</option>
              <option value="serif">Serif</option>
              <option value="mono">Monospace</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[#70767f] mb-1 block">Font Size</label>
            <div className="flex gap-2">
              {FONT_SIZES.map((size) => {
                const active = theme.fontSize === size.id
                return (
                  <button
                    key={size.id}
                    onClick={() => setTheme({ fontSize: size.id })}
                    className={`flex-1 min-h-[44px] px-3 py-2 rounded-lg text-sm transition-colors ${
                      active
                        ? 'bg-[#3D6AF2]/20 border border-[#3D6AF2] text-white'
                        : 'bg-[#090f16] border border-[#1e2631] text-[#a6abb5] hover:text-white'
                    }`}
                  >
                    {size.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Labels */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70767f] mb-2 flex items-center justify-between">
          <span>Custom Labels</span>
          <button
            onClick={() => setLabels({ ...DEFAULT_LABELS })}
            className="text-[#3D6AF2] text-xs font-normal hover:underline normal-case tracking-normal"
          >
            Reset to English
          </button>
        </div>
        <div className="bg-[#131a23] rounded-xl p-4">
          <div className="grid grid-cols-2 gap-2">
            {LABEL_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="text-[10px] text-[#70767f] mb-0.5 block">{label}</label>
                <input
                  type="text"
                  className={INPUT_CLASS}
                  value={labels[key]}
                  onChange={(e) => setLabels({ [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
