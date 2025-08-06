import { useDroppable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import React, { useState } from 'react'

import { useDecks } from '../hooks/useDecks'
import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'
import { cn } from '../utils/cn'
import { useSwordAttackListener } from '../utils/eventDispatcher'
import { isPlayerEliminated } from '../utils/gameUtils'
import { AttackModal } from './AttackModal'
import { Button } from './Button'
import { CommanderDamage } from './CommanderDamage'
import { DeckForm } from './DeckForm'
import { Decks } from './Decks'
import { DraggableSword } from './DraggableSword'
import { Modal } from './Modal'
import { UserForm } from './UserForm'
import PlayerDeckSelector from './player/PlayerDeckSelector'
import PlayerLifeControls from './player/PlayerLifeControls'
import PlayerUserSelector from './player/PlayerUserSelector'
import UserSelectionModal from './player/UserSelectionModal'

interface PlayerSectionProps {
  gameId: Game['id']
  playerId: Player['id']
}

export const PlayerSection: React.FC<PlayerSectionProps> = ({ gameId, playerId }) => {
  const { users } = useUsers()
  const { decks } = useDecks()
  const { games, updateGame, getCurrentActivePlayer } = useGames()
  const [showUserSelect, setShowUserSelect] = useState<boolean>(false)
  const [showDeckSelect, setShowDeckSelect] = useState<boolean>(false)
  const [showDeckForm, setShowDeckForm] = useState<boolean>(false)
  const [showUserForm, setShowUserForm] = useState<boolean>(false)
  const [showAttackModal, setShowAttackModal] = useState<boolean>(false)
  const [attackData, setAttackData] = useState<{ attackerId: string; targetId: string } | null>(null)

  const activePlayerId = getCurrentActivePlayer(gameId)

  const { setNodeRef, isOver } = useDroppable({
    id: `player-drop-${playerId}`,
    data: {
      type: 'player',
      playerId
    }
  })

  useSwordAttackListener(
    event => {
      const { attackerId, targetId } = event.detail

      if (targetId === playerId) {
        setAttackData({ attackerId, targetId })
        setShowAttackModal(true)
      }
    },
    [playerId]
  )

  const game = games.find(g => g.id === gameId)

  if (!game) return <div>Game not found</div>

  const player = game.players.find(p => p.id === playerId)

  if (!player) return <div>Player not found</div>

  const calculateLifeFromActions = (playerId: string) => {
    const player = game.players.find(p => p.id === playerId)

    if (!player) return 0

    let life = game.startingLife

    game.actions.forEach(action => {
      if (action.type === 'life-change') {
        if (action.to?.includes(playerId)) {
          life += action.value
        }
      }
    })

    return life
  }

  const currentLife = calculateLifeFromActions(playerId)
  const isEliminated = isPlayerEliminated(game, playerId)

  const handleUserSelect = (userId: string | null) => {
    updateGame(game.id, {
      players: game.players.map(p => (p.id === playerId ? { ...p, userId } : p))
    })
    setShowUserSelect(false)
  }

  const handleDeckSelect = (deckId: string | null) => {
    updateGame(game.id, {
      players: game.players.map(p => (p.id === playerId ? { ...p, deckId } : p))
    })
    setShowDeckSelect(false)
  }

  const getUserName = (userId: string | null) => {
    if (!userId) return 'Unknown User'

    const user = users.find(u => u.id === userId)

    return user?.name || 'Unknown User'
  }

  const gameIsActive = game.state === 'active'

  // Get player's deck and commander image
  const playerDeck = player.deckId ? decks.find(d => d.id === player.deckId) : null
  const commanderImage = playerDeck?.commanders?.[0]?.image

  const activePlayerDeck = game.players.find(p => p.id === activePlayerId)?.deckId
    ? decks.find(d => d.id === game.players.find(p => p.id === activePlayerId)?.deckId)
    : null

  const activePlayerCommanderId = activePlayerDeck?.commanders?.[0]?.id

  return (
    <div
      ref={setNodeRef}
      data-testid={playerId}
      className={cn(
        'PlayerSection flex-1 flex flex-col p-2 relative overflow-clip',
        isOver && 'ring-2 ring-red-500 ring-opacity-50',
        isEliminated && 'eliminated'
      )}
    >
      {/* Background image with effects */}
      {commanderImage && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${commanderImage})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'black',
            filter: 'brightness(0.25) blur(6px)'
          }}
        />
      )}

      {/* Elimination overlay */}
      {isEliminated && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-red-500 text-4xl font-bold mb-2">ELIMINATED</div>
            <div className="text-gray-300 text-sm">{currentLife < 1 ? 'Life: Below 1' : 'Commander damage: 21+'}</div>
          </div>
        </div>
      )}

      <div
        className={cn(
          'PlayerSectionContent hiddenWhenDragEnabled flex-1 relative flex flex-col gap-1 items-center justify-center',
          activePlayerId === playerId && 'outline-4 outline-blue-800'
        )}
      >
        {gameIsActive && <p className="text-xl font-bold text-white">{getUserName(player.userId)}</p>}

        {gameIsActive && (
          <PlayerLifeControls
            from={activePlayerId}
            to={[playerId]}
            gameId={gameId}
            currentLife={currentLife}
            commanderId={activePlayerCommanderId}
          />
        )}

        <div className="flex justify-center items-center gap-1">
          {gameIsActive && <DraggableSword playerId={playerId} gameId={gameId} />}
          <CommanderDamage gameId={gameId} playerId={playerId} />
        </div>

        {!gameIsActive && (
          <>
            <PlayerUserSelector
              player={player}
              getUserName={getUserName}
              onShowUserSelect={() => setShowUserSelect(true)}
              onRemoveUser={() => handleUserSelect(null)}
            />

            <UserSelectionModal
              isOpen={showUserSelect}
              onClose={() => setShowUserSelect(false)}
              game={game}
              onSelect={handleUserSelect}
              onCreateUser={() => setShowUserForm(true)}
            />

            {/* User Form Modal */}
            <Modal isOpen={showUserForm} title="Add User" onClose={() => setShowUserForm(false)}>
              <UserForm
                onSave={userId => {
                  handleUserSelect(userId)
                  setShowUserForm(false)
                }}
                onCancel={() => setShowUserForm(false)}
              />
            </Modal>

            <PlayerDeckSelector
              player={player}
              onShowDeckSelect={() => setShowDeckSelect(true)}
              onRemoveDeck={() => handleDeckSelect(null)}
            />

            {/* TODO: do similar treatment to users section */}
            {/* Deck Selection Modal */}
            <Modal fullSize isOpen={showDeckSelect} onClose={() => setShowDeckSelect(false)} title="Choose Deck">
              <Decks userId={player.userId || undefined} onDeckClick={handleDeckSelect} />

              {/* Floating Add Deck Button */}
              <Button
                data-testid="decks-add"
                variant="primary"
                round
                className="absolute bottom-3 right-3 shadow-lg z-10"
                onClick={() => setShowDeckForm(true)}
              >
                <Plus size={36} />
              </Button>

              {/* Deck Form Modal */}
              <Modal isOpen={showDeckForm} title="Add Deck" onClose={() => setShowDeckForm(false)}>
                <DeckForm
                  userId={player.userId}
                  onSave={(deckId: string) => {
                    handleDeckSelect(deckId)
                    setShowDeckForm(false)
                  }}
                  onCancel={() => setShowDeckForm(false)}
                />
              </Modal>
            </Modal>
          </>
        )}
      </div>

      {/* Attack Modal */}
      {showAttackModal && attackData && (
        <AttackModal
          isOpen={showAttackModal}
          onClose={() => {
            setShowAttackModal(false)
            setAttackData(null)
          }}
          attackerId={attackData.attackerId}
          targetId={attackData.targetId}
          gameId={gameId}
          currentLife={currentLife}
        />
      )}
    </div>
  )
}
