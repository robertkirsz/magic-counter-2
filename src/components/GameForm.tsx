import React, { useState } from 'react'

import { useDecks } from '../contexts/DecksContext'
import { Deck } from './Deck'
import { DeckForm } from './DeckForm'
import { Modal } from './Modal'
import { UserForm } from './UserForm'

interface GameFormProps {
  game?: Game
  onSave: (data: { players: Player[]; tracking: Game['tracking'] }) => void
  onCancel: () => void
  users: Array<{ id: string; name: string }>
  addUser: (userData: { name: string }) => {
    id: string
    name: string
    createdAt: Date
  }
}

export const GameForm: React.FC<GameFormProps> = ({ game, onSave, onCancel, users, addUser }) => {
  const { decks, addDeck } = useDecks()
  const mode = game ? 'edit' : 'create'
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>(game?.players || [])
  const [tracking, setTracking] = useState<Game['tracking']>(game?.tracking || 'full')
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [isAddingDeck, setIsAddingDeck] = useState(false)
  const [selectedPlayerForDeck, setSelectedPlayerForDeck] = useState<number | null>(null)

  const handleAddNewUser = (userData: { name: string }) => {
    const newUser = addUser(userData)
    setSelectedPlayers(prev => [...prev, { userId: newUser.id, life: 40, deck: null }])
    setIsAddingUser(false)
  }

  const handleUserSelect = (userId: string) => {
    setSelectedPlayers(prev => {
      const existing = prev.find(p => p.userId === userId)

      if (existing) {
        return prev.filter(p => p.userId !== userId)
      } else {
        return [...prev, { userId, life: 40, deck: null }]
      }
    })
  }

  const handleDeckSelect = (playerIndex: number, deckId: string) => {
    setSelectedPlayers(prev =>
      prev.map((player, index) => (index === playerIndex ? { ...player, deck: deckId } : player))
    )
  }

  const handleCreateDeck = (deckData: { name: string; colors: ManaColor[]; commanders?: ScryfallCard[] }) => {
    // Get the user ID of the player for whom we're creating the deck
    const playerUserId = selectedPlayerForDeck !== null ? selectedPlayers[selectedPlayerForDeck].userId : undefined
    const newDeck = addDeck({ ...deckData, createdBy: playerUserId })

    if (selectedPlayerForDeck !== null) {
      handleDeckSelect(selectedPlayerForDeck, newDeck.id)
    }

    setIsAddingDeck(false)
    setSelectedPlayerForDeck(null)
  }

  const handleSave = () => {
    if (selectedPlayers.length > 0) {
      onSave({
        players: selectedPlayers,
        tracking
      })
    }
  }

  const getPlayerName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user ? user.name : 'Unknown'
  }

  return (
    <>
      <Modal isOpen={true} onClose={onCancel} title={mode === 'create' ? 'Add New Game' : 'Edit Game'}>
        {/* User Selection */}
        {users.length > 0 && (
          <div className="mb-4">
            <label className="block mb-2 font-medium">Select Existing Users:</label>

            <div className="grid grid-cols-2 gap-2 mb-3 max-h-32 overflow-y-auto">
              {users.map(user => (
                <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPlayers.some(p => p.userId === user.id)}
                    onChange={() => handleUserSelect(user.id)}
                    className="rounded"
                  />

                  <span className="text-sm">{user.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Add New User */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Add New User:</label>

          <button
            onClick={() => setIsAddingUser(true)}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Add New User
          </button>
        </div>

        {/* Selected Players with Deck Assignment */}
        {selectedPlayers.length > 0 && (
          <div className="mb-4">
            <label className="block mb-2 font-medium">Selected Players & Decks:</label>

            <div className="space-y-3">
              {selectedPlayers.map((player, index) => {
                const deck = decks.find(d => d.id === player.deck)
                return (
                  <div key={player.userId} className="p-3 border border-gray-200 rounded bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{getPlayerName(player.userId)}</span>

                      <button
                        onClick={() => {
                          setSelectedPlayerForDeck(index)
                          setIsAddingDeck(true)
                        }}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        Create New Deck
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium">Deck:</label>

                      <select
                        value={player.deck || ''}
                        onChange={e => handleDeckSelect(index, e.target.value)}
                        className="flex-1 p-1 text-sm border border-gray-300 rounded"
                      >
                        <option value="">No deck assigned</option>

                        {decks.map(deck => (
                          <option key={deck.id} value={deck.id}>
                            {deck.name} ({deck.colors.join(', ')}){deck.createdBy === player.userId ? ' (yours)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {deck && <Deck deck={deck} />}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tracking Selection */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Life Tracking:</label>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={`tracking-${mode}`}
                value="full"
                checked={tracking === 'full'}
                onChange={e => setTracking(e.target.value as 'full' | 'simple' | 'none')}
                className="rounded"
              />

              <span className="text-sm">
                <strong>Full</strong> - Track all life changes and game events
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={`tracking-${mode}`}
                value="simple"
                checked={tracking === 'simple'}
                onChange={e => setTracking(e.target.value as 'full' | 'simple' | 'none')}
                className="rounded"
              />

              <span className="text-sm">
                <strong>Simple</strong> - Track only current life totals (no turn tracking)
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={`tracking-${mode}`}
                value="none"
                checked={tracking === 'none'}
                onChange={e => setTracking(e.target.value as 'full' | 'simple' | 'none')}
                className="rounded"
              />

              <span className="text-sm">
                <strong>None</strong> - Game will not be tracked
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            {mode === 'create' ? 'Save Game' : 'Save Changes'}
          </button>

          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Add User Modal */}
      {isAddingUser && <UserForm onSave={handleAddNewUser} onCancel={() => setIsAddingUser(false)} />}

      {/* Add Deck Modal */}
      {isAddingDeck && (
        <DeckForm
          onSave={handleCreateDeck}
          onCancel={() => {
            setIsAddingDeck(false)
            setSelectedPlayerForDeck(null)
          }}
        />
      )}
    </>
  )
}
