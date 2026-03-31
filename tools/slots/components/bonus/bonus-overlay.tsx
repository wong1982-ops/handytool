'use client'
import { useEffect, useState } from 'react'

interface BonusOverlayProps {
  visible: boolean
  onAnimationComplete: () => void
}

export function BonusOverlay({ visible, onAnimationComplete }: BonusOverlayProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        onAnimationComplete()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [visible, onAnimationComplete])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="text-center animate-bounce">
        <div className="text-6xl sm:text-8xl font-black text-yellow-300 drop-shadow-[0_0_30px_rgba(253,224,71,0.8)]">
          BONUS!
        </div>
        <div className="text-xl text-yellow-200 mt-2 animate-pulse">
          Get Ready...
        </div>
      </div>
    </div>
  )
}
