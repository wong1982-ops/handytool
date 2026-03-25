'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import type { SketchMode } from './types'

const COLORS = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#a855f7', '#92400e']
const PEN_SIZES = [
  { label: 'Thin', size: 2 },
  { label: 'Medium', size: 5 },
  { label: 'Thick', size: 10 },
] as const

const MAX_UNDO = 30

interface DrawingCanvasProps {
  onExport: (dataUrl: string) => void
  mode: SketchMode
}

export default function DrawingCanvas({ onExport, mode }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')
  const [penSize, setPenSize] = useState(5)
  const [color, setColor] = useState('#000000')
  const [undoStack, setUndoStack] = useState<ImageData[]>([])
  const [redoStack, setRedoStack] = useState<ImageData[]>([])

  const isFun = mode === 'fun'

  // Initialize canvas with white background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 512, 512)
    // Save initial state
    setUndoStack([ctx.getImageData(0, 0, 512, 512)])
  }, [])

  const getCanvasPos = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = 512 / rect.width
    const scaleY = 512 / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      isDrawing.current = true
      const pos = getCanvasPos(e)
      lastPos.current = pos

      // Start path for single dot
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, (tool === 'eraser' ? penSize * 2 : penSize) / 2, 0, Math.PI * 2)
      ctx.fillStyle = tool === 'eraser' ? '#ffffff' : color
      ctx.fill()

      canvas.setPointerCapture(e.pointerId)
    },
    [getCanvasPos, tool, penSize, color],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current) return
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx || !lastPos.current) return

      const pos = getCanvasPos(e)

      ctx.beginPath()
      ctx.moveTo(lastPos.current.x, lastPos.current.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
      ctx.lineWidth = tool === 'eraser' ? penSize * 2 : penSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()

      lastPos.current = pos
    },
    [getCanvasPos, tool, penSize, color],
  )

  const handlePointerUp = useCallback(() => {
    if (!isDrawing.current) return
    isDrawing.current = false
    lastPos.current = null

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, 512, 512)
    setUndoStack((prev) => {
      const next = [...prev, imageData]
      if (next.length > MAX_UNDO) next.shift()
      return next
    })
    setRedoStack([])
  }, [])

  const handleUndo = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (undoStack.length <= 1) return

    const newUndo = [...undoStack]
    const current = newUndo.pop()!
    setRedoStack((prev) => [...prev, current])
    setUndoStack(newUndo)

    const previous = newUndo[newUndo.length - 1]
    ctx.putImageData(previous, 0, 0)
  }, [undoStack])

  const handleRedo = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (redoStack.length === 0) return

    const newRedo = [...redoStack]
    const next = newRedo.pop()!
    setRedoStack(newRedo)
    setUndoStack((prev) => [...prev, next])

    ctx.putImageData(next, 0, 0)
  }, [redoStack])

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 512, 512)

    const imageData = ctx.getImageData(0, 0, 512, 512)
    setUndoStack((prev) => [...prev, imageData])
    setRedoStack([])
  }, [])

  const handleExport = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    onExport(canvas.toDataURL('image/png'))
  }, [onExport])

  const toolBtnClass = (active: boolean) =>
    `min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
      active
        ? 'bg-[#3D6AF2] text-white'
        : 'bg-[#131a23] text-white hover:bg-[#1e2631]'
    }`

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div
        className={`flex flex-wrap items-center gap-2 rounded-xl p-3 ${
          isFun
            ? 'bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30'
            : 'bg-[#131a23]'
        }`}
      >
        {/* Tool toggle */}
        <div className="flex gap-1">
          <button
            type="button"
            className={toolBtnClass(tool === 'pen')}
            onClick={() => setTool('pen')}
            aria-label="Pen tool"
            title="Pen"
          >
            {isFun ? '✏️ Pen' : '✏️'}
          </button>
          <button
            type="button"
            className={toolBtnClass(tool === 'eraser')}
            onClick={() => setTool('eraser')}
            aria-label="Eraser tool"
            title="Eraser"
          >
            {isFun ? '🧹 Eraser' : '🧹'}
          </button>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-[#1e2631]" />

        {/* Pen sizes */}
        <div className="flex gap-1">
          {PEN_SIZES.map((ps) => (
            <button
              key={ps.size}
              type="button"
              className={toolBtnClass(penSize === ps.size)}
              onClick={() => setPenSize(ps.size)}
              aria-label={`${ps.label} pen size`}
              title={ps.label}
            >
              <span
                className="inline-block rounded-full bg-current"
                style={{ width: ps.size + 4, height: ps.size + 4 }}
              />
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-[#1e2631]" />

        {/* Color swatches */}
        <div className="flex flex-wrap gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`min-h-[44px] min-w-[44px] rounded-lg border-2 transition-transform cursor-pointer ${
                color === c && tool === 'pen'
                  ? 'border-[#3D6AF2] scale-110'
                  : 'border-transparent'
              }`}
              onClick={() => {
                setColor(c)
                setTool('pen')
              }}
              aria-label={`Color ${c}`}
              title={c}
            >
              <span
                className="block h-6 w-6 rounded-md mx-auto"
                style={{ backgroundColor: c }}
              />
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-[#1e2631]" />

        {/* Undo / Redo / Clear */}
        <div className="flex gap-1">
          <button
            type="button"
            className={toolBtnClass(false)}
            onClick={handleUndo}
            disabled={undoStack.length <= 1}
            aria-label="Undo"
            title="Undo"
          >
            {isFun ? '↩️ Undo' : '↩️'}
          </button>
          <button
            type="button"
            className={toolBtnClass(false)}
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            aria-label="Redo"
            title="Redo"
          >
            {isFun ? '↪️ Redo' : '↪️'}
          </button>
          <button
            type="button"
            className={`${toolBtnClass(false)} text-red-500`}
            onClick={handleClear}
            aria-label="Clear canvas"
            title="Clear"
          >
            {isFun ? '🗑️ Clear' : '🗑️'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full max-w-[512px] mx-auto">
        <canvas
          ref={canvasRef}
          width={512}
          height={512}
          className="w-full aspect-square rounded-xl border-2 border-[#1e2631] cursor-crosshair"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>

      {/* Done button */}
      <button
        type="button"
        onClick={handleExport}
        className={`min-h-[44px] w-full rounded-xl font-semibold text-white transition-all cursor-pointer ${
          isFun
            ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-lg'
            : 'bg-[#3D6AF2] hover:bg-[#3564d8]'
        }`}
      >
        {isFun ? '🎉 Done Drawing!' : 'Done Drawing'}
      </button>
    </div>
  )
}
