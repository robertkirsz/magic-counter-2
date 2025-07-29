import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import React from 'react'

import { Button } from './Button'
import { PlayerSection } from './PlayerSection'

interface SortablePlayerSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  index: number
  gameId: string
  dragEnabled: boolean
}

// Sortable wrapper for PlayerSection
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
    // transition: isDragging ? 'none' : transition,
    gridArea: `player-${index + 1}`,
    zIndex: isDragging ? 21 : 20
  }

  return (
    <div
      ref={setNodeRef}
      className={`SortablePlayerSection flex flex-col relative ${className}`}
      style={_style}
      {...props}
    >
      {dragEnabled && (
        <Button
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          type="button"
          className="DragHandle"
          round
          variant="secondary"
          // tabIndex={-1}
        >
          <GripVertical />
        </Button>
      )}

      <PlayerSection gameId={gameId} playerId={id} />
    </div>
  )
}

{
  /* <Sortable
  {...props}
  strategy={rectSwappingStrategy}
  reorderItems={arraySwap}
  getNewIndex={({id, items, activeIndex, overIndex}) =>
    arraySwap(items, activeIndex, overIndex).indexOf(id)
  }
/> */
}
