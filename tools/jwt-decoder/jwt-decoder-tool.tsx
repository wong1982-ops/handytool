'use client'

import { useState } from 'react'
import { DecodeSection } from './decode-section'

const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

export function JwtDecoderTool() {
  const [token, setToken] = useState(SAMPLE_JWT)
  const [detectedAlgorithm, setDetectedAlgorithm] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <DecodeSection
        token={token}
        onTokenChange={setToken}
        onAlgorithmDetected={setDetectedAlgorithm}
      />
      {/* Verify and Generate sections will be added in subsequent tasks */}
      {detectedAlgorithm && (
        <p className="text-xs text-[var(--tk-color-text-secondary)]">
          Detected algorithm: <span className="font-mono font-medium">{detectedAlgorithm}</span>
        </p>
      )}
    </div>
  )
}
