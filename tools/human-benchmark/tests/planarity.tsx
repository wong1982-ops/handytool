'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import { PLANARITY_GRAPHS } from '../data/planarity-graphs'
import type { PlanarityGraph } from '../data/planarity-graphs'

type Phase = 'intro' | 'playing' | 'gameover'

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getGraphForLevel(level: number): PlanarityGraph {
  const idx = Math.min(level - 1, PLANARITY_GRAPHS.length - 1)
  return pickRandom(PLANARITY_GRAPHS[idx])
}

function getTimeLimit(level: number): number {
  if (level <= 4) return 60
  if (level <= 7) return 90
  return 120
}

/* ── Segment intersection (cross-product orientation test) ── */

function cross(ox: number, oy: number, ax: number, ay: number, bx: number, by: number): number {
  return (ax - ox) * (by - oy) - (ay - oy) * (bx - ox)
}

function onSegment(
  px: number, py: number,
  qx: number, qy: number,
  rx: number, ry: number,
): boolean {
  return (
    Math.min(px, rx) <= qx && qx <= Math.max(px, rx) &&
    Math.min(py, ry) <= qy && qy <= Math.max(py, ry)
  )
}

function segmentsIntersect(
  ax1: number, ay1: number, ax2: number, ay2: number,
  bx1: number, by1: number, bx2: number, by2: number,
): boolean {
  const d1 = cross(bx1, by1, bx2, by2, ax1, ay1)
  const d2 = cross(bx1, by1, bx2, by2, ax2, ay2)
  const d3 = cross(ax1, ay1, ax2, ay2, bx1, by1)
  const d4 = cross(ax1, ay1, ax2, ay2, bx2, by2)

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true
  }

  // Collinear cases
  if (d1 === 0 && onSegment(bx1, by1, ax1, ay1, bx2, by2)) return true
  if (d2 === 0 && onSegment(bx1, by1, ax2, ay2, bx2, by2)) return true
  if (d3 === 0 && onSegment(ax1, ay1, bx1, by1, ax2, ay2)) return true
  if (d4 === 0 && onSegment(ax1, ay1, bx2, by2, ax2, ay2)) return true

  return false
}

/* ── Crossing calculations ── */

function countCrossings(positions: [number, number][], edges: [number, number][]): number {
  let count = 0
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const [a, b] = edges[i]
      const [c, d] = edges[j]
      if (a === c || a === d || b === c || b === d) continue
      if (segmentsIntersect(
        positions[a][0], positions[a][1], positions[b][0], positions[b][1],
        positions[c][0], positions[c][1], positions[d][0], positions[d][1],
      )) count++
    }
  }
  return count
}

/** Returns a Set of edge indices that participate in at least one crossing */
function getCrossingEdges(positions: [number, number][], edges: [number, number][]): Set<number> {
  const result = new Set<number>()
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const [a, b] = edges[i]
      const [c, d] = edges[j]
      if (a === c || a === d || b === c || b === d) continue
      if (segmentsIntersect(
        positions[a][0], positions[a][1], positions[b][0], positions[b][1],
        positions[c][0], positions[c][1], positions[d][0], positions[d][1],
      )) {
        result.add(i)
        result.add(j)
      }
    }
  }
  return result
}

