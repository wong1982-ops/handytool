import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings | Toolk1t Admin',
}

export default function SettingsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
        <p className="text-zinc-400">Settings coming soon.</p>
      </div>
    </>
  )
}
