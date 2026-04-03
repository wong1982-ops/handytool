'use client'
import { useState, useEffect } from 'react'
import { useSlots } from '../../slots-provider'

export function FriendsTab() {
  const { t } = useSlots()
  const [friends, setFriends] = useState<any[]>([])
  const [pending, setPending] = useState<any[]>([])
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/slots/friends')
      .then(r => r.json())
      .then(json => {
        setFriends(json.data?.sent?.filter((f: any) => f.status === 'accepted') || [])
        setPending(json.data?.received?.filter((f: any) => f.status === 'pending') || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleAccept = async (id: string) => {
    await fetch('/api/v1/slots/friends', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendshipId: id, action: 'accept' }),
    })
    setPending(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="p-4 space-y-5">
      <h2 className="text-[17px] font-bold text-white">{t.social.friends}</h2>

      {/* Add friend */}
      <div className="flex gap-2">
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder={t.social.usernamePlaceholder}
          className="flex-1 px-3 py-2.5 min-h-[44px] rounded-lg bg-[#090f16] border border-[#1e2631] text-[13px] text-white placeholder:text-[#70767f] outline-none focus:border-[#3D6AF2]/70 transition-colors"
        />
        <button className="px-3.5 py-2.5 min-h-[44px] rounded-lg text-xs font-bold bg-[#10B981] text-white hover:bg-[#0d9668] transition-colors whitespace-nowrap">
          {t.social.sendRequest}
        </button>
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-[#F59E0B]">{t.social.pending}</h3>
          {pending.map(p => (
            <div key={p.id} className="flex items-center justify-between px-3 py-2.5 rounded-[10px] bg-[#131a23] border border-[#F59E0B]/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#3D6AF2]/20 flex items-center justify-center">
                  <span className="text-sm text-[#a6abb5]">👤</span>
                </div>
                <span className="text-[13px] font-semibold text-white">User {p.user_id?.slice(0, 8)}...</span>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => handleAccept(p.id)} className="px-3 py-1.5 min-h-[32px] text-xs font-bold rounded-lg bg-[#10B981] text-white hover:bg-[#0d9668]">{t.social.accept}</button>
                <button className="px-3 py-1.5 min-h-[32px] text-xs font-medium rounded-lg bg-[#131a23] text-[#70767f] border border-[#1e2631] hover:bg-[#1e2631]">{t.social.decline}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Friend list */}
      {loading ? (
        <div className="text-center text-[#70767f] py-8 text-sm">Loading...</div>
      ) : friends.length === 0 ? (
        <div className="text-center text-[#70767f] py-8 text-sm">{t.social.noFriends}</div>
      ) : (
        <div className="space-y-1.5">
          {friends.map(f => (
            <div key={f.id} className="flex items-center justify-between px-3 py-2.5 rounded-[10px] bg-[#131a23] border border-[#1e2631]">
              <span className="text-[13px] font-semibold text-white">User {f.friend_id?.slice(0, 8)}...</span>
              <span className="text-xs font-medium text-[#10B981]">{t.social.online}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
