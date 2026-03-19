/**
 * Client-side ICO file encoder.
 *
 * ICO binary layout:
 *   [6-byte header] [16-byte dir entry × N] [PNG data × N]
 *
 * Header (6 bytes):
 *   - uint16 reserved   = 0
 *   - uint16 type       = 1 (ICO)
 *   - uint16 count      = number of images
 *
 * Directory entry (16 bytes each):
 *   - uint8  width      (0 = 256)
 *   - uint8  height     (0 = 256)
 *   - uint8  colorPalette = 0
 *   - uint8  reserved   = 0
 *   - uint16 planes     = 1
 *   - uint16 bpp        = 32
 *   - uint32 dataSize
 *   - uint32 dataOffset
 */

export async function encodeIco(
  pngs: { size: number; blob: Blob }[],
): Promise<Blob> {
  const headerSize = 6
  const dirEntrySize = 16
  const dirSize = dirEntrySize * pngs.length

  // Read all blobs into ArrayBuffers
  const buffers = await Promise.all(
    pngs.map((png) => png.blob.arrayBuffer()),
  )

  // Calculate total file size
  const totalDataSize = buffers.reduce((sum, buf) => sum + buf.byteLength, 0)
  const fileSize = headerSize + dirSize + totalDataSize

  const arrayBuffer = new ArrayBuffer(fileSize)
  const view = new DataView(arrayBuffer)

  // ── Write header ─────────────────────────────────────────────
  view.setUint16(0, 0, true)            // reserved
  view.setUint16(2, 1, true)            // type = ICO
  view.setUint16(4, pngs.length, true)  // count

  // ── Write directory entries + image data ─────────────────────
  let dataOffset = headerSize + dirSize

  for (let i = 0; i < pngs.length; i++) {
    const entryOffset = headerSize + i * dirEntrySize
    const { size } = pngs[i]
    const dataSize = buffers[i].byteLength

    // width & height: 0 means 256
    const dim = size >= 256 ? 0 : size

    view.setUint8(entryOffset + 0, dim)        // width
    view.setUint8(entryOffset + 1, dim)        // height
    view.setUint8(entryOffset + 2, 0)          // color palette
    view.setUint8(entryOffset + 3, 0)          // reserved
    view.setUint16(entryOffset + 4, 1, true)   // planes
    view.setUint16(entryOffset + 6, 32, true)  // bpp
    view.setUint32(entryOffset + 8, dataSize, true)   // data size
    view.setUint32(entryOffset + 12, dataOffset, true) // data offset

    // Copy PNG data
    const src = new Uint8Array(buffers[i])
    const dst = new Uint8Array(arrayBuffer, dataOffset, dataSize)
    dst.set(src)

    dataOffset += dataSize
  }

  return new Blob([arrayBuffer], { type: 'image/x-icon' })
}
