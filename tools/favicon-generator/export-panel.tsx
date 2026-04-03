'use client'

import { useCallback, useState } from 'react'
import type { FaviconConfig, ExportSize } from './types'
import { EXPORT_SIZES } from './types'
import { generateFaviconZip, generateHtmlTags, generateManifestJson, downloadBlob } from './export-utils'

interface ExportPanelProps {
  config: FaviconConfig
}

export default function ExportPanel({ config }: ExportPanelProps) {
  const [sizes, setSizes] = useState<ExportSize[]>(EXPORT_SIZES.map((s) => ({ ...s })))
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedHtml, setCopiedHtml] = useState(false)
  const [copiedManifest, setCopiedManifest] = useState(false)

  const hasContent = !!(config.text || config.imageData || config.iconSvg)
  const hasChecked = sizes.some((s) => s.checked)

  const toggleSize = (index: number) => {
    setSizes((prev) =>
      prev.map((s, i) => (i === index ? { ...s, checked: !s.checked } : s)),
    )
  }

  const handleDownloadZip = useCallback(async () => {
    if (!hasContent || !hasChecked) return
    setIsGenerating(true)
    try {
      const blob = await generateFaviconZip(config, sizes)
      downloadBlob(blob, 'favicons.zip')
    } catch (err) {
      console.error('Failed to generate favicon ZIP:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [config, sizes, hasContent, hasChecked])

  const handleCopyHtml = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generateHtmlTags())
      setCopiedHtml(true)
      setTimeout(() => setCopiedHtml(false), 2000)
    } catch (err) {
      console.error('Failed to copy HTML tags:', err)
    }
  }, [])

  const handleCopyManifest = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generateManifestJson())
      setCopiedManifest(true)
      setTimeout(() => setCopiedManifest(false), 2000)
    } catch (err) {
      console.error('Failed to copy manifest:', err)
    }
  }, [])

  return (
    <div className="rounded-xl border border-[#1e2631] bg-[#131a23] p-4 space-y-4">
      <h2 className="text-sm font-semibold text-white">Export</h2>

      {/* Size checkboxes */}
      <div className="space-y-2">
        <span className="text-[10px] font-semibold text-[#70767f] uppercase tracking-[0.08em]">
          Sizes
        </span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {sizes.map((size, i) => (
            <label
              key={size.filename}
              className="flex items-center gap-2 cursor-pointer min-h-[32px]"
            >
              <input
                type="checkbox"
                checked={size.checked}
                onChange={() => toggleSize(i)}
                className="h-[15px] w-[15px] accent-[#3D6AF2] cursor-pointer"
              />
              <span className="text-xs text-[#a6abb5]">{size.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Download ZIP button */}
      <button
        type="button"
        onClick={handleDownloadZip}
        disabled={!hasContent || !hasChecked || isGenerating}
        className="flex items-center justify-center gap-2 w-full rounded-lg text-white font-semibold text-sm px-4 py-3 min-h-[44px] transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(90deg, #3D6AF2 0%, #3D9DF2 100%)' }}
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download ZIP
          </>
        )}
      </button>

      {/* Copy buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCopyHtml}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-[#1e2631] bg-[#1e2631] text-[#a6abb5] text-xs font-medium px-3 py-2.5 min-h-[44px] hover:bg-[#1e2a3a] hover:text-white transition-all"
        >
          {copiedHtml ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10B981]">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              HTML Tags
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleCopyManifest}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-[#1e2631] bg-[#1e2631] text-[#a6abb5] text-xs font-medium px-3 py-2.5 min-h-[44px] hover:bg-[#1e2a3a] hover:text-white transition-all"
        >
          {copiedManifest ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10B981]">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              manifest.json
            </>
          )}
        </button>
      </div>
    </div>
  )
}
