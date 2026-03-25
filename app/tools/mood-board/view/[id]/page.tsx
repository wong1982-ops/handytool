import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shared Mood Board | Toolk1t',
  description: 'View a shared AI-generated mood board.',
}

async function fetchBoard(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolk1t.com'
  const res = await fetch(`${baseUrl}/api/v1/mood-board/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  const json = await res.json()
  return json.data?.board || null
}

export default async function SharedBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const board = await fetchBoard(id)

  if (!board) {
    return (
      <main className="flex-1 flex items-center justify-center bg-[#090f16] min-h-screen">
        <div className="text-center">
          <p className="text-white text-lg font-bold">Board not found</p>
          <p className="text-[#70767f] text-sm mt-1">This board may have been deleted or the link is invalid.</p>
        </div>
      </main>
    )
  }

  // Render read-only board view — images positioned absolutely based on elements JSON
  return (
    <main className="flex-1 flex flex-col items-center bg-[#090f16] min-h-screen p-4">
      <h1 className="text-white text-2xl font-bold mb-4">{board.title}</h1>
      <p className="text-[#70767f] text-sm mb-6">Theme: {board.theme}</p>
      <div className="relative w-full max-w-5xl min-h-[600px] bg-[#0d1117] rounded-xl overflow-hidden">
        {(board.elements as any[]).map((el: any) => {
          if (el.type === 'image' && el.data?.imageUrl) {
            return (
              <div
                key={el.id}
                className="absolute rounded-lg overflow-hidden border-2 border-white/10 shadow-lg"
                style={{
                  left: el.x, top: el.y,
                  width: el.width, height: el.height,
                  transform: `rotate(${el.rotation || 0}deg)`,
                }}
              >
                <img src={el.data.imageUrl} alt={el.data.alt || ''} className="w-full h-full object-cover" />
              </div>
            )
          }
          if (el.type === 'palette' && el.data?.colors) {
            return (
              <div
                key={el.id}
                className="absolute flex gap-2 items-center bg-[#131a23] rounded-xl px-3 py-2"
                style={{ left: el.x, top: el.y, transform: `rotate(${el.rotation || 0}deg)` }}
              >
                {el.data.colors.map((c: string, i: number) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: c }} />
                    <span className="text-[9px] text-[#70767f]">{c}</span>
                  </div>
                ))}
              </div>
            )
          }
          if (el.type === 'font' && el.data?.fontFamily) {
            return (
              <div
                key={el.id}
                className="absolute bg-[#131a23] rounded-xl px-4 py-3"
                style={{ left: el.x, top: el.y, width: el.width, transform: `rotate(${el.rotation || 0}deg)` }}
              >
                <p className="text-[10px] text-[#70767f] mb-1">{el.data.category === 'heading' ? 'Heading' : 'Body'}</p>
                <p className="text-white text-sm font-medium">{el.data.fontFamily}</p>
                <p className="text-[#a6abb5] text-xs mt-1" style={{ fontFamily: el.data.fontFamily }}>{el.data.sampleText}</p>
              </div>
            )
          }
          if (el.type === 'text' && el.data?.content) {
            return (
              <div
                key={el.id}
                className="absolute bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2"
                style={{ left: el.x, top: el.y, width: el.width, transform: `rotate(${el.rotation || 0}deg)` }}
              >
                <p className="text-white text-sm">{el.data.content}</p>
              </div>
            )
          }
          return null
        })}
      </div>
    </main>
  )
}
