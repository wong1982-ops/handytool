'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import { FOUR_COLOUR_MAPS } from '../data/four-colour-maps'
import type { FourColourMap } from '../data/four-colour-maps'

type Phase = 'intro' | 'playing' | 'gameover'

const COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#EAB308'] as const
const COLOR_NAMES = ['Red', 'Blue', 'Green', 'Yellow'] as const

function getMapForLevel(level: number): FourColourMap {
  const idx = Math.min(level - 1, FOUR_COLOUR_MAPS.length - 1)
  const variants = FOUR_COLOUR_MAPS[idx]
  return variants[Math.floor(Math.random() * variants.length)]
}

function getTimerForLevel(level: number): number {
  if (level <= 4) return 60
  if (level <= 6) return 90
  return 120
}

export function FourColour({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [map, setMap] = useState<FourColourMap | null>(null)
  const [regionColors, setRegionColors] = useState<Record<string, number | null>>({})
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<number>(0)
  const [conflicts, setConflicts] = useState<Set<string>>(new Set())
  const [completed, setCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [flashGreen, setFlashGreen] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      timeoutRefs.current.forEach(clearTimeout)
    }
  }, [])

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timeoutRefs.current.push(id)
    return id
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const findConflicts = useCallback((colors: Record<string, number | null>, adjacency: Record<string, string[]>): Set<string> => {
    const conflictSet = new Set<string>()
    for (const [regionId, neighbors] of Object.entries(adjacency)) {
      const color = colors[regionId]
      if (color === null || color === undefined) continue
      for (const neighbor of neighbors) {
        if (colors[neighbor] === color) {
          conflictSet.add(regionId)
          conflictSet.add(neighbor)
        }
      }
    }
    return conflictSet
  }, [])

  const checkCompletion = useCallback((colors: Record<string, number | null>, currentMap: FourColourMap) => {
    const allColored = currentMap.regions.every(r => colors[r.id] !== null && colors[r.id] !== undefined)
    if (!allColored) return false
    const c = findConflicts(colors, currentMap.adjacency)
    return c.size === 0
  }, [findConflicts])

  const startLevel = useCallback((lvl: number) => {
    stopTimer()
    const m = getMapForLevel(lvl)
    setMap(m)
    const initColors: Record<string, number | null> = {}
    for (const region of m.regions) {
      initColors[region.id] = null
    }
    setRegionColors(initColors)
    setSelectedRegion(null)
    setSelectedColor(0)
    setConflicts(new Set())
    setCompleted(false)
    setFlashGreen(false)

    const duration = getTimerForLevel(lvl)
    setTimeLeft(duration)
    setPhase('playing')

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopTimer()
          // Time's up — lose a life
          setLives(l => {
            const newLives = l - 1
            if (newLives <= 0) {
              addTimeout(() => {
                setPhase('gameover')
                onComplete(lvl)
              }, 100)
            } else {
              addTimeout(() => startLevel(lvl), 500)
            }
            return newLives
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [stopTimer, addTimeout, onComplete])

  const handleStart = useCallback(() => {
    setLevel(1)
    setLives(3)
    startLevel(1)
  }, [startLevel])

  const handleRegionClick = useCallback((regionId: string) => {
    if (phase !== 'playing' || completed) return

    if (selectedRegion === regionId) {
      // Deselect
      setSelectedRegion(null)
      return
    }

    // If a region is selected and we click another, just switch selection
    setSelectedRegion(regionId)

    // If region already has no color, apply selected color
    // Actually, always apply current selected color when tapping a region
    setRegionColors(prev => {
      const updated = { ...prev, [regionId]: selectedColor }
      const newConflicts = findConflicts(updated, map!.adjacency)
      setConflicts(newConflicts)

      // Check completion
      if (checkCompletion(updated, map!)) {
        stopTimer()
        setCompleted(true)
        setFlashGreen(true)
        addTimeout(() => {
          const nextLevel = level + 1
          setLevel(nextLevel)
          startLevel(nextLevel)
        }, 800)
      }
      return updated
    })
  }, [phase, completed, selectedRegion, selectedColor, map, level, findConflicts, checkCompletion, stopTimer, addTimeout, startLevel])

  const handleColorSelect = useCallback((colorIndex: number) => {
    if (phase !== 'playing' || completed) return
    setSelectedColor(colorIndex)

    // If a region is selected, apply the color to it
    if (selectedRegion && map) {
      setRegionColors(prev => {
        const updated = { ...prev, [selectedRegion]: colorIndex }
        const newConflicts = findConflicts(updated, map.adjacency)
        setConflicts(newConflicts)

        if (checkCompletion(updated, map)) {
          stopTimer()
          setCompleted(true)
          setFlashGreen(true)
          addTimeout(() => {
            const nextLevel = level + 1
            setLevel(nextLevel)
            startLevel(nextLevel)
          }, 800)
        }
        return updated
      })
    }
  }, [phase, completed, selectedRegion, map, level, findConflicts, checkCompletion, stopTimer, addTimeout, startLevel])

  const handleReset = useCallback(() => {
    if (!map) return
    const initColors: Record<string, number | null> = {}
    for (const region of map.regions) {
      initColors[region.id] = null
    }
    setRegionColors(initColors)
    setSelectedRegion(null)
    setConflicts(new Set())
  }, [map])

  const handleTryAgain = useCallback(() => {
    stopTimer()
    setPhase('intro')
  }, [stopTimer])

  const heartsDisplay = '\u2665'.repeat(lives) + '\u2661'.repeat(3 - lives)

  const getBgColor = () => {
    if (phase === 'gameover') return '#92400E'
    if (flashGreen) return '#16A34A'
    return '#F59E0B'
  }

  const getBadge = () => {
    if (phase === 'intro' || phase === 'gameover') return undefined
    return `LEVEL ${level}  ${heartsDisplay}`
  }

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
            aria-label="Start Four Colour test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">&#x1F3A8;</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Four Colour</p>
            <p className="text-white/70 text-lg mb-2">Color the map &mdash; no neighbors can match!</p>
            <p className="text-white/50 text-sm mb-4">Use at most 4 colors so no adjacent regions share the same color</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-2">Your best: Level {bestScore}</p>
            )}
            <p className="text-white/70 text-lg mt-6">Click to start</p>
          </div>
        )}

        {phase === 'playing' && map && (
          <div className="text-center text-white px-4 w-full">
            {/* Timer */}
            <div className="mb-2">
              <span
                className={`text-lg font-mono font-bold ${timeLeft <= 10 ? 'text-red-300 animate-pulse' : 'text-white/80'}`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* SVG Map */}
            <svg
              viewBox="0 0 300 300"
              className="w-full max-w-[300px] mx-auto rounded-lg"
              style={{ background: 'rgba(0,0,0,0.2)' }}
              role="img"
              aria-label={`Map with ${map.regions.length} regions to color`}
            >
              <defs>
                <style>{`
                  @keyframes conflict-pulse {
                    0%, 100% { stroke-opacity: 1; }
                    50% { stroke-opacity: 0.3; }
                  }
                `}</style>
              </defs>

              {/* Regions */}
              {map.regions.map((region) => {
                const colorIdx = regionColors[region.id]
                const isSelected = selectedRegion === region.id
                const hasConflict = conflicts.has(region.id)
                const fillColor = colorIdx !== null && colorIdx !== undefined
                  ? COLORS[colorIdx]
                  : 'rgba(200, 200, 200, 0.25)'

                return (
                  <g key={region.id}>
                    <path
                      d={region.path}
                      fill={fillColor}
                      stroke={
                        hasConflict
                          ? '#EF4444'
                          : isSelected
                            ? '#FFFFFF'
                            : 'rgba(255,255,255,0.3)'
                      }
                      strokeWidth={isSelected ? 3 : hasConflict ? 3 : 1}
                      strokeDasharray={hasConflict ? '6 3' : undefined}
                      style={{
                        cursor: 'pointer',
                        transition: 'fill 0.2s ease',
                        animation: hasConflict ? 'conflict-pulse 0.8s ease-in-out infinite' : undefined,
                      }}
                      onClick={() => handleRegionClick(region.id)}
                      role="button"
                      aria-label={`Region ${region.id}${colorIdx !== null && colorIdx !== undefined ? `, colored ${COLOR_NAMES[colorIdx]}` : ', uncolored'}${hasConflict ? ', has conflict' : ''}`}
                    />
                    {/* Region label */}
                    <text
                      x={region.centroid[0]}
                      y={region.centroid[1]}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="14"
                      fontWeight="bold"
                      fill={colorIdx !== null && colorIdx !== undefined ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'}
                      style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      {region.id}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Color palette */}
            <div className="flex items-center justify-center gap-4 mt-4" role="radiogroup" aria-label="Color palette">
              {COLORS.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => handleColorSelect(idx)}
                  className="relative rounded-full transition-transform cursor-pointer"
                  style={{
                    width: 44,
                    height: 44,
                    minWidth: 44,
                    minHeight: 44,
                    backgroundColor: color,
                    transform: selectedColor === idx ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: selectedColor === idx
                      ? `0 0 0 3px white, 0 0 12px ${color}80`
                      : '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                  role="radio"
                  aria-checked={selectedColor === idx}
                  aria-label={COLOR_NAMES[idx]}
                />
              ))}
            </div>

            {/* Conflict count + Reset */}
            <div className="flex items-center justify-center gap-4 mt-3">
              {conflicts.size > 0 && (
                <p className="text-red-200 text-sm">
                  {conflicts.size} conflicting region{conflicts.size !== 1 ? 's' : ''}
                </p>
              )}
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold text-xs min-h-[44px] transition-colors cursor-pointer"
                aria-label="Reset all colors"
              >
                Reset
              </button>
            </div>
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
    </GameCard>
  )
}
