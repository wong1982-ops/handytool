'use client'

/**
 * SVG-to-EPS exporter
 * Parses SVG path elements, converts path commands to PostScript,
 * flips Y-axis (SVG top-down -> PS bottom-up), and handles fill colors.
 */

/** Parse a hex color string to RGB 0-1 values */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) / 255
    const g = parseInt(clean[1] + clean[1], 16) / 255
    const b = parseInt(clean[2] + clean[2], 16) / 255
    return [r, g, b]
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16) / 255
    const g = parseInt(clean.slice(2, 4), 16) / 255
    const b = parseInt(clean.slice(4, 6), 16) / 255
    return [r, g, b]
  }
  return [0, 0, 0]
}

/** Parse named CSS colors to hex (common subset) */
function namedColorToHex(name: string): string | null {
  const map: Record<string, string> = {
    black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000',
    blue: '#0000ff', yellow: '#ffff00', cyan: '#00ffff', magenta: '#ff00ff',
    gray: '#808080', grey: '#808080', orange: '#ffa500', purple: '#800080',
    pink: '#ffc0cb', brown: '#a52a2a', navy: '#000080', teal: '#008080',
    lime: '#00ff00', aqua: '#00ffff', maroon: '#800000', olive: '#808000',
    silver: '#c0c0c0', fuchsia: '#ff00ff',
  }
  return map[name.toLowerCase()] ?? null
}

/** Resolve a CSS color value to an RGB tuple, or null if transparent/unsupported */
function resolveColor(value: string | null): [number, number, number] | null {
  if (!value || value === 'none' || value === 'transparent') return null
  if (value.startsWith('#')) return hexToRgb(value)
  if (value.startsWith('rgb')) {
    const m = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
    if (m) return [parseInt(m[1]) / 255, parseInt(m[2]) / 255, parseInt(m[3]) / 255]
    return [0, 0, 0]
  }
  const hex = namedColorToHex(value)
  if (hex) return hexToRgb(hex)
  return [0, 0, 0]
}

/** Tokenize an SVG path data string into command + number groups */
function tokenizePath(d: string): Array<{ cmd: string; args: number[] }> {
  const tokens: Array<{ cmd: string; args: number[] }> = []
  // Match command letter followed by optional numbers (with optional commas/spaces)
  const re = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g
  let match: RegExpExecArray | null
  while ((match = re.exec(d)) !== null) {
    const cmd = match[1]
    const argStr = match[2].trim()
    const args = argStr.length > 0
      ? argStr.split(/[\s,]+/).map(Number).filter((n) => !isNaN(n))
      : []
    tokens.push({ cmd, args })
  }
  return tokens
}

/**
 * Convert SVG path commands to PostScript drawing operators.
 * Handles: M/m, L/l, H/h, V/v, C/c, Z/z
 * Y-axis is flipped: psY = height - svgY
 */
