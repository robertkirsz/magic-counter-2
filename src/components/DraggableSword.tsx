import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Sword } from 'lucide-react'
import React from 'react'

import { cn } from '../utils/cn'

interface DraggableSwordProps {
  className?: string
  playerId: string
}

export const DraggableSword: React.FC<DraggableSwordProps> = ({ className = '', playerId }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `sword-${playerId}`,
    data: {
      type: 'sword',
      playerId
    }
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    zIndex: isDragging ? 1000 : 'auto'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'DraggableSword rounded-full p-2 bg-red-600 hover:bg-red-500 text-white border-red-500 opacity-25 hover:opacity-100 transition-opacity',
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
        className
      )}
    >
      <Sword size={24} />
    </div>
  )
}
