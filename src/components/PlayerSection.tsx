import { DateTime } from 'luxon'
import React, { useCallback, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useDecks } from '../hooks/useDecks'
import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'
import { DeckForm } from './DeckForm'
import { UserForm } from './UserForm'
import DeckSelectionModal from './player/DeckSelectionModal'
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
  const [pendingLifeChanges, setPendingLifeChanges] = useState<number>(0)

  // Debouncing for life changes
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingLifeChangesRef = useRef<number>(0)

  const game = games.find(g => g.id === gameId)

  const commitLifeChanges = useCallback(() => {
    if (!game || pendingLifeChangesRef.current === 0) return

    const fromId = getCurrentActivePlayer() || playerId

    const newAction: LifeChangeAction = {
      id: uuidv4(),
      createdAt: DateTime.now().toJSDate(),
      type: 'life-change',
      value: pendingLifeChangesRef.current,
      from: fromId,
      to: [playerId]
    }

    updateGame(game.id, prevGame => ({
      actions: [...prevGame.actions, newAction]
    }))

    pendingLifeChangesRef.current = 0
    setPendingLifeChanges(0)
  }, [game, playerId, updateGame, getCurrentActivePlayer])

  if (!game) return <div>Game not found</div>

  const player = game.players.find(p => p.id === playerId)

  if (!player) return <div>Player not found</div>

  const calculateLifeFromActions = (playerId: string) => {
    const player = game.players.find(p => p.id === playerId)

    if (!player) return 0

    let life = player.life

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
  const displayLife = currentLife + pendingLifeChanges

  const handleLifeChange = (value: number) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    pendingLifeChangesRef.current += value
    setPendingLifeChanges(prev => prev + value)
    debounceTimeoutRef.current = setTimeout(() => {
      commitLifeChanges()
    }, 1500)
  }

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

  const sortedDecks = [...decks].sort((a, b) => {
    if (
      a.createdBy === game.players.find(p => p.id === playerId)?.userId &&
      b.createdBy !== game.players.find(p => p.id === playerId)?.userId
    )
      return -1

    if (
      a.createdBy !== game.players.find(p => p.id === playerId)?.userId &&
      b.createdBy === game.players.find(p => p.id === playerId)?.userId
    )
      return 1

    return 0
  })

  const gameIsActive = game.state === 'active'
  const currentActivePlayer = getCurrentActivePlayer()

  // Get player's deck and commander image
  const playerDeck = player.deckId ? decks.find(d => d.id === player.deckId) : null
  const commanderImage = playerDeck?.commanders?.[0]?.image

  return (
    <div data-testid={playerId} className="PlayerSection flex-1 flex flex-col p-6 relative overflow-clip">
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

      <div
        className={`PlayerSectionContent flex-1 relative flex flex-col items-center justify-center gap-1 rounded-3xl ${
          currentActivePlayer === playerId ? 'outline-8 outline-blue-800' : ''
        }`}
      >
        <p className="text-white font-medium text-center">{getUserName(player.userId)}</p>

        {gameIsActive && (
          <PlayerLifeControls
            playerId={playerId}
            displayLife={displayLife}
            pendingLifeChanges={pendingLifeChanges}
            onLifeChange={handleLifeChange}
          />
        )}

        {!gameIsActive && (
          <>
            <PlayerUserSelector
              player={player}
              getUserName={getUserName}
              onShowUserSelect={() => setShowUserSelect(true)}
              onRemoveUser={() => handleUserSelect(null)}
            />

            <PlayerDeckSelector
              player={player}
              onShowDeckSelect={() => setShowDeckSelect(true)}
              onRemoveDeck={() => handleDeckSelect(null)}
            />

            <UserSelectionModal
              isOpen={showUserSelect}
              onClose={() => setShowUserSelect(false)}
              game={game}
              onSelect={handleUserSelect}
              onCreateUser={() => setShowUserForm(true)}
            />

            <DeckSelectionModal
              isOpen={showDeckSelect}
              onClose={() => setShowDeckSelect(false)}
              sortedDecks={sortedDecks}
              onSelect={handleDeckSelect}
              onCreateDeck={() => setShowDeckForm(true)}
            />

            {/* Deck Form Modal */}
            {showDeckForm && (
              <DeckForm
                userId={playerId}
                onSave={(deckId: string) => {
                  handleDeckSelect(deckId)
                  setShowDeckForm(false)
                }}
                onCancel={() => setShowDeckForm(false)}
              />
            )}

            {/* User Form Modal */}
            {showUserForm && <UserForm onSave={handleUserSelect} onCancel={() => setShowUserForm(false)} />}
          </>
        )}
      </div>
    </div>
  )
}
