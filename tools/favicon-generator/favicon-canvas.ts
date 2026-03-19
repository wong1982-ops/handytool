import type { FaviconConfig } from './types'
import { FONT_MAP } from './types'

// ── Shape clipping helpers ─────────────────────────────────────

function clipCircle(ctx: CanvasRenderingContext2D, size: number) {
  const r = size / 2
  ctx.beginPath()
  ctx.arc(r, r, r, 0, Math.PI * 2)
  ctx.closePath()
}

function clipSquare(ctx: CanvasRenderingContext2D, size: number) {
  ctx.beginPath()
  ctx.rect(0, 0, size, size)
  ctx.closePath()
}

function clipRounded(ctx: CanvasRenderingContext2D, size: number) {
  const radius = size * 0.2
  ctx.beginPath()
  ctx.moveTo(radius, 0)
  ctx.lineTo(size - radius, 0)
  ctx.quadraticCurveTo(size, 0, size, radius)
  ctx.lineTo(size, size - radius)
  ctx.quadraticCurveTo(size, size, size - radius, size)
  ctx.lineTo(radius, size)
  ctx.quadraticCurveTo(0, size, 0, size - radius)
  ctx.lineTo(0, radius)
  ctx.quadraticCurveTo(0, 0, radius, 0)
  ctx.closePath()
}

function clipHexagon(ctx: CanvasRenderingContext2D, size: number) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

function applyShapeClip(
  ctx: CanvasRenderingContext2D,
  shape: FaviconConfig['shape'],
  size: number,
) {
  switch (shape) {
    case 'circle':  clipCircle(ctx, size); break
    case 'square':  clipSquare(ctx, size); break
    case 'rounded': clipRounded(ctx, size); break
    case 'hexagon': clipHexagon(ctx, size); break
  }
  ctx.clip()
}

// ── Background ─────────────────────────────────────────────────

function drawBackground(ctx: CanvasRenderingContext2D, config: FaviconConfig, size: number) {
  if (config.bgType === 'transparent') return

  if (config.bgType === 'solid') {
    ctx.fillStyle = config.bgColor
    ctx.fillRect(0, 0, size, size)
    return
  }

  // Gradient
  const { from, to, angle } = config.bgGradient
  const rad = (angle * Math.PI) / 180
  const cx = size / 2
  const cy = size / 2
  const len = size / 2

  const x0 = cx - Math.cos(rad) * len
  const y0 = cy - Math.sin(rad) * len
  const x1 = cx + Math.cos(rad) * len
  const y1 = cy + Math.sin(rad) * len

  const gradient = ctx.createLinearGradient(x0, y0, x1, y1)
  gradient.addColorStop(0, from)
  gradient.addColorStop(1, to)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
}

// ── Content renderers ──────────────────────────────────────────

function drawImageContent(
  ctx: CanvasRenderingContext2D,
  config: FaviconConfig,
  size: number,
) {
  if (!config.imageData) return

  const img = new Image()
  img.src = config.imageData

  const pad = (config.padding / 100) * size
  const drawSize = size - pad * 2

  // Apply crop & zoom
  const zoom = config.cropZoom || 1
  const scaledW = img.width / zoom
  const scaledH = img.height / zoom
  const sx = (config.cropX / 100) * (img.width - scaledW)
  const sy = (config.cropY / 100) * (img.height - scaledH)

  ctx.drawImage(img, sx, sy, scaledW, scaledH, pad, pad, drawSize, drawSize)
}

function drawTextContent(
  ctx: CanvasRenderingContext2D,
  config: FaviconConfig,
  size: number,
) {
  if (!config.text) return

  const scaledFontSize = (config.fontSize / 100) * size
  const fontStack = FONT_MAP[config.fontFamily]

  ctx.fillStyle = config.fgColor
  ctx.font = `bold ${scaledFontSize}px ${fontStack}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(config.text, size / 2, size / 2)
}

function drawIconContent(
  ctx: CanvasRenderingContext2D,
  config: FaviconConfig,
  size: number,
) {
  if (!config.iconSvg) return

  const blob = new Blob([config.iconSvg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const img = new Image()
  img.src = url

  const pad = (config.padding / 100) * size
  const drawSize = size - pad * 2

  // Tint the icon by using composite operations
  ctx.drawImage(img, pad, pad, drawSize, drawSize)
  URL.revokeObjectURL(url)
}

// ── Shadow & border ────────────────────────────────────────────

function applyShadow(ctx: CanvasRenderingContext2D, config: FaviconConfig, size: number) {
  if (!config.shadow.enabled) return
  const scale = size / 512
  ctx.shadowColor = config.shadow.color
  ctx.shadowBlur = config.shadow.blur * scale
  ctx.shadowOffsetX = config.shadow.offsetX * scale
  ctx.shadowOffsetY = config.shadow.offsetY * scale
}

function drawBorder(ctx: CanvasRenderingContext2D, config: FaviconConfig, size: number) {
  if (!config.border.enabled) return

  const scale = size / 512
  ctx.save()

  // Re-create shape path for the stroke
  switch (config.shape) {
    case 'circle':  clipCircle(ctx, size); break
    case 'square':  clipSquare(ctx, size); break
    case 'rounded': clipRounded(ctx, size); break
    case 'hexagon': clipHexagon(ctx, size); break
  }

  ctx.strokeStyle = config.border.color
  ctx.lineWidth = config.border.width * scale
  ctx.stroke()
  ctx.restore()
}

// ── Main render function ───────────────────────────────────────

export function renderFavicon(config: FaviconConfig, size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // 1. Save clean state, apply shape clip
  ctx.save()
  applyShapeClip(ctx, config.shape, size)

  // 2. Apply shadow before drawing background
  applyShadow(ctx, config, size)

  // 3. Draw background
  drawBackground(ctx, config, size)

  // 4. Reset shadow so content isn't affected
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // 5. Draw content based on mode
  switch (config.mode) {
    case 'upload':
    case 'ai':
      drawImageContent(ctx, config, size)
      break
    case 'text':
      drawTextContent(ctx, config, size)
      break
    case 'icon':
      drawIconContent(ctx, config, size)
      break
  }

  ctx.restore()

  // 6. Draw border (outside clip region)
  drawBorder(ctx, config, size)

  return canvas
}

// ── Convenience exports ────────────────────────────────────────

export function renderFaviconDataUrl(config: FaviconConfig, size: number): string {
  const canvas = renderFavicon(config, size)
  return canvas.toDataURL('image/png')
}

export function renderFaviconBlob(config: FaviconConfig, size: number): Promise<Blob> {
  const canvas = renderFavicon(config, size)
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to create PNG blob'))
    }, 'image/png')
  })
}
