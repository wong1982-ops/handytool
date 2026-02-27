'use client'

import { useState, useCallback, useEffect } from 'react'

export interface ConversionRecord {
  id: string
  filename: string
  mode: string
  timestamp: number
  inputSize: number
  outputSize: number
  status: 'success' | 'error'
}

const STORAGE_KEY = 'pdf-converter-history'
const MAX_RECORDS = 20

export function useConversionHistory() {
  const [records, setRecords] = useState<ConversionRecord[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setRecords(JSON.parse(stored))
    } catch {}
  }, [])

  const addRecord = useCallback((record: Omit<ConversionRecord, 'id' | 'timestamp'>) => {
    setRecords(prev => {
      const newRecord: ConversionRecord = {
        ...record,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      }
      const updated = [newRecord, ...prev].slice(0, MAX_RECORDS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearHistory = useCallback(() => {
    setRecords([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { records, addRecord, clearHistory }
}
