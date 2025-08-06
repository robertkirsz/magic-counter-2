import { useDraggable } from '@dnd-kit/core'
import { Sword } from 'lucide-react'
import React from 'react'

import { useGames } from '../hooks/useGames'
import { cn } from '../utils/cn'
import { isPlayerEliminated } from '../utils/gameUtils'

interface DraggableSwordProps {
  className?: string
  playerId: string
  gameId?: string
}

// TODO: Hide when Player drag mode is on
export const DraggableSword: React.FC<DraggableSwordProps> = ({ className = '', playerId, gameId }) => {
  const { games } = useGames()
  const game = gameId ? games.find(g => g.id === gameId) : null

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sword-${playerId}`,
    data: {
      type: 'sword',
      playerId
    }
  })

  // Hide sword if player is eliminated
  if (game && isPlayerEliminated(game, playerId)) {
    return null
  }

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
