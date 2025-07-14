import { HeartIcon, UserIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { useGames } from '../hooks/useGames'

interface GameFormProps {
  gameId?: Game['id']
  onSave: (gameId: string) => void
  onCancel: () => void
}

export const GameForm: React.FC<GameFormProps> = ({ gameId, onSave, onCancel }) => {
  const { games, updateGame, addGame } = useGames()
  const game = games.find(g => g.id === gameId)

  const [numberOfPlayers, setNumberOfPlayers] = useState<number>(game?.players.length || 4)
  const [turnTracking, setTurnTracking] = useState<boolean>(game?.turnTracking || false)
  const [startingLife, setStartingLife] = useState<number>(game?.players[0]?.life || 40)
  const [hasUserChangedLife, setHasUserChangedLife] = useState<boolean>(false)

  // Auto-adjust starting life based on player count (only if user hasn't manually changed it)
  useEffect(() => {
    if (!hasUserChangedLife && numberOfPlayers >= 3) setStartingLife(40)
    else if (!hasUserChangedLife && numberOfPlayers < 3) setStartingLife(20)
  }, [numberOfPlayers, hasUserChangedLife])

  const handleSave = () => {
    if (numberOfPlayers === 0) return

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

      updateGame(game.id, {
        players: updatedPlayers,
        turnTracking
      })

      onSave(game.id)
    } else {
      const newGameId = addGame({
        players: Array.from({ length: numberOfPlayers }, (_, index) => ({
          id: `player-${index + 1}`,
          userId: null,
          deckId: null,
          life: startingLife
        })),
        turnTracking
      })

      onSave(newGameId)
    }
  }

  const handleLifeChange = (value: number) => {
    setStartingLife(value)
    setHasUserChangedLife(true)
  }

  const isValidGameSetup = () => {
    if (numberOfPlayers < 2 || numberOfPlayers > 5) return false
    if (startingLife < 1 || startingLife > 999) return false
    return true
  }

  const isEditMode = !!game

  return (
    <>
      <div className="flex flex-col items-center gap-6">
        {/* Section 1: Number of Players */}
        <div className="grid grid-cols-4 gap-2">
          {[2, 3, 4, 5].map(count => (
            <button
              key={count}
              onClick={() => setNumberOfPlayers(count)}
              className={`px-4 py-3 flex items-center gap-1 text-sm font-medium rounded-lg transition ${
                numberOfPlayers === count
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {count} <UserIcon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Section 2: Starting Life */}
        <div className="flex gap-2 items-center">
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg transition-colors hover:bg-gray-300"
            onClick={() => handleLifeChange(startingLife - 1)}
          >
            -
          </button>

          <div className="relative">
            <input
              type="number"
              min="1"
              max="999"
              value={startingLife}
              onChange={e => handleLifeChange(parseInt(e.target.value))}
              className="px-4 py-2 bg-gray-200 rounded-lg pr-5 appearance-none hide-number-arrows transition-colors focus:bg-gray-100 hover:bg-gray-300"
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <HeartIcon className="w-4 h-4 text-gray-500" />
            </span>
          </div>

          <button
            className="px-4 py-2 bg-gray-200 rounded-lg transition-colors hover:bg-gray-300"
            onClick={() => handleLifeChange(startingLife + 1)}
          >
            +
          </button>
        </div>

        {/* Section 3: Tracking Type */}
        <div>
          <label className="flex gap-2 items-center cursor-pointer">
            <input type="checkbox" checked={turnTracking} onChange={() => setTurnTracking(!turnTracking)} />
            <span>Track turns</span>
          </label>
        </div>

        {/* Validation Message */}
        {!isValidGameSetup() && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">Please select the number of players to continue</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!isValidGameSetup()}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isEditMode ? 'Save' : 'Create'}
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
