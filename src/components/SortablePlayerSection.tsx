import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import React from 'react'

import { Button } from './Button'
import { PlayerSection } from './PlayerSection'

interface SortablePlayerSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  gameId: string
  dragEnabled: boolean
}

// Sortable wrapper for PlayerSection
export function SortablePlayerSection({ id, gameId, dragEnabled, className, ...props }: SortablePlayerSectionProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !dragEnabled
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`SortablePlayerSection flex flex-col relative ${className}`}
      {...props}
    >
      {dragEnabled && (
        <div className={`drag-overlay${isDragging ? ' drag-overlay--active' : ''}`}>
          <Button
            ref={setActivatorNodeRef}
            {...listeners}
            {...attributes}
            className="drag-overlay-handle drag-overlay-handle--large"
            round
            variant="secondary"
            tabIndex={-1}
            aria-label="Drag to reorder player"
            type="button"
          >
            <GripVertical />
          </Button>
        </div>
      )}
      <PlayerSection gameId={gameId} playerId={id} />
    </div>
  )
}
