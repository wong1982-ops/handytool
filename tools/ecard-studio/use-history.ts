import { useCallback, useRef, useState } from 'react'

interface UseHistoryReturn<T> {
  state: T
  set: (newState: T) => void
  update: (partial: Partial<T>) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

export function useHistory<T>(initialState: T, maxEntries = 50): UseHistoryReturn<T> {
  const [state, setState] = useState<T>(initialState)
  const historyRef = useRef<T[]>([initialState])
  const pointerRef = useRef(0)

  const set = useCallback((newState: T) => {
    const newHistory = historyRef.current.slice(0, pointerRef.current + 1)
    newHistory.push(newState)
    if (newHistory.length > maxEntries) newHistory.shift()
    historyRef.current = newHistory
    pointerRef.current = newHistory.length - 1
    setState(newState)
  }, [maxEntries])

  const update = useCallback((partial: Partial<T>) => {
    const current = historyRef.current[pointerRef.current]
    set({ ...current, ...partial } as T)
  }, [set])

  const undo = useCallback(() => {
    if (pointerRef.current > 0) {
      pointerRef.current -= 1
      setState(historyRef.current[pointerRef.current])
    }
  }, [])

  const redo = useCallback(() => {
    if (pointerRef.current < historyRef.current.length - 1) {
      pointerRef.current += 1
      setState(historyRef.current[pointerRef.current])
    }
  }, [])

  return {
    state,
    set,
    update,
    undo,
    redo,
    canUndo: pointerRef.current > 0,
    canRedo: pointerRef.current < historyRef.current.length - 1,
  }
}
