import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useDecks } from '../hooks/useDecks'
import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'
import { Deck } from './Deck'
import { DeckForm } from './DeckForm'
import { Modal } from './Modal'
import { ThreeDotMenu } from './ThreeDotMenu'
import { UserForm } from './UserForm'

interface PlayerSectionProps {
  gameId: Game['id']
  playerId: Player['id']
}

export const PlayerSection: React.FC<PlayerSectionProps> = ({ gameId, playerId }) => {
  const { users } = useUsers()
  const { decks } = useDecks()
  const { games, updateGame } = useGames()
  const [showUserSelect, setShowUserSelect] = useState<boolean>(false)
  const [showDeckSelect, setShowDeckSelect] = useState<boolean>(false)
  const [showDeckForm, setShowDeckForm] = useState<boolean>(false)
  const [showUserForm, setShowUserForm] = useState<boolean>(false)

  const game = games.find(g => g.id === gameId)

  if (!game) return <div>Game not found</div>

  const player = game.players.find(p => p.id === playerId)

  if (!player) return <div>Player not found</div>

  // Calculate current life from actions
  const calculateLifeFromActions = (playerId: string) => {
    const player = game.players.find(p => p.id === playerId)
    if (!player) return 0

    let life = player.life // Start with initial life

    // Apply all life change actions for this player
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

  const handleLifeChange = (value: number) => {
    const newAction: LifeChangeAction = {
      id: uuidv4(),
      createdAt: new Date(),
      type: 'life-change',
      value,
      from: playerId,
      to: [playerId]
    }

    updateGame(game.id, {
      actions: [...game.actions, newAction]
    })
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

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.name || 'Unknown User'
  }

  // Sort decks: user's decks first, then others
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

  if (gameIsActive) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 border border-gray-200 rounded-lg p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleLifeChange(-1)}
            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            -
          </button>
          <div className="text-xl font-bold">{currentLife}</div>
          <button
            onClick={() => handleLifeChange(1)}
            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            +
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-1 border border-gray-200 rounded-lg p-2">
      {player.userId && (
        <div className="flex items-center gap-1">
          <button onClick={() => setShowUserSelect(true)}>
            <h1 className="text-lg font-bold">{getUserName(player.userId)}</h1>
          </button>
          <ThreeDotMenu onClose={() => handleUserSelect(null)} asMenu={false} />
        </div>
      )}

      {!player.userId && (
        <button onClick={() => setShowUserSelect(true)} className="bg-blue-500 text-white rounded-lg px-4 py-2">
          User
        </button>
      )}

      {player.deckId && (
        <div className="flex items-center gap-1">
          <button onClick={() => setShowDeckSelect(true)}>
            <Deck id={player.deckId} />
          </button>

          <ThreeDotMenu onClose={() => handleDeckSelect(null)} asMenu={false} />
        </div>
      )}

      {!player.deckId && (
        <button onClick={() => setShowDeckSelect(true)} className="bg-green-500 text-white rounded-lg px-4 py-2">
          Deck
        </button>
      )}

      {/* User Selection Modal */}
      {showUserSelect && (
        <Modal isOpen={showUserSelect} onClose={() => setShowUserSelect(false)} title="Select User">
          <div className="flex flex-col gap-2">
            {users.length > 0 ? (
              <div className="flex flex-col gap-2">
                {users
                  .filter(user => !game.players.some(p => p.userId === user.id))
                  .map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user.id)}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left"
                    >
                      <div className="font-medium">{user.name}</div>
                    </button>
                  ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No users available.</p>
            )}

            {users.filter(user => !game.players.some(p => p.userId === user.id)).length === 0 && users.length > 0 && (
              <p className="text-center text-gray-500">All users are already assigned to players.</p>
            )}

            <button
              onClick={() => setShowUserForm(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Create New User
            </button>
          </div>
        </Modal>
      )}

      {/* Deck Selection Modal */}
      {showDeckSelect && (
        <Modal isOpen={showDeckSelect} onClose={() => setShowDeckSelect(false)} title="Choose Deck">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Select a deck for this player:</p>
              <button
                onClick={() => setShowDeckForm(true)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Create New Deck
              </button>
            </div>

            {sortedDecks.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 items-start">
                {sortedDecks.map(deck => (
                  <button
                    key={deck.id}
                    onClick={() => handleDeckSelect(deck.id)}
                    className="text-left hover:bg-gray-50 transition p-2 rounded"
                  >
                    <Deck id={deck.id} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>No decks available.</p>
                <p className="text-sm">Create a new deck to get started.</p>
              </div>
            )}
          </div>
        </Modal>
      )}

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
      {showUserForm && (
        <UserForm
          onSave={(userId: string) => {
            handleUserSelect(userId)
            setShowUserForm(false)
          }}
          onCancel={() => setShowUserForm(false)}
        />
      )}
    </div>
  )
}
