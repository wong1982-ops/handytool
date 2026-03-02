'use client'

import { useState, useCallback, useMemo } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'

type Phase = 'intro' | 'playing' | 'levelcomplete' | 'gameover'

interface LevelConfig {
  m: number
  n: number
  minCrossings: number
}

function getLevelConfig(level: number): LevelConfig {
  const levels: LevelConfig[] = [
    { m: 2, n: 2, minCrossings: 0 },
    { m: 2, n: 3, minCrossings: 0 },
    { m: 3, n: 3, minCrossings: 1 },
    { m: 3, n: 4, minCrossings: 2 },
    { m: 4, n: 4, minCrossings: 4 },
    { m: 3, n: 5, minCrossings: 4 },
    { m: 4, n: 5, minCrossings: 8 },
    { m: 5, n: 5, minCrossings: 16 },
  ]
  return levels[Math.min(level - 1, levels.length - 1)]
}

const HOUSE_COLORS = ['#8B5CF6', '#F97316', '#22C55E', '#EC4899', '#06B6D4']
const UTILITY_LABELS_DEFAULT = ['W', 'G', 'E']

function getUtilityLabel(index: number, total: number): string {
  if (total <= 3) return UTILITY_LABELS_DEFAULT[index]
  return `U${index + 1}`
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
    Math.min(px, rx) <= qx + 0.001 && qx <= Math.max(px, rx) + 0.001 &&
    Math.min(py, ry) <= qy + 0.001 && qy <= Math.max(py, ry) + 0.001
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

  if (d1 === 0 && onSegment(bx1, by1, ax1, ay1, bx2, by2)) return true
  if (d2 === 0 && onSegment(bx1, by1, ax2, ay2, bx2, by2)) return true
  if (d3 === 0 && onSegment(ax1, ay1, bx1, by1, ax2, ay2)) return true
  if (d4 === 0 && onSegment(ax1, ay1, bx2, by2, ax2, ay2)) return true

  return false
}

function getIntersectionPoint(
  ax1: number, ay1: number, ax2: number, ay2: number,
  bx1: number, by1: number, bx2: number, by2: number,
): [number, number] | null {
  const dax = ax2 - ax1
  const day = ay2 - ay1
  const dbx = bx2 - bx1
  const dby = by2 - by1

  const denom = dax * dby - day * dbx
  if (Math.abs(denom) < 1e-10) return null

  const t = ((bx1 - ax1) * dby - (by1 - ay1) * dbx) / denom
  const u = ((bx1 - ax1) * day - (by1 - ay1) * dax) / denom

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return [ax1 + t * dax, ay1 + t * day]
  }
  return null
}

interface Connection {
  houseIdx: number
  utilIdx: number
}

function connectionsShareEndpoint(a: Connection, b: Connection): boolean {
  return a.houseIdx === b.houseIdx || a.utilIdx === b.utilIdx
}

interface CrossingInfo {
  x: number
  y: number
}

function computeCrossings(
  connections: Connection[],
  housePositions: [number, number][],
  utilPositions: [number, number][],
): CrossingInfo[] {
  const crossings: CrossingInfo[] = []
  for (let i = 0; i < connections.length; i++) {
    for (let j = i + 1; j < connections.length; j++) {
      const a = connections[i]
      const b = connections[j]
      if (connectionsShareEndpoint(a, b)) continue

      const [ax1, ay1] = housePositions[a.houseIdx]
      const [ax2, ay2] = utilPositions[a.utilIdx]
      const [bx1, by1] = housePositions[b.houseIdx]
      const [bx2, by2] = utilPositions[b.utilIdx]

      if (segmentsIntersect(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2)) {
        const pt = getIntersectionPoint(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2)
        if (pt) {
          crossings.push({ x: pt[0], y: pt[1] })
        }
      }
    }
  }
  return crossings
}

function generatePositions(m: number, n: number): {
  houses: [number, number][]
  utilities: [number, number][]
} {
  const houses: [number, number][] = []
  const utilities: [number, number][] = []

  for (let i = 0; i < m; i++) {
    const x = m === 1 ? 150 : 50 + (200 * i) / (m - 1)
    houses.push([x, 60])
  }

  for (let i = 0; i < n; i++) {
    const x = n === 1 ? 150 : 50 + (200 * i) / (n - 1)
    utilities.push([x, 240])
  }

  return { houses, utilities }
}

