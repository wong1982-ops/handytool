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
        <h2 className="text-[17px] font-bold text-white">{t.social.gifts}</h2>
        {gifts.length > 0 && (
          <button
            onClick={handleClaimAll}
            className="px-4 py-2 min-h-[36px] rounded-lg text-[13px] font-semibold bg-[#3D6AF2] text-white hover:bg-[#3D79F2] transition-colors"
          >
            {t.social.claimAll} ({gifts.length})
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center text-[#70767f] py-8 text-sm">Loading...</div>
      ) : gifts.length === 0 ? (
        <div className="text-center text-[#70767f] py-8">
          <p className="text-3xl mb-2">🎁</p>
          <p className="text-sm">{t.social.noGifts}</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {gifts.map(g => (
            <div key={g.id} className="flex items-center justify-between px-3 py-3 rounded-[10px] bg-[#131a23] border border-[#1e2631]">
              <div>
                <span className="text-[13px] font-semibold text-white">From: {g.sender_id?.slice(0, 8)}...</span>
                <span className="text-[10px] text-[#70767f] ml-2">{t.social.giftAmount}</span>
              </div>
              <span className="text-[13px] font-bold text-[#f0d080]" style={{ fontFamily: '"SF Mono", monospace' }}>{g.amount?.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
