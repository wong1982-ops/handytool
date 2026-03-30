'use client'

import { useResume } from '../resume-provider'
import { MODULE_TYPES, type ModuleType } from '../resume-types'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableModule({ mod, enabled, mandatory, label, onToggle }: {
  mod: ModuleType
  enabled: boolean
  mandatory: boolean
  label: string
  onToggle: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: mod, disabled: mandatory })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
        enabled
          ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
          : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-60'
      }`}
    >
      <div className="flex items-center gap-3">
        {!mandatory && (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Drag to reorder"
          >
            ⠿
          </button>
        )}
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
        {mandatory && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            Required
          </span>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={onToggle}
          disabled={mandatory}
          className="sr-only peer"
          aria-label={`Toggle ${label}`}
        />
        <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50" />
      </label>
    </div>
  )
}

export function ModuleManagementPanel() {
  const { state, dispatch, t } = useResume()
  const { enabledModules } = state.resume

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = enabledModules.indexOf(active.id as ModuleType)
    const newIndex = enabledModules.indexOf(over.id as ModuleType)
    if (oldIndex === -1 || newIndex === -1) return

    // Keep baseInfo at index 0
    if (oldIndex === 0 || newIndex === 0) return

    dispatch({ type: 'REORDER_MODULES', payload: arrayMove(enabledModules, oldIndex, newIndex) })
  }

  // All modules: enabled ones in order, then disabled ones
  const disabledModules = MODULE_TYPES.filter((m) => !enabledModules.includes(m))

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {t.moduleManagement.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t.moduleManagement.description}
        </p>

        {/* Enabled modules (sortable) */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={enabledModules} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 mb-6">
              {enabledModules.map((mod) => (
                <SortableModule
                  key={mod}
                  mod={mod}
                  enabled={true}
                  mandatory={mod === 'baseInfo'}
                  label={t.modules[mod as keyof typeof t.modules] ?? mod}
                  onToggle={() => dispatch({ type: 'TOGGLE_MODULE', payload: mod })}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Disabled modules */}
        {disabledModules.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Disabled
            </p>
            {disabledModules.map((mod) => (
              <SortableModule
                key={mod}
                mod={mod}
                enabled={false}
                mandatory={false}
                label={t.modules[mod as keyof typeof t.modules] ?? mod}
                onToggle={() => dispatch({ type: 'TOGGLE_MODULE', payload: mod })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
