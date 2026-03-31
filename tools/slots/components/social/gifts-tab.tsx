'use client'
import { useState, useEffect } from 'react'
import { useSlots } from '../../slots-provider'

export function GiftsTab() {
  const { t, dispatch } = useSlots()
  const [gifts, setGifts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/slots/gifts')
      .then(r => r.json())
      .then(json => {
        setGifts(json.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleClaimAll = async () => {
    const res = await fetch('/api/v1/slots/gifts', { method: 'PATCH' })
    const json = await res.json()
    if (json.data?.total) {
      dispatch({ type: 'ADD_COINS', payload: json.data.total })
      setGifts([])
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#f0d080]">{t.social.gifts}</h2>
        {gifts.length > 0 && (
          <button
            onClick={handleClaimAll}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[#d4a052] text-black hover:bg-[#f0d080] transition-colors"
          >
            {t.social.claimAll} ({gifts.length})
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-8 text-sm">Loading...</div>
      ) : gifts.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p className="text-3xl mb-2">🎁</p>
          <p className="text-sm">{t.social.noGifts}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {gifts.map(g => (
            <div key={g.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#0d0519] border border-[#d4a052]/20">
              <div>
                <span className="text-sm text-white">From: {g.sender_id?.slice(0, 8)}...</span>
                <span className="text-xs text-[#d4a052]/50 ml-2">{t.social.giftAmount}</span>
              </div>
              <span className="text-sm font-bold text-[#f0d080]">{g.amount?.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
