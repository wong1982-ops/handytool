/**
 * Adobe Swatch Exchange (ASE) binary format encoder.
 * Pure utility — no 'use client'.
 */

export function encodeAse(colors: { name: string; hex: string }[]): Blob {
  // Calculate total size
  // Header: 4 (signature) + 2 (major) + 2 (minor) + 4 (block count) = 12
  // Per color block:
  //   2 (block type) + 4 (block length) +
  //   2 (name length in UTF-16 chars including null) +
  //   name.length * 2 + 2 (null terminator) +
  //   4 (color model 'RGB ') + 12 (3 float32) + 2 (color type) = variable

  function calcBlockDataLength(name: string): number {
    // name length (uint16) + name chars (UTF-16BE) + null terminator (2 bytes) + color model (4) + 3 floats (12) + color type (2)
    const nameLen = name.length + 1 // +1 for null terminator
    return 2 + nameLen * 2 + 4 + 12 + 2
  }

  let totalSize = 12 // header
  for (const color of colors) {
    totalSize += 2 + 4 + calcBlockDataLength(color.name) // block type + block length + block data
  }

  const buffer = new ArrayBuffer(totalSize)
  const view = new DataView(buffer)
  let offset = 0

  // Helper: write string as ASCII bytes
  function writeAscii(str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset++, str.charCodeAt(i))
    }
  }

  // Header: 'ASEF'
  writeAscii('ASEF')

  // Version: major 1, minor 0
  view.setUint16(offset, 1)
  offset += 2
  view.setUint16(offset, 0)
  offset += 2

  // Block count
  view.setUint32(offset, colors.length)
  offset += 4

  // Color blocks
  for (const color of colors) {
    // Block type: 0x0001 (color entry)
    view.setUint16(offset, 0x0001)
    offset += 2

    // Block length (everything after this uint32)
    const blockDataLen = calcBlockDataLength(color.name)
    view.setUint32(offset, blockDataLen)
    offset += 4

    // Name length (number of UTF-16 chars including null terminator)
    const nameCharLen = color.name.length + 1
    view.setUint16(offset, nameCharLen)
    offset += 2

    // Name as UTF-16BE
    for (let i = 0; i < color.name.length; i++) {
      view.setUint16(offset, color.name.charCodeAt(i))
      offset += 2
    }
    // Null terminator
    view.setUint16(offset, 0)
    offset += 2

    // Color model: 'RGB ' (4 ASCII bytes)
    writeAscii('RGB ')

    // Parse hex to RGB floats (0.0-1.0)
    const hex = color.hex.replace(/^#/, '')
    const r = parseInt(hex.slice(0, 2), 16) / 255
    const g = parseInt(hex.slice(2, 4), 16) / 255
    const b = parseInt(hex.slice(4, 6), 16) / 255

    view.setFloat32(offset, r)
    offset += 4
    view.setFloat32(offset, g)
    offset += 4
    view.setFloat32(offset, b)
    offset += 4

    // Color type: 0 = global
    view.setUint16(offset, 0)
    offset += 2
  }

  return new Blob([buffer], { type: 'application/octet-stream' })
}
