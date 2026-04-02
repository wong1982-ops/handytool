'use client'
import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { BoardElement, ImageData } from '../types'

interface SortableItemProps {
  element: BoardElement
  isHero: boolean
  isSelected: boolean
  onSelect: (id: string) => void
  onRemove: (id: string) => void
}

function SortableItem({ element, isHero, isSelected, onSelect, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const imageData = element.data as ImageData

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'rounded-xl overflow-hidden relative group cursor-pointer',
        'aspect-square',
        isHero ? 'md:col-span-2 md:row-span-2 md:aspect-auto' : '',
        isSelected ? 'ring-2 ring-[#3D6AF2]' : '',
        isDragging ? 'z-50' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => onSelect(element.id)}
      {...attributes}
      {...listeners}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageData.imageUrl}
        alt={imageData.alt}
        className="object-cover w-full h-full"
        draggable={false}
      />

      {/* Hover overlay with delete button */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <button
        type="button"
        aria-label={`Remove ${imageData.alt}`}
        onClick={(e) => {
          e.stopPropagation()
          onRemove(element.id)
        }}
        className={[
          'absolute top-2 right-2 w-7 h-7 rounded-full',
          'bg-red-600 hover:bg-red-500 text-white',
          'flex items-center justify-center',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          'pointer-events-auto z-10',
          'text-sm font-bold leading-none',
        ].join(' ')}
      >
        ✕
      </button>
    </div>
  )
}

interface ImageGridProps {
  images: BoardElement[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onReorder: (activeId: string, overId: string) => void
  onRemove: (id: string) => void
}

export function ImageGrid({ images, selectedId, onSelect, onReorder, onRemove }: ImageGridProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id))
    }
  }

  if (images.length === 0) {
    return (
      <div className="border-2 border-dashed border-[#1e2631] rounded-xl p-12 text-center text-[#70767f] text-sm">
        No images yet — generate or upload to fill this section.
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <SortableItem
              key={image.id}
              element={image}
              isHero={index < 2}
              isSelected={selectedId === image.id}
              onSelect={onSelect}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
