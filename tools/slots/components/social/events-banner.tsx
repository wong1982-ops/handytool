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

  const typeIcons: Record<string, string> = {
    tournament: '🏆',
    challenge: '🎯',
    happy_hour: '⚡',
  }

  return (
    <div className="mx-4 mt-3 px-3.5 py-3 rounded-xl bg-[#131a23] border border-[#3D6AF2]/30">
      <div className="flex items-center gap-3">
        <span className="text-lg">{typeIcons[event.type] || '🎉'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#f0d080]">{event.name}</p>
          <p className="text-[11px] text-[#70767f] mt-px">
            Ends: {new Date(event.endsAt).toLocaleDateString()}
          </p>
        </div>
        <span className="px-2 py-[3px] text-[10px] font-semibold text-[#3D9DF2] bg-[#3D6AF2]/15 border border-[#3D6AF2]/30 rounded-full">LIVE</span>
      </div>
    </div>
  )
}
