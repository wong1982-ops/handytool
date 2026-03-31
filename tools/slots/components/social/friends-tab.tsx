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
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-bold text-white">{t.social.friends}</h2>

      {/* Add friend */}
      <div className="flex gap-2">
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder={t.social.usernamePlaceholder}
          className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
          {t.social.sendRequest}
        </button>
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-yellow-400">{t.social.pending}</h3>
          {pending.map(p => (
            <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800">
              <span className="text-sm text-gray-300">User {p.user_id?.slice(0, 8)}...</span>
              <div className="flex gap-2">
                <button onClick={() => handleAccept(p.id)} className="px-3 py-1 text-xs rounded-lg bg-green-600 text-white hover:bg-green-500">{t.social.accept}</button>
                <button className="px-3 py-1 text-xs rounded-lg bg-gray-600 text-white hover:bg-gray-500">{t.social.decline}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Friend list */}
      {loading ? (
        <div className="text-center text-gray-500 py-8 text-sm">Loading...</div>
      ) : friends.length === 0 ? (
        <div className="text-center text-gray-500 py-8 text-sm">{t.social.noFriends}</div>
      ) : (
        <div className="space-y-2">
          {friends.map(f => (
            <div key={f.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800">
              <span className="text-sm text-white">User {f.friend_id?.slice(0, 8)}...</span>
              <span className="text-xs text-green-400">{t.social.online}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
