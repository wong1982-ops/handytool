'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ToolType } from './editor-toolbar'
import type { Adjustments, FilterPreset } from './adjustments-panel'

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
  applyFilterPreset: (preset: FilterPreset) => void
  setZoom: (zoomPercent: number) => void
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
        setInitialZoom(Math.round(fitZoom * 100))

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
        canvas.defaultCursor = 'grab'
        canvas.selection = true
        allObjects.forEach((obj: any) => {
          if (!obj.__isBgImage && !obj.__isCropRect) {
            obj.selectable = true
            obj.evented = true
          }
        })

        // Panning: drag on empty space to pan the viewport
        let isPanning = false
        let lastX = 0
        let lastY = 0

        const panDown = (opt: any) => {
          if (opt.target) return // don't pan when clicking on an object
          isPanning = true
          lastX = opt.e.clientX
          lastY = opt.e.clientY
          canvas.defaultCursor = 'grabbing'
        }
        const panMove = (opt: any) => {
          if (!isPanning) return
          const vpt = canvas.viewportTransform!
          vpt[4] += opt.e.clientX - lastX
          vpt[5] += opt.e.clientY - lastY
          lastX = opt.e.clientX
          lastY = opt.e.clientY
          canvas.requestRenderAll()
        }
        const panUp = () => {
          isPanning = false
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

  const applyFilterPreset = useCallback((preset: FilterPreset) => {
    const bgImg = bgImageRef.current
    const fabric = fabricModuleRef.current
    const canvas = fabricRef.current
    if (!bgImg || !fabric || !canvas) return

    const filters = fabric.filters ?? fabric

    // Keep only non-preset (adjustment) filters
    const currentFilters: any[] = bgImg.filters ?? []
    const adjustmentFilters = currentFilters.filter((f: any) => !f.__isPreset)

    const presetFilters: any[] = []

    const tagPreset = (f: any) => {
      f.__isPreset = true
      return f
    }

    switch (preset) {
      case 'grayscale':
        presetFilters.push(tagPreset(new filters.Grayscale()))
        break
      case 'sepia':
        presetFilters.push(tagPreset(new filters.Sepia()))
        break
      case 'invert':
        presetFilters.push(tagPreset(new filters.Invert()))
        break
      case 'blur':
        presetFilters.push(tagPreset(new filters.Blur({ blur: 0.5 })))
        break
      case 'warm':
        // Warm effect: slight brightness + saturation boost + hue shift
        presetFilters.push(tagPreset(new filters.Brightness({ brightness: 0.06 })))
        presetFilters.push(tagPreset(new filters.Saturation({ saturation: 0.2 })))
        presetFilters.push(tagPreset(new filters.HueRotation({ rotation: -0.05 })))
        break
      case 'none':
      default:
        // No preset filters
        break
    }

    bgImg.filters = [...adjustmentFilters, ...presetFilters]
    bgImg.applyFilters()
    canvas.renderAll()
  }, [])

  // ------------------------------------------------------------------
  // Zoom
  // ------------------------------------------------------------------

  const setZoom = useCallback((zoomPercent: number) => {
    const canvas = fabricRef.current
    const imgSize = imageSizeRef.current
    if (!canvas) return
    const zoomFactor = zoomPercent / 100
    // Center the image at the new zoom level
    const viewW = canvas.width ?? 0
    const viewH = canvas.height ?? 0
    if (imgSize) {
      const offsetX = (viewW - imgSize.width * zoomFactor) / 2
      const offsetY = (viewH - imgSize.height * zoomFactor) / 2
      canvas.setViewportTransform([zoomFactor, 0, 0, zoomFactor, offsetX, offsetY])
    } else {
      canvas.setZoom(zoomFactor)
    }
    canvas.requestRenderAll()
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
    setZoom,
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
  }
}
