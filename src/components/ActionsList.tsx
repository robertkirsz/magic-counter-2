import { CircleSlash } from 'lucide-react'
import { DateTime } from 'luxon'
import React from 'react'

import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'
import { ThreeDotMenu } from './ThreeDotMenu'

interface ActionsListProps {
  gameId: string
}

export const ActionsList: React.FC<ActionsListProps> = ({ gameId }) => {
  const { games, updateGame } = useGames()
  const { users } = useUsers()

  const game = games.find(g => g.id === gameId)

  if (!game) return null

  const safeToDateTime = (date: Date | string): DateTime => {
    if (typeof date === 'string') {
      return DateTime.fromISO(date)
    }
    return DateTime.fromJSDate(date)
  }

  const formatAction = (action: LifeChangeAction | TurnChangeAction) => {
    if (action.type === 'life-change') {
      const lifeGained = action.value > 0
      const fromSelf = action.from === action.to?.[0] && action.to?.length === 1
      const value = Math.abs(action.value)
      const from = getPlayerName(action.from)
      const to = action.to?.map(getPlayerName).join(', ')

      if (lifeGained) return `${from} gains ${value} life 💚`
      if (fromSelf && !lifeGained) return `${from} loses ${value} life 💔`
      if (!lifeGained) return `${from} deals ${value} damage to ${to} 💔`

      return 'Unknown message'
    } else if (action.type === 'turn-change') {
      if (action.to === null) return 'Game ended'

      const to = getPlayerName(action.to)

      if (to) return `${to}'s turn`

      return 'Unknown message'
    }

    return `${DateTime.now().toLocaleString()}: Unknown action`
  }

  const canDeleteAction = (actionId: string): boolean => {
    // Don't allow deleting actions in finished games
    if (game.state === 'finished') return false

    const action = game.actions.find(a => a.id === actionId)

    if (!action) return false

    // LifeChangeAction can always be deleted (in active games)
    if (action.type === 'life-change') return true

    // For TurnChangeAction, only the last one can be deleted (in active games)
    if (action.type === 'turn-change') {
      const turnChangeActions = game.actions.filter(a => a.type === 'turn-change')
      const lastTurnChangeAction = turnChangeActions[turnChangeActions.length - 1]
      return action.id === lastTurnChangeAction.id
    }

    return false
  }

  const groupActionsByTurns = () => {
    const groups: Array<{ turn: TurnChangeAction; lifeChanges: LifeChangeAction[] }> = []
    let currentTurn: TurnChangeAction | null = null
    let currentLifeChanges: LifeChangeAction[] = []

    game.actions.forEach(action => {
      if (action.type === 'turn-change') {
        // Save previous turn group if it exists
        if (currentTurn) {
          groups.push({ turn: currentTurn, lifeChanges: currentLifeChanges })
        }
        // Start new turn group
        currentTurn = action
        currentLifeChanges = []
      } else if (action.type === 'life-change' && currentTurn) {
        // Add life change to current turn
        currentLifeChanges.push(action)
      }
    })

    // Add the last turn group
    if (currentTurn) {
      groups.push({ turn: currentTurn, lifeChanges: currentLifeChanges })
    }

    return groups
  }

  const groupTurnsByRounds = () => {
    const turnGroups = groupActionsByTurns()
    const roundGroups: Array<{
      round: number
      turns: Array<{ turn: TurnChangeAction; lifeChanges: LifeChangeAction[] }>
    }> = []
    let currentRound = 1
    let currentTurns: Array<{ turn: TurnChangeAction; lifeChanges: LifeChangeAction[] }> = []
    let turnCount = 0

    turnGroups.forEach(turnGroup => {
      turnCount++
      // Only complete the round when all players have taken their turn
      if (turnCount % game.players.length === 0) {
        // Round complete - save current round and start next
        currentTurns.push(turnGroup)
        roundGroups.push({ round: currentRound, turns: currentTurns })
        currentRound++
        currentTurns = []
      } else {
        // Still in current round
        currentTurns.push(turnGroup)
      }
    })

    // Add any remaining turns to the current round
    if (currentTurns.length > 0) {
      roundGroups.push({ round: currentRound, turns: currentTurns })
    }

    return roundGroups
  }

  const handleActionRemove = (actionId: string) => {
    if (!canDeleteAction(actionId)) return

    updateGame(game.id, {
      actions: game.actions.filter(action => action.id !== actionId)
    })
  }

  const getPlayerName = (playerId?: string | null) => {
    if (!playerId) return 'Unknown'

    const player = game.players.find(p => p.id === playerId)

    if (!player?.userId) return 'Unknown'

    const user = users.find(u => u.id === player.userId)

    return user?.name || 'Unknown'
  }

  const formatTime = (date: DateTime) => {
    return date.toFormat('HH:mm')
  }

  // TODO: Used something Luxos built in?
  const formatRelativeTime = (currentDate: DateTime, previousDate: DateTime) => {
    const diffMs = currentDate.diff(previousDate, 'milliseconds').milliseconds
    const diffMinutes = Math.floor(diffMs / 60000)
    const diffSeconds = Math.floor((diffMs % 60000) / 1000)

    if (diffMinutes > 0) {
      return `${diffMinutes}m ${diffSeconds}s`
    } else {
      return `${diffSeconds}s`
    }
  }

  const getRoundStartTime = (roundGroup: {
    round: number
    turns: Array<{ turn: TurnChangeAction; lifeChanges: LifeChangeAction[] }>
  }) => {
    if (roundGroup.turns.length === 0) return null

    const firstTurn = roundGroup.turns[0].turn
    return safeToDateTime(firstTurn.createdAt)
  }

  const getTurnStartTime = (turnGroup: { turn: TurnChangeAction; lifeChanges: LifeChangeAction[] }) => {
    return safeToDateTime(turnGroup.turn.createdAt)
  }

  return (
    <div className="flex flex-col gap-4">
      {game.actions.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center m-auto">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <CircleSlash className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No actions recorded yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Start playing to see game history here</p>
        </div>
      ) : (
        groupTurnsByRounds().map((roundGroup, roundIndex) => {
          const roundStartTime = getRoundStartTime(roundGroup)
          const previousRoundStartTime = roundIndex > 0 ? getRoundStartTime(groupTurnsByRounds()[roundIndex - 1]) : null

          let timeDisplay = ''

          if (roundStartTime) {
            timeDisplay = formatTime(roundStartTime)

            if (previousRoundStartTime) {
              timeDisplay += ` (${formatRelativeTime(roundStartTime, previousRoundStartTime)} later)`
            }
          }

          return (
            <div
              key={roundGroup.round}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
            >
              {/* Round Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 dark:text-blue-300 font-semibold text-sm">{roundGroup.round}</span>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                        Round {roundGroup.round}
                      </h3>

                      {timeDisplay && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{timeDisplay}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{roundGroup.turns.length} turns</span>
                  </div>
                </div>
              </div>

              {/* Turns in this round */}
              <div className="p-4 space-y-3">
                {roundGroup.turns.map((turnGroup, turnIndex) => {
                  const turnStartTime = getTurnStartTime(turnGroup)
                  const previousTurnStartTime = turnIndex > 0 ? getTurnStartTime(roundGroup.turns[turnIndex - 1]) : null

                  let timeDisplay = ''

                  if (turnIndex > 0 && turnStartTime) {
                    timeDisplay = formatTime(turnStartTime)

                    if (previousTurnStartTime) {
                      timeDisplay += ` (${formatRelativeTime(turnStartTime, previousTurnStartTime)} later)`
                    }
                  }

                  return (
                    <div
                      key={turnGroup.turn.id}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                    >
                      {/* Turn Header */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-3 h-3 text-blue-600 dark:text-blue-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                          </div>

                          <div className="flex-1">
                            <span className="text-blue-700 dark:text-blue-300 font-medium text-sm">
                              {formatAction(turnGroup.turn)}
                            </span>

                            {timeDisplay && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{timeDisplay}</p>
                            )}
                          </div>
                        </div>

                        {canDeleteAction(turnGroup.turn.id) && (
                          <ThreeDotMenu onClose={() => handleActionRemove(turnGroup.turn.id)} asMenu={false} />
                        )}
                      </div>

                      {/* Life Changes in this turn */}
                      {turnGroup.lifeChanges.length > 0 && (
                        <div className="ml-9 space-y-2">
                          {turnGroup.lifeChanges.map((lifeChange, lifeChangeIndex) => {
                            const lifeChangeTime = safeToDateTime(lifeChange.createdAt)
                            const previousLifeChangeTime =
                              lifeChangeIndex > 0
                                ? safeToDateTime(turnGroup.lifeChanges[lifeChangeIndex - 1].createdAt)
                                : null

                            let timeDisplay = ''

                            if (lifeChangeTime) {
                              timeDisplay = formatTime(lifeChangeTime)

                              if (lifeChangeIndex === 0) {
                                timeDisplay += ` (${formatRelativeTime(lifeChangeTime, turnStartTime)} later)`
                              }

                              if (previousLifeChangeTime) {
                                timeDisplay += ` (${formatRelativeTime(lifeChangeTime, previousLifeChangeTime)} later)`
                              }
                            }

                            return (
                              <div
                                key={lifeChange.id}
                                className="flex items-start gap-3 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
                              >
                                <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <svg
                                    className="w-2 h-2 text-red-600 dark:text-red-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                  </svg>
                                </div>

                                <div className="flex-1">
                                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                                    {formatAction(lifeChange)}
                                  </span>
                                  {timeDisplay && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{timeDisplay}</p>
                                  )}
                                </div>

                                {canDeleteAction(lifeChange.id) && (
                                  <ThreeDotMenu onClose={() => handleActionRemove(lifeChange.id)} asMenu={false} />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
