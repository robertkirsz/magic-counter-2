import React from 'react'

import { useDecks } from '../hooks/useDecks'
import { useGames } from '../hooks/useGames'
import { cn } from '../utils/cn'
import { getCurrentMonarch } from '../utils/gameUtils'
import { generateId } from '../utils/idGenerator'

interface MonarchToggleProps {
  gameId: string
  playerId: string
  className?: string
}

export const MonarchToggle: React.FC<MonarchToggleProps> = ({ gameId, playerId, className }) => {
  const { games, dispatchAction } = useGames()
  const { decks } = useDecks()

  const game = games.find(g => g.id === gameId)

  if (!game) return null

  const player = game.players.find(p => p.id === playerId)

  if (!player) return null

  // Check if any deck in the game has the monarch option
  const hasMonarchOption = game.players.some(p => {
    if (!p.deckId) return false
    const deck = decks.find(d => d.id === p.deckId)
    return deck?.options?.includes('monarch')
  })

  if (!hasMonarchOption) return null

  const currentMonarch = getCurrentMonarch(game)
  const isMonarch = currentMonarch === player.id

  const handleMonarchToggle = () => {
    const newMonarchAction = {
      id: generateId(),
      createdAt: new Date(),
      type: 'monarch-change' as const,
      from: currentMonarch,
      to: isMonarch ? null : player.id
    }

    dispatchAction(gameId, newMonarchAction)
  }

  return (
    <button
      type="button"
      className={cn(
        'btn btn-sm transition-colors duration-200',
        isMonarch && 'bg-yellow-600/90 hover:bg-yellow-500 text-white border-yellow-500',
        className
      )}
      onClick={handleMonarchToggle}
      title={isMonarch ? 'Remove Monarch' : 'Become Monarch'}
    >
      👑
    </button>
  )
}
