'use client'

import { useState } from 'react'
import { QUESTIONS, STANDARD_LABELS, evaluateStandard } from './questions'
import { CITY_ZONES, calculateHeatingKw } from './climate-zones'
import type { StandardId, HeatingCalcResult, ChecklistAnswers } from './types'

// ─── Shared Styles ─────────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-xl bg-[#131a23] border border-[#1e2631] text-white px-3 py-2.5 min-h-[44px] text-sm focus:outline-none focus:border-[#3D6AF2] transition-colors'

// ─── Constants ─────────────────────────────────────────────────────────────────

const STANDARD_ORDER: StandardId[] = ['heating', 'insulation', 'ventilation', 'moisture', 'draught']

const STANDARD_ICONS: Record<StandardId, string> = {
  heating: '🔥',
  insulation: '🏠',
  ventilation: '💨',
  moisture: '💧',
  draught: '🌬️',
}

// ─── Status Colours ────────────────────────────────────────────────────────────

function statusColor(status: string): string {
  if (status === 'compliant') return 'text-green-400 bg-green-400/10 border-green-400/30'
  if (status === 'non-compliant') return 'text-red-400 bg-red-400/10 border-red-400/30'
  if (status === 'warning') return 'text-amber-400 bg-amber-400/10 border-amber-400/30'
  return 'text-[#a6abb5] bg-[#1e2631]/60 border-[#1e2631]'
}

function circleColor(status: string): string {
  if (status === 'compliant') return 'bg-green-500 border-green-500 text-white'
  if (status === 'non-compliant') return 'bg-red-500 border-red-500 text-white'
  if (status === 'warning') return 'bg-amber-500 border-amber-500 text-white'
  return 'bg-[#131a23] border-[#1e2631] text-[#a6abb5]'
}

function statusLabel(status: string): string {
  if (status === 'compliant') return 'Pass'
  if (status === 'non-compliant') return 'Fail'
  if (status === 'warning') return 'Warning'
  return 'Not Checked'
}

// ─── Progress Bar ──────────────────────────────────────────────────────────────

