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

  const elements = (board.elements || []) as any[]
  const images = elements.filter((el: any) => el.type === 'image' && el.data?.imageUrl)
  const palette = elements.find((el: any) => el.type === 'palette' && el.data?.colors)
  const fonts = elements.filter((el: any) => el.type === 'font' && el.data?.fontFamily)
  const notes = elements.filter((el: any) => el.type === 'text' || el.type === 'swatch')

  return (
    <main className="flex-1 flex flex-col items-center bg-[#090f16] min-h-screen p-4">
      <h1 className="text-white text-2xl font-bold mb-1">{board.title}</h1>
      <p className="text-[#70767f] text-sm mb-6">Theme: {board.theme}</p>

      <div className="w-full max-w-5xl space-y-6">
        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((el: any, i: number) => (
              <div
                key={el.id}
                className={`rounded-xl overflow-hidden ${i < 2 ? 'md:col-span-2 md:row-span-2' : ''}`}
              >
                <div className="aspect-square">
                  <img src={el.data.imageUrl} alt={el.data.alt || ''} className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Palette + Fonts Row */}
        {(palette || fonts.length > 0) && (
          <div className="flex flex-col md:flex-row gap-6 py-6 border-t border-b border-[#1e2631]">
            {palette && (
              <div className="flex gap-3">
                {(palette.data.colors as string[]).map((c: string, i: number) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: c }} />
                    <span className="text-xs text-[#70767f]">{c}</span>
                  </div>
                ))}
              </div>
            )}
            {fonts.length > 0 && (
              <div className="flex gap-4">
                {fonts.map((el: any) => (
                  <div key={el.id} className="rounded-xl bg-[#131a23] border border-[#1e2631] p-4">
                    <p className="text-[10px] text-[#70767f] mb-1">{el.data.category === 'heading' ? 'Heading' : 'Body'}</p>
                    <p className="text-white text-sm font-medium">{el.data.fontFamily}</p>
                    <p className="text-[#a6abb5] text-xs mt-1" style={{ fontFamily: el.data.fontFamily }}>{el.data.sampleText}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {notes.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {notes.map((el: any) => {
              if (el.type === 'text') {
                return (
                  <div key={el.id} className="w-40 min-h-[80px] rounded-lg bg-amber-200/90 p-3 text-sm text-slate-800">
                    {el.data.content}
                  </div>
                )
              }
              if (el.type === 'swatch') {
                return (
                  <div key={el.id} className="flex flex-col items-center gap-1">
                    <div className="w-16 h-16 rounded-lg" style={{ backgroundColor: el.data.color }} />
                    <span className="text-xs text-[#70767f]">{el.data.color}</span>
                  </div>
                )
              }
              return null
            })}
          </div>
        )}
      </div>
    </main>
  )
}
