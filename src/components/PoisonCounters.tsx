import React from 'react'

import { useGames } from '../hooks/useGames'
import { cn } from '../utils/cn'
import { calculatePoisonCounters } from '../utils/gameUtils'

interface PoisonCountersProps {
  gameId: string
  playerId: string
  pendingChange?: number
}

export const PoisonCounters: React.FC<PoisonCountersProps> = ({ gameId, playerId, pendingChange = 0 }) => {
  const { games } = useGames()

  const game = games.find(g => g.id === gameId)

  if (!game) return null

  const totalPoisonCounters = calculatePoisonCounters(game, playerId)
  const displayPoisonCounters = totalPoisonCounters + pendingChange

  // Show component if:
  // - There are existing poison counters, OR
  // - There are pending changes that would add poison (pendingChange > 0)
  // Hide if there are no counters and no pending additions
  if (totalPoisonCounters === 0 && pendingChange <= 0) return null

  // Ensure display doesn't go below 0
  const safeDisplayValue = Math.max(0, displayPoisonCounters)

  return (
    <div className="flex items-center gap-1">
      <span>☠️</span>
      <span className="text-lg font-bold text-green-400">{safeDisplayValue}</span>
      {pendingChange !== 0 && (
        <span className={cn('text-xs', pendingChange < 0 ? 'text-green-400' : 'text-red-400')}>
          {pendingChange > 0 ? '+' : ''}
          {pendingChange}
        </span>
      )}
    </div>
  )
}
