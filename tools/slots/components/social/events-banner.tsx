'use client'
import { useState, useEffect } from 'react'
import type { CasinoEvent } from '../../slots-types'

export function EventsBanner() {
  const [event, setEvent] = useState<CasinoEvent | null>(null)

  useEffect(() => {
    fetch('/api/v1/slots/events')
      .then(r => r.json())
      .then(json => {
        const events = json.data || []
        if (events.length > 0) setEvent(events[0])
      })
      .catch(() => {})
  }, [])

  if (!event) return null

  const typeColors: Record<string, string> = {
    tournament: 'from-[#2d1052] to-[#1a0a2e] border-[#d4a052]/40',
    challenge: 'from-[#2d1052] to-[#0d0519] border-[#d4a052]/30',
    happy_hour: 'from-[#2d1052] via-[#1a0a2e] to-[#0d0519] border-[#f0d080]/40',
  }

  const typeIcons: Record<string, string> = {
    tournament: '🏆',
    challenge: '🎯',
    happy_hour: '⚡',
  }

  return (
    <div className={`mx-4 my-2 px-4 py-3 rounded-xl bg-gradient-to-r border ${typeColors[event.type] || typeColors.tournament}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{typeIcons[event.type] || '🎉'}</span>
        <div>
          <p className="text-sm font-medium text-[#f0d080]">{event.name}</p>
          <p className="text-xs text-[#d4a052]/50">
            Ends: {new Date(event.endsAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
