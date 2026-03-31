'use client'

import { useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rotation: number
  rotationSpeed: number
  opacity: number
  color: string
}

export interface CoinShowerRef {
  fire: (intensity: 'small' | 'big' | 'mega') => void
}

export const CoinShower = forwardRef<CoinShowerRef, {}>(function CoinShower(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)
  const activeRef = useRef(false)

  const GOLD_COLORS = ['#FFD700', '#FFA500', '#DAA520', '#F0C060', '#E8B230']

  const spawn = useCallback((count: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = canvas.width

    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: Math.random() * w,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 2 + 1,
        size: Math.random() * 8 + 6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        opacity: 1,
        color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
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
      p.vy += 0.08 // gravity
      p.rotation += p.rotationSpeed
      p.opacity -= 0.003

      if (p.y > canvas.height + 20 || p.opacity <= 0) {
        particles.splice(i, 1)
        continue
      }

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.globalAlpha = p.opacity

      // Draw coin (circle with highlight)
      ctx.beginPath()
      ctx.arc(0, 0, p.size, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()

      // Highlight
      ctx.beginPath()
      ctx.arc(-p.size * 0.2, -p.size * 0.2, p.size * 0.4, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.fill()

      ctx.restore()
    }

    if (particles.length > 0) {
      animFrameRef.current = requestAnimationFrame(animate)
    } else {
      activeRef.current = false
    }
  }, [])

  const fire = useCallback((intensity: 'small' | 'big' | 'mega') => {
    const counts = { small: 30, big: 80, mega: 150 }
    spawn(counts[intensity])

    if (!activeRef.current) {
      activeRef.current = true
      animFrameRef.current = requestAnimationFrame(animate)
    }
  }, [spawn, animate])

  useImperativeHandle(ref, () => ({ fire }))

  // Resize canvas
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
      className="absolute inset-0 pointer-events-none z-20"
      aria-hidden="true"
    />
  )
})