export function Planarity({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [graph, setGraph] = useState<PlanarityGraph | null>(null)
  const [positions, setPositions] = useState<[number, number][]>([])
  const [dragNodeIdx, setDragNodeIdx] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [timeLimit, setTimeLimit] = useState(60)
  const [solved, setSolved] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const dragRef = useRef<{
    nodeIdx: number
    startX: number
    startY: number
    origX: number
    origY: number
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

  const crossings = useMemo(() => {
    if (!graph) return 0
    return countCrossings(positions, graph.edges)
  }, [positions, graph])

  const crossingEdgeSet = useMemo(() => {
    if (!graph) return new Set<number>()
    return getCrossingEdges(positions, graph.edges)
  }, [positions, graph])

  const startLevel = useCallback((lvl: number, currentLives?: number) => {
    const g = getGraphForLevel(lvl)
    setGraph(g)
    setPositions(g.startPositions.map(([x, y]) => [x, y]))
    setDragNodeIdx(null)
    setSolved(false)
    const tl = getTimeLimit(lvl)
    setTimeLimit(tl)
    setTimeLeft(tl)
    setPhase('playing')

    const start = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000)
      const remaining = tl - elapsed
      if (remaining <= 0) {
        clearInterval(timerRef.current!)
        timerRef.current = null
        setTimeLeft(0)
        setLives((prev) => {
          const useLives = currentLives ?? prev
          const newLives = useLives - 1
          if (newLives <= 0) {
            setLives(0)
            setPhase('gameover')
            onComplete(lvl - 1)
          } else {
            setLives(newLives)
            setTimeout(() => startLevel(lvl, newLives), 500)
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
    startLevel(1, 3)
  }, [startLevel])

  // Pointer events for node dragging
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGElement>, nodeIdx: number) => {
      if (phase !== 'playing' || solved) return

      setDragNodeIdx(nodeIdx)
      ;(e.target as SVGElement).setPointerCapture(e.pointerId)

      const svg = svgRef.current
      if (!svg) return
      const ctm = svg.getScreenCTM()
      if (!ctm) return
      const pt = svg.createSVGPoint()
      pt.x = e.clientX
      pt.y = e.clientY
      const svgPt = pt.matrixTransform(ctm.inverse())

      dragRef.current = {
        nodeIdx,
        startX: svgPt.x,
        startY: svgPt.y,
        origX: positions[nodeIdx][0],
        origY: positions[nodeIdx][1],
      }
    },
    [phase, solved, positions],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!dragRef.current) return
      const svg = svgRef.current
      if (!svg) return
      const ctm = svg.getScreenCTM()
      if (!ctm) return
      const pt = svg.createSVGPoint()
      pt.x = e.clientX
      pt.y = e.clientY
      const svgPt = pt.matrixTransform(ctm.inverse())

      const dx = svgPt.x - dragRef.current.startX
      const dy = svgPt.y - dragRef.current.startY

      // Clamp to viewBox
      const nx = Math.max(10, Math.min(290, dragRef.current.origX + dx))
      const ny = Math.max(10, Math.min(290, dragRef.current.origY + dy))

      setPositions((prev) => {
        const next = [...prev] as [number, number][]
        next[dragRef.current!.nodeIdx] = [nx, ny]
        return next
      })
    },
    [],
  )

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current) return
    dragRef.current = null
    setDragNodeIdx(null)
  }, [])

  // Check for win condition after positions update
  useEffect(() => {
    if (phase !== 'playing' || solved || !graph) return
    if (crossings === 0 && positions.length > 0) {
      setSolved(true)
      stopTimer()
      const nextLevel = level + 1
      setLevel(nextLevel)
      setTimeout(() => {
        startLevel(nextLevel)
      }, 800)
    }
  }, [crossings, phase, solved, graph, positions, level, stopTimer, startLevel])

  const handleTryAgain = useCallback(() => {
    stopTimer()
    setPhase('intro')
  }, [stopTimer])

  const heartsDisplay = '\u2665'.repeat(lives) + '\u2661'.repeat(3 - lives)
  const timerProgress = timeLimit > 0 ? timeLeft / timeLimit : 0

  const getBadge = () => {
    if (phase === 'intro' || phase === 'gameover') return undefined
    return `LEVEL ${level}  ${heartsDisplay}`
  }

  const getBgColor = () => {
    if (phase === 'gameover') return '#2563eb'
    return '#06B6D4'
  }

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
            aria-label="Start Planarity test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">
              🔀
            </div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Planarity</p>
            <p className="text-white/70 text-lg mb-2">Untangle the graph — no crossings!</p>
            <p className="text-white/50 text-sm mb-4">Drag nodes so that no edges overlap</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-2">Your best: Level {bestScore}</p>
            )}
            <p className="text-white/70 text-lg mt-6">Click to start</p>
          </div>
        )}

        {phase === 'playing' && graph && (
          <div className="text-center text-white px-2 w-full">
            {/* Timer progress bar */}
            <div className="w-full max-w-[340px] mx-auto mb-2">
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

            {/* Crossing counter */}
            <p className="text-lg font-bold mb-2">
              {solved ? (
                <span className="text-green-300">Solved!</span>
              ) : (
                <>
                  <span className={crossings > 0 ? 'text-red-300' : 'text-green-300'}>
                    {crossings}
                  </span>
                  {' '}crossing{crossings !== 1 ? 's' : ''}
                </>
              )}
            </p>

            {/* SVG graph area */}
            <svg
              ref={svgRef}
              viewBox="0 0 300 300"
              className="w-full max-w-[340px] mx-auto touch-none rounded-lg"
              style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              aria-label="Planarity graph area"
            >
              {/* Edges (rendered below nodes) */}
              {graph.edges.map(([a, b], edgeIdx) => {
                const isCrossing = crossingEdgeSet.has(edgeIdx)
                return (
                  <line
                    key={`edge-${edgeIdx}`}
                    x1={positions[a][0]}
                    y1={positions[a][1]}
                    x2={positions[b][0]}
                    y2={positions[b][1]}
                    stroke={isCrossing ? '#EF4444' : '#22C55E'}
                    strokeWidth={2}
                    strokeLinecap="round"
                    opacity={0.8}
                  />
                )
              })}

              {/* Nodes */}
              {positions.map(([x, y], nodeIdx) => {
                const isDragging = dragNodeIdx === nodeIdx
                return (
                  <g
                    key={`node-${nodeIdx}`}
                    onPointerDown={(e) => handlePointerDown(e, nodeIdx)}
                    style={{ cursor: 'grab' }}
                  >
                    {/* Invisible hit area */}
                    <circle
                      cx={x}
                      cy={y}
                      r={22}
                      fill="transparent"
                    />
                    {/* Visible node */}
                    <circle
                      cx={x}
                      cy={y}
                      r={14}
                      fill={isDragging ? '#FACC15' : '#FFFFFF'}
                      stroke={isDragging ? '#CA8A04' : '#1E293B'}
                      strokeWidth={isDragging ? 3 : 2}
                    />
                  </g>
                )
              })}

              {/* Solved flash overlay */}
              {solved && (
                <rect x="0" y="0" width="300" height="300" fill="#22C55E" opacity="0.15" rx="8">
                  <animate
                    attributeName="opacity"
                    from="0.3"
                    to="0"
                    dur="0.8s"
                    fill="freeze"
                  />
                </rect>
              )}
            </svg>
          </div>
        )}

        {phase === 'gameover' && (
          <div className="text-center text-white px-6">
            <div className="text-6xl mb-6" aria-hidden="true">
              🏆
            </div>
            <p className="text-lg text-white/70 mb-2">You reached</p>
            <p className="text-5xl md:text-6xl font-black mb-2">Level {level - 1}</p>
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
