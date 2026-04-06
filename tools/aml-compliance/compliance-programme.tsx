'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'
import { PROGRAMME_SECTIONS, BUSINESS_TYPES } from './aml-data'
import { generateCompliancePDF } from './pdf-programme'
import type { RiskAssessmentResult, RiskLevel } from './types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RISK_COLORS: Record<RiskLevel, { badge: string; text: string }> = {
  low: { badge: 'bg-green-500', text: 'text-green-400' },
  medium: { badge: 'bg-amber-500', text: 'text-amber-400' },
  high: { badge: 'bg-red-500', text: 'text-red-400' },
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ComplianceProgramme() {
  const { user } = useAuth()
  const [businessName, setBusinessName] = useState('')
  const [generating, setGenerating] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)

  // In a real app, this would come from shared state/context.
  // For now, we store a simple mock result for demo purposes.
  const [riskResult] = useState<RiskAssessmentResult | null>(null)

  const handleDownloadPDF = useCallback(async () => {
    if (!user) {
      setShowSignIn(true)
      return
    }

    setGenerating(true)
    try {
      const doc = generateCompliancePDF(businessName, riskResult)
      const filename = businessName
        ? `aml-cft-programme-${businessName.toLowerCase().replace(/\s+/g, '-')}.pdf`
        : 'aml-cft-compliance-programme.pdf'
      doc.save(filename)
    } finally {
      setGenerating(false)
    }
  }, [user, businessName, riskResult])

  return (
    <div className="space-y-6">
      {/* Business Name Input */}
      <div className="rounded-2xl border border-[#1e2631] bg-[#131a23] p-5">
        <label htmlFor="business-name" className="block text-sm font-semibold text-white mb-2">
          Business Name
        </label>
        <input
          id="business-name"
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Enter your business name..."
          className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-[#1e2631] bg-[#0d1117] text-sm text-white placeholder-slate-500 focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2]/50 outline-none transition-colors"
        />
        <p className="text-xs text-slate-500 mt-2">
          This will appear on the generated compliance programme document.
        </p>
      </div>

      {/* Risk Assessment Summary (if available) */}
      {riskResult && (
        <div className="rounded-2xl border border-[#1e2631] bg-[#131a23] p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Risk Assessment Summary</h3>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold text-white ${RISK_COLORS[riskResult.overallLevel].badge}`}>
              {riskResult.overallLevel.toUpperCase()} RISK
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Your risk assessment (completed {new Date(riskResult.completedAt).toLocaleDateString('en-NZ')}) has been incorporated into the programme.
            {riskResult.businessType && (
              <span> Business type: <strong className="text-slate-300">{BUSINESS_TYPES.find((b) => b.id === riskResult.businessType)?.name}</strong>.</span>
            )}
          </p>
        </div>
      )}

      {/* Programme Sections Preview */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white">Programme Contents</h3>
        <p className="text-sm text-slate-400">
          Your compliance programme will include the following sections, tailored to NZ AML/CFT Act 2009 requirements:
        </p>

        {PROGRAMME_SECTIONS.map((section, idx) => (
          <details
            key={section.id}
            className="group rounded-xl border border-[#1e2631] bg-[#131a23] overflow-hidden"
          >
            <summary className="flex items-center justify-between min-h-[44px] px-4 py-3 cursor-pointer hover:bg-[#1e2631] transition-colors select-none">
              <span className="text-sm font-medium text-white">{section.title}</span>
              <svg
                className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </summary>
            <div className="px-4 pb-4 space-y-2">
              {section.content.map((paragraph, i) => (
                <p key={i} className="text-sm text-slate-400 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </details>
        ))}
      </div>

      {/* Download Button */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleDownloadPDF}
          disabled={generating}
          className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#3D6AF2] text-sm font-bold text-white hover:bg-[#3D79F2] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating PDF...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download Compliance Programme (PDF)
            </>
          )}
        </button>

        {!user && (
          <p className="text-xs text-slate-500 text-center">
            Sign in required to download PDF
          </p>
        )}
      </div>

      {/* Sign-in Modal */}
      {showSignIn && !user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#1e2631] bg-[#131a23] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Sign in to download</h3>
            <p className="text-sm text-slate-400 mb-5">
              Create a free account to download your AML/CFT compliance programme as a PDF.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => signInWithOAuth('google')}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-white text-sm font-medium text-slate-800 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
              <button
                onClick={() => setShowSignIn(false)}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-[#1e2631] text-sm font-medium text-slate-400 hover:bg-[#1e2631] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <p className="text-xs text-amber-400/80">
          <strong>Disclaimer:</strong> This tool provides general guidance only. It is not legal advice and does not replace the requirement for independent AML/CFT compliance advice. Contact the DIA AML/CFT team for specific guidance.
        </p>
      </div>
    </div>
  )
}
