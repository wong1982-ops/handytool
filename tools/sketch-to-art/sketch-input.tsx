'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { SketchMode, InputMethod } from './types'
import DrawingCanvas from './drawing-canvas'
import { resizeImage } from './image-utils'

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

  // Camera state
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const isFun = mode === 'fun'

  const tabs: { id: InputMethod; label: string; funLabel: string }[] = [
    { id: 'upload', label: 'Upload', funLabel: '📁 Upload' },
    { id: 'camera', label: 'Camera', funLabel: '📸 Camera' },
    { id: 'draw', label: 'Draw', funLabel: '✏️ Draw' },
  ]

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
      // Resize immediately on upload to prevent huge state
      const resized = await resizeImage(result)
      setPreview(resized)
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
    resizeImage(dataUrl).then((resized) => {
      setCapturedPhoto(resized)
      setPreview(resized)
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
  }, [])

  return (
    <div className="flex flex-col gap-4">
      {/* Tab Bar */}
      <div
        role="tablist"
        className={`flex rounded-xl p-1 ${
          isFun
            ? 'bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30'
            : 'bg-[var(--tk-color-surface-100)] dark:bg-[var(--tk-color-surface-800)]'
        }`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`flex-1 min-h-[44px] rounded-lg font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-[var(--tk-color-surface-700)] text-[var(--tk-color-primary-500)] shadow-sm'
                : 'text-[var(--tk-color-text-secondary)] hover:text-[var(--tk-color-text-primary)]'
            }`}
            onClick={() => handleTabSwitch(tab.id)}
          >
            {isFun ? tab.funLabel : tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {/* Upload Tab */}
        {activeTab === 'upload' && !preview && (
          <div
            className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-colors ${
              dragOver
                ? 'border-[var(--tk-color-primary-500)] bg-[var(--tk-color-primary-500)]/5'
                : 'border-[var(--tk-color-surface-300)] dark:border-[var(--tk-color-surface-600)]'
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
          >
            <div className="text-4xl">{isFun ? '🖼️' : '📁'}</div>
            <p className="text-center text-[var(--tk-color-text-secondary)]">
              {isFun ? 'Drop your awesome sketch here!' : 'Drag & drop your sketch here'}
            </p>
            <p className="text-xs text-[var(--tk-color-text-tertiary)]">PNG, JPG, or WebP (max 10 MB)</p>
            <label
              className={`min-h-[44px] inline-flex items-center px-6 rounded-xl font-semibold cursor-pointer transition-colors ${
                isFun
                  ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white hover:from-pink-500 hover:to-purple-600'
                  : 'bg-[var(--tk-color-primary-500)] text-white hover:bg-[var(--tk-color-primary-600)]'
              }`}
            >
              {isFun ? '📂 Browse Files' : 'Browse Files'}
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                className="sr-only"
                onChange={handleFileSelect}
              />
            </label>
            {error && (
              <p className="text-sm text-red-500" role="alert">
                {error}
              </p>
            )}
          </div>
        )}

        {/* Camera Tab */}
        {activeTab === 'camera' && !preview && (
          <div className="flex flex-col items-center gap-4">
            {cameraError ? (
              <div className="flex flex-col items-center gap-3 rounded-xl bg-[var(--tk-color-surface-100)] dark:bg-[var(--tk-color-surface-800)] p-8 text-center">
                <p className="text-[var(--tk-color-text-secondary)]">{cameraError}</p>
                <button
                  type="button"
                  className="min-h-[44px] px-6 rounded-xl bg-[var(--tk-color-primary-500)] text-white font-semibold hover:bg-[var(--tk-color-primary-600)] transition-colors"
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
                    : 'bg-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-600)]'
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
                        : 'bg-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-600)]'
                    }`}
                    onClick={capturePhoto}
                  >
                    {isFun ? '📸 Snap!' : 'Capture'}
                  </button>
                  <button
                    type="button"
                    className="min-h-[44px] px-6 rounded-xl font-medium bg-[var(--tk-color-surface-200)] dark:bg-[var(--tk-color-surface-700)] text-[var(--tk-color-text-primary)] hover:bg-[var(--tk-color-surface-300)] dark:hover:bg-[var(--tk-color-surface-600)] transition-colors"
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
            <div className="relative w-full max-w-[512px]">
              <img
                src={preview}
                alt="Sketch preview"
                className="w-full aspect-square rounded-xl object-contain border-2 border-[var(--tk-color-surface-300)] dark:border-[var(--tk-color-surface-600)] bg-white"
              />
            </div>
            <div className="flex gap-2 w-full max-w-[512px]">
              <button
                type="button"
                className="min-h-[44px] flex-1 rounded-xl font-medium bg-[var(--tk-color-surface-200)] dark:bg-[var(--tk-color-surface-700)] text-[var(--tk-color-text-primary)] hover:bg-[var(--tk-color-surface-300)] dark:hover:bg-[var(--tk-color-surface-600)] transition-colors"
                onClick={handleClearPreview}
              >
                {isFun ? '🔄 Try Again' : 'Change'}
              </button>
              <button
                type="button"
                className={`min-h-[44px] flex-1 rounded-xl font-semibold text-white transition-all ${
                  isFun
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-lg'
                    : 'bg-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-600)]'
                }`}
                onClick={handleUseSketch}
              >
                {isFun ? '✨ Use this sketch →' : 'Use this sketch →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
