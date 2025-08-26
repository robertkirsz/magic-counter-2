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
      if (turnActions[i].to === null) {
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

    // Initialize with starting life values (typically 40 for Commander)
    game.players.forEach((player: Player) => {
      finalLifeValues[player.id] = 40 // Default starting life
    })

    // Process all life change actions to calculate final values
    game.actions.forEach((action: LifeChangeAction | TurnChangeAction | MonarchChangeAction) => {
      if (action.type === 'life-change' && action.to) {
        action.to.forEach((playerId: string) => {
          if (finalLifeValues[playerId] !== undefined) {
            finalLifeValues[playerId] += action.value
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
          color: 'bg-yellow-900/20 text-yellow-300 border-yellow-700',
          duration: null
        }
      case 'active':
        return {
          label: 'ACTIVE',
          color: 'bg-green-900/20 text-green-300 border-green-700 animate-pulse',
          duration: duration
        }
      case 'finished':
        return {
          label: 'FINISHED',
          color: 'bg-slate-800 text-slate-200 border-slate-700',
          duration: duration
        }
      default:
        return {
          label: 'UNKNOWN',
          color: 'bg-red-900/20 text-red-300 border-red-700',
          duration: null
        }
    }
  }

  const stateDisplay = getGameStateDisplay(game)

  return (
    <div className="flex flex-col gap-2 p-2 bg-slate-800 rounded-lg border border-slate-700 shadow-sm overflow-hidden">
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
              <div className="flex items-center gap-1 text-slate-400">
                <Clock size={14} />
                {stateDisplay.duration}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{DateTime.fromJSDate(game.createdAt).toFormat('MMM dd, HH:mm')}</span>
            </div>

            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{game.players.length}</span>
            </div>

            {game.turnTracking && (
              <div className="flex items-center gap-1 text-blue-400">
                <Clock size={14} />
              </div>
            )}

            {game.state === 'finished' && game.winner && game.winCondition && (
              <div className="flex items-center gap-1 text-yellow-400">
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
            className="px-3 py-1 text-sm bg-blue-900/20 hover:bg-blue-900/30 text-blue-300 rounded border border-blue-700 transition-colors"
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
              <div key={player.id} className="flex items-start gap-2 p-2 bg-slate-700/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-slate-100">{getPlayerName(player.userId)}</span>

                    <span className="text-sm text-slate-400">(Life: {finalLife})</span>
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
              className="flex items-center gap-2 w-full p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              {chartsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span className="font-medium text-slate-100">Charts & Analytics</span>
            </button>

            {chartsExpanded && (
              <Suspense
                fallback={
                  <div className="mt-3 p-3 rounded-lg border border-slate-700 bg-slate-800 text-slate-400">
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
