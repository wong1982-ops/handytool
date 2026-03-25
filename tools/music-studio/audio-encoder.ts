// tools/music-studio/audio-encoder.ts

/**
 * Convert interleaved 16-bit PCM Int16Array to stereo Float32Arrays.
 * Lyria outputs interleaved stereo PCM16 at 48kHz.
 */
export function pcm16ToFloat32(pcm16: Int16Array): { left: Float32Array; right: Float32Array } {
  const numSamples = pcm16.length / 2
  const left = new Float32Array(numSamples)
  const right = new Float32Array(numSamples)
  for (let i = 0; i < numSamples; i++) {
    left[i] = pcm16[i * 2] / 32768
    right[i] = pcm16[i * 2 + 1] / 32768
  }
  return { left, right }
}

/**
 * Encode Float32Array audio chunks to WAV blob.
 */
export function encodeWav(chunks: { left: Float32Array; right: Float32Array }[], sampleRate: number): Blob {
  const totalSamples = chunks.reduce((sum, c) => sum + c.left.length, 0)
  const buffer = new ArrayBuffer(44 + totalSamples * 4) // 16-bit stereo = 4 bytes per sample
  const view = new DataView(buffer)

  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + totalSamples * 4, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true) // chunk size
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 2, true) // stereo
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 4, true) // byte rate
  view.setUint16(32, 4, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  writeString(36, 'data')
  view.setUint32(40, totalSamples * 4, true)

  let offset = 44
  for (const chunk of chunks) {
    for (let i = 0; i < chunk.left.length; i++) {
      const l = Math.max(-1, Math.min(1, chunk.left[i]))
      const r = Math.max(-1, Math.min(1, chunk.right[i]))
      view.setInt16(offset, l * 32767, true)
      view.setInt16(offset + 2, r * 32767, true)
      offset += 4
    }
  }

  return new Blob([buffer], { type: 'audio/wav' })
}

/**
 * Encode Float32Array audio chunks to MP3 blob using lamejs.
 */
export async function encodeMp3(chunks: { left: Float32Array; right: Float32Array }[], sampleRate: number): Promise<Blob> {
  const lamejs = await import('lamejs')
  const mp3Encoder = new lamejs.Mp3Encoder(2, sampleRate, 192) // stereo, 192kbps
  const mp3Parts: Int8Array[] = []

  for (const chunk of chunks) {
    const leftInt16 = new Int16Array(chunk.left.length)
    const rightInt16 = new Int16Array(chunk.right.length)
    for (let i = 0; i < chunk.left.length; i++) {
      leftInt16[i] = Math.max(-32768, Math.min(32767, Math.round(chunk.left[i] * 32767)))
      rightInt16[i] = Math.max(-32768, Math.min(32767, Math.round(chunk.right[i] * 32767)))
    }
    const encoded = mp3Encoder.encodeBuffer(leftInt16, rightInt16)
    if (encoded.length > 0) mp3Parts.push(new Int8Array(encoded))
  }

  const flush = mp3Encoder.flush()
  if (flush.length > 0) mp3Parts.push(new Int8Array(flush))

  // Int8Array → ArrayBuffer to satisfy strict BlobPart typing
  const buffers: ArrayBuffer[] = mp3Parts.map(p => p.buffer.slice(0) as ArrayBuffer)
  return new Blob(buffers, { type: 'audio/mp3' })
}
