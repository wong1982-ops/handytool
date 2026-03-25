'use client'

import { useState } from 'react'
import type { VBlogJob } from './types'

interface Variant {
  key: string
  label: string
  aspect: string
  url: string | undefined
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-xs text-[#3D6AF2] hover:text-white font-semibold min-h-[44px] px-2 cursor-pointer transition-colors"
      aria-label={`Copy ${label}`}
    >
      {copied ? 'Copied!' : `Copy ${label}`}
    </button>
  )
}

interface VideoPreviewProps {
  job: VBlogJob
}

export function VideoPreview({ job }: VideoPreviewProps) {
  const [downloading, setDownloading] = useState(false)

  const variants: Variant[] = [
    { key: 'master', label: 'YouTube (Master)', aspect: '16:9', url: job.artifacts.masterUrl },
    { key: 'tiktok', label: 'TikTok', aspect: '9:16', url: job.artifacts.tiktokUrl },
    { key: 'reels', label: 'Instagram Reels', aspect: '9:16', url: job.artifacts.reelsUrl },
    { key: 'twitter', label: 'Twitter / X', aspect: '1:1', url: job.artifacts.twitterUrl },
  ]

  const availableVariants = variants.filter((v) => v.url)

  const handleDownloadAll = async () => {
    if (availableVariants.length === 0) return
    setDownloading(true)
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      for (const v of availableVariants) {
        if (!v.url) continue
        const res = await fetch(v.url)
        const blob = await res.blob()
        zip.file(`${v.key}.mp4`, blob)
      }

      // Add script text if available
      if (job.scriptData) {
        const scriptText = job.scriptData.sections.map((s) => s.text).join('\n\n')
        zip.file('script.txt', scriptText)
        if (job.scriptData.hashtags.length > 0) {
          zip.file('hashtags.txt', job.scriptData.hashtags.join(' '))
        }
      }

      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = `${job.toolName.toLowerCase().replace(/\s+/g, '-')}-video.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // ignore zip errors
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Video player */}
      {job.artifacts.masterUrl && (
        <video
          src={job.artifacts.masterUrl}
          controls
          className="w-full rounded-xl bg-black aspect-video"
          preload="metadata"
        >
          <track kind="captions" />
        </video>
      )}

      {/* Download grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {variants.map((v) => (
          <div
            key={v.key}
            className="bg-[#090f16] rounded-xl border border-[#1e2631] p-3 flex flex-col items-center gap-2"
          >
            <p className="text-white text-sm font-semibold text-center">{v.label}</p>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#70767f]">
              {v.aspect}
            </span>
            {v.url ? (
              <a
                href={v.url}
                download
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl min-h-[44px] px-3 py-2 text-xs text-center cursor-pointer transition-colors inline-flex items-center justify-center"
              >
                Download
              </a>
            ) : (
              <span className="text-xs text-[#70767f]">Not ready</span>
            )}
          </div>
        ))}
      </div>

      {/* Download All */}
      {availableVariants.length > 1 && (
        <button
          type="button"
          onClick={handleDownloadAll}
          disabled={downloading}
          className="w-full bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white font-semibold rounded-xl min-h-[44px] px-6 py-3 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {downloading ? 'Bundling ZIP...' : 'Download All'}
        </button>
      )}

      {/* Script text */}
      {job.scriptData && (
        <div className="bg-[#090f16] rounded-xl border border-[#1e2631] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#a6abb5]">Script</h3>
            <CopyButton
              text={job.scriptData.sections.map((s) => s.text).join('\n\n')}
              label="Script"
            />
          </div>
          <div className="text-sm text-[#a6abb5] whitespace-pre-wrap max-h-60 overflow-y-auto">
            {job.scriptData.sections.map((s, i) => (
              <p key={i} className="mb-2">
                {s.text}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Hashtags */}
      {job.scriptData && job.scriptData.hashtags.length > 0 && (
        <div className="bg-[#090f16] rounded-xl border border-[#1e2631] p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[#a6abb5]">Hashtags</h3>
            <CopyButton text={job.scriptData.hashtags.join(' ')} label="Hashtags" />
          </div>
          <div className="flex flex-wrap gap-2">
            {job.scriptData.hashtags.map((tag, i) => (
              <span
                key={i}
                className="text-xs font-medium bg-[#3D6AF2]/20 text-[#3D6AF2] px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
