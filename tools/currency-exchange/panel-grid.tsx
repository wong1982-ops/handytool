'use client'

import { type ReactNode, useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { DraggablePanel, DraggablePanelOverlay } from './draggable-panel'
import { type PanelId, type PanelConfig } from './use-panel-layout'

interface PanelGridProps {
  panels: PanelConfig[]
  onReorder: (newOrder: PanelId[]) => void
  onColSpanChange: (id: PanelId, span: 1 | 2 | 3) => void
  onReset: () => void
  isDefault: boolean
  isDragEnabled: boolean
  renderPanel: (id: PanelId) => ReactNode
}

export function PanelGrid({
  panels,
  onReorder,
  onColSpanChange,
  onReset,
  isDefault,
  isDragEnabled,
  renderPanel,
}: PanelGridProps) {
  const [activeId, setActiveId] = useState<PanelId | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as PanelId)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)
      const { active, over } = event
      if (!over || active.id === over.id) return
      const ids = panels.map((p) => p.id)
      const oldIndex = ids.indexOf(active.id as PanelId)
      const newIndex = ids.indexOf(over.id as PanelId)
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(arrayMove(ids, oldIndex, newIndex))
      }
    },
    [panels, onReorder]
  )

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
  }, [])

  const activePanel = activeId ? panels.find((p) => p.id === activeId) : null

  return (
    <div className="space-y-3">
      {/* Reset button — only when layout is customized */}
      {isDragEnabled && !isDefault && (
        <div className="flex justify-end">
          <button
            onClick={onReset}
            className="text-xs text-slate-400 hover:text-[var(--tk-color-primary-500)] transition-colors cursor-pointer"
            aria-label="Reset panel layout to default"
          >
            Reset layout
          </button>
        </div>
      )}

      {isDragEnabled ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={panels.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-6">
              {panels.map((panel) => (
                <DraggablePanel
                  key={panel.id}
                  id={panel.id}
                  colSpan={panel.colSpan}
                  onColSpanChange={(span) => onColSpanChange(panel.id, span)}
                  isDragEnabled
                >
                  {renderPanel(panel.id)}
                </DraggablePanel>
              ))}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={null}>
            {activePanel && (
              <DraggablePanelOverlay id={activePanel.id}>
                {renderPanel(activePanel.id)}
              </DraggablePanelOverlay>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        /* Mobile: simple stacked layout, no drag */
        <div className="grid grid-cols-1 gap-6">
          {panels.map((panel) => (
            <div key={panel.id}>{renderPanel(panel.id)}</div>
          ))}
        </div>
      )}
    </div>
  )
}