function pathToPS(d: string, height: number): string[] {
  const tokens = tokenizePath(d)
  const lines: string[] = []
  let cx = 0, cy = 0 // current point (SVG coords)

  const flipY = (y: number) => height - y

  for (const { cmd, args } of tokens) {
    switch (cmd) {
      case 'M': {
        // Absolute moveto — can have implicit lineto pairs after first pair
        for (let i = 0; i < args.length; i += 2) {
          cx = args[i]; cy = args[i + 1]
          if (i === 0) {
            lines.push(`${cx} ${flipY(cy)} moveto`)
          } else {
            lines.push(`${cx} ${flipY(cy)} lineto`)
          }
        }
        break
      }
      case 'm': {
        for (let i = 0; i < args.length; i += 2) {
          cx += args[i]; cy += args[i + 1]
          if (i === 0) {
            lines.push(`${cx} ${flipY(cy)} moveto`)
          } else {
            lines.push(`${cx} ${flipY(cy)} lineto`)
          }
        }
        break
      }
      case 'L': {
        for (let i = 0; i < args.length; i += 2) {
          cx = args[i]; cy = args[i + 1]
          lines.push(`${cx} ${flipY(cy)} lineto`)
        }
        break
      }
      case 'l': {
        for (let i = 0; i < args.length; i += 2) {
          cx += args[i]; cy += args[i + 1]
          lines.push(`${cx} ${flipY(cy)} lineto`)
        }
        break
      }
      case 'H': {
        for (const x of args) {
          cx = x
          lines.push(`${cx} ${flipY(cy)} lineto`)
        }
        break
      }
      case 'h': {
        for (const dx of args) {
          cx += dx
          lines.push(`${cx} ${flipY(cy)} lineto`)
        }
        break
      }
      case 'V': {
        for (const y of args) {
          cy = y
          lines.push(`${cx} ${flipY(cy)} lineto`)
        }
        break
      }
      case 'v': {
        for (const dy of args) {
          cy += dy
          lines.push(`${cx} ${flipY(cy)} lineto`)
        }
        break
      }
      case 'C': {
        for (let i = 0; i + 5 < args.length; i += 6) {
          const x1 = args[i], y1 = args[i + 1]
          const x2 = args[i + 2], y2 = args[i + 3]
          const x = args[i + 4], y = args[i + 5]
          lines.push(`${x1} ${flipY(y1)} ${x2} ${flipY(y2)} ${x} ${flipY(y)} curveto`)
          cx = x; cy = y
        }
        break
      }
      case 'c': {
        for (let i = 0; i + 5 < args.length; i += 6) {
          const x1 = cx + args[i], y1 = cy + args[i + 1]
          const x2 = cx + args[i + 2], y2 = cy + args[i + 3]
          const x = cx + args[i + 4], y = cy + args[i + 5]
          lines.push(`${x1} ${flipY(y1)} ${x2} ${flipY(y2)} ${x} ${flipY(y)} curveto`)
          cx = x; cy = y
        }
        break
      }
      case 'S': {
        // Smooth cubic — approximate by using current point as first control
        for (let i = 0; i + 3 < args.length; i += 4) {
          const x2 = args[i], y2 = args[i + 1]
          const x = args[i + 2], y = args[i + 3]
          lines.push(`${cx} ${flipY(cy)} ${x2} ${flipY(y2)} ${x} ${flipY(y)} curveto`)
          cx = x; cy = y
        }
        break
      }
      case 's': {
        for (let i = 0; i + 3 < args.length; i += 4) {
          const x2 = cx + args[i], y2 = cy + args[i + 1]
          const x = cx + args[i + 2], y = cy + args[i + 3]
          lines.push(`${cx} ${flipY(cy)} ${x2} ${flipY(y2)} ${x} ${flipY(y)} curveto`)
          cx = x; cy = y
        }
        break
      }
      case 'Q': {
        // Quadratic bezier — approximate with cubic
        for (let i = 0; i + 3 < args.length; i += 4) {
          const qx = args[i], qy = args[i + 1]
          const x = args[i + 2], y = args[i + 3]
          // Convert quadratic to cubic control points
          const cp1x = cx + (2 / 3) * (qx - cx)
          const cp1y = cy + (2 / 3) * (qy - cy)
          const cp2x = x + (2 / 3) * (qx - x)
          const cp2y = y + (2 / 3) * (qy - y)
          lines.push(`${cp1x} ${flipY(cp1y)} ${cp2x} ${flipY(cp2y)} ${x} ${flipY(y)} curveto`)
          cx = x; cy = y
        }
        break
      }
      case 'q': {
        for (let i = 0; i + 3 < args.length; i += 4) {
          const qx = cx + args[i], qy = cy + args[i + 1]
          const x = cx + args[i + 2], y = cy + args[i + 3]
          const cp1x = cx + (2 / 3) * (qx - cx)
          const cp1y = cy + (2 / 3) * (qy - cy)
          const cp2x = x + (2 / 3) * (qx - x)
          const cp2y = y + (2 / 3) * (qy - y)
          lines.push(`${cp1x} ${flipY(cp1y)} ${cp2x} ${flipY(cp2y)} ${x} ${flipY(y)} curveto`)
          cx = x; cy = y
        }
        break
      }
      case 'Z':
      case 'z':
        lines.push('closepath')
        break
      // T, t, A, a — skip unsupported commands gracefully
      default:
        break
    }
  }
  return lines
}

/**
 * Convert an SVG string to EPS format.
 * Returns a Blob of type 'application/postscript'.
 */
export function svgToEps(svgString: string): Blob {
  if (!svgString || !svgString.trim()) {
    throw new Error('Empty SVG string')
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')
  const svgEl = doc.querySelector('svg')

  if (!svgEl) {
    throw new Error('Invalid SVG: no <svg> element found')
  }

  // Determine dimensions from viewBox or width/height attributes
  let width = 0, height = 0
  const viewBox = svgEl.getAttribute('viewBox')
  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number)
    if (parts.length >= 4) {
      width = parts[2]
      height = parts[3]
    }
  }
  if (!width) width = parseFloat(svgEl.getAttribute('width') || '0') || 300
  if (!height) height = parseFloat(svgEl.getAttribute('height') || '0') || 300

  // Collect all path elements
  const paths = doc.querySelectorAll('path')

  const psLines: string[] = [
    '%!PS-Adobe-3.0 EPSF-3.0',
    `%%BoundingBox: 0 0 ${Math.ceil(width)} ${Math.ceil(height)}`,
    `%%HiResBoundingBox: 0 0 ${width} ${height}`,
    '%%Creator: Toolk1t SVG Converter',
    '%%Pages: 1',
    '%%EndComments',
    '%%Page: 1 1',
    '',
    '% Begin SVG paths',
  ]

  if (paths.length === 0) {
    // No paths — produce a valid but empty EPS
    psLines.push('% No paths found in SVG')
  }

  paths.forEach((pathEl) => {
    const d = pathEl.getAttribute('d')
    if (!d || !d.trim()) return

    const fill = pathEl.getAttribute('fill') || pathEl.style?.fill || null
    const color = resolveColor(fill)

    psLines.push('')
    psLines.push('newpath')

    const commands = pathToPS(d, height)
    psLines.push(...commands)

    if (color) {
      psLines.push(`${color[0].toFixed(4)} ${color[1].toFixed(4)} ${color[2].toFixed(4)} setrgbcolor`)
    } else {
      psLines.push('0 0 0 setrgbcolor')
    }
    psLines.push('fill')
  })

  psLines.push('')
  psLines.push('showpage')
  psLines.push('%%EOF')

  const epsContent = psLines.join('\n')
  return new Blob([epsContent], { type: 'application/postscript' })
}
