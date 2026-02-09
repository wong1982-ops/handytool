'use client'

import { useState, useCallback } from 'react'
import { FormatSidebar, PHOTO_FORMATS } from '@/tools/id-photo/format-sidebar'
import { PhotoCanvas } from '@/tools/id-photo/photo-canvas'
import { SettingsPanel } from '@/tools/id-photo/settings-panel'

export default function IdPhotoPage() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [selectedFormat, setSelectedFormat] = useState('us-passport')
  const [brightness, setBrightness] = useState(0)
  const [contrast, setContrast] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [exportMode, setExportMode] = useState<'digital' | 'print'>('digital')
  const [paperSize, setPaperSize] = useState('4x6')
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [showMobileSettings, setShowMobileSettings] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const currentFormat = PHOTO_FORMATS.find((f) => f.id === selectedFormat) || PHOTO_FORMATS[0]

  const handleFileSelect = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setPhotoUrl(e.target?.result as string)
      setToast('Photo uploaded — align your face with the guides')
      setTimeout(() => setToast(null), 3000)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleReset = useCallback(() => {
    setPhotoUrl(null)
    setBrightness(0)
    setContrast(0)
    setZoom(100)
  }, [])

  const handleDownload = useCallback(() => {
    if (!photoUrl) return

    // Create a canvas to render the photo with adjustments
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const fmt = PHOTO_FORMATS.find((f) => f.id === selectedFormat) || PHOTO_FORMATS[0]
      // Use mm-based dimensions scaled to 300 DPI (~11.81 px/mm)
      const scale = 11.81
      canvas.width = Math.round(fmt.widthMm * scale)
      canvas.height = Math.round(fmt.heightMm * scale)

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Fill background
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Apply filters
      ctx.filter = `brightness(${1 + brightness / 100}) contrast(${1 + contrast / 100})`

      // Draw image centered/cover
      const imgRatio = img.width / img.height
      const canvasRatio = canvas.width / canvas.height
      let sx = 0, sy = 0, sw = img.width, sh = img.height
      if (imgRatio > canvasRatio) {
        sw = img.height * canvasRatio
        sx = (img.width - sw) / 2
      } else {
        sh = img.width / canvasRatio
        sy = (img.height - sh) / 2
      }

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)

      // Download
      const link = document.createElement('a')
      link.download = `id-photo-${selectedFormat}.jpg`
      link.href = canvas.toDataURL('image/jpeg', 0.95)
      link.click()

      setToast('Photo downloaded successfully!')
      setTimeout(() => setToast(null), 3000)
    }
    img.src = photoUrl
  }, [photoUrl, selectedFormat, bgColor, brightness, contrast])

  const handleGeneratePrint = useCallback(() => {
    setExportMode('print')
    setShowMobileSettings(true)
    setToast('Print layout generated — check the Print Preview panel')
    setTimeout(() => setToast(null), 3000)
  }, [])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Breadcrumb */}
      <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 cursor-pointer"
            aria-label="Toggle format panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="/tools" className="hover:text-[var(--ht-color-primary-500)] transition-colors">Home</a></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-slate-900 dark:text-white font-medium">ID Photo Editor</li>
            </ol>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile settings toggle */}
          <button
            onClick={() => setShowMobileSettings(!showMobileSettings)}
            className="xl:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 cursor-pointer"
            aria-label="Toggle settings panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Format badge */}
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ht-color-secondary-500)]/10 text-[var(--ht-color-secondary-500)] rounded-lg text-xs font-bold">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {currentFormat.name} ({currentFormat.dimensions.split('(')[0].trim()})
          </span>
        </div>
      </div>

      {/* Main workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left sidebar — desktop */}
        <FormatSidebar
          selectedFormat={selectedFormat}
          onSelectFormat={setSelectedFormat}
          brightness={brightness}
          onBrightnessChange={setBrightness}
          contrast={contrast}
          onContrastChange={setContrast}
          hasPhoto={!!photoUrl}
          onGeneratePrint={handleGeneratePrint}
        />

        {/* Mobile left sidebar overlay */}
        {showMobileSidebar && (
          <>
            <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setShowMobileSidebar(false)} />
            <div className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 z-40 lg:hidden shadow-2xl overflow-y-auto">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-sm">Formats & Adjustments</span>
                <button onClick={() => setShowMobileSidebar(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer" aria-label="Close">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <MobileFormatPanel
                selectedFormat={selectedFormat}
                onSelectFormat={(id) => { setSelectedFormat(id); setShowMobileSidebar(false) }}
                brightness={brightness}
                onBrightnessChange={setBrightness}
                contrast={contrast}
                onContrastChange={setContrast}
              />
            </div>
          </>
        )}

        {/* Center canvas */}
        <PhotoCanvas
          photoUrl={photoUrl}
          brightness={brightness}
          contrast={contrast}
          zoom={zoom}
          onZoomChange={setZoom}
          onFileSelect={handleFileSelect}
          onReset={handleReset}
          onDownload={handleDownload}
          formatName={currentFormat.name}
        />

        {/* Right settings — desktop */}
        <SettingsPanel
          bgColor={bgColor}
          onBgColorChange={setBgColor}
          exportMode={exportMode}
          onExportModeChange={setExportMode}
          paperSize={paperSize}
          onPaperSizeChange={setPaperSize}
          hasPhoto={!!photoUrl}
          photoUrl={photoUrl}
          onDownload={handleDownload}
        />

        {/* Mobile right settings overlay */}
        {showMobileSettings && (
          <>
            <div className="fixed inset-0 bg-black/30 z-30 xl:hidden" onClick={() => setShowMobileSettings(false)} />
            <div className="fixed right-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 z-40 xl:hidden shadow-2xl overflow-y-auto">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-sm">Settings</span>
                <button onClick={() => setShowMobileSettings(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer" aria-label="Close">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SettingsPanel
                bgColor={bgColor}
                onBgColorChange={setBgColor}
                exportMode={exportMode}
                onExportModeChange={setExportMode}
                paperSize={paperSize}
                onPaperSizeChange={setPaperSize}
                hasPhoto={!!photoUrl}
                photoUrl={photoUrl}
                onDownload={() => { handleDownload(); setShowMobileSettings(false) }}
              />
            </div>
          </>
        )}
      </main>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl z-50" role="status">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  )
}

/* Mobile format panel (inline component) */
function MobileFormatPanel({
  selectedFormat,
  onSelectFormat,
  brightness,
  onBrightnessChange,
  contrast,
  onContrastChange,
}: {
  selectedFormat: string
  onSelectFormat: (id: string) => void
  brightness: number
  onBrightnessChange: (val: number) => void
  contrast: number
  onContrastChange: (val: number) => void
}) {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        {PHOTO_FORMATS.map((fmt) => (
          <button
            key={fmt.id}
            onClick={() => onSelectFormat(fmt.id)}
            className={`flex items-center gap-3 p-3 rounded-xl w-full text-left transition-colors cursor-pointer ${
              selectedFormat === fmt.id
                ? 'bg-[var(--ht-color-secondary-500)]/10 border border-[var(--ht-color-secondary-500)]/20'
                : 'border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex-1">
              <p className={`text-sm ${selectedFormat === fmt.id ? 'font-bold' : 'font-medium'}`}>{fmt.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{fmt.dimensions}</p>
            </div>
          </button>
        ))}
      </div>
      <hr className="border-slate-100 dark:border-slate-800" />
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
            <span>BRIGHTNESS</span><span>{brightness > 0 ? '+' : ''}{brightness}%</span>
          </div>
          <input type="range" min={-100} max={100} value={brightness} onChange={(e) => onBrightnessChange(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--ht-color-secondary-500)]" />
        </div>
        <div>
          <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
            <span>CONTRAST</span><span>{contrast > 0 ? '+' : ''}{contrast}%</span>
          </div>
          <input type="range" min={-100} max={100} value={contrast} onChange={(e) => onContrastChange(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--ht-color-secondary-500)]" />
        </div>
      </div>
    </div>
  )
}
