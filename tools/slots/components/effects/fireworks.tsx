'use client'

import { useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'

interface FireworkParticle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

export interface FireworksRef {
  fire: () => void
}

export const Fireworks = forwardRef<FireworksRef, {}>(function Fireworks(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<FireworkParticle[]>([])
  const animFrameRef = useRef<number>(0)
  const activeRef = useRef(false)

  const COLORS = ['#FFD700', '#FF4444', '#7B2D8E', '#FF8C00', '#FF69B4', '#00CED1']

  const burst = useCallback((cx: number, cy: number) => {
    const count = 40 + Math.floor(Math.random() * 20)
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3
      const speed = 2 + Math.random() * 4
      particlesRef.current.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 40 + Math.random() * 30,
        color,
        size: 2 + Math.random() * 2,
      })
    }
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const particles = particlesRef.current
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.05 // gravity
      p.vx *= 0.98 // drag
      p.vy *= 0.98
      p.life++

      if (p.life >= p.maxLife) {
        particles.splice(i, 1)
        continue
      }

      const progress = p.life / p.maxLife
      ctx.globalAlpha = 1 - progress

      // Draw trail
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()

      // Glow
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
      ctx.fillStyle = p.color.replace(')', ', 0.2)').replace('rgb', 'rgba')
      ctx.fill()
    }

    ctx.globalAlpha = 1

    if (particles.length > 0) {
      animFrameRef.current = requestAnimationFrame(animate)
    } else {
      activeRef.current = false
    }
  }, [])

  const fire = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // 3-5 bursts at random positions
    const burstCount = 3 + Math.floor(Math.random() * 3)
    for (let i = 0; i < burstCount; i++) {
      setTimeout(() => {
        burst(
          canvas.width * 0.2 + Math.random() * canvas.width * 0.6,
          canvas.height * 0.2 + Math.random() * canvas.height * 0.4
        )
      }, i * 400)
    }

    if (!activeRef.current) {
      activeRef.current = true
      animFrameRef.current = requestAnimationFrame(animate)
    }
  }, [burst, animate])

  useImperativeHandle(ref, () => ({ fire }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-30"
      aria-hidden="true"
    />
  )
})
