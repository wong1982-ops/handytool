'use client'

import { useState, useEffect, useRef } from 'react'

interface JobSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function JobSearchBar({ value, onChange }: JobSearchBarProps) {
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
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#70767f] pointer-events-none"
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
        placeholder="Search jobs by title, skill, or keyword..."
        className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#1e2631] bg-[#131a23] text-sm text-white placeholder:text-[#70767f] focus:outline-none focus:border-[rgba(61,106,242,0.6)] focus:shadow-[0_0_0_3px_rgba(61,106,242,0.12)] transition-all"
        aria-label="Search jobs"
      />
    </div>
  )
}
