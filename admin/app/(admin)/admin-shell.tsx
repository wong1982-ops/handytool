'use client'

import { useState } from 'react'
import { AdminSidebar } from '@/components/admin-sidebar'
import { AdminTopbar } from '@/components/admin-topbar'

interface Props {
  email: string
  children: React.ReactNode
}

export function AdminShell({ email, children }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <AdminTopbar email={email} sidebarCollapsed={collapsed} onMenuToggle={() => setCollapsed((c) => !c)} />
      <main className={`transition-all duration-200 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="max-w-7xl mx-auto w-full px-4 py-8 md:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
