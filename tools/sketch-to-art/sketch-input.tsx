'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { SketchMode, InputMethod } from './types'
import DrawingCanvas from './drawing-canvas'
import { resizeImage, getImageDimensions, isEditorEligible } from './image-utils'

const ImageEditor = dynamic(() => import('./image-editor'), { ssr: false })

interface SketchInputProps {
  onSketchReady: (dataUrl: string) => void
  mode: SketchMode
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']

export default function SketchInput({ onSketchReady, mode }: SketchInputProps) {
  const [activeTab, setActiveTab] = useState<InputMethod>('upload')
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editorEligible, setEditorEligible] = useState(false)
  const [rawPreview, setRawPreview] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Camera state
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const isFun = mode === 'fun'

  // Cleanup camera on unmount or tab switch
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }, [])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  const handleTabSwitch = useCallback(
    (tab: InputMethod) => {
      stopCamera()
      setCapturedPhoto(null)
      setCameraError(null)
      setError(null)
      setActiveTab(tab)
    },
    [stopCamera],
  )

  // --- Upload ---
  const processFile = useCallback((file: File) => {
    setError(null)
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload a PNG, JPG, or WebP image.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 10 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      const result = e.target?.result as string
      // Check original dimensions for editor eligibility
      const dims = await getImageDimensions(result)
      const eligible = isEditorEligible(dims.width, dims.height)
      setEditorEligible(eligible)
      if (eligible) {
        setRawPreview(result)  // Store raw for editor (resized in crop pipeline)
        setPreview(result)     // Show editor
      } else {
        const resized = await resizeImage(result)
        setPreview(resized)    // Small image: show plain preview
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const handleFileDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
    },
    [processFile],
  )

  // --- Camera ---
  const startCamera = useCallback(async () => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraActive(true)
    } catch {
      setCameraError('Camera not available. Please use the Upload tab instead.')
    }
  }, [])

  const capturePhoto = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
    getImageDimensions(dataUrl).then(async (dims) => {
      const eligible = isEditorEligible(dims.width, dims.height)
      setEditorEligible(eligible)
      if (eligible) {
        setRawPreview(dataUrl)
        setCapturedPhoto(dataUrl)
        setPreview(dataUrl)
      } else {
        const resized = await resizeImage(dataUrl)
        setCapturedPhoto(resized)
        setPreview(resized)
      }
    })
    stopCamera()
  }, [stopCamera])

  const handleRetake = useCallback(() => {
    setCapturedPhoto(null)
    setPreview(null)
    startCamera()
  }, [startCamera])

  // --- Draw ---
  const handleDrawingExport = useCallback((dataUrl: string) => {
    setPreview(dataUrl)
  }, [])

  // --- Use Sketch ---
  const handleUseSketch = useCallback(() => {
    if (preview) {
      onSketchReady(preview) // already resized on upload/capture
    }
  }, [preview, onSketchReady])

  const handleClearPreview = useCallback(() => {
    setPreview(null)
    setCapturedPhoto(null)
    setRawPreview(null)
    setEditorEligible(false)
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Creation Hub sidebar */}
      <div className="lg:col-span-4 space-y-4">
        <div className="rounded-2xl bg-[#131a23] p-5 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-[#af88ff] text-lg" aria-hidden="true">✨</span>
            <h3 className="font-bold text-lg text-white">Creation Hub</h3>
          </div>

          {/* Upload option */}
          <button
            type="button"
            onClick={() => handleTabSwitch('upload')}
            className={`w-full flex items-center gap-3 rounded-xl p-3 transition-colors text-left ${
              activeTab === 'upload'
                ? 'bg-[#3D6AF2]/15 ring-1 ring-[#3D6AF2]/40'
                : 'hover:bg-[#1e2631]'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-[#3D6AF2]/20 flex items-center justify-center shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3D6AF2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm text-white">Upload</p>
              <p className="text-xs text-[#a6abb5]">Import your PNG/JPG</p>
            </div>
          </button>

          {/* Draw option */}
          <button
            type="button"
            onClick={() => handleTabSwitch('draw')}
            className={`w-full flex items-center gap-3 rounded-xl p-3 transition-colors text-left ${
              activeTab === 'draw'
                ? 'bg-[#7C3AED]/15 ring-1 ring-[#7C3AED]/40'
                : 'hover:bg-[#1e2631]'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/20 flex items-center justify-center shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#af88ff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
                <circle cx="11" cy="11" r="2" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm text-white">Canvas Draw</p>
              <p className="text-xs text-[#a6abb5]">Sketch in real-time</p>
            </div>
          </button>

          {/* Quick Tips */}
          <div className="pt-4 mt-2 border-t border-[#1e2631]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#70767f] mb-3">Quick Tips</p>
            <ul className="space-y-2 text-xs text-[#a6abb5]">
              <li className="flex gap-2">
                <span className="text-[#3D6AF2] shrink-0" aria-hidden="true">•</span>
                High contrast sketches work best.
              </li>
              <li className="flex gap-2">
                <span className="text-[#3D6AF2] shrink-0" aria-hidden="true">•</span>
                Keep lines clean and continuous.
              </li>
              <li className="flex gap-2">
                <span className="text-[#3D6AF2] shrink-0" aria-hidden="true">•</span>
                PNG or JPG up to 10 MB accepted.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right: Main workspace */}
      <div className="lg:col-span-8">
        <div className="rounded-2xl bg-[#131a23] p-4 lg:p-6">
          {/* Internal tab bar (hidden when preview is shown) */}
          {!preview && (
            <div className="flex items-center gap-5 mb-5 pb-4 border-b border-[#1e2631]">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'upload'}
                onClick={() => handleTabSwitch('upload')}
                className={`text-sm font-bold pb-1 transition-colors ${
                  activeTab === 'upload'
                    ? 'border-b-2 border-[#3D6AF2] text-white'
                    : 'text-[#70767f] hover:text-white'
                }`}
              >
                {isFun ? '📁 Upload' : 'Upload'}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'draw'}
                onClick={() => handleTabSwitch('draw')}
                className={`text-sm font-bold pb-1 transition-colors ${
                  activeTab === 'draw'
                    ? 'border-b-2 border-[#3D6AF2] text-white'
                    : 'text-[#70767f] hover:text-white'
                }`}
              >
                {isFun ? '✏️ Draw' : 'Draw'}
              </button>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && !preview && (
            <div
              className={`relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 transition-colors ${
                dragOver
                  ? 'border-[#3D6AF2] bg-[#3D6AF2]/5'
                  : 'border-[#1e2631] hover:border-[#3D6AF2]/50'
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
            >
              {/* Glow circle behind icon */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                aria-hidden="true"
              >
                <div className="w-32 h-32 rounded-full bg-[#3D6AF2]/10 blur-2xl" />
              </div>

              {/* Upload icon */}
              <div className="relative z-10 w-14 h-14 rounded-2xl bg-[#1e2631] flex items-center justify-center">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3D6AF2"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>

              <div className="relative z-10 text-center space-y-1">
                <p className="font-semibold text-white">
                  {isFun ? 'Drop your awesome sketch here!' : 'Drag & drop your sketch here'}
                </p>
                <p className="text-xs text-[#70767f]">PNG, JPG, or WebP — max 10 MB</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`relative z-10 min-h-[44px] inline-flex items-center px-6 rounded-xl font-semibold cursor-pointer transition-colors text-sm ${
                  isFun
                    ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white hover:from-pink-500 hover:to-purple-600'
                    : 'bg-[#3D6AF2] text-white hover:bg-[#3D6AF2]/85'
                }`}
              >
                {isFun ? '📂 Browse Files' : 'Browse Files'}
              </button>

              {error && (
                <p className="relative z-10 text-sm text-red-400" role="alert">
                  {error}
                </p>
              )}
            </div>
          )}

          {/* Camera Tab (retained for completeness, not shown in sidebar) */}
          {activeTab === 'camera' && !preview && (
            <div className="flex flex-col items-center gap-4">
              {cameraError ? (
                <div className="flex flex-col items-center gap-3 rounded-xl bg-[#1e2631] p-8 text-center">
                  <p className="text-[#a6abb5]">{cameraError}</p>
                  <button
                    type="button"
                    className="min-h-[44px] px-6 rounded-xl bg-[#3D6AF2] text-white font-semibold hover:bg-[#3D6AF2]/85 transition-colors"
                    onClick={() => handleTabSwitch('upload')}
                  >
                    {isFun ? '📁 Go to Upload' : 'Switch to Upload'}
                  </button>
                </div>
              ) : !cameraActive && !capturedPhoto ? (
                <button
                  type="button"
                  className={`min-h-[44px] px-8 rounded-xl font-semibold text-white transition-all ${
                    isFun
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-lg'
                      : 'bg-[#3D6AF2] hover:bg-[#3D6AF2]/85'
                  }`}
                  onClick={startCamera}
                >
                  {isFun ? '📸 Open Camera' : 'Open Camera'}
                </button>
              ) : (
                <>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full max-w-[512px] aspect-square rounded-xl object-cover bg-black"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`min-h-[44px] px-8 rounded-xl font-semibold text-white transition-all ${
                        isFun
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-lg'
                          : 'bg-[#3D6AF2] hover:bg-[#3D6AF2]/85'
                      }`}
                      onClick={capturePhoto}
                    >
                      {isFun ? '📸 Snap!' : 'Capture'}
                    </button>
                    <button
                      type="button"
                      className="min-h-[44px] px-6 rounded-xl font-medium bg-[#1e2631] text-[#a6abb5] hover:bg-[#1e2631]/80 transition-colors"
                      onClick={stopCamera}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Draw Tab */}
          {activeTab === 'draw' && !preview && (
            <DrawingCanvas onExport={handleDrawingExport} mode={mode} />
          )}

          {/* Preview (shown for any tab after input) */}
          {preview && (
            <div className="flex flex-col items-center gap-4">
              {editorEligible && rawPreview ? (
                <ImageEditor
                  src={rawPreview}
                  onComplete={(edited: string) => onSketchReady(edited)}
                  onCancel={handleClearPreview}
                  mode={mode}
                />
              ) : (
                <div className="flex flex-col items-center gap-4 w-full">
                  <div className="relative w-full max-w-[512px]">
                    <img
                      src={preview}
                      alt="Sketch preview"
                      className="w-full aspect-square rounded-xl object-contain border-2 border-[#1e2631] bg-[#0d1117]"
                    />
                  </div>
                  <div className="flex gap-2 w-full max-w-[512px]">
                    <button
                      type="button"
                      className="min-h-[44px] flex-1 rounded-xl font-medium bg-[#1e2631] text-[#a6abb5] hover:bg-[#1e2631]/80 transition-colors"
                      onClick={handleClearPreview}
                    >
                      {isFun ? 'Try Again' : 'Change'}
                    </button>
                    <button
                      type="button"
                      className={`min-h-[44px] flex-1 rounded-xl font-semibold text-white transition-all ${
                        isFun
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-lg'
                          : 'bg-[#3D6AF2] hover:bg-[#3D6AF2]/85'
                      }`}
                      onClick={handleUseSketch}
                    >
                      Use this sketch
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
