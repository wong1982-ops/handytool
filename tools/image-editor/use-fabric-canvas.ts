'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ToolType } from './editor-toolbar'
import type { Adjustments } from './adjustments-panel'
import type { FilterPresetConfig } from './filter-presets'

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FabricCanvasAPI {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  isReady: boolean
  imageSize: { width: number; height: number } | null
  initialZoom: number
  loadImage: (file: File) => void
  setTool: (tool: ToolType) => void
  setBrushColor: (color: string) => void
  setBrushWidth: (width: number) => void
  applyAdjustments: (adj: Adjustments) => void
  applyFilterPreset: (preset: FilterPresetConfig, intensity: number) => void
  generateFilterThumbnails: () => Promise<Record<string, string>>
  setZoom: (zoomPercent: number) => void
  /** Current zoom percent (kept in sync with wheel zoom) */
  zoomPercent: number
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  deleteSelected: () => void
  selectAll: () => void
  rotateCW: () => void
  rotateCCW: () => void
  flipH: () => void
  flipV: () => void
  exportPNG: () => void
  exportJPEG: (quality?: number) => void
  reset: () => void
  /** Enable/disable spacebar-pan mode (call from keydown/keyup) */
  setSpacebarPanning: (active: boolean) => void
  isPanning: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_HISTORY = 30

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useFabricCanvas(): FabricCanvasAPI {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Fabric module & canvas instance — mutable refs, never trigger re-render
  const fabricModuleRef = useRef<any>(null)
  const fabricRef = useRef<any>(null) // fabric.Canvas instance
  const bgImageRef = useRef<any>(null) // fabric.FabricImage background

  // State exposed to consumers
  const [isReady, setIsReady] = useState(false)
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [initialZoom, setInitialZoom] = useState(100)

  // Undo / redo stacks
  const historyRef = useRef<string[]>([])
  const redoStackRef = useRef<string[]>([])
  const isRestoringRef = useRef(false)
  const isUndoRedoInProgressRef = useRef(false)

  // Current tool / brush settings
  const activeToolRef = useRef<ToolType>('move')
  const brushColorRef = useRef('#000000')
  const brushWidthRef = useRef(5)

  // One-shot handler cleanup for text tool
  const textHandlerRef = useRef<((e: any) => void) | null>(null)

  // Pan handler refs for move tool cleanup
  const panHandlersRef = useRef<{ down: any; move: any; up: any } | null>(null)

  // Pending file to load once Fabric initialises
  const pendingFileRef = useRef<File | null>(null)

  // Image native dimensions (ref for use in callbacks without deps)
  const imageSizeRef = useRef<{ width: number; height: number } | null>(null)

  // Initial zoom calculated by fit-to-viewport
  const initialZoomRef = useRef(1)

  // Universal pan/zoom state
  const [isPanning, setIsPanning] = useState(false)
  const [zoomPercent, setZoomPercent] = useState(100)
  const spacebarDownRef = useRef(false)
  const spacebarPanRef = useRef<{ active: boolean; lastX: number; lastY: number }>({
    active: false, lastX: 0, lastY: 0,
  })
  // Track the tool that was active before spacebar pan started
  const prePanToolStateRef = useRef<{
    cursor: string
    isDrawingMode: boolean
  } | null>(null)

  // ------------------------------------------------------------------
  // History helpers
  // ------------------------------------------------------------------

  const pushHistory = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas || isRestoringRef.current) return
    const json = JSON.stringify(canvas.toJSON(['__isBgImage', '__isCropRect']))
    const stack = historyRef.current
    stack.push(json)
    if (stack.length > MAX_HISTORY) stack.shift()
    redoStackRef.current = []
    setCanUndo(stack.length > 1)
    setCanRedo(false)
  }, [])

  const restoreFromJSON = useCallback(async (json: string) => {
    const canvas = fabricRef.current
    const fabric = fabricModuleRef.current
    if (!canvas || !fabric) return
    isRestoringRef.current = true
    try {
      await canvas.loadFromJSON(json)
      canvas.renderAll()
      // Re-acquire the background image reference
      const objects = canvas.getObjects() as any[]
      bgImageRef.current = objects.find((o: any) => o.__isBgImage) ?? null
    } finally {
      isRestoringRef.current = false
    }
  }, [])

  // ------------------------------------------------------------------
  // loadImage
  // ------------------------------------------------------------------

  const loadImageInternal = useCallback((file: File) => {
    const canvas = fabricRef.current
    const fabric = fabricModuleRef.current
    if (!canvas || !fabric) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      if (!dataUrl) return

      const imgEl = new Image()
      imgEl.onload = async () => {
        const imgW = imgEl.naturalWidth
        const imgH = imgEl.naturalHeight

        // Size canvas to fill the section viewport
        const section = canvasRef.current?.closest('section')
        const viewW = section?.clientWidth ?? imgW
        const viewH = section?.clientHeight ?? imgH
        canvas.setDimensions({ width: viewW, height: viewH })

        // Calculate fit zoom (never upscale beyond 100%)
        const fitZoom = Math.min(viewW / imgW, viewH / imgH, 1)

        // Center the image via viewport transform
        const offsetX = (viewW - imgW * fitZoom) / 2
        const offsetY = (viewH - imgH * fitZoom) / 2
        canvas.setViewportTransform([fitZoom, 0, 0, fitZoom, offsetX, offsetY])

        imageSizeRef.current = { width: imgW, height: imgH }
        setImageSize({ width: imgW, height: imgH })
        initialZoomRef.current = fitZoom
        const fitPercent = Math.round(fitZoom * 100)
        setInitialZoom(fitPercent)
        setZoomPercent(fitPercent)

        // Create the Fabric image at canvas origin
        const fabricImg = new fabric.FabricImage(imgEl, {
          selectable: false,
          evented: false,
          hasControls: false,
          hasBorders: false,
          lockMovementX: true,
          lockMovementY: true,
          left: 0,
          top: 0,
        }) as any
        fabricImg.__isBgImage = true

        // Clear previous content
        canvas.clear()
        canvas.add(fabricImg)
        canvas.sendObjectToBack(fabricImg)
        bgImageRef.current = fabricImg
        canvas.renderAll()

        // Reset history
        historyRef.current = []
        redoStackRef.current = []
        setCanUndo(false)
        setCanRedo(false)
        pushHistory()
      }
      imgEl.onerror = () => {
        console.error('[useFabricCanvas] Failed to load image from data URL')
      }
      imgEl.src = dataUrl
    }
    reader.onerror = () => {
      console.error('[useFabricCanvas] Failed to read file:', reader.error)
    }
    reader.readAsDataURL(file)
  }, [pushHistory])

  const loadImage = useCallback((file: File) => {
    if (!fabricRef.current || !fabricModuleRef.current) {
      // Queue the file — will be processed when Fabric initialises
      pendingFileRef.current = file
      return
    }
    loadImageInternal(file)
  }, [loadImageInternal])

  // ------------------------------------------------------------------
  // Initialise Fabric canvas (dynamic import, SSR-safe)
  // ------------------------------------------------------------------

  useEffect(() => {
    let disposed = false

    async function init() {
      if (!canvasRef.current) return
      const fabric = await import('fabric')
      if (disposed) return

      fabricModuleRef.current = fabric
      const canvas = new fabric.Canvas(canvasRef.current, {
        selection: true,
        backgroundColor: 'transparent',
        preserveObjectStacking: true,
      })

      fabricRef.current = canvas
      setIsReady(true)

      // Listen for object modifications to push history
      canvas.on('object:modified', () => pushHistory())
      canvas.on('path:created', () => pushHistory())

      // --- Mouse wheel zoom (zoom at cursor position) ---
      canvas.on('mouse:wheel', (opt: any) => {
        const e = opt.e as WheelEvent
        e.preventDefault()
        e.stopPropagation()

        const delta = e.deltaY
        const vpt = [...canvas.viewportTransform!]
        let currentZoom = vpt[0]
        const zoomStep = delta > 0 ? 0.9 : 1.1
        let newZoom = currentZoom * zoomStep

        // Clamp between 25% and 300%
        newZoom = Math.min(Math.max(newZoom, 0.25), 3)

        // Zoom toward cursor position
        const pointer = canvas.getViewportPoint(opt.e)
        vpt[0] = newZoom
        vpt[3] = newZoom
        vpt[4] = pointer.x - (pointer.x - vpt[4]) * (newZoom / currentZoom)
        vpt[5] = pointer.y - (pointer.y - vpt[5]) * (newZoom / currentZoom)

        canvas.setViewportTransform(vpt as any)
        canvas.requestRenderAll()
        setZoomPercent(Math.round(newZoom * 100))
      })

      // --- Middle-click pan (button 1 = middle mouse) ---
      let middlePanning = false
      let midLastX = 0
      let midLastY = 0

      canvas.on('mouse:down', (opt: any) => {
        if (opt.e.button === 1) {
          middlePanning = true
          midLastX = opt.e.clientX
          midLastY = opt.e.clientY
          canvas.defaultCursor = 'grabbing'
          opt.e.preventDefault()
        }
      })
      canvas.on('mouse:move', (opt: any) => {
        // Middle-click pan
        if (middlePanning) {
          const vpt = canvas.viewportTransform!
          vpt[4] += opt.e.clientX - midLastX
          vpt[5] += opt.e.clientY - midLastY
          midLastX = opt.e.clientX
          midLastY = opt.e.clientY
          canvas.requestRenderAll()
          return
        }
        // Spacebar pan
        if (spacebarPanRef.current.active) {
          const vpt = canvas.viewportTransform!
          vpt[4] += opt.e.clientX - spacebarPanRef.current.lastX
          vpt[5] += opt.e.clientY - spacebarPanRef.current.lastY
          spacebarPanRef.current.lastX = opt.e.clientX
          spacebarPanRef.current.lastY = opt.e.clientY
          canvas.requestRenderAll()
        }
      })
      canvas.on('mouse:up', () => {
        if (middlePanning) {
          middlePanning = false
          canvas.defaultCursor = activeToolRef.current === 'move' ? 'grab' : 'default'
        }
        if (spacebarPanRef.current.active) {
          spacebarPanRef.current.active = false
        }
      })

      // Process any file queued before Fabric was ready
      if (pendingFileRef.current) {
        const pending = pendingFileRef.current
        pendingFileRef.current = null
        loadImageInternal(pending)
      }
    }

    init()

    return () => {
      disposed = true
      const canvas = fabricRef.current
      if (canvas) {
        canvas.dispose()
        fabricRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ------------------------------------------------------------------
  // Tool switching helpers
  // ------------------------------------------------------------------

  const removeTextHandler = useCallback(() => {
    const canvas = fabricRef.current
    if (textHandlerRef.current && canvas) {
      canvas.off('mouse:down', textHandlerRef.current)
      textHandlerRef.current = null
    }
  }, [])

  const removePanHandlers = useCallback(() => {
    const canvas = fabricRef.current
    const h = panHandlersRef.current
    if (!canvas || !h) return
    canvas.off('mouse:down', h.down)
    canvas.off('mouse:move', h.move)
    canvas.off('mouse:up', h.up)
    panHandlersRef.current = null
  }, [])

  const removeCropRect = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    const objects = canvas.getObjects() as any[]
    objects.forEach((obj: any) => {
      if (obj.__isCropRect) canvas.remove(obj)
    })
    canvas.renderAll()
  }, [])

  const setTool = useCallback((tool: ToolType) => {
    const canvas = fabricRef.current
    const fabric = fabricModuleRef.current
    if (!canvas || !fabric) return

    activeToolRef.current = tool

    // Clean up previous tool state
    removeTextHandler()
    removePanHandlers()
    canvas.isDrawingMode = false
    canvas.selection = false
    canvas.defaultCursor = 'default'

    // Make objects non-selectable by default; tools that need it will override
    const allObjects = canvas.getObjects() as any[]
    allObjects.forEach((obj: any) => {
      if (!obj.__isBgImage && !obj.__isCropRect) {
        obj.selectable = false
        obj.evented = false
      }
    })

    switch (tool) {
      case 'move': {
        canvas.defaultCursor = 'default'
        canvas.selection = true
        allObjects.forEach((obj: any) => {
          if (!obj.__isBgImage && !obj.__isCropRect) {
            obj.selectable = true
            obj.evented = true
          }
        })
        break
      }

      case 'hand': {
        canvas.defaultCursor = 'grab'
        canvas.selection = false

        let isPanningHand = false
        let lastX = 0
        let lastY = 0

        const panDown = (opt: any) => {
          isPanningHand = true
          lastX = opt.e.clientX
          lastY = opt.e.clientY
          canvas.defaultCursor = 'grabbing'
        }
        const panMove = (opt: any) => {
          if (!isPanningHand) return
          const vpt = canvas.viewportTransform!
          vpt[4] += opt.e.clientX - lastX
          vpt[5] += opt.e.clientY - lastY
          lastX = opt.e.clientX
          lastY = opt.e.clientY
          canvas.requestRenderAll()
        }
        const panUp = () => {
          isPanningHand = false
          canvas.defaultCursor = 'grab'
        }

        panHandlersRef.current = { down: panDown, move: panMove, up: panUp }
        canvas.on('mouse:down', panDown)
        canvas.on('mouse:move', panMove)
        canvas.on('mouse:up', panUp)
        break
      }

      case 'brush': {
        canvas.isDrawingMode = true
        const brush = new fabric.PencilBrush(canvas)
        brush.width = brushWidthRef.current
        brush.color = brushColorRef.current
        canvas.freeDrawingBrush = brush
        break
      }

      case 'eraser': {
        canvas.isDrawingMode = true
        if ((fabric as any).EraserBrush) {
          canvas.freeDrawingBrush = new (fabric as any).EraserBrush(canvas)
          canvas.freeDrawingBrush.width = 20
        } else {
          // Fallback: white brush as eraser
          const eraserBrush = new fabric.PencilBrush(canvas)
          eraserBrush.width = 20
          eraserBrush.color = '#FFFFFF'
          canvas.freeDrawingBrush = eraserBrush
        }
        break
      }

      case 'text': {
        canvas.defaultCursor = 'text'
        const handler = (evt: any) => {
          const pointer = canvas.getScenePoint(evt.e)
          const text = new fabric.IText('Type here', {
            left: pointer.x,
            top: pointer.y,
            fontSize: 24,
            fill: brushColorRef.current,
            fontFamily: 'sans-serif',
          })
          canvas.add(text)
          canvas.setActiveObject(text)
          text.enterEditing()
          canvas.renderAll()
          pushHistory()

          // One-shot: remove handler after first placement
          removeTextHandler()
        }
        textHandlerRef.current = handler
        canvas.on('mouse:down', handler)
        break
      }

      case 'select': {
        canvas.selection = true
        canvas.defaultCursor = 'default'
        allObjects.forEach((obj: any) => {
          if (!obj.__isBgImage && !obj.__isCropRect) {
            obj.selectable = true
            obj.evented = true
          }
        })
        break
      }

      case 'crop': {
        removeCropRect()
        canvas.selection = false
        canvas.defaultCursor = 'crosshair'
        const w = canvas.width ?? 200
        const h = canvas.height ?? 200
        const cropRect = new fabric.Rect({
          left: w * 0.1,
          top: h * 0.1,
          width: w * 0.8,
          height: h * 0.8,
          fill: 'rgba(0,0,0,0.3)',
          stroke: '#ffffff',
          strokeDashArray: [6, 4],
          strokeWidth: 2,
          selectable: true,
          evented: true,
          hasControls: true,
          hasBorders: true,
          lockRotation: true,
          cornerColor: '#ffffff',
          cornerSize: 8,
          transparentCorners: false,
        }) as any
        cropRect.__isCropRect = true
        canvas.add(cropRect)
        canvas.setActiveObject(cropRect)
        canvas.renderAll()
        break
      }
    }
  }, [pushHistory, removeTextHandler, removePanHandlers, removeCropRect])

  // ------------------------------------------------------------------
  // Brush helpers
  // ------------------------------------------------------------------

  const setBrushColor = useCallback((color: string) => {
    brushColorRef.current = color
    const canvas = fabricRef.current
    if (canvas?.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color
    }
  }, [])

  const setBrushWidth = useCallback((width: number) => {
    brushWidthRef.current = width
    const canvas = fabricRef.current
    if (canvas?.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = width
    }
  }, [])

  // ------------------------------------------------------------------
  // Adjustments (applied to bgImage filters — non-preset filters)
  // ------------------------------------------------------------------

  const applyAdjustments = useCallback((adj: Adjustments) => {
    const bgImg = bgImageRef.current
    const fabric = fabricModuleRef.current
    const canvas = fabricRef.current
    if (!bgImg || !fabric || !canvas) return

    // Fabric filters module is nested under fabric.filters or directly on the module
    const filters = fabric.filters ?? fabric

    // Keep only __isPreset filters
    const currentFilters: any[] = bgImg.filters ?? []
    const presetFilters = currentFilters.filter((f: any) => f.__isPreset)

    // Build new adjustment filters
    const adjustmentFilters: any[] = []

    if (adj.brightness !== 0) {
      const f = new filters.Brightness({ brightness: adj.brightness / 100 })
      adjustmentFilters.push(f)
    }
    if (adj.contrast !== 0) {
      const f = new filters.Contrast({ contrast: adj.contrast / 100 })
      adjustmentFilters.push(f)
    }
    if (adj.saturate !== 0) {
      const f = new filters.Saturation({ saturation: adj.saturate / 100 })
      adjustmentFilters.push(f)
    }
    if (adj.hueRotate !== 0) {
      const f = new filters.HueRotation({ rotation: adj.hueRotate / 180 })
      adjustmentFilters.push(f)
    }

    bgImg.filters = [...adjustmentFilters, ...presetFilters]
    bgImg.applyFilters()
    canvas.renderAll()
  }, [])

  // ------------------------------------------------------------------
  // Filter presets (applied on top of adjustments)
  // ------------------------------------------------------------------

  const applyFilterPreset = useCallback((preset: FilterPresetConfig, intensity: number) => {
    const bgImg = bgImageRef.current
    const fabric = fabricModuleRef.current
    const canvas = fabricRef.current
    if (!bgImg || !fabric || !canvas) return

    const filtersNS = fabric.filters ?? fabric

    // Keep only non-preset (adjustment) filters
    const currentFilters: any[] = bgImg.filters ?? []
    const adjustmentFilters = currentFilters.filter((f: any) => !f.__isPreset)

    const presetFilters: any[] = []
    const scale = intensity / 100

    if (scale > 0 && preset.filters.length > 0) {
      for (const f of preset.filters) {
        const FilterClass = (filtersNS as any)[f.type]
        if (!FilterClass) continue

        const tag = (inst: any) => { inst.__isPreset = true; return inst }

        // Boolean filters (Grayscale, Sepia) — apply at full strength
        if (Object.keys(f.params).length === 0) {
          presetFilters.push(tag(new FilterClass()))
          continue
        }

        // Numeric filters — scale params by intensity
        const scaledParams: Record<string, number> = {}
        for (const [k, v] of Object.entries(f.params)) {
          scaledParams[k] = v * scale
        }
        presetFilters.push(tag(new FilterClass(scaledParams)))
      }
    }

    bgImg.filters = [...adjustmentFilters, ...presetFilters]
    bgImg.applyFilters()
    canvas.renderAll()
  }, [])

  // ------------------------------------------------------------------
  // Filter thumbnail generation (64x64 off-screen previews)
  // ------------------------------------------------------------------

  const generateFilterThumbnails = useCallback(async (): Promise<Record<string, string>> => {
    const bgImg = bgImageRef.current
    const fabric = fabricModuleRef.current
    if (!bgImg || !fabric) return {}

    const { FILTER_PRESETS } = await import('./filter-presets')
    const filtersNS = fabric.filters ?? fabric
    const thumbnails: Record<string, string> = {}

    const srcElement = bgImg.getElement() as HTMLImageElement
    if (!srcElement || !srcElement.naturalWidth) return {}

    const thumbSize = 64
    const offscreen = document.createElement('canvas')
    offscreen.width = thumbSize
    offscreen.height = thumbSize
    const ctx = offscreen.getContext('2d')!

    // Calculate scale to fit image in thumbnail
    const scale = Math.min(thumbSize / srcElement.naturalWidth, thumbSize / srcElement.naturalHeight)
    const w = srcElement.naturalWidth * scale
    const h = srcElement.naturalHeight * scale
    const x = (thumbSize - w) / 2
    const y = (thumbSize - h) / 2

    // Natural thumbnail (no filters)
    ctx.clearRect(0, 0, thumbSize, thumbSize)
    ctx.drawImage(srcElement, x, y, w, h)
    thumbnails['natural'] = offscreen.toDataURL('image/jpeg', 0.6)

    for (const preset of FILTER_PRESETS) {
      if (preset.id === 'natural') continue

      // Yield to main thread to avoid blocking
      await new Promise(resolve => setTimeout(resolve, 0))

      try {
        const tempImg = new fabric.FabricImage(srcElement, {
          scaleX: scale,
          scaleY: scale,
        })

        const presetFilters: any[] = []
        for (const f of preset.filters) {
          const FilterClass = (filtersNS as any)[f.type]
          if (!FilterClass) continue
          if (Object.keys(f.params).length === 0) {
            presetFilters.push(new FilterClass())
          } else {
            presetFilters.push(new FilterClass(f.params))
          }
        }
        tempImg.filters = presetFilters
        tempImg.applyFilters()

        const el = tempImg.toCanvasElement()
        ctx.clearRect(0, 0, thumbSize, thumbSize)
        const dw = Math.min(thumbSize, el.width)
        const dh = Math.min(thumbSize, el.height)
        const dx = (thumbSize - dw) / 2
        const dy = (thumbSize - dh) / 2
        ctx.drawImage(el, dx, dy, dw, dh)
        thumbnails[preset.id] = offscreen.toDataURL('image/jpeg', 0.6)
      } catch {
        // Skip failed thumbnails silently
      }
    }

    return thumbnails
  }, [])

  // ------------------------------------------------------------------
  // Zoom
  // ------------------------------------------------------------------

  const setZoom = useCallback((percent: number) => {
    const canvas = fabricRef.current
    if (!canvas) return
    const newZoom = percent / 100
    const vpt = canvas.viewportTransform!
    const oldZoom = vpt[0]

    // Zoom toward viewport center (preserves pan position relative to center)
    const viewW = canvas.width ?? 0
    const viewH = canvas.height ?? 0
    const cx = viewW / 2
    const cy = viewH / 2

    vpt[0] = newZoom
    vpt[3] = newZoom
    vpt[4] = cx - (cx - vpt[4]) * (newZoom / oldZoom)
    vpt[5] = cy - (cy - vpt[5]) * (newZoom / oldZoom)

    canvas.setViewportTransform(vpt as any)
    canvas.requestRenderAll()
    setZoomPercent(percent)
  }, [])

  // ------------------------------------------------------------------
  // Undo / Redo
  // ------------------------------------------------------------------

  const undo = useCallback(async () => {
    if (isUndoRedoInProgressRef.current) return
    const stack = historyRef.current
    if (stack.length <= 1) return

    isUndoRedoInProgressRef.current = true
    const current = stack.pop()!
    redoStackRef.current.push(current)
    const previous = stack[stack.length - 1]

    try {
      await restoreFromJSON(previous)
    } catch {
      // Restore the popped item back on failure
      stack.push(redoStackRef.current.pop()!)
    }
    setCanUndo(stack.length > 1)
    setCanRedo(redoStackRef.current.length > 0)
    isUndoRedoInProgressRef.current = false
  }, [restoreFromJSON])

  const redo = useCallback(async () => {
    if (isUndoRedoInProgressRef.current) return
    const redoStack = redoStackRef.current
    if (redoStack.length === 0) return

    isUndoRedoInProgressRef.current = true
    const next = redoStack.pop()!
    historyRef.current.push(next)

    try {
      await restoreFromJSON(next)
    } catch {
      // Restore on failure
      redoStack.push(historyRef.current.pop()!)
    }
    setCanUndo(historyRef.current.length > 1)
    setCanRedo(redoStack.length > 0)
    isUndoRedoInProgressRef.current = false
  }, [restoreFromJSON])

  // ------------------------------------------------------------------
  // Selection / deletion
  // ------------------------------------------------------------------

  const deleteSelected = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    const active = canvas.getActiveObjects()
    if (!active || active.length === 0) return
    active.forEach((obj: any) => {
      if (!obj.__isBgImage && !obj.__isCropRect) canvas.remove(obj)
    })
    canvas.discardActiveObject()
    canvas.renderAll()
    pushHistory()
  }, [pushHistory])

  const selectAll = useCallback(() => {
    const canvas = fabricRef.current
    const fabric = fabricModuleRef.current
    if (!canvas || !fabric) return
    const objects = (canvas.getObjects() as any[]).filter(
      (o: any) => !o.__isBgImage && !o.__isCropRect
    )
    if (objects.length === 0) return
    const selection = new fabric.ActiveSelection(objects, { canvas })
    canvas.setActiveObject(selection)
    canvas.renderAll()
  }, [])

  // ------------------------------------------------------------------
  // Transform helpers
  // ------------------------------------------------------------------

  const rotateCW = useCallback(() => {
    const img = bgImageRef.current
    const canvas = fabricRef.current
    if (!img || !canvas) return
    img.rotate((img.angle || 0) + 90)
    img.setCoords()
    canvas.renderAll()
    pushHistory()
  }, [pushHistory])

  const rotateCCW = useCallback(() => {
    const img = bgImageRef.current
    const canvas = fabricRef.current
    if (!img || !canvas) return
    img.rotate((img.angle || 0) - 90)
    img.setCoords()
    canvas.renderAll()
    pushHistory()
  }, [pushHistory])

  const flipH = useCallback(() => {
    const img = bgImageRef.current
    const canvas = fabricRef.current
    if (!img || !canvas) return
    img.set('flipX', !img.flipX)
    canvas.renderAll()
    pushHistory()
  }, [pushHistory])

  const flipV = useCallback(() => {
    const img = bgImageRef.current
    const canvas = fabricRef.current
    if (!img || !canvas) return
    img.set('flipY', !img.flipY)
    canvas.renderAll()
    pushHistory()
  }, [pushHistory])

  // ------------------------------------------------------------------
  // Export (resets zoom to 1x temporarily for full-resolution output)
  // ------------------------------------------------------------------

  const exportCanvas = useCallback((format: 'png' | 'jpeg', quality?: number) => {
    const canvas = fabricRef.current
    const imgSize = imageSizeRef.current
    if (!canvas || !imgSize) return

    // Save current viewport and canvas size
    const savedVPT = [...canvas.viewportTransform!]
    const savedW = canvas.width ?? 0
    const savedH = canvas.height ?? 0

    // Set to full resolution for export (identity viewport, native image size)
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
    canvas.setDimensions({ width: imgSize.width, height: imgSize.height })
    canvas.renderAll()

    const dataURL = canvas.toDataURL({
      format,
      quality: format === 'jpeg' ? (quality ?? 0.92) : undefined,
      multiplier: 1,
    })

    // Restore viewport and canvas dimensions
    canvas.setViewportTransform(savedVPT as any)
    canvas.setDimensions({ width: savedW, height: savedH })
    canvas.renderAll()

    // Trigger download
    const link = document.createElement('a')
    link.download = `edited-image.${format === 'jpeg' ? 'jpg' : 'png'}`
    link.href = dataURL
    link.click()
  }, [])

  const exportPNG = useCallback(() => exportCanvas('png'), [exportCanvas])
  const exportJPEG = useCallback((quality?: number) => exportCanvas('jpeg', quality), [exportCanvas])

  // ------------------------------------------------------------------
  // Reset
  // ------------------------------------------------------------------

  const reset = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    // Remove everything except the background image
    const objects = canvas.getObjects() as any[]
    objects.forEach((obj: any) => {
      if (!obj.__isBgImage) canvas.remove(obj)
    })

    // Clear filters on bg image
    const bgImg = bgImageRef.current
    if (bgImg) {
      bgImg.filters = []
      bgImg.applyFilters()
    }

    // Reset zoom
    canvas.setZoom(1)
    canvas.discardActiveObject()
    canvas.renderAll()

    // Reset history
    historyRef.current = []
    redoStackRef.current = []
    setCanUndo(false)
    setCanRedo(false)
    pushHistory()
  }, [pushHistory])

  // ------------------------------------------------------------------
  // Spacebar pan (any tool)
  // ------------------------------------------------------------------

  const setSpacebarPanning = useCallback((active: boolean) => {
    const canvas = fabricRef.current
    if (!canvas) return

    if (active && !spacebarDownRef.current) {
      spacebarDownRef.current = true
      setIsPanning(true)
      // Save current tool state
      prePanToolStateRef.current = {
        cursor: canvas.defaultCursor,
        isDrawingMode: canvas.isDrawingMode,
      }
      canvas.isDrawingMode = false
      canvas.defaultCursor = 'grab'
      canvas.discardActiveObject()
      canvas.requestRenderAll()
    } else if (!active && spacebarDownRef.current) {
      spacebarDownRef.current = false
      spacebarPanRef.current.active = false
      setIsPanning(false)
      // Restore previous tool state
      if (prePanToolStateRef.current) {
        canvas.defaultCursor = prePanToolStateRef.current.cursor
        canvas.isDrawingMode = prePanToolStateRef.current.isDrawingMode
        prePanToolStateRef.current = null
      }
      canvas.requestRenderAll()
    }
  }, [])

  // Spacebar mouse:down — start dragging
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    const handleSpacePanDown = (opt: any) => {
      if (spacebarDownRef.current && !spacebarPanRef.current.active) {
        spacebarPanRef.current = {
          active: true,
          lastX: opt.e.clientX,
          lastY: opt.e.clientY,
        }
        canvas.defaultCursor = 'grabbing'
      }
    }
    canvas.on('mouse:down', handleSpacePanDown)
    return () => { canvas.off('mouse:down', handleSpacePanDown) }
  }, [isReady])

  // ------------------------------------------------------------------
  // Return public API
  // ------------------------------------------------------------------

  return {
    canvasRef,
    isReady,
    imageSize,
    initialZoom,
    loadImage,
    setTool,
    setBrushColor,
    setBrushWidth,
    applyAdjustments,
    applyFilterPreset,
    generateFilterThumbnails,
    setZoom,
    zoomPercent,
    undo,
    redo,
    canUndo,
    canRedo,
    deleteSelected,
    selectAll,
    rotateCW,
    rotateCCW,
    flipH,
    flipV,
    exportPNG,
    exportJPEG,
    reset,
    setSpacebarPanning,
    isPanning,
  }
}