export function ThreeUtilities({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedNode, setSelectedNode] = useState<{ type: 'house' | 'utility'; idx: number } | null>(null)
  const [levelMessage, setLevelMessage] = useState('')

  const config = getLevelConfig(level)
  const { houses: housePositions, utilities: utilPositions } = useMemo(
    () => generatePositions(config.m, config.n),
    [config.m, config.n],
  )

  const totalRequired = config.m * config.n

  const crossings = useMemo(
    () => computeCrossings(connections, housePositions, utilPositions),
    [connections, housePositions, utilPositions],
  )

  const connectionExists = useCallback(
    (houseIdx: number, utilIdx: number) =>
      connections.some((c) => c.houseIdx === houseIdx && c.utilIdx === utilIdx),
    [connections],
  )

  const handleNodeClick = useCallback(
    (type: 'house' | 'utility', idx: number) => {
      if (phase !== 'playing') return

      if (!selectedNode) {
        setSelectedNode({ type, idx })
        return
      }

      // If same type, switch selection
      if (selectedNode.type === type) {
        setSelectedNode({ type, idx })
        return
      }

      // Different types — make a connection
      const houseIdx = type === 'house' ? idx : selectedNode.idx
      const utilIdx = type === 'utility' ? idx : selectedNode.idx

      if (!connectionExists(houseIdx, utilIdx)) {
        const newConnections = [...connections, { houseIdx, utilIdx }]
        setConnections(newConnections)

        // Check if all connections made
        if (newConnections.length === totalRequired) {
          const crossingCount = computeCrossings(newConnections, housePositions, utilPositions).length
          const { minCrossings, m, n } = config

          if (crossingCount <= minCrossings) {
            setLevelMessage(
              `Perfect! K\u2083,\u2083 minimum crossings = ${minCrossings}`
                .replace('K\u2083,\u2083', `K\u2080${m},${n}`)
            )
            // Actually, let's use a cleaner message
            setLevelMessage(
              crossingCount === 0
                ? `Perfect! K${m},${n} is planar — 0 crossings needed!`
                : `Perfect! K${m},${n} crossing number = ${minCrossings}`,
            )
            setPhase('levelcomplete')
          } else if (crossingCount <= minCrossings + 2) {
            setLevelMessage(
              `Good! ${crossingCount} crossings (minimum is ${minCrossings})`,
            )
            setPhase('levelcomplete')
          } else {
            // Lose a life
            const newLives = lives - 1
            setLives(newLives)
            if (newLives <= 0) {
              setPhase('gameover')
              onComplete(level - 1)
            } else {
              // Retry level
              setConnections([])
              setSelectedNode(null)
            }
          }
        }
      }

      setSelectedNode(null)
    },
    [phase, selectedNode, connections, connectionExists, totalRequired, housePositions, utilPositions, config, lives, level, onComplete],
  )

  const handleUndo = useCallback(() => {
    if (connections.length === 0) return
    setConnections((prev) => prev.slice(0, -1))
  }, [connections.length])

  const handleReset = useCallback(() => {
    setConnections([])
    setSelectedNode(null)
  }, [])

  const handleStart = useCallback(() => {
    setLevel(1)
    setLives(3)
    setConnections([])
    setSelectedNode(null)
    setPhase('playing')
  }, [])

  const handleAdvance = useCallback(() => {
    const nextLevel = level + 1
    setLevel(nextLevel)
    setConnections([])
    setSelectedNode(null)
    setPhase('playing')
  }, [level])

  const handleTryAgain = useCallback(() => {
    setPhase('intro')
  }, [])

  const heartsDisplay = '\u2665'.repeat(lives) + '\u2661'.repeat(3 - lives)

  const getBadge = () => {
    if (phase === 'intro' || phase === 'gameover') return undefined
    return `LEVEL ${level}  ${heartsDisplay}`
  }

  const getBgColor = () => {
    if (phase === 'gameover') return '#2563eb'
    if (phase === 'levelcomplete') return '#16A34A'
    return '#EF4444'
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
            aria-label="Start Three Utilities test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">
              🏘️
            </div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Three Utilities</p>
            <p className="text-white/70 text-lg mb-2">Connect every house to every utility!</p>
            <p className="text-white/50 text-sm mb-4">Minimize line crossings</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-2">Your best: Level {bestScore}</p>
            )}
            <p className="text-white/70 text-lg mt-6">Click to start</p>
          </div>
        )}

        {phase === 'playing' && (
          <div className="text-center text-white px-2 w-full">
            {/* Status bar */}
            <div className="flex items-center justify-between max-w-[340px] mx-auto mb-2 px-1">
              <p className="text-sm text-white/70">
                K<sub>{config.m}</sub>,<sub>{config.n}</sub> — min crossings: {config.minCrossings}
              </p>
              <p className="text-sm font-bold">
                {connections.length}/{totalRequired} connections
              </p>
            </div>

            {/* Crossing count */}
            <p className="text-lg font-bold mb-2">
              <span className={crossings.length > 0 ? 'text-red-300' : 'text-green-300'}>
                {crossings.length}
              </span>
              {' '}crossing{crossings.length !== 1 ? 's' : ''}
            </p>

            {/* SVG graph area */}
            <svg
              viewBox="0 0 300 300"
              className="w-full max-w-[340px] mx-auto touch-none rounded-lg"
              style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
              aria-label="Three Utilities graph area"
            >
              {/* Connection lines */}
              {connections.map((conn, idx) => {
                const [x1, y1] = housePositions[conn.houseIdx]
                const [x2, y2] = utilPositions[conn.utilIdx]
                return (
                  <line
                    key={`conn-${idx}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={HOUSE_COLORS[conn.houseIdx % HOUSE_COLORS.length]}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    opacity={0.85}
                  />
                )
              })}

              {/* Crossing markers */}
              {crossings.map((c, idx) => (
                <g key={`cross-${idx}`}>
                  <circle cx={c.x} cy={c.y} r={5} fill="#EF4444" opacity={0.9} />
                  <text
                    x={c.x}
                    y={c.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize="7"
                    fontWeight="bold"
                  >
                    ✕
                  </text>
                </g>
              ))}

              {/* House nodes (top row) */}
              {housePositions.map(([x, y], idx) => {
                const isSelected = selectedNode?.type === 'house' && selectedNode.idx === idx
                return (
                  <g
                    key={`house-${idx}`}
                    onClick={() => handleNodeClick('house', idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Selection glow */}
                    {isSelected && (
                      <rect
                        x={x - 19}
                        y={y - 19}
                        width={38}
                        height={38}
                        rx={6}
                        fill="none"
                        stroke="#FACC15"
                        strokeWidth={3}
                        opacity={0.9}
                      >
                        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1s" repeatCount="indefinite" />
                      </rect>
                    )}
                    {/* Hit area */}
                    <rect
                      x={x - 22}
                      y={y - 22}
                      width={44}
                      height={44}
                      rx={8}
                      fill="transparent"
                    />
                    {/* Visible node */}
                    <rect
                      x={x - 15}
                      y={y - 15}
                      width={30}
                      height={30}
                      rx={5}
                      fill={HOUSE_COLORS[idx % HOUSE_COLORS.length]}
                      stroke={isSelected ? '#FACC15' : '#1E293B'}
                      strokeWidth={isSelected ? 3 : 2}
                    />
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      H{idx + 1}
                    </text>
                  </g>
                )
              })}

              {/* Utility nodes (bottom row) */}
              {utilPositions.map(([x, y], idx) => {
                const isSelected = selectedNode?.type === 'utility' && selectedNode.idx === idx
                const label = getUtilityLabel(idx, config.n)
                return (
                  <g
                    key={`util-${idx}`}
                    onClick={() => handleNodeClick('utility', idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Selection glow */}
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r={19}
                        fill="none"
                        stroke="#FACC15"
                        strokeWidth={3}
                        opacity={0.9}
                      >
                        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {/* Hit area */}
                    <circle cx={x} cy={y} r={22} fill="transparent" />
                    {/* Visible node */}
                    <circle
                      cx={x}
                      cy={y}
                      r={15}
                      fill="#06B6D4"
                      stroke={isSelected ? '#FACC15' : '#1E293B'}
                      strokeWidth={isSelected ? 3 : 2}
                    />
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      {label}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Action buttons */}
            <div className="flex gap-3 justify-center mt-3">
              <button
                onClick={handleUndo}
                disabled={connections.length === 0}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm font-semibold min-h-[44px] transition-colors cursor-pointer"
              >
                Undo
              </button>
              <button
                onClick={handleReset}
                disabled={connections.length === 0}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm font-semibold min-h-[44px] transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {phase === 'levelcomplete' && (
          <div
            className="text-center text-white px-6 cursor-pointer"
            onClick={handleAdvance}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleAdvance()
              }
            }}
            aria-label="Advance to next level"
          >
            <div className="text-5xl mb-4" aria-hidden="true">
              🎉
            </div>
            <p className="text-2xl font-bold mb-3">Level {level} Complete!</p>
            <p className="text-white/80 text-lg mb-2">{levelMessage}</p>
            <p className="text-white/50 text-sm mb-2">
              K<sub>{config.m}</sub>,<sub>{config.n}</sub> crossing number = {config.minCrossings}
            </p>
            <p className="text-white/70 text-lg mt-6">Click to continue</p>
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
