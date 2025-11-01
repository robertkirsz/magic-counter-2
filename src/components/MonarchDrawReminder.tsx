import React, { useEffect, useState } from 'react'

import { useGames } from '../hooks/useGames'
import { useTurnChangeListener } from '../utils/eventDispatcher'
import { getCurrentMonarch } from '../utils/gameUtils'

interface MonarchDrawReminderProps {
  gameId: string
}

export const MonarchDrawReminder: React.FC<MonarchDrawReminderProps> = ({ gameId }) => {
  const [showReminder, setShowReminder] = useState(false)
  const { games, getCurrentActivePlayer } = useGames()

  const activePlayerId = getCurrentActivePlayer(gameId)

  useTurnChangeListener(
    event => {
      if (event.detail.gameId === gameId && event.detail.fromPlayerId === activePlayerId) {
        // Player is passing their turn, check if they are the monarch
        const game = games.find(g => g.id === gameId)

        if (game) {
          const currentMonarch = getCurrentMonarch(game)
          const player = game.players.find(p => p.id === activePlayerId)

          if (currentMonarch === player?.id) {
            setShowReminder(true)
          }
        }
      }
    },
    [gameId, activePlayerId, games]
  )

  useEffect(() => {
    if (showReminder) {
      const timer = setTimeout(() => {
        setShowReminder(false)
      }, 3000) // Hide after 3 seconds

      return () => clearTimeout(timer)
    }
  }, [showReminder])

  if (!showReminder) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-1000 pointer-events-none">
      <div className="bg-yellow-600 text-white px-6 py-4 rounded-lg shadow-lg pointer-events-auto animate-pulse">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👑</span>
          <div>
            <div className="font-bold">Monarch Reminder</div>
            <div className="text-sm">Draw a card at the beginning of your end step!</div>
          </div>
        </div>
      </div>
    </div>
  )
}
