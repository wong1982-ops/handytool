'use client'

import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { BoardElement, ImageData } from '../types'

interface ImageGridProps {
  images: BoardElement[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onReorder: (activeId: string, overId: string) => void
  onRemove: (id: string) => void
}

function SortableImage({
  element,
  isSelected,
  isHero,
  onSelect,
  onRemove,
}: {
  element: BoardElement
  isSelected: boolean
  isHero: boolean
  onSelect: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: element.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.7 : 1,
  }

  const data = element.data as ImageData

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative group cursor-pointer rounded-xl overflow-hidden ${
        isHero ? 'md:col-span-2 md:row-span-2' : ''
      } ${isSelected ? 'ring-2 ring-[#3D6AF2]' : ''}`}
      onClick={onSelect}
    >
      <div className="aspect-square">
        <img
          src={data.imageUrl}
          alt={data.alt || 'Mood board image'}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Delete overlay */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove() }}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove image"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export function ImageGrid({ images, selectedId, onSelect, onReorder, onRemove }: ImageGridProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string)
    }
  }

  if (images.length === 0) {
    return (
      <div className="border-2 border-dashed border-[#1e2631] rounded-xl p-12 text-center text-[#70767f] text-sm">
        No images generated yet
      </div>
    )
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <SortableImage
              key={img.id}
              element={img}
              isSelected={selectedId === img.id}
              isHero={i < 2}
              onSelect={() => onSelect(img.id)}
              onRemove={() => onRemove(img.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
