'use client'

import { useEffect, useCallback } from 'react'
import Draggable from 'react-draggable'
import { ResizableBox } from 'react-resizable'
import BoardElementRenderer from './board-element'
import type { BoardElement } from './types'

interface BoardCanvasProps {
  elements: BoardElement[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdate: (id: string, partial: Partial<BoardElement>) => void
  onRemove: (id: string) => void
  onBringToFront: (id: string) => void
  canvasRef?: React.RefObject<HTMLDivElement | null>
}

/* Minimal inline styles for react-resizable handles */
const resizeHandleStyle: React.CSSProperties = {
  position: 'absolute',
  width: 12,
  height: 12,
  bottom: 0,
  right: 0,
  cursor: 'se-resize',
  background:
    'linear-gradient(135deg, transparent 50%, rgba(61,106,242,0.6) 50%)',
  borderRadius: '0 0 4px 0',
}

const RESIZABLE_TYPES = new Set(['image', 'swatch', 'font', 'text'])

export default function BoardCanvas({
  elements,
  selectedId,
  onSelect,
  onUpdate,
  onRemove,
  onBringToFront,
  canvasRef,
}: BoardCanvasProps) {
  /* Keyboard: Delete / Backspace removes selected element */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!selectedId) return
      // Don't intercept when typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        onRemove(selectedId)
      }
    },
    [selectedId, onRemove],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <>
      {/* Inline style tag for react-resizable handle class */}
      <style>{`
        .react-resizable { position: relative; }
        .react-resizable-handle {
          position: absolute;
          width: 12px;
          height: 12px;
          bottom: 0;
          right: 0;
          cursor: se-resize;
        }
      `}</style>

      <div
        ref={canvasRef}
        className="relative w-full min-h-[600px] bg-[#0d1117] rounded-xl overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          color: 'rgba(255,255,255,0.03)',
        }}
        onClick={() => onSelect(null)}
      >
        {elements.map((el) => {
          const isSelected = el.id === selectedId
          const isResizable = RESIZABLE_TYPES.has(el.type)

          const elementNode = (
            <BoardElementRenderer
              element={el}
              selected={isSelected}
              onSelect={() => {
                onSelect(el.id)
                onBringToFront(el.id)
              }}
              onUpdate={(partial) => onUpdate(el.id, partial)}
              onRemove={() => onRemove(el.id)}
            />
          )

          const innerContent = isResizable ? (
            <ResizableBox
              width={el.width}
              height={el.height}
              onResizeStop={(_e, { size }) =>
                onUpdate(el.id, { width: size.width, height: size.height })
              }
              handle={
                isSelected ? (
                  <span
                    className="react-resizable-handle"
                    style={resizeHandleStyle}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span style={{ display: 'none' }} />
                )
              }
              minConstraints={[60, 40]}
            >
              {elementNode}
            </ResizableBox>
          ) : (
            elementNode
          )

          return (
            <Draggable
              key={el.id}
              position={{ x: el.x, y: el.y }}
              onStop={(_e, d) => onUpdate(el.id, { x: d.x, y: d.y })}
              cancel="textarea"
            >
              <div
                className="absolute"
                style={{
                  transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                  zIndex: isSelected ? 50 : undefined,
                }}
              >
                {innerContent}
              </div>
            </Draggable>
          )
        })}
      </div>
    </>
  )
}
