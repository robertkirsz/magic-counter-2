import { SwordsIcon } from 'lucide-react'
import { DateTime } from 'luxon'
import React, { useState } from 'react'

import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'
import { ActionsList } from './ActionsList'
import { DamageChart } from './DamageChart'
import { Deck } from './Deck'
import { LifeChart } from './LifeChart'
import { RoundDurationChart } from './RoundDurationChart'
import { ThreeDotMenu } from './ThreeDotMenu'

export const Games: React.FC = () => {
  const { games, removeGame } = useGames()
  const { users } = useUsers()
  const [expandedGame, setExpandedGame] = useState<string | null>(null)

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
    game.actions.forEach((action: LifeChangeAction | TurnChangeAction) => {
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

  // Get game state display
  const getGameStateDisplay = (game: Game) => {
    const duration = getGameDuration(game)

    switch (game.state) {
      case 'setup':
        return {
          label: 'SETUP',
          color:
            'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700',
          icon: '⚙️',
          duration: null
        }
      case 'active':
        return {
          label: 'ACTIVE',
          color:
            'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700 animate-pulse',
          icon: '▶️',
          duration: duration
        }
      case 'finished':
        return {
          label: 'FINISHED',
          color:
            'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700',
          icon: '🏁',
          duration: duration
        }
      default:
        return {
          label: 'UNKNOWN',
          color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700',
          icon: '❓',
          duration: null
        }
    }
  }

  const hasGames = games.length > 0

  return (
    <div className="flex flex-col gap-6">
      {hasGames && (
        <div className="grid gap-6">
          {games.map(game => {
            const stateDisplay = getGameStateDisplay(game)
            const isExpanded = expandedGame === game.id

            return (
              <div
                key={game.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
              >
                {/* Game Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{stateDisplay.icon}</span>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${stateDisplay.color}`}>
                          {stateDisplay.label}
                        </span>

                        {stateDisplay.duration && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                            {stateDisplay.duration}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>Created {DateTime.fromJSDate(game.createdAt).toFormat('MMM dd, yyyy HH:mm')}</span>
                        <span>•</span>
                        <span>{game.players.length} players</span>

                        {game.turnTracking && (
                          <>
                            <span>•</span>
                            <span>Turn tracking enabled</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => setExpandedGame(isExpanded ? null : game.id)}
                          className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-700 transition-colors"
                        >
                          {isExpanded ? 'Hide Actions' : 'Show Actions'}
                        </button>

                        <ThreeDotMenu onRemove={() => removeGame(game.id)} asMenu={false} />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {/* Players and Decks */}
                      <div className="flex flex-wrap gap-4">
                        {game.players.map(player => {
                          const finalLifeValues = getFinalLifeValues(game)
                          const finalLife = finalLifeValues[player.id]

                          return (
                            <div
                              key={player.id}
                              className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {getPlayerName(player.userId)}
                                  </span>

                                  <span className="text-sm text-gray-500 dark:text-gray-400">(Life: {finalLife})</span>
                                </div>

                                {player.deckId && (
                                  <Deck id={player.deckId} showCreator={false} className="text-sm" showStats={false} />
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {game.actions.length > 0 && <LifeChart gameId={game.id} />}
                      {game.actions.length > 0 && <DamageChart gameId={game.id} />}
                      {game.actions.length > 0 && <RoundDurationChart gameId={game.id} />}
                    </div>
                  </div>
                </div>

                {/* Actions Section */}
                {isExpanded && (
                  <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Game Actions</h4>
                    <ActionsList gameId={game.id} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!hasGames && (
        <div className="flex flex-col items-center justify-center text-center">
          <SwordsIcon size={48} className="text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No games yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Create your first game to get started</p>
        </div>
      )}
    </div>
  )
}
