'use client'

import type { Compliance, ComplianceStatus } from './types'

interface CompliancePanelProps {
  compliance: Compliance
}

interface CheckItem {
  key: keyof Compliance
  label: string
  passText: string
  failText: string
  warnText: string
}

const CHECKS: CheckItem[] = [
  {
    key: 'centered',
    label: 'Face Centered',
    passText: 'Face is well centered in the frame.',
    failText: 'Face is not centered. Drag to reposition.',
    warnText: 'Face slightly off-center. Adjust position.',
  },
  {
    key: 'faceSize',
    label: 'Face Size',
    passText: 'Face size is within the required range.',
    failText: 'Face size is outside the required range.',
    warnText: 'Face size is borderline. Zoom to adjust.',
  },
  {
    key: 'headStraight',
    label: 'Head Straight',
    passText: 'Head angle is within acceptable range.',
    failText: 'Head is tilted too much. Face camera directly.',
    warnText: 'Slight head tilt detected.',
  },
  {
    key: 'eyesOpen',
    label: 'Eyes Open',
    passText: 'Eyes are open and visible.',
    failText: 'Eyes appear closed. Keep eyes open.',
    warnText: 'Eyes may be partially closed.',
  },
  {
    key: 'lighting',
    label: 'Even Lighting',
    passText: 'Lighting appears even across the face.',
    failText: 'Uneven lighting detected. Use even illumination.',
    warnText: 'Slightly uneven lighting. Consider adjusting.',
  },
]

const STATUS_CONFIG: Record<ComplianceStatus, { icon: React.ReactNode; color: string }> = {
  pass: {
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
    color: 'text-green-500',
  },
  warn: {
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
      </svg>
    ),
    color: 'text-amber-500',
  },
  fail: {
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
      </svg>
    ),
    color: 'text-red-500',
  },
  pending: {
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    color: 'text-slate-400 dark:text-slate-500',
  },
}

export function CompliancePanel({ compliance }: CompliancePanelProps) {
  const allPass = Object.values(compliance).every((s) => s === 'pass')
  const hasFailure = Object.values(compliance).some((s) => s === 'fail')

  return (
    <div className="space-y-3">
      {/* Header with status badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <svg className={`w-3.5 h-3.5 ${allPass ? 'text-green-500' : hasFailure ? 'text-red-500' : 'text-[var(--tk-color-secondary-500)]'}`} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
          </svg>
          Compliance Checklist
        </h3>
      </div>

      {/* Check items */}
      <div className="space-y-2">
        {CHECKS.map(({ key, label, passText, failText, warnText }) => {
          const status = compliance[key]
          const config = STATUS_CONFIG[status]
          const description = status === 'pass' ? passText : status === 'fail' ? failText : status === 'warn' ? warnText : 'Verification pending...'

          return (
            <div
              key={key}
              className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50"
            >
              <div className={`shrink-0 mt-0.5 ${config.color}`}>
                {config.icon}
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-bold ${
                  status === 'pass' ? 'text-green-600 dark:text-green-400'
                    : status === 'fail' ? 'text-red-600 dark:text-red-400'
                      : status === 'warn' ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {label}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                  {description}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Overall status banner */}
      {allPass && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 rounded-lg p-3 flex items-start gap-2">
          <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <div>
            <div className="text-xs font-bold text-green-700 dark:text-green-400">Official Validation</div>
            <div className="text-[10px] text-green-600 dark:text-green-500 mt-0.5">
              Ready for government submission. All critical requirements met.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
