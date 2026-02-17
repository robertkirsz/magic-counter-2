import React from 'react'

import { useDecks } from '../hooks/useDecks'
import { useGames } from '../hooks/useGames'

interface CommanderDamageProps {
  gameId: string
  playerId: string
}

export const CommanderDamage: React.FC<CommanderDamageProps> = ({ gameId, playerId }) => {
  const { games } = useGames()
  const { decks } = useDecks()

  const game = games.find(g => g.id === gameId)

  if (!game) return null

  // Get all commander damage actions that targeted this player
  const commanderDamageActions = game.actions.filter(action => {
    if (action.type !== 'life-change') return false
    if (!action.commanderId) return false
    if (!action.to?.includes(playerId)) return false
    return action.value < 0 // Only damage, not life gain
  })

  // Get unique commander IDs that dealt damage to this player
  const commanderIds = [...new Set(commanderDamageActions.map(action => (action as LifeChangeAction).commanderId))]

  // Get commander details for each unique commander
  const commanders = commanderIds
    .map(commanderId => {
      const deck = decks.find(d => d.commanders.some(c => c.id === commanderId))
      if (!deck) return null
      return deck.commanders.find(c => c.id === commanderId)
    })
    .filter(Boolean)

  if (commanders.length === 0) return null

  return (
    <div className="flex gap-2 flex-wrap">
      {commanders.map(commander => (
        <div key={commander?.id} className="relative" title={`${commander?.name} - ${commander?.type}`}>
          <img
            src={commander?.image || ''}
            alt={commander?.name || 'Commander'}
            className="w-8 h-8 rounded border object-cover"
          />

          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {commanderDamageActions
              .filter(action => (action as LifeChangeAction).commanderId === commander?.id)
              .reduce((total, action) => total + Math.abs((action as LifeChangeAction).value), 0)}
          </div>
        </div>
      ))}
    </div>
  )
}
