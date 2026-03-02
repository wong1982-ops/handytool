'use client'

import { useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  snapPoint?: 'half' | 'full'
}

const SNAP_HEIGHTS = {
  half: '50vh',
  full: '90vh',
}

const DISMISS_THRESHOLD = 100
const VELOCITY_THRESHOLD = 500

export function BottomSheet({ open, onClose, children, snapPoint = 'half' }: BottomSheetProps) {
  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > DISMISS_THRESHOLD || info.velocity.y > VELOCITY_THRESHOLD) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.div
            className="fixed inset-0 z-[70] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[71] rounded-t-2xl bg-gray-900 border-t border-white/10"
            style={{ maxHeight: SNAP_HEIGHTS[snapPoint] }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
          >
            {/* Drag handle */}
            <div className="flex justify-center py-3">
              <div className="w-9 h-1 rounded-full bg-gray-600" />
            </div>

            {/* Content */}
            <div className="overflow-y-auto px-4 pb-8" style={{ maxHeight: `calc(${SNAP_HEIGHTS[snapPoint]} - 40px)` }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
