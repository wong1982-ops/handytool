'use client'

import { useState, useEffect } from 'react'

const BLOBS = [
  { color: '#3D6AF2', top: '-10%', left: '-10%', animName: 'meshBlob1', keyframes: 'translateX(0) translateY(0), translateX(30%) translateY(20%), translateX(-10%) translateY(40%), translateX(0) translateY(0)', duration: '18s' },
  { color: '#8B5CF6', top: '-20%', left: '50%', animName: 'meshBlob2', keyframes: 'translateX(0) translateY(0), translateX(-25%) translateY(30%), translateX(15%) translateY(-10%), translateX(0) translateY(0)', duration: '20s' },
  { color: '#32D9D9', top: '40%', left: '-15%', animName: 'meshBlob3', keyframes: 'translateX(0) translateY(0), translateX(20%) translateY(-25%), translateX(-15%) translateY(15%), translateX(0) translateY(0)', duration: '16s' },
  { color: '#EC4899', top: '30%', left: '55%', animName: 'meshBlob4', keyframes: 'translateX(0) translateY(0), translateX(-20%) translateY(-20%), translateX(25%) translateY(10%), translateX(0) translateY(0)', duration: '17s' },
]

function buildKeyframeCSS(name: string, keyframes: string): string {
  const points = keyframes.split(',').map((s) => s.trim())
  const step = 100 / (points.length - 1)
  const rules = points.map((p, i) => `${Math.round(step * i)}% { transform: ${p}; }`).join(' ')
  return `@keyframes ${name} { ${rules} }`
}

export function GradientMesh() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {!reducedMotion && (
        <style dangerouslySetInnerHTML={{ __html: BLOBS.map((b) => buildKeyframeCSS(b.animName, b.keyframes)).join('\n') }} />
      )}
      {BLOBS.map((blob) => (
        <div
          key={blob.animName}
          className="absolute w-[60%] h-[60%] rounded-full blur-3xl"
          style={{
            top: blob.top,
            left: blob.left,
            background: `radial-gradient(circle, ${blob.color}22 0%, transparent 70%)`,
            animation: reducedMotion ? 'none' : `${blob.animName} ${blob.duration} ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  )
}
