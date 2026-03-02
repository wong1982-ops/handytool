'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import { FIVE_ROOMS_PUZZLES } from '../data/five-rooms-puzzles'
import type { FiveRoomsPuzzle, WallSegment } from '../data/five-rooms-puzzles'

type Phase = 'intro' | 'playing' | 'gameover'

function getPuzzleForLevel(level: number): FiveRoomsPuzzle {
  const puzzleIndex = Math.min(level - 1, FIVE_ROOMS_PUZZLES.length - 1)
  const variants = FIVE_ROOMS_PUZZLES[puzzleIndex]
  return variants[Math.floor(Math.random() * variants.length)]
}

/** Get the room on the other side of a wall from the given room */
function getOtherRoom(wall: WallSegment, currentRoom: string): string {
  return wall.rooms[0] === currentRoom ? wall.rooms[1] : wall.rooms[0]
}

/** Check if a wall is adjacent to the current room */
function isWallAdjacentToRoom(wall: WallSegment, roomId: string): boolean {
  return wall.rooms[0] === roomId || wall.rooms[1] === roomId
}

export function FiveRooms({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [puzzle, setPuzzle] = useState<FiveRoomsPuzzle | null>(null)
  const [crossedWalls, setCrossedWalls] = useState<Set<number>>(new Set())
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [shakeWall, setShakeWall] = useState<number | null>(null)
  const [completed, setCompleted] = useState(false)
  const [impossibleRevealed, setImpossibleRevealed] = useState(false)
  const [stuckDetected, setStuckDetected] = useState(false)

  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout)
    }
  }, [])

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timeoutRefs.current.push(id)
    return id
  }, [])

  const startLevel = useCallback((lvl: number) => {
    const p = getPuzzleForLevel(lvl)
    setPuzzle(p)
    setCrossedWalls(new Set())
    setCurrentRoom(null)
    setShakeWall(null)
    setCompleted(false)
    setImpossibleRevealed(false)
    setStuckDetected(false)
    setPhase('playing')
  }, [])

  const handleStart = useCallback(() => {
    setLevel(1)
    setLives(3)
    startLevel(1)
  }, [startLevel])

  const checkStuck = useCallback((roomId: string, crossed: Set<number>, pzl: FiveRoomsPuzzle): boolean => {
    // Check if there are any uncrossed walls adjacent to the current room
    const hasValidMove = pzl.walls.some((wall, idx) =>
      !crossed.has(idx) && isWallAdjacentToRoom(wall, roomId)
    )
    const allCrossed = crossed.size === pzl.walls.length

    return !hasValidMove && !allCrossed
  }, [])

  const handleWallClick = useCallback((wallIndex: number) => {
    if (phase !== 'playing' || !puzzle || completed || impossibleRevealed) return

    const wall = puzzle.walls[wallIndex]

    // Already crossed
    if (crossedWalls.has(wallIndex)) {
      setShakeWall(wallIndex)
      addTimeout(() => setShakeWall(null), 400)
      return
    }

    // First tap: any wall is valid
    if (currentRoom === null) {
      const newCrossed = new Set(crossedWalls)
      newCrossed.add(wallIndex)
      setCrossedWalls(newCrossed)
      // Player enters the room on the "other side" — pick rooms[1] as the entered room
      // (player comes from exterior or rooms[0])
      const enteredRoom = wall.rooms[1] === 'ext' ? wall.rooms[0] : wall.rooms[1]
      setCurrentRoom(enteredRoom)

      // Check completion
      if (newCrossed.size === puzzle.walls.length) {
        setCompleted(true)
        addTimeout(() => {
          const nextLevel = level + 1
          setLevel(nextLevel)
          startLevel(nextLevel)
        }, 800)
        return
      }

      // Check stuck
      if (checkStuck(enteredRoom, newCrossed, puzzle)) {
        if (!puzzle.solvable) {
          setStuckDetected(true)
          setImpossibleRevealed(true)
          addTimeout(() => {
            const nextLevel = level + 1
            setLevel(nextLevel)
            startLevel(nextLevel)
          }, 2500)
        } else {
          setStuckDetected(true)
          addTimeout(() => {
            const newLives = lives - 1
            setLives(newLives)
            if (newLives <= 0) {
              setPhase('gameover')
              onComplete(level)
            } else {
              startLevel(level)
            }
          }, 1000)
        }
      }
      return
    }

    // Subsequent taps: wall must be adjacent to current room
    if (!isWallAdjacentToRoom(wall, currentRoom)) {
      setShakeWall(wallIndex)
      addTimeout(() => setShakeWall(null), 400)
      return
    }

    // Valid move: cross the wall
    const newCrossed = new Set(crossedWalls)
    newCrossed.add(wallIndex)
    setCrossedWalls(newCrossed)

    const enteredRoom = getOtherRoom(wall, currentRoom)
    setCurrentRoom(enteredRoom)

    // Check completion
    if (newCrossed.size === puzzle.walls.length) {
      setCompleted(true)
      addTimeout(() => {
        const nextLevel = level + 1
        setLevel(nextLevel)
        startLevel(nextLevel)
      }, 800)
      return
    }

    // Check stuck
    if (checkStuck(enteredRoom, newCrossed, puzzle)) {
      if (!puzzle.solvable) {
        setStuckDetected(true)
        setImpossibleRevealed(true)
        addTimeout(() => {
          const nextLevel = level + 1
          setLevel(nextLevel)
          startLevel(nextLevel)
        }, 2500)
      } else {
        setStuckDetected(true)
        addTimeout(() => {
          const newLives = lives - 1
          setLives(newLives)
          if (newLives <= 0) {
            setPhase('gameover')
            onComplete(level)
          } else {
            startLevel(level)
          }
        }, 1000)
      }
    }
  }, [phase, puzzle, completed, impossibleRevealed, crossedWalls, currentRoom, lives, level, checkStuck, addTimeout, startLevel, onComplete])

  const handleUndo = useCallback(() => {
    if (!puzzle || crossedWalls.size === 0) return

    // Simple undo: reset the entire path (since we don't track full path history)
    setCrossedWalls(new Set())
    setCurrentRoom(null)
    setStuckDetected(false)
  }, [puzzle, crossedWalls])

  const handleTryAgain = useCallback(() => {
    setPhase('intro')
  }, [])

  const heartsDisplay = '\u2665'.repeat(lives) + '\u2661'.repeat(3 - lives)

  const getBgColor = () => {
    if (phase === 'gameover') return '#2563eb'
    if (impossibleRevealed) return '#dc2626'
    return '#8B5CF6'
  }

  const getBadge = () => {
    if (phase === 'intro' || phase === 'gameover') return undefined
    return `LEVEL ${level}  ${heartsDisplay}`
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
            aria-label="Start Five Rooms test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">&#x1F3E0;</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Five Rooms</p>
            <p className="text-white/70 text-lg mb-2">Cross every wall exactly once!</p>
            <p className="text-white/50 text-sm mb-4">Tap walls to draw a path through all of them</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-2">Your best: Level {bestScore}</p>
            )}
            <p className="text-white/70 text-lg mt-6">Click to start</p>
          </div>
        )}

        {phase === 'playing' && puzzle && (
          <div className="text-center text-white px-4 w-full">
            {/* Impossible puzzle reveal */}
            {impossibleRevealed && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50 rounded-xl">
                <div className="text-center px-6">
                  <div className="text-5xl mb-4" aria-hidden="true">&#x1F6AB;</div>
                  <p className="text-2xl font-bold text-white mb-2">This puzzle has no solution!</p>
                  <p className="text-white/70 text-sm">The classic Five Rooms puzzle is mathematically impossible.</p>
                  <p className="text-white/50 text-xs mt-2">Advancing to next level...</p>
                </div>
              </div>
            )}

            {/* SVG Floor Plan */}
            <svg
              viewBox="0 0 300 300"
              className="w-full max-w-[320px] mx-auto"
              role="img"
              aria-label={`Floor plan puzzle with ${puzzle.rooms.length} rooms and ${puzzle.walls.length} walls`}
            >
              <defs>
                <filter id="room-glow">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Room fills */}
              {puzzle.rooms.map((room) => {
                const isCurrentRoom = currentRoom === room.id
                return (
                  <path
                    key={room.id}
                    d={room.path}
                    fill={isCurrentRoom ? 'rgba(139, 92, 246, 0.35)' : 'rgba(255, 255, 255, 0.1)'}
                    stroke="none"
                    filter={isCurrentRoom ? 'url(#room-glow)' : undefined}
                    style={{ transition: 'fill 0.3s ease' }}
                  />
                )
              })}

              {/* Room labels */}
              {puzzle.rooms.map((room) => {
                // Calculate center of room from path
                const coords = room.path.match(/\d+/g)?.map(Number) || []
                const xs = coords.filter((_, i) => i % 2 === 0)
                const ys = coords.filter((_, i) => i % 2 === 1)
                const cx = xs.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : 150
                const cy = ys.length ? (Math.min(...ys) + Math.max(...ys)) / 2 : 150
                const isCurrentRoom = currentRoom === room.id

                return (
                  <text
                    key={`label-${room.id}`}
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="16"
                    fontWeight="bold"
                    fill={isCurrentRoom ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)'}
                    style={{ pointerEvents: 'none', transition: 'fill 0.3s ease' }}
                  >
                    {room.label || room.id}
                  </text>
                )
              })}

              {/* Wall segments */}
              {puzzle.walls.map((wall, idx) => {
                const isCrossed = crossedWalls.has(idx)
                const isShaking = shakeWall === idx
                const isValid = currentRoom !== null
                  ? isWallAdjacentToRoom(wall, currentRoom) && !isCrossed
                  : !isCrossed

                return (
                  <g
                    key={idx}
                    onClick={() => handleWallClick(idx)}
                    className="cursor-pointer"
                    role="button"
                    aria-label={`Wall between ${wall.rooms[0]} and ${wall.rooms[1]}${isCrossed ? ', crossed' : ''}${isValid ? ', available' : ''}`}
                    style={{
                      animation: isShaking ? 'wall-shake 0.3s ease-in-out' : 'none',
                    }}
                  >
                    {/* Invisible wider hit area for easier tapping */}
                    <line
                      x1={wall.x1}
                      y1={wall.y1}
                      x2={wall.x2}
                      y2={wall.y2}
                      stroke="transparent"
                      strokeWidth={20}
                      strokeLinecap="round"
                    />
                    {/* Visible wall */}
                    <line
                      x1={wall.x1}
                      y1={wall.y1}
                      x2={wall.x2}
                      y2={wall.y2}
                      stroke={
                        isCrossed
                          ? '#4ade80'
                          : isShaking
                            ? '#ef4444'
                            : isValid && currentRoom !== null
                              ? 'rgba(255, 255, 255, 0.7)'
                              : 'rgba(255, 255, 255, 0.35)'
                      }
                      strokeWidth={isCrossed ? 6 : 8}
                      strokeDasharray={isCrossed ? undefined : '8 4'}
                      strokeLinecap="round"
                      style={{ transition: 'stroke 0.2s ease, stroke-width 0.2s ease' }}
                    />
                    {/* Green check indicator on crossed walls */}
                    {isCrossed && (
                      <circle
                        cx={(wall.x1 + wall.x2) / 2}
                        cy={(wall.y1 + wall.y2) / 2}
                        r={5}
                        fill="#4ade80"
                        style={{ opacity: 0.8 }}
                      />
                    )}
                  </g>
                )
              })}
            </svg>

            {/* Progress indicator */}
            <p className="text-white/60 text-sm mt-3">
              {crossedWalls.size} / {puzzle.walls.length} walls
              {stuckDetected && !impossibleRevealed && (
                <span className="text-red-300 ml-2">Stuck! No valid moves.</span>
              )}
            </p>

            {/* Undo / Reset button */}
            {crossedWalls.size > 0 && !completed && !impossibleRevealed && !stuckDetected && (
              <button
                onClick={handleUndo}
                className="mt-3 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-semibold text-sm min-h-[44px] transition-colors cursor-pointer"
                aria-label="Reset path"
              >
                Reset
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
        @keyframes wall-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          50% { transform: translateX(3px); }
          75% { transform: translateX(-3px); }
        }
      `}</style>
    </GameCard>
  )
}
