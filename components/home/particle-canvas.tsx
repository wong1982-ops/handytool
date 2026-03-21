'use client'

import { useRef, useEffect, useCallback, useState } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
}

function randomVelocity(): number {
  const speed = 0.2 + Math.random() * 0.3
  return Math.random() > 0.5 ? speed : -speed
}

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 })
  const [isMobile, setIsMobile] = useState(false)
  const reducedMotionRef = useRef(false)
  const visibleRef = useRef(true)

  const resize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas?.parentElement) return
    canvas.width = canvas.parentElement.clientWidth
    canvas.height = canvas.parentElement.clientHeight
  }, [])

  useEffect(() => {
    if (window.innerWidth < 640) {
      setIsMobile(true)
      return
    }

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionRef.current = mq.matches
    const motionHandler = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches
    }
    mq.addEventListener('change', motionHandler)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    resize()

    // Create particles
    const particles: Particle[] = []
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: randomVelocity(),
        vy: randomVelocity(),
      })
    }
    particlesRef.current = particles

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    // Intersection observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting
      },
      { threshold: 0.1 }
    )
    observer.observe(canvas)

    // Resize handler
    window.addEventListener('resize', resize)

    // Draw static dots for reduced motion
    if (reducedMotionRef.current) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.fill()
      }
      return () => {
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('mouseleave', handleMouseLeave)
        observer.disconnect()
        window.removeEventListener('resize', resize)
        mq.removeEventListener('change', motionHandler)
      }
    }

    // Animation loop
    const animate = () => {
      if (!visibleRef.current) {
        rafRef.current = requestAnimationFrame(animate)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const w = canvas.width
      const h = canvas.height
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy

        // Wrap edges
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.fill()
      }

      // Draw lines between particles near mouse
      const nearMouse = particles.filter((p) => {
        const dx = p.x - mx
        const dy = p.y - my
        return dx * dx + dy * dy < 120 * 120
      })

      for (let i = 0; i < nearMouse.length; i++) {
        for (let j = i + 1; j < nearMouse.length; j++) {
          const a = nearMouse[i]
          const b = nearMouse[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          if (dx * dx + dy * dy < 120 * 120) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = 'rgba(255,255,255,0.08)'
            ctx.stroke()
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      observer.disconnect()
      window.removeEventListener('resize', resize)
      mq.removeEventListener('change', motionHandler)
    }
  }, [resize])

  if (isMobile) return null

  return <canvas ref={canvasRef} className="absolute inset-0" />
}
