import { HeartIcon, UserIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGames } from '../hooks/useGames'
import { cn } from '../utils/cn'
import { Button } from './Button'

interface GameFormProps extends React.HTMLAttributes<HTMLFormElement> {
  gameId?: Game['id']
  onSave: (gameId: string) => void
  onCancel: () => void
  onPlayerCountChange?: (count: number) => void
}

export const GameForm: React.FC<GameFormProps> = ({ gameId, onSave, onCancel, onPlayerCountChange, ...props }) => {
  const { games, updateGame, addGame } = useGames()
  const game = games.find(g => g.id === gameId)

  const [numberOfPlayers, setNumberOfPlayers] = useState<number>(game?.players.length || 4)
  const [turnTracking, setTurnTracking] = useState<boolean>(game?.turnTracking ?? true)
  const [startingLife, setStartingLife] = useState<number>(game?.startingLife || 40)
  const [hasUserChangedLife, setHasUserChangedLife] = useState<boolean>(false)
  const [commanders, setCommanders] = useState<boolean>(game?.commanders ?? true)

  // Auto-adjust starting life based on player count (only if user hasn't manually changed it)
  useEffect(() => {
    if (!hasUserChangedLife && numberOfPlayers >= 3) setStartingLife(40)
    else if (!hasUserChangedLife && numberOfPlayers < 3) setStartingLife(20)
  }, [numberOfPlayers, hasUserChangedLife])

  // Notify parent component of player count changes
  useEffect(() => {
    onPlayerCountChange?.(numberOfPlayers)
  }, [numberOfPlayers, onPlayerCountChange])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (numberOfPlayers === 0) return

    // If editing existing game, preserve existing players and their assignments
    if (game) {
      let updatedPlayers: Player[]

      if (numberOfPlayers > game.players.length) {
        // Add new players
        const newPlayers = Array.from({ length: numberOfPlayers - game.players.length }, (_, index) => ({
          id: `player-${game.players.length + index + 1}`,
          userId: null,
          deckId: null
        }))
        updatedPlayers = [...game.players, ...newPlayers]
      } else if (numberOfPlayers < game.players.length) {
        // Remove players from the end
        updatedPlayers = game.players.slice(0, numberOfPlayers)
      } else {
        // Same number of players, just update life
        updatedPlayers = game.players
      }

      updateGame(game.id, {
        players: updatedPlayers,
        turnTracking,
        startingLife,
        commanders
      })

      onSave(game.id)
    } else {
      const newGameId = addGame({
        players: Array.from({ length: numberOfPlayers }, (_, index) => ({
          id: `player-${index + 1}`,
          userId: null,
          deckId: null
        })),
        turnTracking,
        startingLife,
        commanders
      })

      // If turn tracking is disabled, automatically start the game
      if (!turnTracking) {
        updateGame(newGameId, { state: 'active' })
      }

      onSave(newGameId)
    }
  }

  const handleLifeChange = (value: number) => {
    setStartingLife(value)
    setHasUserChangedLife(true)
  }

  const isValidGameSetup = () => {
    if (numberOfPlayers < 1 || numberOfPlayers > 6) return false
    if (startingLife < 1 || startingLife > 999) return false
    return true
  }

  const isEditMode = !!game

  return (
    <form className={cn('flex flex-col items-center gap-6', props.className)} onSubmit={handleSubmit}>
      {/* Section 1: Number of Players */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6].map(count => (
          <Button
            key={count}
            type="button"
            variant={numberOfPlayers === count ? 'primary' : 'secondary'}
            onClick={() => setNumberOfPlayers(count)}
          >
            {count} <UserIcon className="w-4 h-4" />
          </Button>
        ))}
      </div>

      {/* Section 2: Starting Life */}
      <div className="flex gap-2 items-center">
        <Button type="button" variant="secondary" onClick={() => handleLifeChange(startingLife - 5)}>
          -
        </Button>

        <div className="relative">
          <Input
            type="number"
            min="1"
            max="999"
            value={startingLife}
            onChange={e => handleLifeChange(Number.parseInt(e.target.value, 10) || 0)}
            className="hide-number-arrows w-24 pr-8 text-center"
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 transform">
            <HeartIcon className="w-4 h-4 text-slate-400" />
          </span>
        </div>

        <Button type="button" variant="secondary" onClick={() => handleLifeChange(startingLife + 5)}>
          +
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {/* Section 3: Commander Game */}
        <Label className="flex cursor-pointer items-center gap-2 text-slate-200">
          <Checkbox checked={commanders} onCheckedChange={checked => setCommanders(checked === true)} />
          Commander
        </Label>

        {/* Section 4: Tracking Type */}
        <Label className="flex cursor-pointer items-center gap-2 text-slate-200">
          <Checkbox checked={turnTracking} onCheckedChange={checked => setTurnTracking(checked === true)} />
          Turn tracking
        </Label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="primary" disabled={!isValidGameSetup()}>
          {isEditMode ? 'Save' : 'Create'}
        </Button>

        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
