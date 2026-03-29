'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ToolType } from './editor-toolbar'
import {
  type ShapeType,
  type ShapeStyle,
  DEFAULT_SHAPE_STYLE,
  SHAPE_LABELS,
  generateStarPoints,
  generatePolygonPoints,
  generateArrowheadPoints,
  constrainProportions,
  snapAngle,
} from './shape-tools'
import type { Adjustments } from './adjustments-panel'
import type { FilterPresetConfig } from './filter-presets'
import type { HistoryEntry } from './history-strip'

// ---------------------------------------------------------------------------
// Layer type
// ---------------------------------------------------------------------------

export interface Layer {
  id: string
  name: string
  type: 'image' | 'text' | 'drawing' | 'shape'
  visible: boolean
  locked: boolean
  opacity: number       // 0-100
  blendMode: string     // globalCompositeOperation value
}

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
  historyEntries: HistoryEntry[]
  historyIndex: number
  goToHistory: (index: number) => void
  deleteSelected: () => void
  selectAll: () => void
  rotateCW: () => void
  rotateCCW: () => void
  flipH: () => void
  flipV: () => void
  exportPNG: () => void
  exportJPEG: (quality?: number) => void
  exportWebP: (quality?: number) => void
  reset: () => void
  /** Enable/disable spacebar-pan mode (call from keydown/keyup) */
  setSpacebarPanning: (active: boolean) => void
  isPanning: boolean
  // Layer operations
  layers: Layer[]
  activeLayerId: string | null
  setActiveLayer: (id: string | null) => void
  addImageLayer: (file: File) => void
  deleteLayer: (id: string) => void
  toggleLayerVisibility: (id: string) => void
  toggleLayerLock: (id: string) => void
  renameLayer: (id: string, name: string) => void
  setLayerOpacity: (id: string, opacity: number) => void
  setLayerBlendMode: (id: string, mode: string) => void
  reorderLayer: (id: string, newIndex: number) => void
  moveLayerForward: (id: string) => void
  moveLayerBackward: (id: string) => void
  moveLayerToFront: (id: string) => void
  moveLayerToBack: (id: string) => void
  // Shape operations
  setActiveShape: (shape: ShapeType) => void
  setShapeStyle: (updates: Partial<ShapeStyle>) => void
  getSelectedShapeProperties: () => {
    x: number; y: number; width: number; height: number;
    angle: number; scaleX: number; scaleY: number; pointCount?: number;
  } | null
  updateSelectedShapeProperties: (updates: Record<string, any>) => void
  // AI mode operations
  aiMode: 'none' | 'segment-click' | 'brush-mask'
  setAiMode: (mode: 'none' | 'segment-click' | 'brush-mask') => void
  aiMaskBrushSize: number
  setAiMaskBrushSize: (size: number) => void
  exportCurrentImage: () => string | null
  exportMask: () => string | null
  clearMask: () => void
  addAiResultLayer: (imageDataUrl: string, label: string) => void
  onSegmentClick: React.RefObject<((point: { x: number; y: number }) => void) | null>
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

  // Layer state
  const [layers, setLayers] = useState<Layer[]>([])
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null)

  // Undo / redo stacks
  const historyRef = useRef<string[]>([])
  const redoStackRef = useRef<string[]>([])
  const historyLabelsRef = useRef<string[]>([])
  const redoLabelsRef = useRef<string[]>([])
  const isRestoringRef = useRef(false)
  const isUndoRedoInProgressRef = useRef(false)

  // History entries exposed to UI (labels + index)
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

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

  // Shape drawing state
  const activeShapeRef = useRef<ShapeType>('rectangle')
  const shapeStyleRef = useRef<ShapeStyle>({ ...DEFAULT_SHAPE_STYLE })
  const drawingShapeRef = useRef<any>(null)
  const drawStartRef = useRef<{ x: number; y: number } | null>(null)
  const customPolyPointsRef = useRef<{ x: number; y: number }[]>([])
  const customPolyPreviewRef = useRef<any[]>([])
  const isDrawingShapeRef = useRef(false)
  const shapeCounterRef = useRef<Record<string, number>>({})
  const shapeHandlersRef = useRef<{ down: any; move: any; up: any } | null>(null)
  // Ref-based access to syncLayersFromCanvas (defined later) for use in shape helpers
  const syncLayersRef = useRef<() => void>(() => {})

  // ------------------------------------------------------------------
  // History helpers
  // ------------------------------------------------------------------

  const syncHistoryEntries = useCallback(() => {
    const labels = historyLabelsRef.current
    const redoLabels = redoLabelsRef.current
    // Combine: history labels + redo labels (redo is stored reversed, so reverse back)
    const allLabels = [...labels, ...[...redoLabels].reverse()]
    const entries: HistoryEntry[] = allLabels.map((label, i) => ({ label, index: i }))
    setHistoryEntries(entries)
    setHistoryIndex(labels.length - 1)
  }, [])

  const pushHistory = useCallback((label: string = 'Edit') => {
    const canvas = fabricRef.current
    if (!canvas || isRestoringRef.current) return
    const json = JSON.stringify(canvas.toJSON(['__isBgImage', '__isCropRect', '__layerId', '__layerName', '__isShape', '__shapeType', '__pointCount']))
    const stack = historyRef.current
    const labels = historyLabelsRef.current
    stack.push(json)
    labels.push(label)
    if (stack.length > MAX_HISTORY) {
      stack.shift()
      labels.shift()
    }
    redoStackRef.current = []
    redoLabelsRef.current = []
    setCanUndo(stack.length > 1)
    setCanRedo(false)
    syncHistoryEntries()
  }, [syncHistoryEntries])

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
        fabricImg.__layerId = 'bg'
        fabricImg.__layerName = 'Background'

        // Clear previous content
        canvas.clear()
        canvas.add(fabricImg)
        canvas.sendObjectToBack(fabricImg)
        bgImageRef.current = fabricImg
        canvas.renderAll()

        // Reset history
        historyRef.current = []
        redoStackRef.current = []
        historyLabelsRef.current = []
        redoLabelsRef.current = []
        setCanUndo(false)
        setCanRedo(false)
        pushHistory('Open')
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
      canvas.on('object:modified', () => { pushHistory('Transform'); syncLayersFromCanvas() })
      canvas.on('path:created', () => { pushHistory('Draw'); syncLayersFromCanvas() })

      // Layer sync: assign __layerId to new objects, sync panel on changes
      canvas.on('object:added', (e: any) => {
        const obj = e.target
        if (obj && !obj.__layerId) {
          obj.__layerId = crypto.randomUUID().slice(0, 8)
        }
        if (obj && !obj.__layerName) {
          obj.__layerName = autoName(obj)
        }
        syncLayersFromCanvas()
      })
      canvas.on('object:removed', () => syncLayersFromCanvas())

      // Sync canvas selection → activeLayerId
      canvas.on('selection:created', (e: any) => {
        const obj = e.selected?.[0]
        if (obj?.__layerId) setActiveLayerId(obj.__layerId)
      })
      canvas.on('selection:updated', (e: any) => {
        const obj = e.selected?.[0]
        if (obj?.__layerId) setActiveLayerId(obj.__layerId)
      })
      canvas.on('selection:cleared', () => setActiveLayerId(null))

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

  const removeShapeHandlers = useCallback(() => {
    const canvas = fabricRef.current
    const h = shapeHandlersRef.current
    if (!canvas || !h) return
    canvas.off('mouse:down', h.down)
    canvas.off('mouse:move', h.move)
    canvas.off('mouse:up', h.up)
    customPolyPreviewRef.current.forEach((obj) => canvas.remove(obj))
    customPolyPreviewRef.current = []
    customPolyPointsRef.current = []
    isDrawingShapeRef.current = false
    drawingShapeRef.current = null
    shapeHandlersRef.current = null
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

  // ------------------------------------------------------------------
  // Shape drawing helpers
  // ------------------------------------------------------------------

  const createInitialShape = (x: number, y: number) => {
    const fabric = fabricModuleRef.current
    if (!fabric) return null

    const style = shapeStyleRef.current
    const commonProps: any = {
      left: x,
      top: y,
      strokeWidth: style.strokeWidth,
      stroke: style.strokeWidth > 0 ? style.stroke : undefined,
      strokeDashArray: style.strokeDashArray.length > 0 ? [...style.strokeDashArray] : undefined,
      opacity: style.opacity / 100,
      selectable: false,
      evented: false,
      originX: 'left',
      originY: 'top',
    }

    if (style.shadowEnabled) {
      commonProps.shadow = new fabric.Shadow({
        color: style.shadowColor,
        offsetX: style.shadowOffsetX,
        offsetY: style.shadowOffsetY,
        blur: style.shadowBlur,
      })
    }

    const fill = style.fillType === 'none' ? 'transparent' : style.fill

    switch (activeShapeRef.current) {
      case 'rectangle':
        return new fabric.Rect({ ...commonProps, fill, width: 0, height: 0 })
      case 'rounded-rectangle':
        return new fabric.Rect({ ...commonProps, fill, width: 0, height: 0, rx: style.cornerRadius, ry: style.cornerRadius })
      case 'ellipse':
        return new fabric.Ellipse({ ...commonProps, fill, rx: 0, ry: 0 })
      case 'triangle':
        return new fabric.Triangle({ ...commonProps, fill, width: 0, height: 0 })
      case 'line':
        return new fabric.Line([x, y, x, y], { ...commonProps, stroke: style.stroke || '#ffffff' })
      case 'arrow':
        return new fabric.Line([x, y, x, y], { ...commonProps, stroke: style.stroke || '#ffffff' })
      case 'polygon': {
        const poly = new fabric.Polygon(generatePolygonPoints(0, 0, 0, 6), { ...commonProps, fill })
        ;(poly as any).__pointCount = 6
        return poly
      }
      case 'star': {
        const star = new fabric.Polygon(generateStarPoints(0, 0, 0, 0, 5), { ...commonProps, fill })
        ;(star as any).__pointCount = 5
        return star
      }
      default:
        return null
    }
  }

  const updateShapeDuringDraw = (
    shape: any,
    start: { x: number; y: number },
    current: { x: number; y: number },
    shift: boolean,
    alt: boolean,
  ) => {
    let dx = current.x - start.x
    let dy = current.y - start.y

    const shapeType = activeShapeRef.current

    if (shapeType === 'line' || shapeType === 'arrow') {
      let endX = current.x
      let endY = current.y
      if (shift) {
        const snapped = snapAngle(start.x, start.y, current.x, current.y)
        endX = snapped.x
        endY = snapped.y
      }
      shape.set({ x2: endX, y2: endY })
      return
    }

    if (shift) {
      const constrained = constrainProportions(dx, dy)
      dx = constrained.width
      dy = constrained.height
    }

    let left = start.x
    let top = start.y
    let width = Math.abs(dx)
    let height = Math.abs(dy)

    if (alt) {
      left = start.x - width
      top = start.y - height
      width *= 2
      height *= 2
    } else {
      if (dx < 0) left = start.x + dx
      if (dy < 0) top = start.y + dy
    }

    switch (shapeType) {
      case 'rectangle':
      case 'rounded-rectangle':
      case 'triangle':
        shape.set({ left, top, width, height })
        break
      case 'ellipse':
        shape.set({ left, top, rx: width / 2, ry: height / 2 })
        break
      case 'polygon': {
        const r = Math.min(width, height) / 2
        const sides = shape.__pointCount ?? 6
        shape.set({ points: generatePolygonPoints(0, 0, r, sides), left: left + width / 2 - r, top: top + height / 2 - r })
        break
      }
      case 'star': {
        const outerR = Math.min(width, height) / 2
        const innerR = outerR * 0.5
        const pts = shape.__pointCount ?? 5
        shape.set({ points: generateStarPoints(0, 0, outerR, innerR, pts), left: left + width / 2 - outerR, top: top + height / 2 - outerR })
        break
      }
    }
  }

  const handleCustomPolyClick = (opt: any) => {
    const canvas = fabricRef.current
    const fabric = fabricModuleRef.current
    if (!canvas || !fabric) return

    const pointer = canvas.getScenePoint(opt.e)
    const points = customPolyPointsRef.current

    if (points.length >= 3) {
      const first = points[0]
      const dist = Math.sqrt((pointer.x - first.x) ** 2 + (pointer.y - first.y) ** 2)
      if (dist < 8 || opt.e.detail === 2) {
        finalizeCustomPolygon()
        return
      }
    }

    points.push({ x: pointer.x, y: pointer.y })

    const circle = new fabric.Circle({
      left: pointer.x - 4,
      top: pointer.y - 4,
      radius: 4,
      fill: '#3D6AF2',
      stroke: '#ffffff',
      strokeWidth: 1,
      selectable: false,
      evented: false,
    })
    canvas.add(circle)
    customPolyPreviewRef.current.push(circle)

    if (points.length > 1) {
      const prev = points[points.length - 2]
      const line = new fabric.Line([prev.x, prev.y, pointer.x, pointer.y], {
        stroke: '#3D6AF2',
        strokeWidth: 1,
        strokeDashArray: [4, 4],
        selectable: false,
        evented: false,
      })
      canvas.add(line)
      customPolyPreviewRef.current.push(line)
    }

    canvas.requestRenderAll()
  }

  const finalizeCustomPolygon = () => {
    const canvas = fabricRef.current
    const fabric = fabricModuleRef.current
    if (!canvas || !fabric) return

    const points = [...customPolyPointsRef.current]
    if (points.length < 3) return

    customPolyPreviewRef.current.forEach((obj) => canvas.remove(obj))
    customPolyPreviewRef.current = []
    customPolyPointsRef.current = []

    const minX = Math.min(...points.map((p) => p.x))
    const minY = Math.min(...points.map((p) => p.y))
    const normalizedPoints = points.map((p) => ({ x: p.x - minX, y: p.y - minY }))

    const style = shapeStyleRef.current
    const fill = style.fillType === 'none' ? 'transparent' : style.fill

    const polygon = new fabric.Polygon(normalizedPoints, {
      left: minX,
      top: minY,
      fill,
      strokeWidth: style.strokeWidth,
      stroke: style.strokeWidth > 0 ? style.stroke : undefined,
      opacity: style.opacity / 100,
      selectable: true,
      evented: true,
    })

    const count = (shapeCounterRef.current['custom-polygon'] ?? 0) + 1
    shapeCounterRef.current['custom-polygon'] = count
    ;(polygon as any).__layerId = crypto.randomUUID().slice(0, 8)
    ;(polygon as any).__layerName = `Custom Polygon ${count}`
    ;(polygon as any).__isShape = true
    ;(polygon as any).__shapeType = 'custom-polygon'

    canvas.add(polygon)
    canvas.setActiveObject(polygon)
    canvas.requestRenderAll()

    syncLayersRef.current()
    pushHistory('Add Custom Polygon')
  }

  const setTool = useCallback((tool: ToolType) => {
    const canvas = fabricRef.current
    const fabric = fabricModuleRef.current
    if (!canvas || !fabric) return

    activeToolRef.current = tool

    // Clean up previous tool state
    removeTextHandler()
    removePanHandlers()
    removeShapeHandlers()
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
          pushHistory('Add Text')

          // One-shot: remove handler after first placement
          removeTextHandler()
        }
        textHandlerRef.current = handler
        canvas.on('mouse:down', handler)
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

      case 'shape': {
        canvas.defaultCursor = 'crosshair'
        canvas.selection = false

        allObjects.forEach((obj: any) => {
          if (obj.__isShape && !obj.__isBgImage) {
            obj.selectable = true
            obj.evented = true
          }
        })

        const shapeMouseDown = (opt: any) => {
          // Skip if clicking on an existing object
          if (opt.target) return

          if (activeShapeRef.current === 'custom-polygon') {
            handleCustomPolyClick(opt)
            return
          }
          const pointer = canvas.getScenePoint(opt.e)
          drawStartRef.current = { x: pointer.x, y: pointer.y }
          isDrawingShapeRef.current = true

          const shape = createInitialShape(pointer.x, pointer.y)
          if (shape) {
            drawingShapeRef.current = shape
            canvas.add(shape)
            canvas.requestRenderAll()
          }
        }

        const shapeMouseMove = (opt: any) => {
          if (!isDrawingShapeRef.current || !drawingShapeRef.current || !drawStartRef.current) return
          const pointer = canvas.getScenePoint(opt.e)

          updateShapeDuringDraw(
            drawingShapeRef.current,
            drawStartRef.current,
            pointer,
            opt.e.shiftKey,
            opt.e.altKey,
          )
          canvas.requestRenderAll()
        }

        const shapeMouseUp = () => {
          if (!isDrawingShapeRef.current || !drawingShapeRef.current) return
          isDrawingShapeRef.current = false

          const shape = drawingShapeRef.current
          const shapeType = activeShapeRef.current
          const count = (shapeCounterRef.current[shapeType] ?? 0) + 1
          shapeCounterRef.current[shapeType] = count
          const label = SHAPE_LABELS[shapeType]

          shape.__layerId = crypto.randomUUID().slice(0, 8)
          shape.__layerName = `${label} ${count}`
          shape.__isShape = true
          shape.__shapeType = shapeType
          shape.selectable = true
          shape.evented = true

          drawingShapeRef.current = null
          drawStartRef.current = null

          syncLayersRef.current()
          pushHistory(`Add ${label}`)
        }

        canvas.on('mouse:down', shapeMouseDown)
        canvas.on('mouse:move', shapeMouseMove)
        canvas.on('mouse:up', shapeMouseUp)

        shapeHandlersRef.current = { down: shapeMouseDown, move: shapeMouseMove, up: shapeMouseUp }
        break
      }
    }
  }, [pushHistory, removeTextHandler, removePanHandlers, removeShapeHandlers, removeCropRect])

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
    if (adj.sharpen > 0) {
      const intensity = adj.sharpen / 100
      // Sharpening kernel: identity + (sharpen kernel - identity) * intensity
      // Full sharpen kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0]
      // Identity kernel:     [0,  0, 0,  0, 1,  0, 0,  0, 0]
      const matrix = [
        0, -1 * intensity, 0,
        -1 * intensity, 1 + 4 * intensity, -1 * intensity,
        0, -1 * intensity, 0,
      ]
      const f = new filters.Convolute({ matrix })
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
  // Layer sync helpers
  // ------------------------------------------------------------------

  function autoName(obj: any): string {
    if (obj.__isBgImage) return 'Background'
    if (obj.type === 'i-text' || obj.type === 'textbox') return `Text "${(obj.text || '').slice(0, 15)}"`
    if (obj.type === 'path') return `Drawing ${obj.__layerId?.slice(-4) || ''}`
    if (obj.type === 'image') return obj.__layerName || 'Image Layer'
    return `Layer ${obj.__layerId?.slice(-4) || ''}`
  }

  function detectType(obj: any): Layer['type'] {
    if (obj.type === 'image') return 'image'
    if (obj.type === 'i-text' || obj.type === 'textbox') return 'text'
    if (obj.type === 'path' || obj.type === 'group') return 'drawing'
    return 'shape'
  }

  const syncLayersFromCanvas = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    const objects = canvas.getObjects() as any[]
    const layerList: Layer[] = objects
      .filter((obj: any) => !obj.__isCropRect)
      .reverse()  // top object = first in list
      .map((obj: any) => ({
        id: obj.__layerId || '',
        name: obj.__layerName || autoName(obj),
        type: detectType(obj),
        visible: obj.visible !== false,
        locked: !obj.selectable,
        opacity: Math.round((obj.opacity ?? 1) * 100),
        blendMode: obj.globalCompositeOperation || 'source-over',
      }))

    setLayers(layerList)
  }, [])

  // Keep syncLayersRef in sync so shape helpers can call it
  syncLayersRef.current = syncLayersFromCanvas

  // ------------------------------------------------------------------
  // Layer operations
  // ------------------------------------------------------------------

  const setActiveLayer = useCallback((id: string | null) => {
    const canvas = fabricRef.current
    if (!canvas) return
    if (!id) {
      canvas.discardActiveObject()
    } else {
      const obj = (canvas.getObjects() as any[]).find((o: any) => o.__layerId === id)
      if (obj && obj.selectable) {
        canvas.setActiveObject(obj)
      }
    }
    canvas.renderAll()
    setActiveLayerId(id)
  }, [])

  const addImageLayer = useCallback((file: File) => {
    const canvas = fabricRef.current
    const fabric = fabricModuleRef.current
    if (!canvas || !fabric) return

    const reader = new FileReader()
    reader.onload = async () => {
      const img = await fabric.FabricImage.fromURL(reader.result as string)
      const canvasW = canvas.getWidth()
      const canvasH = canvas.getHeight()
      const sc = Math.min(canvasW / (img.width || 1), canvasH / (img.height || 1), 0.5)
      img.set({ scaleX: sc, scaleY: sc, left: canvasW / 4, top: canvasH / 4 })
      ;(img as any).__layerId = crypto.randomUUID().slice(0, 8)
      ;(img as any).__layerName = file.name.replace(/\.[^.]+$/, '')
      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
      pushHistory('Add Layer')
    }
    reader.readAsDataURL(file)
  }, [pushHistory])

  const deleteLayer = useCallback((id: string) => {
    const canvas = fabricRef.current
    if (!canvas || id === 'bg') return

    const obj = (canvas.getObjects() as any[]).find((o: any) => o.__layerId === id)
    if (obj) {
      canvas.remove(obj)
      canvas.discardActiveObject()
      canvas.renderAll()
      syncLayersFromCanvas()
      pushHistory('Delete Layer')
    }
  }, [syncLayersFromCanvas, pushHistory])

  const toggleLayerVisibility = useCallback((id: string) => {
    const canvas = fabricRef.current
    if (!canvas) return
    const obj = (canvas.getObjects() as any[]).find((o: any) => o.__layerId === id)
    if (obj) {
      obj.visible = !obj.visible
      canvas.renderAll()
      syncLayersFromCanvas()
    }
  }, [syncLayersFromCanvas])

  const toggleLayerLock = useCallback((id: string) => {
    const canvas = fabricRef.current
    if (!canvas) return
    const obj = (canvas.getObjects() as any[]).find((o: any) => o.__layerId === id)
    if (obj) {
      const wasSelectable = obj.selectable
      obj.selectable = !wasSelectable
      obj.evented = !wasSelectable
      canvas.renderAll()
      syncLayersFromCanvas()
    }
  }, [syncLayersFromCanvas])

  const renameLayer = useCallback((id: string, name: string) => {
    const canvas = fabricRef.current
    if (!canvas) return
    const obj = (canvas.getObjects() as any[]).find((o: any) => o.__layerId === id)
    if (obj) {
      obj.__layerName = name
      syncLayersFromCanvas()
    }
  }, [syncLayersFromCanvas])

  const setLayerOpacity = useCallback((id: string, opacity: number) => {
    const canvas = fabricRef.current
    if (!canvas) return
    const obj = (canvas.getObjects() as any[]).find((o: any) => o.__layerId === id)
    if (obj) {
      obj.opacity = opacity / 100
      canvas.renderAll()
      syncLayersFromCanvas()
    }
  }, [syncLayersFromCanvas])

  const setLayerBlendMode = useCallback((id: string, mode: string) => {
    const canvas = fabricRef.current
    if (!canvas) return
    const obj = (canvas.getObjects() as any[]).find((o: any) => o.__layerId === id)
    if (obj) {
      obj.globalCompositeOperation = mode
      canvas.renderAll()
      syncLayersFromCanvas()
    }
  }, [syncLayersFromCanvas])

  const reorderLayer = useCallback((id: string, newIndex: number) => {
    const canvas = fabricRef.current
    if (!canvas || id === 'bg') return

    const objects = (canvas.getObjects() as any[]).filter((o: any) => !o.__isCropRect)
    const obj = objects.find((o: any) => o.__layerId === id)
    if (obj) {
      // newIndex is in panel order (reversed), convert to canvas index
      const canvasIndex = objects.length - 1 - newIndex
      canvas.moveTo(obj, Math.max(0, canvasIndex))
      canvas.renderAll()
      syncLayersFromCanvas()
      pushHistory('Reorder Layers')
    }
  }, [syncLayersFromCanvas, pushHistory])

  const moveLayerForward = useCallback((id: string) => {
    const canvas = fabricRef.current
    if (!canvas) return
    const obj = (canvas.getObjects() as any[]).find((o: any) => o.__layerId === id)
    if (obj) {
      canvas.bringObjectForward(obj)
      canvas.renderAll()
      syncLayersFromCanvas()
    }
  }, [syncLayersFromCanvas])

  const moveLayerBackward = useCallback((id: string) => {
    const canvas = fabricRef.current
    if (!canvas) return
    const obj = (canvas.getObjects() as any[]).find((o: any) => o.__layerId === id)
    if (obj) {
      canvas.sendObjectBackwards(obj)
      canvas.renderAll()
      syncLayersFromCanvas()
    }
  }, [syncLayersFromCanvas])

  const moveLayerToFront = useCallback((id: string) => {
    const canvas = fabricRef.current
    if (!canvas) return
    const obj = (canvas.getObjects() as any[]).find((o: any) => o.__layerId === id)
    if (obj) {
      canvas.bringObjectToFront(obj)
      canvas.renderAll()
      syncLayersFromCanvas()
    }
  }, [syncLayersFromCanvas])

  const moveLayerToBack = useCallback((id: string) => {
    const canvas = fabricRef.current
    if (!canvas || id === 'bg') return
    const obj = (canvas.getObjects() as any[]).find((o: any) => o.__layerId === id)
    if (obj) {
      // Move to index 1 (above background at 0)
      canvas.moveTo(obj, 1)
      canvas.renderAll()
      syncLayersFromCanvas()
    }
  }, [syncLayersFromCanvas])

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
    const labels = historyLabelsRef.current
    if (stack.length <= 1) return

    isUndoRedoInProgressRef.current = true
    const current = stack.pop()!
    const currentLabel = labels.pop()!
    redoStackRef.current.push(current)
    redoLabelsRef.current.push(currentLabel)
    const previous = stack[stack.length - 1]

    try {
      await restoreFromJSON(previous)
    } catch {
      // Restore the popped item back on failure
      const restored = redoStackRef.current.pop()!
      const restoredLabel = redoLabelsRef.current.pop()!
      stack.push(restored)
      labels.push(restoredLabel)
    }
    setCanUndo(stack.length > 1)
    setCanRedo(redoStackRef.current.length > 0)
    syncHistoryEntries()
    isUndoRedoInProgressRef.current = false
  }, [restoreFromJSON, syncHistoryEntries])

  const redo = useCallback(async () => {
    if (isUndoRedoInProgressRef.current) return
    const redoStack = redoStackRef.current
    const redoLabels = redoLabelsRef.current
    if (redoStack.length === 0) return

    isUndoRedoInProgressRef.current = true
    const next = redoStack.pop()!
    const nextLabel = redoLabels.pop()!
    historyRef.current.push(next)
    historyLabelsRef.current.push(nextLabel)

    try {
      await restoreFromJSON(next)
    } catch {
      // Restore on failure
      redoStack.push(historyRef.current.pop()!)
      redoLabels.push(historyLabelsRef.current.pop()!)
    }
    setCanUndo(historyRef.current.length > 1)
    setCanRedo(redoStack.length > 0)
    syncHistoryEntries()
    isUndoRedoInProgressRef.current = false
  }, [restoreFromJSON, syncHistoryEntries])

  const goToHistory = useCallback(async (targetIndex: number) => {
    if (isUndoRedoInProgressRef.current) return
    const stack = historyRef.current
    const labels = historyLabelsRef.current
    const redoStack = redoStackRef.current
    const redoLabels = redoLabelsRef.current

    // Current position is stack.length - 1
    const currentIdx = stack.length - 1
    if (targetIndex === currentIdx || targetIndex < 0) return

    // Total entries = stack + redoStack
    const allSnapshots = [...stack, ...[...redoStack].reverse()]
    const allLabels = [...labels, ...[...redoLabels].reverse()]
    const totalLength = allSnapshots.length
    if (targetIndex >= totalLength) return

    isUndoRedoInProgressRef.current = true

    // Rebuild stacks: [0..targetIndex] = history, [targetIndex+1..end] = redo (reversed)
    const newHistory = allSnapshots.slice(0, targetIndex + 1)
    const newHistoryLabels = allLabels.slice(0, targetIndex + 1)
    const newRedo = allSnapshots.slice(targetIndex + 1).reverse()
    const newRedoLabels = allLabels.slice(targetIndex + 1).reverse()

    historyRef.current = newHistory
    historyLabelsRef.current = newHistoryLabels
    redoStackRef.current = newRedo
    redoLabelsRef.current = newRedoLabels

    try {
      await restoreFromJSON(newHistory[newHistory.length - 1])
    } catch {
      // On failure, revert to original state
      historyRef.current = stack
      historyLabelsRef.current = labels
      redoStackRef.current = redoStack
      redoLabelsRef.current = redoLabels
    }

    setCanUndo(historyRef.current.length > 1)
    setCanRedo(redoStackRef.current.length > 0)
    syncHistoryEntries()
    isUndoRedoInProgressRef.current = false
  }, [restoreFromJSON, syncHistoryEntries])

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
    pushHistory('Delete')
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
    pushHistory('Rotate CW')
  }, [pushHistory])

  const rotateCCW = useCallback(() => {
    const img = bgImageRef.current
    const canvas = fabricRef.current
    if (!img || !canvas) return
    img.rotate((img.angle || 0) - 90)
    img.setCoords()
    canvas.renderAll()
    pushHistory('Rotate CCW')
  }, [pushHistory])

  const flipH = useCallback(() => {
    const img = bgImageRef.current
    const canvas = fabricRef.current
    if (!img || !canvas) return
    img.set('flipX', !img.flipX)
    canvas.renderAll()
    pushHistory('Flip H')
  }, [pushHistory])

  const flipV = useCallback(() => {
    const img = bgImageRef.current
    const canvas = fabricRef.current
    if (!img || !canvas) return
    img.set('flipY', !img.flipY)
    canvas.renderAll()
    pushHistory('Flip V')
  }, [pushHistory])

  // ------------------------------------------------------------------
  // Export (resets zoom to 1x temporarily for full-resolution output)
  // ------------------------------------------------------------------

  const exportCanvas = useCallback((format: 'png' | 'jpeg' | 'webp', quality?: number) => {
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

    // Fabric.js toDataURL only supports 'png' and 'jpeg' natively
    // For WebP, we export as PNG then convert via canvas
    const fabricFormat = format === 'webp' ? 'png' : format
    const dataURL = canvas.toDataURL({
      format: fabricFormat,
      quality: fabricFormat === 'jpeg' ? (quality ?? 0.92) : undefined,
      multiplier: 1,
    })

    // Restore viewport and canvas dimensions
    canvas.setViewportTransform(savedVPT as any)
    canvas.setDimensions({ width: savedW, height: savedH })
    canvas.renderAll()

    // For WebP, re-encode via an offscreen canvas
    if (format === 'webp') {
      const img = new Image()
      img.onload = () => {
        const offscreen = document.createElement('canvas')
        offscreen.width = img.width
        offscreen.height = img.height
        const ctx = offscreen.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        const webpURL = offscreen.toDataURL('image/webp', quality ?? 0.92)
        const link = document.createElement('a')
        link.download = 'edited-image.webp'
        link.href = webpURL
        link.click()
      }
      img.src = dataURL
      return
    }

    // Trigger download
    const link = document.createElement('a')
    const ext = format === 'jpeg' ? 'jpg' : 'png'
    link.download = `edited-image.${ext}`
    link.href = dataURL
    link.click()
  }, [])

  const exportPNG = useCallback(() => exportCanvas('png'), [exportCanvas])
  const exportJPEG = useCallback((quality?: number) => exportCanvas('jpeg', quality), [exportCanvas])
  const exportWebP = useCallback((quality?: number) => exportCanvas('webp', quality), [exportCanvas])

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
    historyLabelsRef.current = []
    redoLabelsRef.current = []
    setCanUndo(false)
    setCanRedo(false)
    pushHistory('Reset')
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
  // AI mode state & methods
  // ------------------------------------------------------------------

  const [aiMode, setAiModeState] = useState<'none' | 'segment-click' | 'brush-mask'>('none')
  const [aiMaskBrushSize, setAiMaskBrushSize] = useState(30)
  const onSegmentClick = useRef<((point: { x: number; y: number }) => void) | null>(null)
  const maskDataRef = useRef<{ paths: Array<{ x: number; y: number }[]> }>({ paths: [] })
  const aiModeCleanupRef = useRef<(() => void) | null>(null)

  const setAiMode = useCallback((mode: 'none' | 'segment-click' | 'brush-mask') => {
    const canvas = fabricRef.current
    const fabric = fabricModuleRef.current
    if (!canvas || !fabric) return

    // Cleanup previous AI mode
    if (aiModeCleanupRef.current) {
      aiModeCleanupRef.current()
      aiModeCleanupRef.current = null
    }

    setAiModeState(mode)

    if (mode === 'segment-click') {
      canvas.isDrawingMode = false
      canvas.selection = false
      canvas.defaultCursor = 'crosshair'
      // Disable object selection
      const allObjects = canvas.getObjects() as any[]
      allObjects.forEach((obj: any) => { obj.selectable = false; obj.evented = false })

      const handler = (opt: any) => {
        const imgSize = imageSizeRef.current
        if (!imgSize) return
        const pointer = canvas.getScenePoint(opt.e)
        // Convert to fraction of image dimensions
        const point = { x: pointer.x / imgSize.width, y: pointer.y / imgSize.height }
        if (onSegmentClick.current) onSegmentClick.current(point)
      }
      canvas.on('mouse:down', handler)
      aiModeCleanupRef.current = () => { canvas.off('mouse:down', handler) }
    } else if (mode === 'brush-mask') {
      canvas.isDrawingMode = true
      const brush = new fabric.PencilBrush(canvas)
      brush.width = aiMaskBrushSize
      brush.color = 'rgba(255,0,0,0.4)'
      canvas.freeDrawingBrush = brush
      canvas.selection = false

      // Track drawn paths for mask export
      const pathHandler = (opt: any) => {
        const path = opt.path
        if (path) {
          // Extract points from the path object
          const points: { x: number; y: number }[] = []
          if (path.path) {
            for (const segment of path.path) {
              // Each segment is like ['M', x, y] or ['Q', cx, cy, x, y] or ['L', x, y]
              if (segment.length >= 3) {
                points.push({ x: segment[segment.length - 2], y: segment[segment.length - 1] })
              }
            }
          }
          maskDataRef.current.paths.push(points)
          // Tag the path as mask so we can remove it later
          ;(path as any).__isMaskPath = true
        }
      }
      canvas.on('path:created', pathHandler)
      aiModeCleanupRef.current = () => {
        canvas.off('path:created', pathHandler)
      }
    } else {
      // 'none' — restore defaults
      canvas.isDrawingMode = false
      canvas.defaultCursor = 'default'
      canvas.selection = true
      // Re-enable selectable on non-bg objects
      const allObjects = canvas.getObjects() as any[]
      allObjects.forEach((obj: any) => {
        if (!obj.__isBgImage && !obj.__isCropRect && !obj.__isMaskPath) {
          obj.selectable = true
          obj.evented = true
        }
      })
    }
    canvas.renderAll()
  }, [aiMaskBrushSize])

  const setAiMaskBrushSizeWrapped = useCallback((size: number) => {
    setAiMaskBrushSize(size)
    const canvas = fabricRef.current
    if (canvas?.freeDrawingBrush && canvas.isDrawingMode) {
      canvas.freeDrawingBrush.width = size
    }
  }, [])

  const exportCurrentImage = useCallback((): string | null => {
    const canvas = fabricRef.current
    const imgSize = imageSizeRef.current
    if (!canvas || !imgSize) return null

    // Save current viewport
    const savedVPT = [...canvas.viewportTransform!]
    const savedW = canvas.width ?? 0
    const savedH = canvas.height ?? 0

    // Set to full resolution for export
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
    canvas.setDimensions({ width: imgSize.width, height: imgSize.height })

    // Hide mask paths temporarily
    const objects = canvas.getObjects() as any[]
    const maskPaths = objects.filter((o: any) => o.__isMaskPath)
    maskPaths.forEach((p: any) => { p.visible = false })

    canvas.renderAll()
    const dataUrl = canvas.toDataURL({ format: 'png' })

    // Restore mask paths
    maskPaths.forEach((p: any) => { p.visible = true })

    // Restore viewport
    canvas.setViewportTransform(savedVPT as any)
    canvas.setDimensions({ width: savedW, height: savedH })
    canvas.renderAll()

    return dataUrl
  }, [])

  const exportMask = useCallback((): string | null => {
    const imgSize = imageSizeRef.current
    const canvas = fabricRef.current
    if (!imgSize || !canvas) return null

    // Collect mask path objects from the canvas
    const objects = canvas.getObjects() as any[]
    const maskPaths = objects.filter((o: any) => o.__isMaskPath)
    if (maskPaths.length === 0) return null

    // Create a temporary canvas at image dimensions
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = imgSize.width
    tempCanvas.height = imgSize.height
    const ctx = tempCanvas.getContext('2d')!
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

    // Render each mask path as white
    ctx.strokeStyle = 'white'
    ctx.fillStyle = 'white'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    for (const pathObj of maskPaths) {
      if (!pathObj.path) continue
      ctx.lineWidth = pathObj.strokeWidth || 30
      ctx.beginPath()
      for (const seg of pathObj.path) {
        if (seg[0] === 'M') {
          ctx.moveTo(seg[1], seg[2])
        } else if (seg[0] === 'L') {
          ctx.lineTo(seg[1], seg[2])
        } else if (seg[0] === 'Q') {
          ctx.quadraticCurveTo(seg[1], seg[2], seg[3], seg[4])
        } else if (seg[0] === 'C') {
          ctx.bezierCurveTo(seg[1], seg[2], seg[3], seg[4], seg[5], seg[6])
        }
      }
      ctx.stroke()
    }

    return tempCanvas.toDataURL('image/png')
  }, [])

  const clearMask = useCallback(() => {
    maskDataRef.current = { paths: [] }
    const canvas = fabricRef.current
    if (!canvas) return
    const objects = canvas.getObjects() as any[]
    objects.forEach((obj: any) => {
      if (obj.__isMaskPath) canvas.remove(obj)
    })
    canvas.renderAll()
  }, [])

  const addAiResultLayer = useCallback((imageDataUrl: string, label: string) => {
    const canvas = fabricRef.current
    const fabric = fabricModuleRef.current
    if (!canvas || !fabric) return

    const imgEl = new Image()
    imgEl.onload = () => {
      const fabricImg = new fabric.FabricImage(imgEl, {
        left: 0,
        top: 0,
        selectable: true,
        evented: true,
      }) as any
      fabricImg.__layerId = crypto.randomUUID().slice(0, 8)
      fabricImg.__layerName = label
      canvas.add(fabricImg)
      canvas.renderAll()
      syncLayersFromCanvas()
      pushHistory(label)
    }
    imgEl.src = imageDataUrl
  }, [syncLayersFromCanvas, pushHistory])

  // ------------------------------------------------------------------
  // ------------------------------------------------------------------
  // Shape public methods
  // ------------------------------------------------------------------

  const setActiveShape = useCallback((shape: ShapeType) => {
    activeShapeRef.current = shape
  }, [])

  const setShapeStyle = useCallback((updates: Partial<ShapeStyle>) => {
    shapeStyleRef.current = { ...shapeStyleRef.current, ...updates }

    const canvas = fabricRef.current
    const fabric = fabricModuleRef.current
    if (!canvas || !fabric) return

    const active = canvas.getActiveObject() as any
    if (!active || !active.__isShape) return

    const style = shapeStyleRef.current
    const props: any = {}

    // Fill
    props.fill = style.fillType === 'none' ? 'transparent' : style.fill

    // Stroke
    props.stroke = style.strokeWidth > 0 ? style.stroke : undefined
    props.strokeWidth = style.strokeWidth
    props.strokeDashArray = style.strokeDashArray.length > 0 ? [...style.strokeDashArray] : undefined

    // Opacity & blend
    props.opacity = style.opacity / 100
    props.globalCompositeOperation = style.blendMode

    // Shadow
    if (style.shadowEnabled) {
      props.shadow = new fabric.Shadow({
        color: style.shadowColor,
        offsetX: style.shadowOffsetX,
        offsetY: style.shadowOffsetY,
        blur: style.shadowBlur,
      })
    } else {
      props.shadow = null
    }

    // Corner radius
    if (active.__shapeType === 'rectangle' || active.__shapeType === 'rounded-rectangle') {
      props.rx = style.cornerRadius
      props.ry = style.cornerRadius
    }

    active.set(props)
    canvas.requestRenderAll()
    pushHistory('Edit Shape')
  }, [pushHistory])

  const getSelectedShapeProperties = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return null

    const active = canvas.getActiveObject() as any
    if (!active || !active.__isShape) return null

    return {
      x: active.left ?? 0,
      y: active.top ?? 0,
      width: active.width ?? 0,
      height: active.height ?? 0,
      angle: active.angle ?? 0,
      scaleX: active.scaleX ?? 1,
      scaleY: active.scaleY ?? 1,
      pointCount: active.__pointCount,
    }
  }, [])

  const updateSelectedShapeProperties = useCallback((updates: Record<string, any>) => {
    const canvas = fabricRef.current
    if (!canvas) return

    const active = canvas.getActiveObject() as any
    if (!active || !active.__isShape) return

    if (updates.x !== undefined) active.set('left', updates.x)
    if (updates.y !== undefined) active.set('top', updates.y)
    if (updates.width !== undefined) active.set('width', updates.width)
    if (updates.height !== undefined) active.set('height', updates.height)
    if (updates.angle !== undefined) active.set('angle', updates.angle)
    if (updates.pointCount !== undefined) {
      active.__pointCount = updates.pointCount
      const shapeType = active.__shapeType as ShapeType
      const r = Math.min(active.width ?? 50, active.height ?? 50) / 2
      if (shapeType === 'polygon') {
        active.set('points', generatePolygonPoints(0, 0, r, updates.pointCount))
      } else if (shapeType === 'star') {
        active.set('points', generateStarPoints(0, 0, r, r * 0.5, updates.pointCount))
      }
    }

    active.setCoords()
    canvas.requestRenderAll()
    pushHistory('Edit Shape')
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
    generateFilterThumbnails,
    setZoom,
    zoomPercent,
    undo,
    redo,
    canUndo,
    canRedo,
    historyEntries,
    historyIndex,
    goToHistory,
    deleteSelected,
    selectAll,
    rotateCW,
    rotateCCW,
    flipH,
    flipV,
    exportPNG,
    exportJPEG,
    exportWebP,
    reset,
    setSpacebarPanning,
    isPanning,
    // Layer operations
    layers,
    activeLayerId,
    setActiveLayer,
    addImageLayer,
    deleteLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    renameLayer,
    setLayerOpacity,
    setLayerBlendMode,
    reorderLayer,
    moveLayerForward,
    moveLayerBackward,
    moveLayerToFront,
    moveLayerToBack,
    // Shape operations
    setActiveShape,
    setShapeStyle,
    getSelectedShapeProperties,
    updateSelectedShapeProperties,
    // AI mode operations
    aiMode,
    setAiMode,
    aiMaskBrushSize,
    setAiMaskBrushSize: setAiMaskBrushSizeWrapped,
    exportCurrentImage,
    exportMask,
    clearMask,
    addAiResultLayer,
    onSegmentClick,
  }
}
