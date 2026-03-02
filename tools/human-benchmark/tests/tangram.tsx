'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import { TANGRAM_PUZZLES } from '../data/tangram-puzzles'
import type { TangramPuzzle } from '../data/tangram-puzzles'

type Phase = 'intro' | 'playing' | 'gameover'

interface PieceState {
  id: string
  color: string
  /** Current polygon points (original definition, before transform) */
  points: [number, number][]
  /** Offset from solution center: how far the piece has been dragged */
  x: number
  y: number
  rotation: number // 0-7
  flip: boolean
  placed: boolean
}

function getCentroid(points: [number, number][]): [number, number] {
  let cx = 0
  let cy = 0
  for (const [px, py] of points) {
    cx += px
    cy += py
  }
  return [cx / points.length, cy / points.length]
}

function getTimeLimit(difficulty: number): number {
  if (difficulty <= 1) return 60
  if (difficulty <= 2) return 90
  return 120
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getPuzzleForLevel(level: number): TangramPuzzle {
  // Clamp to available levels
  const idx = Math.min(level - 1, TANGRAM_PUZZLES.length - 1)
  const puzzles = TANGRAM_PUZZLES[idx]
  return pickRandom(puzzles)
}

function initPieceStates(puzzle: TangramPuzzle): PieceState[] {
  // Scatter pieces in a tray area below the puzzle (y: 420-580)
  // Spread them horizontally across the 400px width
  return puzzle.pieces.map((piece, i) => {
    const cols = Math.min(puzzle.pieces.length, 4)
    const col = i % cols
    const row = Math.floor(i / cols)
    const spacing = 400 / (cols + 1)
    const trayX = spacing * (col + 1) - 200 // offset from solution center
    const trayY = 440 + row * 80

    const [solCx, solCy] = getCentroid(piece.solutionPoints)

    return {
      id: piece.id,
      color: piece.color,
      points: piece.solutionPoints,
      // x, y are the offset of piece center from its solution center
      x: trayX - solCx + 200,
      y: trayY - solCy,
      rotation: 0,
      flip: false,
      placed: false,
    }
  })
}

export function Tangram({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [puzzle, setPuzzle] = useState<TangramPuzzle | null>(null)
  const [pieces, setPieces] = useState<PieceState[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [timeLimit, setTimeLimit] = useState(60)
  const [snapFlash, setSnapFlash] = useState<string | null>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const dragRef = useRef<{
    pieceId: string
    startX: number
    startY: number
    offsetX: number
    offsetY: number
  } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startLevel = useCallback((lvl: number) => {
    const p = getPuzzleForLevel(lvl)
    setPuzzle(p)
    const states = initPieceStates(p)
    setPieces(states)
    setSelectedId(null)
    setSnapFlash(null)
    const tl = getTimeLimit(p.difficulty)
    setTimeLimit(tl)
    setTimeLeft(tl)
    setPhase('playing')

    // Start countdown
    const start = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000)
      const remaining = tl - elapsed
      if (remaining <= 0) {
        // Timeout
        clearInterval(timerRef.current!)
        timerRef.current = null
        setTimeLeft(0)
        // Lose a life
        setLives((prev) => {
          const newLives = prev - 1
          if (newLives <= 0) {
            setPhase('gameover')
            onComplete(lvl)
          } else {
            // Retry same level after brief delay
            setTimeout(() => {
              startLevel(lvl)
            }, 500)
          }
          return newLives
        })
      } else {
        setTimeLeft(remaining)
      }
    }, 250)
  }, [onComplete])

  const handleStart = useCallback(() => {
    setLevel(1)
    setLives(3)
    startLevel(1)
  }, [startLevel])

  // Check if a piece should snap
  const checkAndSnap = useCallback(
    (pieceId: string, currentPieces: PieceState[]): PieceState[] => {
      if (!puzzle) return currentPieces
      const solPiece = puzzle.pieces.find((p) => p.id === pieceId)
      const stateIdx = currentPieces.findIndex((p) => p.id === pieceId)
      if (!solPiece || stateIdx === -1) return currentPieces

      const state = currentPieces[stateIdx]
      if (state.placed) return currentPieces

      const distX = Math.abs(state.x)
      const distY = Math.abs(state.y)
      const rotMatch = state.rotation === solPiece.solutionRotation
      const flipMatch = state.flip === solPiece.solutionFlip

      if (distX < 15 && distY < 15 && rotMatch && flipMatch) {
        // Snap!
        const updated = [...currentPieces]
        updated[stateIdx] = { ...state, x: 0, y: 0, placed: true }

        // Flash feedback
        setSnapFlash(pieceId)
        setTimeout(() => setSnapFlash(null), 400)

        // Check if all pieces placed
        const allPlaced = updated.every((p) => p.placed)
        if (allPlaced) {
          stopTimer()
          // Level up
          const nextLevel = level + 1
          setLevel(nextLevel)
          setTimeout(() => {
            startLevel(nextLevel)
          }, 800)
        }

        return updated
      }
      return currentPieces
    },
    [puzzle, level, stopTimer, startLevel],
  )

  // Pointer events for drag
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGElement>, pieceId: string) => {
      if (phase !== 'playing') return
      const state = pieces.find((p) => p.id === pieceId)
      if (!state || state.placed) return

      // Select the piece
      setSelectedId(pieceId)

      // Capture pointer for reliable drag
      ;(e.target as SVGElement).setPointerCapture(e.pointerId)

      // Get SVG coordinates
      const svg = svgRef.current
      if (!svg) return
      try {
        const ctm = svg.getScreenCTM()
        if (!ctm) return
        const pt = svg.createSVGPoint()
        pt.x = e.clientX
        pt.y = e.clientY
        const svgPt = pt.matrixTransform(ctm.inverse())

        dragRef.current = {
          pieceId,
          startX: svgPt.x,
          startY: svgPt.y,
          offsetX: state.x,
          offsetY: state.y,
        }
      } catch {
        return
      }
    },
    [phase, pieces],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!dragRef.current) return
      const svg = svgRef.current
      if (!svg) return

      try {
        const ctm = svg.getScreenCTM()
        if (!ctm) return
        const pt = svg.createSVGPoint()
        pt.x = e.clientX
        pt.y = e.clientY
        const svgPt = pt.matrixTransform(ctm.inverse())

        const dx = svgPt.x - dragRef.current.startX
        const dy = svgPt.y - dragRef.current.startY

        // Clamp piece position within SVG bounds (with some margin)
        const rawX = dragRef.current.offsetX + dx
        const rawY = dragRef.current.offsetY + dy
        const clampedX = Math.max(-250, Math.min(250, rawX))
        const clampedY = Math.max(-350, Math.min(350, rawY))

        setPieces((prev) =>
          prev.map((p) =>
            p.id === dragRef.current!.pieceId
              ? { ...p, x: clampedX, y: clampedY }
              : p,
          ),
        )
      } catch {
        return
      }
    },
    [],
  )

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current) return
    const pieceId = dragRef.current.pieceId
    dragRef.current = null

    // Check snap, then ensure piece is within visible bounds
    setPieces((prev) => {
      const snapped = checkAndSnap(pieceId, prev)
      return snapped.map((p) => {
        if (p.id !== pieceId || p.placed) return p
        // Clamp final position within safe bounds
        const clampedX = Math.max(-200, Math.min(200, p.x))
        const clampedY = Math.max(-250, Math.min(300, p.y))
        return { ...p, x: clampedX, y: clampedY }
      })
    })
  }, [checkAndSnap])

  const handleRotate = useCallback(() => {
    if (!selectedId) return
    setPieces((prev) => {
      const updated = prev.map((p) =>
        p.id === selectedId && !p.placed ? { ...p, rotation: (p.rotation + 1) % 8 } : p,
      )
      return checkAndSnap(selectedId, updated)
    })
  }, [selectedId, checkAndSnap])

  const handleFlip = useCallback(() => {
    if (!selectedId) return
    setPieces((prev) => {
      const updated = prev.map((p) =>
        p.id === selectedId && !p.placed ? { ...p, flip: !p.flip } : p,
      )
      return checkAndSnap(selectedId, updated)
    })
  }, [selectedId, checkAndSnap])

  const handleTryAgain = useCallback(() => {
    stopTimer()
    setPhase('intro')
  }, [stopTimer])

  const heartsDisplay = '\u2665'.repeat(lives) + '\u2661'.repeat(3 - lives)

  const getBgColor = () => {
    if (phase === 'gameover') return '#2563eb'
    return '#FF9800'
  }

  const getBadge = () => {
    if (phase === 'intro' || phase === 'gameover') return undefined
    return `LEVEL ${level}  ${heartsDisplay}`
  }

  // Build SVG transform for a piece
  function buildTransform(state: PieceState): string {
    const [cx, cy] = getCentroid(state.points)
    const tx = cx + state.x
    const ty = cy + state.y
    const rot = state.rotation * 45
    const scaleX = state.flip ? -1 : 1

    return `translate(${tx}, ${ty}) rotate(${rot}) scale(${scaleX}, 1) translate(${-cx}, ${-cy})`
  }

  function pointsToString(points: [number, number][]): string {
    return points.map(([x, y]) => `${x},${y}`).join(' ')
  }

  const selectedPiece = pieces.find((p) => p.id === selectedId)
  const showFlip = selectedPiece?.id === 'parallelogram' && !selectedPiece?.placed
  const timerProgress = timeLimit > 0 ? timeLeft / timeLimit : 0

  return (
    <GameCard bgColor={getBgColor()} badge={getBadge()}>
      <div className="w-full h-full min-h-[350px] md:min-h-[400px] flex items-center justify-center select-none">
        {phase === 'intro' && (
          <div
            className="text-center text-white px-6 cursor-pointer"
            onClick={handleStart}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleStart()
              }
            }}
            aria-label="Start Tangram test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">
              🔷
            </div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Tangram</p>
            <p className="text-white/70 text-lg mb-2">Drag pieces to fill the silhouette!</p>
            <p className="text-white/50 text-sm mb-4">Rotate and flip pieces to match the target shape</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-2">Your best: Level {bestScore}</p>
            )}
            <p className="text-white/70 text-lg mt-6">Click to start</p>
          </div>
        )}

        {phase === 'playing' && puzzle && (
          <div className="text-center text-white px-2 w-full">
            {/* Timer progress bar */}
            <div className="w-full max-w-[380px] mx-auto mb-2">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-250 ease-linear"
                  style={{
                    width: `${timerProgress * 100}%`,
                    backgroundColor: timerProgress > 0.25 ? '#4ade80' : '#ef4444',
                  }}
                />
              </div>
              <p className="text-white/60 text-xs mt-1">{timeLeft}s</p>
            </div>

            {/* Puzzle name */}
            <p className="text-white/80 text-sm font-medium mb-2">{puzzle.name}</p>

            {/* SVG puzzle area */}
            <svg
              ref={svgRef}
              viewBox="0 0 400 600"
              className="w-full max-w-[380px] mx-auto touch-none"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              aria-label="Tangram puzzle area"
            >
              {/* Silhouette target */}
              <path
                d={puzzle.silhouettePath}
                fill="rgba(128,128,128,0.2)"
                stroke="rgba(128,128,128,0.5)"
                strokeWidth="2"
              />

              {/* Pieces — render placed pieces first, then unplaced (so dragging pieces are on top) */}
              {[...pieces]
                .sort((a, b) => {
                  if (a.placed && !b.placed) return -1
                  if (!a.placed && b.placed) return 1
                  // Selected piece on top
                  if (a.id === selectedId) return 1
                  if (b.id === selectedId) return -1
                  return 0
                })
                .map((state) => {
                  const isSelected = state.id === selectedId
                  const isSnapping = snapFlash === state.id

                  return (
                    <g
                      key={state.id}
                      transform={buildTransform(state)}
                      onPointerDown={(e) => handlePointerDown(e, state.id)}
                      style={{
                        cursor: state.placed ? 'default' : 'grab',
                        opacity: state.placed ? 0.6 : 1,
                      }}
                    >
                      <polygon
                        points={pointsToString(state.points)}
                        fill={state.color}
                        stroke={isSelected ? '#fff' : 'rgba(0,0,0,0.3)'}
                        strokeWidth={isSelected ? 3 : 1.5}
                        strokeLinejoin="round"
                      />
                      {/* Snap glow effect */}
                      {isSnapping && (
                        <polygon
                          points={pointsToString(state.points)}
                          fill="none"
                          stroke="#fff"
                          strokeWidth={4}
                          opacity={0.8}
                        >
                          <animate
                            attributeName="opacity"
                            from="0.8"
                            to="0"
                            dur="0.4s"
                            fill="freeze"
                          />
                          <animate
                            attributeName="stroke-width"
                            from="4"
                            to="8"
                            dur="0.4s"
                            fill="freeze"
                          />
                        </polygon>
                      )}
                    </g>
                  )
                })}
            </svg>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-2">
              <button
                onClick={handleRotate}
                disabled={!selectedId || !!selectedPiece?.placed}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-default rounded-lg font-medium text-sm min-h-[44px] transition-colors cursor-pointer"
                aria-label="Rotate selected piece 45 degrees"
              >
                ⟳ Rotate
              </button>
              {showFlip && (
                <button
                  onClick={handleFlip}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium text-sm min-h-[44px] transition-colors cursor-pointer"
                  aria-label="Flip selected piece"
                >
                  ↔ Flip
                </button>
              )}
            </div>
          </div>
        )}

        {phase === 'gameover' && (
          <div className="text-center text-white px-6">
            <div className="text-6xl mb-6" aria-hidden="true">
              🏆
            </div>
            <p className="text-lg text-white/70 mb-2">You reached</p>
            <p className="text-5xl md:text-6xl font-black mb-2">Level {level}</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/60 text-sm mb-6">Your best: Level {bestScore}</p>
            )}
            <button
              onClick={handleTryAgain}
              className="mt-6 px-8 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold min-h-[44px] transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </GameCard>
  )
}
