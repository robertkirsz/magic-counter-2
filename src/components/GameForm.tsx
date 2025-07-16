import { HeartIcon, UserIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { useGames } from '../hooks/useGames'
import { Button } from './Button'

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
            <Button
              key={count}
              variant={numberOfPlayers === count ? 'primary' : 'secondary'}
              onClick={() => setNumberOfPlayers(count)}
            >
              {count} <UserIcon className="w-4 h-4" />
            </Button>
          ))}
        </div>

        {/* Section 2: Starting Life */}
        <div className="flex gap-2 items-center">
          <Button variant="secondary" onClick={() => handleLifeChange(startingLife - 5)}>
            -
          </Button>

          <div className="relative">
            <input
              type="number"
              min="1"
              max="999"
              value={startingLife}
              onChange={e => handleLifeChange(parseInt(e.target.value))}
              // TODO: match Button classes
              className="px-4 py-2 bg-gray-200 rounded-lg pr-5 appearance-none hide-number-arrows transition-colors focus:bg-gray-100 hover:bg-gray-300"
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <HeartIcon className="w-4 h-4 text-gray-500" />
            </span>
          </div>

          <Button variant="secondary" onClick={() => handleLifeChange(startingLife + 5)}>
            +
          </Button>
        </div>

        {/* Section 3: Tracking Type */}
        <div>
          <label className="flex gap-2 items-center cursor-pointer">
            <input type="checkbox" checked={turnTracking} onChange={() => setTurnTracking(!turnTracking)} />
            <span>Track turns</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="primary" disabled={!isValidGameSetup()} onClick={handleSave}>
            {isEditMode ? 'Save' : 'Create'}
          </Button>

          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </>
  )
}
