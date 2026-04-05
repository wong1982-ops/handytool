'use client'

import { useState } from 'react'
import { ToolFrame } from '@/components/layout/tool-frame'
import { useDashboard } from '@/tools/dashboard/use-dashboard'
import { DashboardGrid } from '@/tools/dashboard/dashboard-grid'
import { DashboardToolbar } from '@/tools/dashboard/dashboard-toolbar'
import { AddWidgetDrawer } from '@/tools/dashboard/add-widget-drawer'

export default function DashboardPage() {
  const dashboard = useDashboard()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <ToolFrame
      toolName="Dashboard"
      toolSlug="dashboard"
      category="utility"
      icon={
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
        </svg>
      }
    >
      <DashboardToolbar
        onAddWidget={() => setDrawerOpen(true)}
        onReset={dashboard.resetLayout}
        widgetCount={dashboard.widgets.length}
        maxWidgets={12}
      />
      <DashboardGrid
        widgets={dashboard.widgets}
        loading={dashboard.loading}
        onRemove={dashboard.removeWidget}
        onResize={dashboard.resizeWidget}
        onReorder={dashboard.reorderWidgets}
        onAddWidget={() => setDrawerOpen(true)}
      />
      <AddWidgetDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAdd={(slug) => { dashboard.addWidget(slug); setDrawerOpen(false) }}
        isToolOnDashboard={dashboard.isToolOnDashboard}
        widgetCount={dashboard.widgets.length}
        maxWidgets={12}
      />
    </ToolFrame>
  )
}
