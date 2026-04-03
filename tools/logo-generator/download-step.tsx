'use client'

import { useState } from 'react'
import Image from 'next/image'
import { LogoConcept } from '@/tools/logo-generator/types'

interface DownloadStepProps {
  concept: LogoConcept
  businessName: string
  onStartOver: () => void
}

type BgMode = 'dark' | 'light'

const SIZE_PREVIEWS = [
  { label: '1024px', displaySize: 128, description: 'Large' },
  { label: '512px', displaySize: 80, description: 'Medium' },
  { label: '128px', displaySize: 40, description: 'Icon' },
]

async function downloadImage(url: string, filename: string) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(objectUrl)
  } catch {
    // fallback: open in new tab
    window.open(url, '_blank')
  }
}

export function DownloadStep({ concept, businessName, onStartOver }: DownloadStepProps) {
  const [bgMode, setBgMode] = useState<BgMode>('dark')
  const [downloading, setDownloading] = useState<string | null>(null)

  const previewBg = bgMode === 'dark' ? 'bg-[#131a23]' : 'bg-white'

  async function handleFreeDownload(size: string) {
    setDownloading(size)
    const slug = businessName.toLowerCase().replace(/\s+/g, '-') || 'logo'
    await downloadImage(concept.imageUrl, `${slug}-${size}.png`)
    setDownloading(null)
  }

  function handleCreditDownload(type: string) {
    // Placeholder — API integration in Task 8
    alert(`Downloading ${type} requires sign-in. Coming soon!`)
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Heading */}
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 0 24px rgba(16,185,129,0.3)' }}
        >
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Your logo is ready!</h2>
        <p className="text-[#a6abb5] text-sm">
          Preview and download in the format you need.
        </p>
      </div>

      {/* Size Previews */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#70767f] mb-4">
          Size Previews
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {SIZE_PREVIEWS.map(({ label, displaySize, description }) => (
            <div
              key={label}
              className="bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-4 gap-3 min-h-[140px]"
            >
              <div
                className="flex items-center justify-center"
                style={{ width: displaySize, height: displaySize }}
              >
                <Image
                  src={concept.imageUrl}
                  alt={`Logo at ${label}`}
                  width={displaySize}
                  height={displaySize}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-700">{description}</p>
                <p className="text-xs text-[#a6abb5]">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Background Toggle */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#70767f] mb-3">
          Preview Background
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setBgMode('dark')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border cursor-pointer min-h-[44px] ${
              bgMode === 'dark'
                ? 'bg-[#3D6AF2] border-[#3D6AF2] text-white'
                : 'bg-transparent border-[#1e2631] text-[#a6abb5] hover:border-[#3D6AF2]'
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => setBgMode('light')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border cursor-pointer min-h-[44px] ${
              bgMode === 'light'
                ? 'bg-white border-white text-slate-900'
                : 'bg-transparent border-[#1e2631] text-[#a6abb5] hover:border-[#3D6AF2]'
            }`}
          >
            Light
          </button>
        </div>

        {/* Live Preview */}
        <div
          className={`mt-3 rounded-xl flex items-center justify-center p-8 ${previewBg} border border-[#1e2631]`}
          style={{ minHeight: 140 }}
        >
          <Image
            src={concept.imageUrl}
            alt="Logo preview"
            width={96}
            height={96}
            className="object-contain"
            unoptimized
          />
        </div>
      </div>

      {/* Mockup Previews */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#70767f] mb-4">
          Mockup Previews
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {/* Business Card */}
          <div className="flex flex-col items-center gap-2">
            <div className="bg-slate-800 rounded-lg w-full flex items-center justify-center border border-[#1e2631]"
              style={{ height: 72 }}>
              <Image
                src={concept.imageUrl}
                alt="Business card mockup"
                width={36}
                height={36}
                className="object-contain"
                unoptimized
              />
            </div>
            <span className="text-xs text-[#a6abb5]">Business Card</span>
          </div>

          {/* Website Header */}
          <div className="flex flex-col items-center gap-2">
            <div className="bg-slate-800 rounded-lg w-full flex items-start px-3 py-2 border border-[#1e2631]"
              style={{ height: 72 }}>
              <Image
                src={concept.imageUrl}
                alt="Website header mockup"
                width={32}
                height={32}
                className="object-contain mt-auto mb-auto"
                unoptimized
              />
            </div>
            <span className="text-xs text-[#a6abb5]">Website Header</span>
          </div>

          {/* App Icon */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex items-center justify-center"
              style={{ height: 72 }}
            >
              <div className="bg-slate-800 rounded-2xl flex items-center justify-center border border-[#1e2631]"
                style={{ width: 56, height: 56 }}>
                <Image
                  src={concept.imageUrl}
                  alt="App icon mockup"
                  width={36}
                  height={36}
                  className="object-contain rounded-xl"
                  unoptimized
                />
              </div>
            </div>
            <span className="text-xs text-[#a6abb5]">App Icon</span>
          </div>
        </div>
      </div>

      {/* Download Buttons */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#70767f] mb-4">
          Download
        </h3>
        <div className="flex flex-col gap-3">
          {/* Free: PNG 512px */}
          <button
            onClick={() => handleFreeDownload('512px')}
            disabled={downloading === '512px'}
            className="w-full flex items-center justify-between px-5 py-3 rounded-xl font-semibold text-white text-sm transition-all min-h-[44px] cursor-pointer
              bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>{downloading === '512px' ? 'Downloading…' : 'Download PNG (512px)'}</span>
            <span className="text-xs font-normal bg-emerald-500/50 px-2 py-0.5 rounded-full">Free</span>
          </button>

          {/* Free: PNG 1024px */}
          <button
            onClick={() => handleFreeDownload('1024px')}
            disabled={downloading === '1024px'}
            className="w-full flex items-center justify-between px-5 py-3 rounded-xl font-semibold text-white text-sm transition-all min-h-[44px] cursor-pointer
              bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>{downloading === '1024px' ? 'Downloading…' : 'Download PNG (1024px)'}</span>
            <span className="text-xs font-normal bg-emerald-500/50 px-2 py-0.5 rounded-full">Free</span>
          </button>

          {/* Credit: PNG 2048px */}
          <button
            onClick={() => handleCreditDownload('PNG 2048px')}
            className="w-full flex items-center justify-between px-5 py-3 rounded-xl font-semibold text-white text-sm transition-all min-h-[44px] cursor-pointer
              bg-[#7C3AED]/80 hover:bg-[#7C3AED]"
          >
            <span>Download PNG (2048px)</span>
            <span className="text-xs font-medium bg-[#7C3AED]/30 text-[#c084fc] px-2 py-0.5 rounded-full border border-[#7C3AED]/40">
              1 credit
            </span>
          </button>

          {/* Credit: SVG */}
          <button
            onClick={() => handleCreditDownload('SVG')}
            className="w-full flex items-center justify-between px-5 py-3 rounded-xl font-semibold text-white text-sm transition-all min-h-[44px] cursor-pointer
              bg-[#7C3AED]/80 hover:bg-[#7C3AED]"
          >
            <span>Download SVG</span>
            <span className="text-xs font-medium bg-[#7C3AED]/30 text-[#c084fc] px-2 py-0.5 rounded-full border border-[#7C3AED]/40">
              1 credit
            </span>
          </button>

          {/* Credit: Brand Kit */}
          <button
            onClick={() => handleCreditDownload('Brand Kit')}
            className="w-full flex items-center justify-between px-5 py-3 rounded-xl font-semibold text-white text-sm transition-all min-h-[44px] cursor-pointer
              bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] hover:opacity-90"
          >
            <span>Download Brand Kit</span>
            <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
              1 credit
            </span>
          </button>
        </div>
      </div>

      {/* Start Over */}
      <div className="pt-2 border-t border-[#1e2631]">
        <button
          onClick={onStartOver}
          className="w-full px-5 py-3 rounded-xl text-sm font-semibold text-[#3D6AF2] hover:bg-[#3D6AF2]/10 transition-colors min-h-[44px] cursor-pointer
            border border-[#3D6AF2]"
        >
          Create Another Logo
        </button>
      </div>
    </div>
  )
}
