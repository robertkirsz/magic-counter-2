import { useDraggable } from '@dnd-kit/core'
import { Sword } from 'lucide-react'
import React from 'react'

import { cn } from '../utils/cn'

interface DraggableSwordProps {
  className?: string
  playerId: string
}

// TODO: Hide when Player drag mode is on
export const DraggableSword: React.FC<DraggableSwordProps> = ({ className = '', playerId }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sword-${playerId}`,
    data: {
      type: 'sword',
      playerId
    }
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'DraggableSword rounded-full p-2 bg-red-600 hover:bg-red-500 text-white border-red-500 opacity-25 hover:opacity-100 transition-opacity',
        isDragging && 'opacity-0',
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
        className
      )}
    >
      <Sword size={24} />
    </div>
  )
}
