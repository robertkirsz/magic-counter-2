import { SkullIcon } from 'lucide-react'
import React from 'react'

import { useGames } from '../hooks/useGames'
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
    <div className="flex relative">
      <SkullIcon className="size-8" />

      <div className="absolute -top-1 -right-1 bg-success text-success-content text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
        {safeDisplayValue}
        {pendingChange !== 0 && (
          <span className="text-xs absolute left-full pl-1 text-success">
            {pendingChange > 0 ? '+' : ''}
            {pendingChange}
          </span>
        )}
      </div>
    </div>
  )
}
