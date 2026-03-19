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
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-4">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Export</h2>

      {/* Size checkboxes */}
      <div className="space-y-2">
        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Sizes
        </span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {sizes.map((size, i) => (
            <label
              key={size.filename}
              className="flex items-center gap-2 cursor-pointer min-h-[32px]"
            >
              <input
                type="checkbox"
                checked={size.checked}
                onChange={() => toggleSize(i)}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-[var(--tk-color-primary-500,#3D6AF2)] focus:ring-[var(--tk-color-primary-500,#3D6AF2)] accent-[var(--tk-color-primary-500,#3D6AF2)]"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">{size.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Download ZIP button */}
      <button
        type="button"
        onClick={handleDownloadZip}
        disabled={!hasContent || !hasChecked || isGenerating}
        className="flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-[var(--tk-color-primary-500,#3D6AF2)] to-[#3D9DF2] text-white font-medium text-sm px-4 py-3 min-h-[44px] transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
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
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium px-3 py-2.5 min-h-[44px] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {copiedHtml ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
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
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium px-3 py-2.5 min-h-[44px] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {copiedManifest ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
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
