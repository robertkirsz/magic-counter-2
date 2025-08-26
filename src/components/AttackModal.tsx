import React from 'react'

import { useDecks } from '../hooks/useDecks'
import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'
import { getCurrentMonarch } from '../utils/gameUtils'
import { generateId } from '../utils/idGenerator'
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
  const { games, dispatchAction } = useGames()
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

  const handleLifeCommitted = (action: LifeChangeAction) => {
    // Check if damage was dealt to the monarch
    if (action.value < 0) {
      // Damage was dealt
      const currentMonarch = getCurrentMonarch(game)
      const targetUserId = target?.userId

      if (currentMonarch === targetUserId && attacker?.userId) {
        // Monarch was dealt damage, steal the title
        const monarchChangeAction = {
          id: generateId(),
          createdAt: new Date(),
          type: 'monarch-change' as const,
          from: currentMonarch,
          to: attacker.userId
        }

        dispatchAction(gameId, monarchChangeAction)
      }
    }
  }

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
            onLifeCommitted={handleLifeCommitted}
          />
        </div>
      </div>
    </Modal>
  )
}
