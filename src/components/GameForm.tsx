import { HeartIcon, UserIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { useGames } from '../hooks/useGames'
import { cn } from '../utils/cn'
import { Button } from './Button'
import { Checkbox } from './ui/checkbox'
import { Input } from './ui/input'
import { Label } from './ui/label'

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

  useEffect(() => {
    if (!hasUserChangedLife && numberOfPlayers >= 3) setStartingLife(40)
    else if (!hasUserChangedLife && numberOfPlayers < 3) setStartingLife(20)
  }, [numberOfPlayers, hasUserChangedLife])

  useEffect(() => {
    onPlayerCountChange?.(numberOfPlayers)
  }, [numberOfPlayers, onPlayerCountChange])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (numberOfPlayers === 0) return

    if (game) {
      let updatedPlayers: Player[]

      if (numberOfPlayers > game.players.length) {
        const newPlayers = Array.from({ length: numberOfPlayers - game.players.length }, (_, index) => ({
          id: `player-${game.players.length + index + 1}`,
          userId: null,
          deckId: null
        }))
        updatedPlayers = [...game.players, ...newPlayers]
      } else if (numberOfPlayers < game.players.length) {
        updatedPlayers = game.players.slice(0, numberOfPlayers)
      } else {
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
      {/* Number of Players */}
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

      {/* Starting Life */}
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
            onChange={e => handleLifeChange(parseInt(e.target.value))}
            className="hide-number-arrows pr-8"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <HeartIcon className="w-4 h-4 text-muted-foreground" />
          </span>
        </div>

        <Button type="button" variant="secondary" onClick={() => handleLifeChange(startingLife + 5)}>
          +
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {/* Commander Game */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="commanders"
            checked={commanders}
            onCheckedChange={checked => setCommanders(checked === true)}
          />
          <Label htmlFor="commanders" className="cursor-pointer">
            Commander
          </Label>
        </div>

        {/* Turn Tracking */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="turnTracking"
            checked={turnTracking}
            onCheckedChange={checked => setTurnTracking(checked === true)}
          />
          <Label htmlFor="turnTracking" className="cursor-pointer">
            Turn tracking
          </Label>
        </div>
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