function ProgressBar({
  activeStandard,
  results,
  onSelect,
}: {
  activeStandard: string | null
  results: Record<StandardId, { status: string; issues: string[] }>
  onSelect: (id: StandardId) => void
}) {
  return (
    <div className="flex items-center justify-between gap-1 mb-6">
      {STANDARD_ORDER.map((id, i) => {
        const result = results[id]
        const isActive = activeStandard === id
        return (
          <div key={id} className="flex flex-1 flex-col items-center gap-1.5">
            <button
              onClick={() => onSelect(id)}
              aria-label={`${STANDARD_LABELS[id]} — ${statusLabel(result.status)}`}
              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] focus:ring-offset-2 focus:ring-offset-[#0a0f18] ${circleColor(result.status)} ${isActive ? 'ring-2 ring-[#3D6AF2] ring-offset-2 ring-offset-[#0a0f18] scale-110' : ''}`}
            >
              {i + 1}
            </button>
            <span className="text-[10px] text-[#a6abb5] text-center leading-tight hidden sm:block">
              {STANDARD_LABELS[id]}
            </span>
            {i < STANDARD_ORDER.length - 1 && (
              <div className="absolute" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Heating Calculator ────────────────────────────────────────────────────────

function HeatingCalculator({
  answers,
  onChange,
  heatingCalc,
  onCalcResult,
}: {
  answers: ChecklistAnswers
  onChange: (id: string, value: string | number) => void
  heatingCalc: HeatingCalcResult | null
  onCalcResult: (result: HeatingCalcResult | null) => void
}) {
  const length = typeof answers['hc_length'] === 'number' ? (answers['hc_length'] as number) : undefined
  const width = typeof answers['hc_width'] === 'number' ? (answers['hc_width'] as number) : undefined
  const height = typeof answers['hc_height'] === 'number' ? (answers['hc_height'] as number) : undefined
  const city = (answers['hc_city'] as string) || ''

  const selectedZone = CITY_ZONES.find(c => c.city === city)?.zone

  function handleDimChange(field: string, val: string) {
    const num = parseFloat(val)
    onChange(field, isNaN(num) ? '' : num)

    const l = field === 'hc_length' ? num : length
    const w = field === 'hc_width' ? num : width
    const h = field === 'hc_height' ? num : height
    const z = selectedZone

    if (l && w && h && z && !isNaN(l) && !isNaN(w) && !isNaN(h)) {
      onCalcResult(calculateHeatingKw(l, w, h, z))
    } else {
      onCalcResult(null)
    }
  }

  function handleCityChange(val: string) {
    onChange('hc_city', val)
    const zone = CITY_ZONES.find(c => c.city === val)?.zone
    if (length && width && height && zone) {
      onCalcResult(calculateHeatingKw(length as number, width as number, height as number, zone))
    } else {
      onCalcResult(null)
    }
  }

  const heaterType = (answers['h2'] as string) || ''
  const heaterLabel: Record<string, string> = {
    'heat-pump': 'Heat pump',
    'flued-gas': 'Flued gas heater',
    'pellet-burner': 'Pellet burner',
    'wood-burner': 'Wood burner / log fire',
    'electric-panel': 'Fixed electric panel heater',
  }

  // Heat pumps and wood burners are typically sufficient; panel heaters often underpowered
  function getHeaterHint(): { pass: boolean; text: string } | null {
    if (!heatingCalc || !heaterType || heaterType === 'none') return null
    if (heaterType === 'electric-panel') {
      return { pass: false, text: `Electric panel heaters typically cannot achieve the required ${heatingCalc.requiredKw} kW. Consider a heat pump.` }
    }
    return { pass: true, text: `${heaterLabel[heaterType] || 'Your heater'} is an acceptable fixed heater type. Verify rated output ≥ ${heatingCalc.requiredKw} kW.` }
  }

  const hint = getHeaterHint()

  return (
    <div className="bg-[#0d1117] border border-[#3D6AF2]/20 rounded-xl p-4 mt-3">
      <p className="text-white text-sm font-semibold mb-3">🔥 Heating Calculator</p>

      {/* Dimension inputs */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { field: 'hc_length', label: 'Length (m)' },
          { field: 'hc_width', label: 'Width (m)' },
          { field: 'hc_height', label: 'Height (m)' },
        ].map(({ field, label }) => (
          <div key={field}>
            <label className="block text-[11px] text-[#a6abb5] mb-1">{label}</label>
            <input
              type="number"
              min={0}
              step={0.1}
              className={inputCls}
              value={answers[field] !== undefined && answers[field] !== '' ? String(answers[field]) : ''}
              onChange={e => handleDimChange(field, e.target.value)}
              placeholder="0.0"
            />
          </div>
        ))}
      </div>

      {/* City selector */}
      <div className="mb-3">
        <label className="block text-[11px] text-[#a6abb5] mb-1">City / Region</label>
        <div className="flex gap-2 items-center">
          <select
            className={`${inputCls} flex-1`}
            value={city}
            onChange={e => handleCityChange(e.target.value)}
          >
            <option value="">Select city…</option>
            {CITY_ZONES.map(c => (
              <option key={c.city} value={c.city}>{c.city}</option>
            ))}
          </select>
          {selectedZone && (
            <span className="rounded-full bg-[#3D6AF2]/20 text-[#3D9DF2] text-xs font-semibold px-2.5 py-1 whitespace-nowrap">
              Zone {selectedZone}
            </span>
          )}
        </div>
      </div>

      {/* Result */}
      {heatingCalc && (
        <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-3 space-y-1">
          <p className="text-[#a6abb5] text-xs">
            Room volume: <span className="text-white font-medium">{heatingCalc.volume.toFixed(1)} m³</span>
          </p>
          <p className="text-[#a6abb5] text-xs">
            Required heater output:{' '}
            <span className="text-[#3D6AF2] text-base font-bold">{heatingCalc.requiredKw} kW</span>
          </p>
          {hint && (
            <p className={`text-xs mt-1 ${hint.pass ? 'text-green-400' : 'text-red-400'}`}>
              {hint.pass ? '✓' : '✗'} {hint.text}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Question Renderer ─────────────────────────────────────────────────────────

function QuestionItem({
  question,
  value,
  onChange,
}: {
  question: (typeof QUESTIONS)[number]
  value: string | number | boolean | undefined
  onChange: (val: string | number) => void
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-white text-sm font-medium">{question.question}</p>

      {question.type === 'radio' && question.options && (
        <div className="flex flex-wrap gap-2">
          {question.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium min-h-[44px] border transition-colors ${
                value === opt.value
                  ? 'bg-[#3D6AF2] text-white border-[#3D6AF2]'
                  : 'bg-[#131a23] text-[#a6abb5] border-[#1e2631] hover:border-[#3D6AF2]/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {question.type === 'select' && question.options && (
        <select
          className={inputCls}
          value={typeof value === 'string' ? value : ''}
          onChange={e => onChange(e.target.value)}
        >
          <option value="">Select…</option>
          {question.options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {question.type === 'number' && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            step={0.1}
            className={`${inputCls} flex-1`}
            value={value !== undefined ? String(value) : ''}
            onChange={e => {
              const n = parseFloat(e.target.value)
              onChange(isNaN(n) ? '' : n)
            }}
            placeholder={question.unit ? `0.0 ${question.unit}` : '0'}
          />
          {question.unit && (
            <span className="text-[#a6abb5] text-sm shrink-0">{question.unit}</span>
          )}
        </div>
      )}

      {question.hint && (
        <p className="text-[#a6abb5] text-xs leading-relaxed">{question.hint}</p>
      )}
    </div>
  )
}

// ─── Standard Section Card ─────────────────────────────────────────────────────

function StandardCard({
  standardId,
  index,
  isOpen,
  onToggle,
  answers,
  onChange,
  result,
  heatingCalc,
  onCalcResult,
}: {
  standardId: StandardId
  index: number
  isOpen: boolean
  onToggle: () => void
  answers: ChecklistAnswers
  onChange: (id: string, value: string | number) => void
  result: { status: string; issues: string[] }
  heatingCalc: HeatingCalcResult | null
  onCalcResult: (result: HeatingCalcResult | null) => void
}) {
  const questions = QUESTIONS.filter(q => q.standard === standardId)
  const label = STANDARD_LABELS[standardId]
  const icon = STANDARD_ICONS[standardId]

  return (
    <div className="rounded-xl bg-[#0e1520] border border-[#1e2631] overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#131a23] transition-colors text-left min-h-[44px]"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#3D6AF2]/20 text-[#3D9DF2] text-xs font-bold shrink-0">
            {index + 1}
          </span>
          <span className="text-sm font-bold text-white">
            {icon} {label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor(result.status)}`}>
            {statusLabel(result.status)}
          </span>
          <svg
            className={`w-4 h-4 text-[#a6abb5] transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-5 pb-5 space-y-4 border-t border-[#1e2631] pt-4">
          {questions.map(q => (
            <QuestionItem
              key={q.id}
              question={q}
              value={answers[q.id]}
              onChange={val => onChange(q.id, val)}
            />
          ))}

          {standardId === 'heating' && (
            <HeatingCalculator
              answers={answers}
              onChange={onChange}
              heatingCalc={heatingCalc}
              onCalcResult={onCalcResult}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ─── Results Summary ───────────────────────────────────────────────────────────

function ResultsSummary({
  results,
}: {
  results: Record<StandardId, { status: string; issues: string[] }>
}) {
  const failCount = STANDARD_ORDER.filter(
    id => results[id].status === 'non-compliant',
  ).length
  const allChecked = STANDARD_ORDER.every(id => results[id].status !== 'not-checked')
  const isCompliant = allChecked && failCount === 0

  return (
    <div className="rounded-xl bg-[#0e1520] border-t-2 border-t-[#3D6AF2] border-x border-b border-[#1e2631] p-5 mt-6">
      <h3 className="text-white text-base font-bold mb-4">Compliance Summary</h3>
      <div className="space-y-2 mb-5">
        {STANDARD_ORDER.map(id => {
          const result = results[id]
          const firstIssue = result.issues[0]
          return (
            <div key={id} className="flex items-start gap-3 py-2 border-b border-[#1e2631] last:border-0">
              <span className="text-lg shrink-0">{STANDARD_ICONS[id]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{STANDARD_LABELS[id]}</p>
                {firstIssue && (
                  <p className="text-red-400 text-xs mt-0.5 truncate" title={firstIssue}>
                    {firstIssue}
                  </p>
                )}
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${statusColor(result.status)}`}>
                {statusLabel(result.status)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Overall result */}
      <div className={`rounded-xl px-4 py-3 mb-4 border ${isCompliant && allChecked ? 'bg-green-500/10 border-green-500/30' : failCount > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-[#131a23] border-[#1e2631]'}`}>
        {allChecked ? (
          isCompliant ? (
            <p className="text-green-400 font-semibold text-sm">✓ Compliant — All standards met</p>
          ) : (
            <p className="text-red-400 font-semibold text-sm">
              ✗ Not Compliant — {failCount} standard{failCount !== 1 ? 's' : ''} need{failCount === 1 ? 's' : ''} attention
            </p>
          )
        ) : (
          <p className="text-[#a6abb5] text-sm">Complete all standards above to see your compliance result.</p>
        )}
      </div>

      <a
        href="#statement"
        className="flex items-center justify-center gap-2 text-[#3D6AF2] text-sm font-semibold hover:text-[#3D9DF2] transition-colors"
      >
        Generate Compliance Statement →
      </a>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ComplianceChecker() {
  const [answers, setAnswers] = useState<ChecklistAnswers>({})
  const [activeStandard, setActiveStandard] = useState<string | null>('heating')
  const [heatingCalc, setHeatingCalc] = useState<HeatingCalcResult | null>(null)

  function handleChange(id: string, value: string | number) {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  function toggleStandard(id: StandardId) {
    setActiveStandard(prev => (prev === id ? null : id))
  }

  // Evaluate all standards from current answers
  const results = Object.fromEntries(
    STANDARD_ORDER.map(id => [id, evaluateStandard(id, answers)]),
  ) as Record<StandardId, { status: string; issues: string[] }>

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2">
      {/* Progress bar */}
      <ProgressBar
        activeStandard={activeStandard}
        results={results}
        onSelect={id => {
          setActiveStandard(id)
        }}
      />

      {/* Standard sections */}
      <div className="space-y-3">
        {STANDARD_ORDER.map((id, i) => (
          <StandardCard
            key={id}
            standardId={id}
            index={i}
            isOpen={activeStandard === id}
            onToggle={() => toggleStandard(id)}
            answers={answers}
            onChange={handleChange}
            result={results[id]}
            heatingCalc={id === 'heating' ? heatingCalc : null}
            onCalcResult={id === 'heating' ? setHeatingCalc : () => {}}
          />
        ))}
      </div>

      {/* Results summary */}
      <ResultsSummary results={results} />
    </div>
  )
}
