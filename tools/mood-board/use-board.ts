// tools/mood-board/use-board.ts
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { Board, BoardElement, ElementType, ElementData } from './types'
import { MAX_ELEMENTS, ELEMENT_DEFAULTS } from './types'

interface UseBoardReturn {
  board: Board
  saving: boolean
  generating: boolean
  addingMore: boolean
  error: string | null
  setBoard: (b: Board) => void
  generate: (theme: string) => Promise<void>
  addMore: (prompt: string) => Promise<void>
  addElement: (type: ElementType, data: ElementData) => void
  updateElement: (id: string, partial: Partial<BoardElement>) => void
  removeElement: (id: string) => void
  bringToFront: (id: string) => void
  save: () => Promise<void>
  share: () => Promise<string | null>
  loadBoard: (entry: any) => void
}

export function useBoard(): UseBoardReturn {
  const [board, setBoard] = useState<Board>({
    id: null,
    title: 'Untitled Board',
    theme: '',
    elements: [],
    shared: false,
    shareId: null,
    createdAt: null,
    updatedAt: null,
  })
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [addingMore, setAddingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const boardRef = useRef(board)
  boardRef.current = board

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
  const generate = useCallback(async (theme: string) => {
    setGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/mood-board/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Generation failed')
        return
      }

      setBoard((b) => ({
        ...b,
        theme,
        title: theme.slice(0, 40),
        elements: json.data?.elements || [],
      }))

      // Auto-save new board (fire-and-forget)
      fetch('/api/v1/mood-board/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: theme.slice(0, 40),
          theme,
          elements: json.data?.elements || [],
        }),
      })
        .then((r) => r.json())
        .then((saveJson) => {
          if (saveJson.data?.boardId) {
            setBoard((b) => ({ ...b, id: saveJson.data.boardId }))
          }
        })
        .catch(() => {})
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

      const newElements: BoardElement[] = json.data?.elements || []
      setBoard((b) => ({
        ...b,
        elements: [...b.elements, ...newElements].slice(0, MAX_ELEMENTS),
      }))
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
      const defaults = ELEMENT_DEFAULTS[type]
      const el: BoardElement = {
        id: `${type}-${crypto.randomUUID().slice(0, 8)}`,
        type,
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        width: defaults.width,
        height: defaults.height,
        rotation: Math.random() * 4 - 2,
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

  const bringToFront = useCallback((id: string) => {
    setBoard((b) => {
      const el = b.elements.find((e) => e.id === id)
      if (!el) return b
      return { ...b, elements: [...b.elements.filter((e) => e.id !== id), el] }
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
    })
  }, [])

  return {
    board, saving, generating, addingMore, error,
    setBoard, generate, addMore, addElement, updateElement,
    removeElement, bringToFront, save, share, loadBoard,
  }
}
