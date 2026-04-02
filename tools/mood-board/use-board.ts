// tools/mood-board/use-board.ts
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { Board, BoardElement, ElementType, ElementData, MoodOption, ColorPreference } from './types'
import { MAX_ELEMENTS, DEFAULT_BOARD } from './types'

interface UseBoardReturn {
  board: Board
  saving: boolean
  generating: boolean
  addingMore: boolean
  error: string | null
  setBoard: (b: Board) => void
  generate: (theme: string, mood: MoodOption, colorPreference: ColorPreference) => Promise<void>
  addMore: (prompt: string) => Promise<void>
  addElement: (type: ElementType, data: ElementData) => void
  updateElement: (id: string, partial: Partial<BoardElement>) => void
  removeElement: (id: string) => void
  reorderImages: (activeId: string, overId: string) => void
  save: () => Promise<void>
  share: () => Promise<string | null>
  loadBoard: (entry: any) => void
}

export function useBoard(): UseBoardReturn {
  const [board, setBoard] = useState<Board>({ ...DEFAULT_BOARD })
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [addingMore, setAddingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const boardRef = useRef(board)
  boardRef.current = board

  // Restore localStorage draft on mount if no board id
  useEffect(() => {
    try {
      const draft = localStorage.getItem('mb_draft_board')
      if (draft) {
        const parsed: Board = JSON.parse(draft)
        setBoard((b) => {
          if (b.id === null) return parsed
          return b
        })
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // Clear localStorage draft once a real board id is assigned
  useEffect(() => {
    if (board.id) {
      localStorage.removeItem('mb_draft_board')
    }
  }, [board.id])

  // Auto-save (debounced 2s)
  useEffect(() => {
    if (!board.id || board.elements.length === 0) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      fetch('/api/v1/mood-board/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: board.id,
          title: board.title,
          theme: board.theme,
          elements: board.elements,
        }),
      }).catch(() => {})
    }, 2000)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [board.id, board.elements, board.title, board.theme])

  // Generate initial board
  const generate = useCallback(async (theme: string, mood: MoodOption, colorPreference: ColorPreference) => {
    setGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/mood-board/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, mood, colorPreference }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Generation failed')
        return
      }

      const elements: BoardElement[] = json.data?.elements || []
      const newBoard: Board = {
        ...DEFAULT_BOARD,
        theme,
        mood,
        colorPreference,
        title: theme.slice(0, 40),
        elements,
      }
      setBoard(newBoard)

      // Auto-save new board (fire-and-forget)
      fetch('/api/v1/mood-board/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: theme.slice(0, 40),
          theme,
          elements,
        }),
      })
        .then((r) => r.json())
        .then((saveJson) => {
          if (saveJson.data?.boardId) {
            setBoard((b) => ({ ...b, id: saveJson.data.boardId }))
          } else {
            // No auth — persist to localStorage as fallback
            setBoard((b) => {
              localStorage.setItem('mb_draft_board', JSON.stringify(b))
              return b
            })
          }
        })
        .catch(() => {
          // Save failed — persist to localStorage as fallback
          setBoard((b) => {
            try {
              localStorage.setItem('mb_draft_board', JSON.stringify(b))
            } catch {
              // ignore storage errors
            }
            return b
          })
        })
    } catch {
      setError('Network error')
    } finally {
      setGenerating(false)
    }
  }, [])

  // Add more elements (1 credit)
  const addMore = useCallback(async (prompt: string) => {
    if (boardRef.current.elements.length >= MAX_ELEMENTS) {
      setError(`Board is full (max ${MAX_ELEMENTS} elements). Remove some to add more.`)
      return
    }
    setAddingMore(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/mood-board/add-more', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: boardRef.current.id || 'temp',
          prompt,
          theme: boardRef.current.theme,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Add more failed')
        return
      }

      // Ignore x/y/rotation from API response — only keep valid fields
      const rawElements: any[] = json.data?.elements || []
      const newElements: BoardElement[] = rawElements.map((el: any) => ({
        id: el.id,
        type: el.type,
        width: el.width,
        height: el.height,
        order: el.order ?? 0,
        data: el.data,
      }))

      setBoard((b) => {
        const merged = [...b.elements, ...newElements].slice(0, MAX_ELEMENTS)
        // Re-assign order values to maintain consistent ordering
        const reordered = merged.map((el, idx) => ({ ...el, order: idx }))
        return { ...b, elements: reordered }
      })
    } catch {
      setError('Network error')
    } finally {
      setAddingMore(false)
    }
  }, [])

  // Element CRUD
  const addElement = useCallback((type: ElementType, data: ElementData) => {
    setBoard((b) => {
      if (b.elements.length >= MAX_ELEMENTS) return b
      const defaultSizes: Record<ElementType, { width: number; height: number }> = {
        image: { width: 200, height: 200 },
        text: { width: 160, height: 100 },
        swatch: { width: 80, height: 80 },
        palette: { width: 200, height: 80 },
        font: { width: 200, height: 100 },
      }
      const { width, height } = defaultSizes[type]
      const el: BoardElement = {
        id: `${type}-${crypto.randomUUID().slice(0, 8)}`,
        type,
        width,
        height,
        order: b.elements.length,
        data,
      }
      return { ...b, elements: [...b.elements, el] }
    })
  }, [])

  const updateElement = useCallback((id: string, partial: Partial<BoardElement>) => {
    setBoard((b) => ({
      ...b,
      elements: b.elements.map((el) => (el.id === id ? { ...el, ...partial } : el)),
    }))
  }, [])

  const removeElement = useCallback((id: string) => {
    setBoard((b) => ({ ...b, elements: b.elements.filter((el) => el.id !== id) }))
  }, [])

  // Reorder images by swapping order values then re-sorting
  const reorderImages = useCallback((activeId: string, overId: string) => {
    setBoard((b) => {
      const activeIdx = b.elements.findIndex((el) => el.id === activeId)
      const overIdx = b.elements.findIndex((el) => el.id === overId)
      if (activeIdx === -1 || overIdx === -1) return b

      const elements = b.elements.map((el) => ({ ...el }))
      const activeOrder = elements[activeIdx].order
      const overOrder = elements[overIdx].order
      elements[activeIdx].order = overOrder
      elements[overIdx].order = activeOrder

      const sorted = [...elements].sort((a, b) => a.order - b.order)
      return { ...b, elements: sorted }
    })
  }, [])

  // Manual save
  const save = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/v1/mood-board/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: boardRef.current.id,
          title: boardRef.current.title,
          theme: boardRef.current.theme,
          elements: boardRef.current.elements,
        }),
      })
      const json = await res.json()
      if (json.data?.boardId && !boardRef.current.id) {
        setBoard((b) => ({ ...b, id: json.data.boardId }))
      }
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }, [])

  // Share
  const share = useCallback(async (): Promise<string | null> => {
    if (!boardRef.current.id) await save()
    if (!boardRef.current.id) return null

    try {
      const res = await fetch('/api/v1/mood-board/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId: boardRef.current.id }),
      })
      const json = await res.json()
      if (json.data?.shareUrl) {
        setBoard((b) => ({ ...b, shared: true, shareId: json.data.shareId }))
        return json.data.shareUrl
      }
    } catch {
      // silent
    }
    return null
  }, [save])

  // Load from history
  const loadBoard = useCallback((entry: any) => {
    setBoard({
      id: entry.id,
      title: entry.title || 'Untitled',
      theme: entry.theme || '',
      elements: entry.elements || [],
      shared: entry.shared || false,
      shareId: entry.share_id || null,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at,
      mood: entry.mood || null,
      colorPreference: entry.colorPreference || entry.color_preference || 'surprise',
    })
  }, [])

  return {
    board, saving, generating, addingMore, error,
    setBoard, generate, addMore, addElement, updateElement,
    removeElement, reorderImages, save, share, loadBoard,
  }
}
