'use client'

import { useState, useEffect, useRef } from 'react'

interface NewsSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function NewsSearchBar({ value, onChange }: NewsSearchBarProps) {
  const [localValue, setLocalValue] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (newValue: string) => {
    setLocalValue(newValue)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onChange(newValue)
    }, 300)
  }

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <div className="relative w-full">
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#70767f]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search by model name, topic, or keyword..."
        className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#1e2631] bg-[#131a23] text-sm text-white placeholder:text-[#70767f] focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]/50 focus:border-transparent transition-all"
        aria-label="Search AI news"
      />
    </div>
  )
}
