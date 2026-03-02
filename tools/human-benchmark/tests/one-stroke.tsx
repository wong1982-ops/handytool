'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import { ONE_STROKE_PUZZLES } from '../data/one-stroke-puzzles'
import type { OneStrokePuzzle } from '../data/one-stroke-puzzles'

type Phase = 'intro' | 'playing' | 'gameover'

const edgeKey = (a: number, b: number) => `${Math.min(a, b)}-${Math.max(a, b)}`

function getPuzzleForLevel(level: number): OneStrokePuzzle {
  const puzzleIndex = Math.min(level - 1, ONE_STROKE_PUZZLES.length - 1)
  const variants = ONE_STROKE_PUZZLES[puzzleIndex]
  return variants[Math.floor(Math.random() * variants.length)]
}

function getAdjacentEdges(puzzle: OneStrokePuzzle, nodeIndex: number): [number, number][] {
  return puzzle.edges.filter(([a, b]) => a === nodeIndex || b === nodeIndex)
}

export function OneStroke({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [puzzle, setPuzzle] = useState<OneStrokePuzzle | null>(null)
  const [path, setPath] = useState<number[]>([])
  const [drawnEdges, setDrawnEdges] = useState<Set<string>>(new Set())
  const [shakeNode, setShakeNode] = useState<number | null>(null)
  const [stuckTimer, setStuckTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [completed, setCompleted] = useState(false)

  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout)
      if (stuckTimer) clearTimeout(stuckTimer)
    }
  }, [stuckTimer])

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timeoutRefs.current.push(id)
    return id
  }, [])

  const startLevel = useCallback((lvl: number) => {
    const p = getPuzzleForLevel(lvl)
    setPuzzle(p)
    setPath([])
    setDrawnEdges(new Set())
    setShakeNode(null)
    setCompleted(false)
    setPhase('playing')
    if (stuckTimer) {
      clearTimeout(stuckTimer)
      setStuckTimer(null)
    }
  }, [stuckTimer])

  const handleStart = useCallback(() => {
    setLevel(1)
    setLives(3)
    startLevel(1)
  }, [startLevel])

  const checkStuck = useCallback((currentNode: number, currentDrawn: Set<string>, currentPuzzle: OneStrokePuzzle) => {
    // Check if current node has any undrawn adjacent edges
    const adjacentEdges = getAdjacentEdges(currentPuzzle, currentNode)
    const hasUndrawn = adjacentEdges.some(([a, b]) => !currentDrawn.has(edgeKey(a, b)))
    const allEdgesDrawn = currentDrawn.size === currentPuzzle.edges.length

    if (!hasUndrawn && !allEdgesDrawn) {
      // Stuck: no moves available but edges remain
      return true
    }
    return false
  }, [])

  const handleNodeClick = useCallback((nodeIndex: number) => {
    if (phase !== 'playing' || !puzzle || completed) return

    const currentNode = path.length > 0 ? path[path.length - 1] : null

    // First tap: start from this node
    if (currentNode === null) {
      setPath([nodeIndex])

      // Check if stuck immediately (shouldn't happen on first move unless isolated node)
      if (checkStuck(nodeIndex, drawnEdges, puzzle)) {
        const timer = addTimeout(() => {
          const newLives = lives - 1
          setLives(newLives)
          if (newLives <= 0) {
            setPhase('gameover')
            onComplete(level)
          } else {
            startLevel(level)
          }
        }, 1000)
        setStuckTimer(timer)
      }
      return
    }

    // Same node as current: ignore
    if (nodeIndex === currentNode) return

    // Check if edge exists between current and target
    const ek = edgeKey(currentNode, nodeIndex)
    const edgeExists = puzzle.edges.some(([a, b]) => edgeKey(a, b) === ek)

    if (!edgeExists || drawnEdges.has(ek)) {
      // Invalid move: no edge or already drawn
      setShakeNode(nodeIndex)
      addTimeout(() => setShakeNode(null), 400)
      return
    }

    // Valid move: draw the edge
    const newDrawn = new Set(drawnEdges)
    newDrawn.add(ek)
    const newPath = [...path, nodeIndex]

    setDrawnEdges(newDrawn)
    setPath(newPath)

    // Check if all edges drawn
    if (newDrawn.size === puzzle.edges.length) {
      setCompleted(true)
      addTimeout(() => {
        const nextLevel = level + 1
        setLevel(nextLevel)
        startLevel(nextLevel)
      }, 800)
      return
    }

    // Check if stuck
    if (checkStuck(nodeIndex, newDrawn, puzzle)) {
      const timer = addTimeout(() => {
        const newLives = lives - 1
        setLives(newLives)
        if (newLives <= 0) {
          setPhase('gameover')
          onComplete(level)
        } else {
          startLevel(level)
        }
      }, 1000)
      setStuckTimer(timer)
    }
  }, [phase, puzzle, completed, path, drawnEdges, lives, level, checkStuck, addTimeout, startLevel, onComplete])

  const handleUndo = useCallback(() => {
    if (path.length <= 1 || !puzzle) {
      // If only starting node, reset entirely
      if (path.length === 1) {
        setPath([])
        setDrawnEdges(new Set())
      }
      if (stuckTimer) {
        clearTimeout(stuckTimer)
        setStuckTimer(null)
      }
      return
    }

    // Clear stuck timer if active
    if (stuckTimer) {
      clearTimeout(stuckTimer)
      setStuckTimer(null)
    }

    const newPath = path.slice(0, -1)
    const lastNode = path[path.length - 1]
    const prevNode = path[path.length - 2]
    const ek = edgeKey(prevNode, lastNode)

    const newDrawn = new Set(drawnEdges)
    newDrawn.delete(ek)

    setPath(newPath)
    setDrawnEdges(newDrawn)
  }, [path, puzzle, drawnEdges, stuckTimer])

  const handleTryAgain = useCallback(() => {
    setPhase('intro')
  }, [])

  const heartsDisplay = '\u2665'.repeat(lives) + '\u2661'.repeat(3 - lives)

  const getBgColor = () => {
    if (phase === 'gameover') return '#2563eb'
    return '#4CAF50'
  }

  const getBadge = () => {
    if (phase === 'intro' || phase === 'gameover') return undefined
    return `LEVEL ${level}  ${heartsDisplay}`
  }

  const currentNode = path.length > 0 ? path[path.length - 1] : null

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
            aria-label="Start One Stroke test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">&#x270D;&#xFE0F;</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">One Stroke</p>
            <p className="text-white/70 text-lg mb-2">Trace every edge exactly once!</p>
            <p className="text-white/50 text-sm mb-4">Tap nodes to draw a path through all edges</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-2">Your best: Level {bestScore}</p>
            )}
            <p className="text-white/70 text-lg mt-6">Click to start</p>
          </div>
        )}

        {phase === 'playing' && puzzle && (
          <div className="text-center text-white px-4 w-full">
            {/* SVG Graph */}
            <svg
              viewBox="0 0 300 300"
              className="w-full max-w-[320px] mx-auto"
              role="img"
              aria-label={`Graph puzzle with ${puzzle.nodes.length} nodes and ${puzzle.edges.length} edges`}
            >
              {/* Pulsing glow filter */}
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Edges */}
              {puzzle.edges.map(([a, b]) => {
                const ek = edgeKey(a, b)
                const isDrawn = drawnEdges.has(ek)
                const nodeA = puzzle.nodes[a]
                const nodeB = puzzle.nodes[b]
                return (
                  <line
                    key={ek}
                    x1={nodeA.x}
                    y1={nodeA.y}
                    x2={nodeB.x}
                    y2={nodeB.y}
                    stroke={isDrawn ? '#4CAF50' : '#666'}
                    strokeWidth={isDrawn ? 3 : 2}
                    strokeDasharray={isDrawn ? undefined : '6 3'}
                    style={{ transition: 'stroke 0.2s ease, stroke-width 0.2s ease' }}
                  />
                )
              })}

              {/* Nodes */}
              {puzzle.nodes.map((node, i) => {
                const isCurrent = currentNode === i
                const isShaking = shakeNode === i
                const isStart = path.length === 0
                const isAdjacent = currentNode !== null && puzzle.edges.some(
                  ([a, b]) => (a === currentNode && b === i || b === currentNode && a === i) && !drawnEdges.has(edgeKey(a, b))
                )

                return (
                  <g
                    key={i}
                    onClick={() => handleNodeClick(i)}
                    role="button"
                    aria-label={`Node ${i + 1}${isCurrent ? ', current position' : ''}${isAdjacent ? ', can move here' : ''}`}
                    className="cursor-pointer"
                    style={{
                      transform: isShaking ? 'translateX(4px)' : 'none',
                      animation: isShaking ? 'shake 0.3s ease-in-out' : isCurrent ? 'pulse-glow 1.2s ease-in-out infinite' : 'none',
                    }}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={20}
                      fill={isCurrent ? '#FFD700' : completed ? '#4CAF50' : 'white'}
                      stroke={isCurrent ? '#FFA000' : isShaking ? '#ef4444' : '#333'}
                      strokeWidth={isCurrent ? 3 : 2}
                      filter={isCurrent ? 'url(#glow)' : undefined}
                      style={{ transition: 'fill 0.2s ease, stroke 0.2s ease' }}
                    />
                    {/* Show node number for accessibility */}
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="12"
                      fontWeight="bold"
                      fill={isCurrent ? '#333' : '#666'}
                      style={{ pointerEvents: 'none' }}
                    >
                      {i + 1}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Progress indicator */}
            <p className="text-white/60 text-sm mt-3">
              {drawnEdges.size} / {puzzle.edges.length} edges
            </p>

            {/* Undo button */}
            {path.length > 0 && (
              <button
                onClick={handleUndo}
                className="mt-3 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-semibold text-sm min-h-[44px] transition-colors cursor-pointer"
                aria-label="Undo last move"
              >
                Undo
              </button>
            )}
          </div>
        )}

        {phase === 'gameover' && (
          <div className="text-center text-white px-6">
            <div className="text-6xl mb-6" aria-hidden="true">&#x1F3C6;</div>
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

      {/* Inline keyframes for animations */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-4px); }
        }
      `}</style>
    </GameCard>
  )
}
