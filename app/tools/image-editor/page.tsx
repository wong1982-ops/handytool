'use client'

import { useState, useCallback, useEffect, useRef, type DragEvent, type ChangeEvent } from 'react'
import { EditorToolbar, type ToolType } from '@/tools/image-editor/editor-toolbar'
import { AdjustmentsPanel, type Adjustments } from '@/tools/image-editor/adjustments-panel'
import { FILTER_PRESETS } from '@/tools/image-editor/filter-presets'
import { useFabricCanvas } from '@/tools/image-editor/use-fabric-canvas'

interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
}

const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturate: 0,
  hueRotate: 0,
}

export default function ImageEditorPage() {
  const [activeTool, setActiveTool] = useState<ToolType>('move')
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS)
  const [activeFilter, setActiveFilter] = useState('natural')
  const [filterIntensity, setFilterIntensity] = useState(100)
  const [filterThumbnails, setFilterThumbnails] = useState<Record<string, string>>({})
  const [zoom, setZoom] = useState(100)
  const [fgColor, setFgColor] = useState('#ffffff')
  const [bgColor, setBgColor] = useState('#000000')
  const [layers, setLayers] = useState<Layer[]>([])
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [showMobileAdjustments, setShowMobileAdjustments] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const fabric = useFabricCanvas()

  // Sync state to Fabric canvas
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fabric.setTool(activeTool) }, [activeTool, fabric.setTool])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fabric.applyAdjustments(adjustments) }, [adjustments, fabric.applyAdjustments])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const preset = FILTER_PRESETS.find(p => p.id === activeFilter)
    if (preset) fabric.applyFilterPreset(preset, filterIntensity)
  }, [activeFilter, filterIntensity, fabric.applyFilterPreset])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fabric.setZoom(zoom) }, [zoom, fabric.setZoom])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fabric.setBrushColor(fgColor) }, [fgColor, fabric.setBrushColor])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey
      const tag = (e.target as HTMLElement)?.tagName
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA'

      // Spacebar → pan mode (any tool)
      if (e.code === 'Space' && !isInput && !e.repeat) {
        e.preventDefault()
        fabric.setSpacebarPanning(true)
        return
      }

      if (meta && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        fabric.redo()
        return
      }
      if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        fabric.undo()
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (isInput) return
        e.preventDefault()
        fabric.deleteSelected()
        return
      }
      if (meta && e.key.toLowerCase() === 'a') {
        if (isInput) return
        e.preventDefault()
        fabric.selectAll()
        return
      }
    }
    const keyupHandler = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        fabric.setSpacebarPanning(false)
      }
    }
    window.addEventListener('keydown', handler)
    window.addEventListener('keyup', keyupHandler)
    return () => {
      window.removeEventListener('keydown', handler)
      window.removeEventListener('keyup', keyupHandler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabric.undo, fabric.redo, fabric.deleteSelected, fabric.selectAll, fabric.setSpacebarPanning])

  // Sync zoom slider with hook's fit-to-viewport calculation
  useEffect(() => {
    if (fabric.initialZoom !== zoom) setZoom(fabric.initialZoom)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabric.initialZoom])

  // Sync zoom from wheel zoom (hook → page state)
  useEffect(() => {
    if (fabric.zoomPercent !== zoom) setZoom(fabric.zoomPercent)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabric.zoomPercent])

  const loadImage = useCallback((file: File) => {
    fabric.loadImage(file)
    setLayers([{ id: 'bg', name: `Background (${file.name})`, visible: true, locked: false }])
    setActiveLayerId('bg')
    setAdjustments(DEFAULT_ADJUSTMENTS)
    setActiveFilter('natural')
    setFilterIntensity(100)
    setFilterThumbnails({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabric.loadImage])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) loadImage(file)
  }, [loadImage])

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadImage(file)
  }, [loadImage])

  const handleSwapColors = useCallback(() => {
    setFgColor((prevFg) => {
      setBgColor(prevFg)
      return bgColor
    })
  }, [bgColor])

  const handleExport = useCallback(() => {
    fabric.exportPNG()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabric.exportPNG])

  const handleExportJPEG = useCallback(() => {
    fabric.exportJPEG()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabric.exportJPEG])

  const handleReset = useCallback(() => {
    setAdjustments(DEFAULT_ADJUSTMENTS)
    setActiveFilter('natural')
    setFilterIntensity(100)
    setFilterThumbnails({})
    setZoom(100)
    fabric.reset()
    setLayers([])
    setActiveLayerId(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabric.reset])

  const toggleLayerVisibility = useCallback((id: string) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)))
  }, [])

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#101622]">
      {/* Top bar */}
      <header className="h-12 border-b border-slate-700 flex items-center justify-between px-4 shrink-0 bg-[#101622]">
        <div className="flex items-center gap-4">
          <nav aria-label="Breadcrumb" className="hidden sm:block">
            <ol className="flex items-center gap-1.5 text-sm text-slate-400">
              <li><a href="/tools" className="hover:text-[var(--ht-color-primary-500)] transition-colors">Home</a></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white font-medium">Image Editor</li>
            </ol>
          </nav>

          {/* Dropdown menus */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-400 ml-6">
            {/* File menu */}
            <div className="group relative">
              <button className="hover:text-white transition-colors cursor-pointer px-3 py-1 rounded hover:bg-slate-800">File</button>
              <div className="hidden group-hover:block group-focus-within:block absolute top-full left-0 mt-0.5 w-48 bg-[#1a2333] border border-slate-700 rounded-lg shadow-xl z-50 py-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                >
                  Open Image...
                </button>
                <button
                  onClick={handleExport}
                  disabled={!fabric.imageSize}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Export PNG
                </button>
                <button
                  onClick={handleExportJPEG}
                  disabled={!fabric.imageSize}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Export JPEG
                </button>
              </div>
            </div>

            {/* Edit menu */}
            <div className="group relative">
              <button className="hover:text-white transition-colors cursor-pointer px-3 py-1 rounded hover:bg-slate-800">Edit</button>
              <div className="hidden group-hover:block group-focus-within:block absolute top-full left-0 mt-0.5 w-48 bg-[#1a2333] border border-slate-700 rounded-lg shadow-xl z-50 py-1">
                <button
                  onClick={fabric.undo}
                  disabled={!fabric.canUndo}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-between"
                >
                  <span>Undo</span>
                  <kbd className="text-[10px] text-slate-500">Ctrl+Z</kbd>
                </button>
                <button
                  onClick={fabric.redo}
                  disabled={!fabric.canRedo}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-between"
                >
                  <span>Redo</span>
                  <kbd className="text-[10px] text-slate-500">Ctrl+Shift+Z</kbd>
                </button>
                <div className="h-px bg-slate-700 my-1" />
                <button
                  onClick={fabric.deleteSelected}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span>Delete Selected</span>
                  <kbd className="text-[10px] text-slate-500">Del</kbd>
                </button>
                <button
                  onClick={fabric.selectAll}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span>Select All</span>
                  <kbd className="text-[10px] text-slate-500">Ctrl+A</kbd>
                </button>
              </div>
            </div>

            {/* Image menu */}
            <div className="group relative">
              <button className="hover:text-white transition-colors cursor-pointer px-3 py-1 rounded hover:bg-slate-800">Image</button>
              <div className="hidden group-hover:block group-focus-within:block absolute top-full left-0 mt-0.5 w-48 bg-[#1a2333] border border-slate-700 rounded-lg shadow-xl z-50 py-1">
                <button
                  onClick={fabric.rotateCW}
                  disabled={!fabric.imageSize}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Rotate Clockwise
                </button>
                <button
                  onClick={fabric.rotateCCW}
                  disabled={!fabric.imageSize}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Rotate Counter-Clockwise
                </button>
                <div className="h-px bg-slate-700 my-1" />
                <button
                  onClick={fabric.flipH}
                  disabled={!fabric.imageSize}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Flip Horizontal
                </button>
                <button
                  onClick={fabric.flipV}
                  disabled={!fabric.imageSize}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Flip Vertical
                </button>
              </div>
            </div>

            {/* Filters menu */}
            <div className="group relative">
              <button className="hover:text-white transition-colors cursor-pointer px-3 py-1 rounded hover:bg-slate-800">Filters</button>
              <div className="hidden group-hover:block group-focus-within:block absolute top-full left-0 mt-0.5 w-48 bg-[#1a2333] border border-slate-700 rounded-lg shadow-xl z-50 py-1 max-h-64 overflow-y-auto">
                {FILTER_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveFilter(p.id)}
                    className={`w-full text-left px-4 py-1.5 text-sm transition-colors cursor-pointer flex items-center justify-between ${
                      activeFilter === p.id
                        ? 'text-[var(--ht-color-primary-500)] bg-[var(--ht-color-primary-500)]/10'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{p.name}</span>
                    {activeFilter === p.id && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <button
            onClick={fabric.undo}
            disabled={!fabric.canUndo}
            className="p-2 hover:bg-slate-800 rounded transition-colors text-slate-400 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Undo"
            aria-label="Undo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4" />
            </svg>
          </button>
          <button
            onClick={fabric.redo}
            disabled={!fabric.canRedo}
            className="p-2 hover:bg-slate-800 rounded transition-colors text-slate-400 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Redo"
            aria-label="Redo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a5 5 0 00-5 5v2m15-7l-4-4m4 4l-4 4" />
            </svg>
          </button>

          <div className="w-px h-6 bg-slate-700 mx-1" />

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-2 hover:bg-slate-800 rounded transition-colors text-slate-400 cursor-pointer"
            title="Reset adjustments"
            aria-label="Reset adjustments"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Mobile adjustments toggle */}
          <button
            onClick={() => setShowMobileAdjustments(!showMobileAdjustments)}
            className="lg:hidden p-2 hover:bg-slate-800 rounded transition-colors text-slate-400 cursor-pointer"
            aria-label="Toggle adjustments panel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            disabled={!fabric.imageSize}
            className="bg-[var(--ht-color-primary-500)] hover:bg-[var(--ht-color-primary-600,#2d5ad2)] text-white font-bold py-1.5 px-4 rounded-lg text-sm transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </header>

      {/* Main editor area */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left toolbar */}
        <EditorToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          fgColor={fgColor}
          bgColor={bgColor}
          onSwapColors={handleSwapColors}
        />

        {/* Center canvas */}
        <section
          className="flex-1 relative overflow-hidden"
          style={{
            backgroundImage:
              'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            backgroundColor: '#141b2a',
          }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {/* Upload prompt — absolutely positioned so it doesn't affect scroll layout */}
          {!fabric.imageSize && (
            <div
              className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click() } }}
              aria-label="Upload an image"
            >
              <div
                className={`flex flex-col items-center gap-4 p-10 rounded-2xl border-2 border-dashed transition-all ${
                  dragging
                    ? 'border-[var(--ht-color-primary-500)] bg-[var(--ht-color-primary-500)]/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <svg className="w-16 h-16 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-slate-400 text-sm font-medium">Drop an image here or click to upload</p>
                <span
                  className="bg-[var(--ht-color-primary-500)] hover:bg-[var(--ht-color-primary-600,#2d5ad2)] text-white font-bold py-2 px-6 rounded-lg text-sm transition-all"
                >
                  Choose Image
                </span>
                <p className="text-slate-600 text-xs">Supports JPG, PNG, WebP, GIF</p>
              </div>
            </div>
          )}

          {/* Fabric canvas — fills the section as a viewport, always in DOM for Fabric init */}
          <div className={!fabric.imageSize ? 'absolute w-0 h-0 overflow-hidden' : 'absolute inset-0'}>
            <canvas ref={fabric.canvasRef} />
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </section>

        {/* Right panel -- adjustments + layers */}
        <div className="hidden lg:flex flex-col w-72 border-l border-slate-700 bg-[#1a2333] shrink-0 overflow-hidden">
          {/* Adjustments (scrollable) */}
          <div className="flex-1 overflow-y-auto">
            <AdjustmentsPanel
              adjustments={adjustments}
              onAdjustmentsChange={setAdjustments}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              filterIntensity={filterIntensity}
              onFilterIntensityChange={setFilterIntensity}
              filterThumbnails={filterThumbnails}
              zoom={zoom}
              onZoomChange={setZoom}
              imageSize={fabric.imageSize}
            />
          </div>

          {/* Layers */}
          <div className="border-t border-slate-700">
            <div className="p-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Layers</h3>
              <span className="text-[10px] text-slate-500">{layers.length} layer{layers.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="max-h-40 overflow-y-auto px-1 pb-2 space-y-0.5">
              {layers.length === 0 ? (
                <p className="text-[11px] text-slate-600 px-3 py-2">No layers yet</p>
              ) : (
                layers.map((layer) => (
                  <div
                    key={layer.id}
                    onClick={() => setActiveLayerId(layer.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors ${
                      activeLayerId === layer.id
                        ? 'bg-[var(--ht-color-primary-500)]/20 border border-[var(--ht-color-primary-500)]/30'
                        : 'hover:bg-slate-800'
                    }`}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id) }}
                      className="text-slate-400 hover:text-white cursor-pointer"
                      aria-label={layer.visible ? `Hide ${layer.name}` : `Show ${layer.name}`}
                    >
                      {layer.visible ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                    <span className={`text-xs font-medium truncate ${activeLayerId === layer.id ? 'text-white' : 'text-slate-400'}`}>
                      {layer.name}
                    </span>
                    {layer.locked && (
                      <svg className="w-3 h-3 text-slate-500 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Mobile adjustments overlay */}
        {showMobileAdjustments && (
          <>
            <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setShowMobileAdjustments(false)} />
            <div className="fixed right-0 top-0 bottom-0 w-72 bg-[#1a2333] z-40 lg:hidden shadow-2xl overflow-y-auto">
              <div className="p-3 border-b border-slate-700 flex items-center justify-between">
                <span className="font-bold text-sm text-white">Adjustments</span>
                <button onClick={() => setShowMobileAdjustments(false)} className="p-1 hover:bg-slate-800 rounded cursor-pointer" aria-label="Close">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <AdjustmentsPanel
                adjustments={adjustments}
                onAdjustmentsChange={setAdjustments}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                filterIntensity={filterIntensity}
                onFilterIntensityChange={setFilterIntensity}
                filterThumbnails={filterThumbnails}
                zoom={zoom}
                onZoomChange={setZoom}
                imageSize={fabric.imageSize}
              />
            </div>
          </>
        )}
      </main>

      {/* Bottom status bar */}
      <footer className="h-7 border-t border-slate-700 bg-[#101622] flex items-center justify-between px-4 text-[10px] font-medium text-slate-500 shrink-0">
        <div className="flex items-center gap-4">
          {fabric.imageSize ? (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {fabric.imageSize.width} x {fabric.imageSize.height} px
            </span>
          ) : (
            <span>No image loaded</span>
          )}
          <span>Zoom: {zoom}%</span>
          <span className="capitalize">Tool: {activeTool}</span>
        </div>
        <div className="flex items-center gap-3">
          {activeFilter !== 'natural' && (
            <span className="text-[var(--ht-color-primary-500)]">Filter: {FILTER_PRESETS.find((p) => p.id === activeFilter)?.name}</span>
          )}
          <span className="hidden sm:inline">Client-side editing</span>
        </div>
      </footer>
    </div>
  )
}
