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
    tournament: 'from-purple-900/40 to-blue-900/40 border-purple-700/50',
    challenge: 'from-green-900/40 to-teal-900/40 border-green-700/50',
    happy_hour: 'from-yellow-900/40 to-orange-900/40 border-yellow-700/50',
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
          <p className="text-sm font-medium text-white">{event.name}</p>
          <p className="text-xs text-gray-400">
            Ends: {new Date(event.endsAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
