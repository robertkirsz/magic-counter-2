import React from 'react'

import { useDecks } from '../hooks/useDecks'
import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'
import { Modal } from './Modal'
import PlayerLifeControls from './player/PlayerLifeControls'

interface AttackModalProps {
  isOpen: boolean
  onClose: () => void
  attackerId: string
  targetId: string
  gameId: string
  currentLife: number
}

export const AttackModal: React.FC<AttackModalProps> = ({
  isOpen,
  onClose,
  attackerId,
  targetId,
  gameId,
  currentLife
}) => {
  const { games } = useGames()
  const { users } = useUsers()
  const { decks } = useDecks()

  const game = games.find(g => g.id === gameId)
  if (!game) return null

  const attacker = game.players.find(p => p.id === attackerId)
  const target = game.players.find(p => p.id === targetId)

  // Get attacker's deck and commander information
  const attackerDeck = attacker?.deckId ? decks.find(d => d.id === attacker.deckId) : null
  const attackerCommanderId = attackerDeck?.commanders?.[0]?.id

  const getUserName = (userId: string | null) => {
    if (!userId) return 'Unknown User'
    const user = users.find(u => u.id === userId)
    return user?.name || 'Unknown User'
  }

  const attackerName = attacker ? getUserName(attacker.userId) : 'Unknown Attacker'
  const targetName = target ? getUserName(target.userId) : 'Unknown Target'

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <p className="text-sm text-slate-400">
            <span className="font-medium text-red-500">{attackerName}</span> is attacking{' '}
            <span className="font-medium text-blue-500">{targetName}</span>
          </p>
        </div>

        <div className="w-full">
          <PlayerLifeControls
            from={attackerId}
            to={[targetId]}
            gameId={gameId}
            currentLife={currentLife}
            attackMode
            commanderId={attackerCommanderId}
            testId="attack-modal"
          />
        </div>
      </div>
    </Modal>
  )
}
