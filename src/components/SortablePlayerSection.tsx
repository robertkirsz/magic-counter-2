import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import React from 'react'

import { cn } from '../utils/cn'
import { PlayerSection } from './PlayerSection'

interface SortablePlayerSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  index: number
  gameId: string
  dragEnabled: boolean
}

export function SortablePlayerSection({
  id,
  index,
  gameId,
  dragEnabled,
  style,
  className,
  ...props
}: SortablePlayerSectionProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !dragEnabled
  })

  const _style: React.CSSProperties = {
    ...style,
    transform: CSS.Transform.toString(transform),
    transition,
    gridArea: `player-${index + 1}`,
    zIndex: isDragging ? 21 : 20
  }

  return (
    <div
      ref={setNodeRef}
      className={cn('SortablePlayerSection flex flex-col relative', className)}
      style={_style}
      {...props}
    >
      {dragEnabled && (
        <button
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          type="button"
          className={'btn btn btn-circle DragHandle'}
        >
          <GripVertical />
        </button>
      )}

      <PlayerSection gameId={gameId} playerId={id} />
    </div>
  )
}
