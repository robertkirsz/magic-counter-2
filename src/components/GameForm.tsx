import React, { useEffect, useState } from 'react'

import { useDecks } from '../contexts/DecksContext'
import { Deck } from './Deck'
import { DeckForm } from './DeckForm'
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
  const [startingLife, setStartingLife] = useState<number>(20)
  const [hasUserChangedLife, setHasUserChangedLife] = useState<boolean>(false)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [isAddingDeck, setIsAddingDeck] = useState(false)
  const [selectedPlayerForDeck, setSelectedPlayerForDeck] = useState<number | null>(null)

  // Auto-adjust starting life based on player count (only if user hasn't manually changed it)
  useEffect(() => {
    if (!hasUserChangedLife) {
      if (selectedPlayers.length >= 3) {
        setStartingLife(40)
      } else {
        setStartingLife(20)
      }
    }
  }, [selectedPlayers.length, hasUserChangedLife])

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
      // Update all players with the current starting life value
      const playersWithLife = selectedPlayers.map(player => ({
        ...player,
        life: startingLife
      }))

      onSave({
        players: playersWithLife,
        tracking
      })
    }
  }

  const getUserById = (userId: string) => {
    return users.find(u => u.id === userId)
  }

  // Validation: Check if at least 2 players are selected and each has exactly one deck
  const isValidGameSetup = () => {
    if (selectedPlayers.length < 2) return false
    return selectedPlayers.every(player => player.deck !== null && player.deck !== '')
  }

  return (
    <>
      <div className="space-y-6">
        {/* Section 1: List of Users */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Select Players</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {users.map(user => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedPlayers.some(p => p.userId === user.id)}
                  onChange={() => handleUserSelect(user.id)}
                  className="rounded"
                />
                <div className="flex-1">
                  <span className="font-medium">{user.name}</span>
                </div>
              </div>
            ))}
            <button
              className="px-4 py-3 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
              onClick={() => setIsAddingUser(true)}
            >
              Add New User
            </button>
          </div>
        </div>

        {/* Section 2: Selected Users with Deck Assignment */}
        {selectedPlayers.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Selected Players & Decks</h3>
            <div className="space-y-4">
              {selectedPlayers.map((player, index) => {
                const user = getUserById(player.userId)
                const playerDecks = decks.filter(d => d.createdBy === player.userId)
                const otherDecks = decks.filter(d => d.createdBy !== player.userId)
                const allDecks = [...playerDecks, ...otherDecks]

                return (
                  <div key={player.userId} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">{user?.name || 'Unknown'}</h4>
                      <button
                        onClick={() => {
                          setSelectedPlayerForDeck(index)
                          setIsAddingDeck(true)
                        }}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        Create New Deck
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">Assigned Deck:</label>
                        <select
                          value={player.deck || ''}
                          onChange={e => handleDeckSelect(index, e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded"
                        >
                          <option value="">No deck assigned</option>
                          {allDecks.map(deck => (
                            <option key={deck.id} value={deck.id}>
                              {deck.name} ({deck.colors.join(', ')}){deck.createdBy === player.userId ? ' (yours)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      {player.deck && (
                        <div>
                          <Deck deck={decks.find(d => d.id === player.deck)!} />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Section 3: Starting Life */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Starting Life</h3>
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium">Starting Life:</label>
            <input
              type="number"
              min="1"
              max="999"
              value={startingLife}
              onChange={e => {
                setStartingLife(parseInt(e.target.value) || 20)
                setHasUserChangedLife(true)
              }}
              className="w-20 p-2 border border-gray-300 rounded text-center"
            />
            <span className="text-sm text-gray-600">life points</span>
          </div>
        </div>

        {/* Section 4: Tracking Type */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Life Tracking</h3>
          <div className="space-y-3">
            <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="tracking"
                value="full"
                checked={tracking === 'full'}
                onChange={e => setTracking(e.target.value as 'full' | 'simple' | 'none')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium">Full</div>
                <div className="text-sm text-gray-600">Track all life changes and game events</div>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="tracking"
                value="simple"
                checked={tracking === 'simple'}
                onChange={e => setTracking(e.target.value as 'full' | 'simple' | 'none')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium">Simple</div>
                <div className="text-sm text-gray-600">Track only current life totals (no turn tracking)</div>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="tracking"
                value="none"
                checked={tracking === 'none'}
                onChange={e => setTracking(e.target.value as 'full' | 'simple' | 'none')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium">None</div>
                <div className="text-sm text-gray-600">Game will not be tracked</div>
              </div>
            </label>
          </div>
        </div>

        {/* Validation Message */}
        {selectedPlayers.length > 0 && !isValidGameSetup() && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              {selectedPlayers.length < 2
                ? `Please select at least 2 players (currently ${selectedPlayers.length})`
                : 'Please assign a deck to each selected player'}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            disabled={!isValidGameSetup()}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {mode === 'create' ? 'Create Game' : 'Save Changes'}
          </button>

          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>

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
