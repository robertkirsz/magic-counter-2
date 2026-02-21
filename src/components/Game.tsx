import { Calendar, ChevronDown, ChevronRight, Clock, Trophy, Users } from 'lucide-react'
import { DateTime } from 'luxon'
import React, { Suspense, useState } from 'react'

import { useUsers } from '../hooks/useUsers'
import { cn } from '../utils/cn'
import { ActionsList } from './ActionsList'
import { Deck } from './Deck'
import { Modal } from './Modal'
import { ThreeDotMenu } from './ThreeDotMenu'

const LifeChart = React.lazy(() => import('./LifeChart').then(m => ({ default: m.LifeChart })))
const DamageChart = React.lazy(() => import('./DamageChart').then(m => ({ default: m.DamageChart })))
const RoundDurationChart = React.lazy(() =>
  import('./RoundDurationChart').then(m => ({ default: m.RoundDurationChart }))
)

interface GameProps {
  game: Game
  onRemove: () => void
}

export const Game: React.FC<GameProps> = ({ game, onRemove }) => {
  const { users } = useUsers()
  const [actionsListVisible, setActionsListVisible] = useState(false)
  const [chartsExpanded, setChartsExpanded] = useState(false)

  // Calculate game duration
  const getGameDuration = (game: Game) => {
    const turnActions = game.actions.filter(action => action.type === 'turn-change') as TurnChangeAction[]

    if (turnActions.length === 0) return null

    const gameStartTime = DateTime.fromJSDate(turnActions[0].createdAt)
    let gameEndTime: DateTime | null = null

    // Find the last TurnChangeAction with to=null (game end)
    for (let i = turnActions.length - 1; i >= 0; i--) {
      if (!turnActions[i].to) {
        gameEndTime = DateTime.fromJSDate(turnActions[i].createdAt)
        break
      }
    }

    const endTime = gameEndTime || DateTime.now()
    const duration = endTime.diff(gameStartTime)

    const hours = Math.floor(duration.as('hours'))
    const minutes = Math.floor(duration.as('minutes')) % 60
    const seconds = Math.floor(duration.as('seconds')) % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  }

  // Get player name
  const getPlayerName = (playerId: string | null) => {
    if (!playerId) return 'Unknown'
    const user = users.find(u => u.id === playerId)
    return user?.name || 'Unknown'
  }

  // Calculate final life values for each player
  const getFinalLifeValues = (game: Game) => {
    const finalLifeValues: { [playerId: string]: number } = {}

    // Initialize with starting life values
    game.players.forEach((player: Player) => {
      finalLifeValues[player.id] = game.startingLife
    })

    // Process all life change actions to calculate final values
    game.actions.forEach((action: LifeChangeAction | TurnChangeAction | MonarchChangeAction) => {
      if (action.type === 'life-change' && action.to) {
        action.to.forEach((playerId: string) => {
          if (finalLifeValues[playerId] !== undefined) {
            // Poison damage does not reduce life, only adds poison counters
            if (!action.poison) {
              finalLifeValues[playerId] += action.value
            }
          }
        })
      }
    })

    return finalLifeValues
  }

  // Get win condition display text
  const getWinConditionDisplay = (winCondition: WinCondition) => {
    switch (winCondition) {
      case 'combat-damage':
        return 'Combat Damage'
      case 'commander-damage':
        return 'Commander Damage'
      case 'poison':
        return 'Poison'
      case 'mill':
        return 'Mill'
      case 'card-rule':
        return 'Card Rule'
      case 'other':
        return 'Other'
      default:
        return 'Unknown'
    }
  }

  // Get game state display
  const getGameStateDisplay = (game: Game) => {
    const duration = getGameDuration(game)

    switch (game.state) {
      case 'setup':
        return {
          label: 'SETUP',
          color: 'bg-warning/20 text-warning border-warning',
          duration: null
        }
      case 'active':
        return {
          label: 'ACTIVE',
          color: 'bg-success/20 text-success border-success animate-pulse',
          duration
        }
      case 'finished':
        return {
          label: 'FINISHED',
          color: 'bg-base-200 text-base-content/90 border-base-300',
          duration
        }
      default:
        return {
          label: 'UNKNOWN',
          color: 'bg-error/20 text-error border-error',
          duration: null
        }
    }
  }

  const stateDisplay = getGameStateDisplay(game)

  return (
    <div className="flex flex-col gap-2 p-2 bg-base-200 rounded-lg border border-base-300 shadow-sm overflow-hidden">
      {/* Game Header */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex flex-col items-center px-3 py-1 rounded-md text-xs font-semibold border',
              stateDisplay.color
            )}
          >
            {stateDisplay.label}

            {stateDisplay.duration && (
              <div className="flex items-center gap-1 text-base-content/70">
                <Clock size={14} />
                {stateDisplay.duration}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-base-content/70">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{DateTime.fromJSDate(game.createdAt).toFormat('MMM dd, HH:mm')}</span>
            </div>

            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{game.players.length}</span>
            </div>

            {game.turnTracking && (
              <div className="flex items-center gap-1 text-info">
                <Clock size={14} />
              </div>
            )}

            {game.state === 'finished' && game.winner && game.winCondition && (
              <div className="flex items-center gap-1 text-warning">
                <Trophy size={14} />
                <span>
                  {getPlayerName(game.winner)} - {getWinConditionDisplay(game.winCondition)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActionsListVisible(true)}
            className="px-3 py-1 text-sm bg-info/20 hover:bg-info/30 text-info rounded border border-info transition-colors"
          >
            Actions
          </button>

          <ThreeDotMenu onRemove={onRemove} asMenu={false} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Players and Decks */}
        <div className="flex flex-wrap gap-2">
          {game.players.map(player => {
            const finalLifeValues = getFinalLifeValues(game)
            const finalLife = finalLifeValues[player.id]

            return (
              <div key={player.id} className="flex items-start gap-2 flex-1 max-w-43 p-2 bg-base-300/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-base-content">{getPlayerName(player.userId)}</span>

                    <span className="text-sm text-base-content/70">(Life: {finalLife})</span>
                  </div>

                  {player.deckId && (
                    <Deck id={player.deckId} showCreator={false} className="text-sm" showStats={false} />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {game.actions.length > 0 && (
          <div className="w-full">
            <button
              onClick={() => setChartsExpanded(!chartsExpanded)}
              className="flex items-center gap-2 w-full p-3 bg-base-300 rounded-lg hover:bg-base-content/10 transition-colors"
            >
              {chartsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span className="font-medium text-base-content">Charts & Analytics</span>
            </button>

            {chartsExpanded && (
              <Suspense
                fallback={
                  <div className="mt-3 p-3 rounded-lg border border-base-300 bg-base-200 text-base-content/70">
                    Loading charts...
                  </div>
                }
              >
                <div className="mt-3 space-y-4">
                  <LifeChart gameId={game.id} />
                  <DamageChart gameId={game.id} />
                  <RoundDurationChart gameId={game.id} />
                </div>
              </Suspense>
            )}
          </div>
        )}
      </div>

      {/* Actions Modal */}
      <Modal isOpen={actionsListVisible} title="Game Actions" onClose={() => setActionsListVisible(false)} fullSize>
        <ActionsList gameId={game.id} />
      </Modal>
    </div>
  )
}
