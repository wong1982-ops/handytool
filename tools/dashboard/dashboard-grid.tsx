'use client'

import React from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { tools } from '@/lib/tools'
import { getToolCategory } from '@/components/layout/tool-categories'
import { WidgetCard } from './widget-card'
import type { DashboardWidget } from './types'

interface DashboardGridProps {
  widgets: DashboardWidget[]
  loading: boolean
  onRemove: (id: string) => void
  onResize: (id: string) => void
  onReorder: (activeId: string, overId: string) => void
  onAddWidget: () => void
}

export function DashboardGrid({
  widgets,
  loading,
  onRemove,
  onResize,
  onReorder,
  onAddWidget,
}: DashboardGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id))
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-[#1e2631] rounded-xl h-32"
            aria-hidden="true"
          />
        ))}
      </div>
    )
  }

  if (widgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 flex items-center justify-center text-[#3a4555]">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-white">Your dashboard is empty</p>
          <p className="text-sm text-[#8892a4] mt-1">Add widgets to get started</p>
        </div>
        <button
          type="button"
          onClick={onAddWidget}
          className="mt-2 h-11 px-6 rounded-lg bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Add Widget
        </button>
      </div>
    )
  }

  const widgetIds = widgets.map((w) => w.id)

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={widgetIds} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {widgets.map((widget) => {
            const tool = tools.find((t) => t.href === '/tools/' + widget.toolSlug)
            if (!tool) return null
            const category = getToolCategory(widget.toolSlug)
            return (
              <WidgetCard
                key={widget.id}
                widget={widget}
                toolName={tool.name}
                toolIcon={tool.icon}
                toolColor={tool.color}
                category={category}
                onRemove={onRemove}
                onResize={onResize}
              />
            )
          })}
        </div>
      </SortableContext>
    </DndContext>
  )
}
