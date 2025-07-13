import React, { useEffect, useState } from 'react'

interface GameFormProps {
  game?: Game
  onSave: (data: { players: Player[]; tracking: Game['tracking'] }) => void
  onCancel: () => void
}

export const GameForm: React.FC<GameFormProps> = ({ game, onSave, onCancel }) => {
  const [numberOfPlayers, setNumberOfPlayers] = useState<number>(game?.players.length || 4)
  const [customPlayerCount, setCustomPlayerCount] = useState<number>(game?.players.length || 4)
  const [tracking, setTracking] = useState<'full' | 'simple' | 'none'>(game?.tracking || 'none')
  const [startingLife, setStartingLife] = useState<number>(game?.players[0]?.life || 40)
  const [hasUserChangedLife, setHasUserChangedLife] = useState<boolean>(false)

  // Auto-adjust starting life based on player count (only if user hasn't manually changed it)
  useEffect(() => {
    if (!hasUserChangedLife && numberOfPlayers >= 3) {
      setStartingLife(40)
    } else if (!hasUserChangedLife && numberOfPlayers < 3) {
      setStartingLife(20)
    }
  }, [numberOfPlayers, hasUserChangedLife])

  const handlePlayerCountSelect = (count: number) => {
    setNumberOfPlayers(count)
  }

  const handleCustomPlayerCount = (count: number) => {
    setCustomPlayerCount(count)
    setNumberOfPlayers(count)
  }

  const handleSave = () => {
    if (numberOfPlayers > 0) {
      // If editing existing game, preserve existing players and their assignments
      if (game) {
        let updatedPlayers: Player[]

        if (numberOfPlayers > game.players.length) {
          // Add new players
          const newPlayers = Array.from({ length: numberOfPlayers - game.players.length }, (_, index) => ({
            id: `player-${game.players.length + index + 1}`,
            userId: null,
            deckId: null,
            life: startingLife
          }))
          updatedPlayers = [...game.players, ...newPlayers]
        } else if (numberOfPlayers < game.players.length) {
          // Remove players from the end
          updatedPlayers = game.players.slice(0, numberOfPlayers)
        } else {
          // Same number of players, just update life
          updatedPlayers = game.players
        }

        // Update life for all players
        updatedPlayers = updatedPlayers.map(player => ({
          ...player,
          life: startingLife
        }))

        onSave({
          players: updatedPlayers,
          tracking
        })
      } else {
        // Creating new game
        onSave({
          players: Array.from({ length: numberOfPlayers }, (_, index) => ({
            id: `player-${index + 1}`,
            userId: null,
            deckId: null,
            life: startingLife
          })),
          tracking
        })
      }
    }
  }

  // Validation: Check if number of players is set and tracking is selected
  const isValidGameSetup = () => {
    return numberOfPlayers > 0
  }

  const isEditMode = !!game

  return (
    <>
      <div className="space-y-6">
        {/* Section 1: Number of Players */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Number of Players</h3>

          {/* Predefined buttons */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[2, 3, 4].map(count => (
              <button
                key={count}
                onClick={() => handlePlayerCountSelect(count)}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition ${
                  numberOfPlayers === count ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {count} Players
              </button>
            ))}

            {/* Custom input */}
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="1"
                max="10"
                value={customPlayerCount}
                placeholder="Other"
                onChange={e => handleCustomPlayerCount(parseInt(e.target.value) || 1)}
                className="w-full p-2 border border-gray-300 rounded text-center"
              />
            </div>
          </div>

          {isEditMode && numberOfPlayers < game.players.length && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Warning: Reducing players from {game.players.length} to {numberOfPlayers}. Players will be removed from
                the end of the list.
              </p>
            </div>
          )}
        </div>

        {/* Section 2: Starting Life */}
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

        {/* Section 3: Tracking Type */}
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
        {!isValidGameSetup() && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">Please select the number of players to continue</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            disabled={!isValidGameSetup()}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isEditMode ? 'Save Changes' : 'Create Game'}
          </button>

          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}
