import { ChevronDown, ChevronRight, CircleSlash, Heart, Zap } from 'lucide-react'
import { DateTime } from 'luxon'
import React, { useState } from 'react'

import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'
import { cn } from '../utils/cn'
import { FadeMask } from './FadeMask'
import { ThreeDotMenu } from './ThreeDotMenu'

interface ActionsListProps {
  gameId: string
}

export const ActionsList: React.FC<ActionsListProps> = ({ gameId }) => {
  const { games, updateGame } = useGames()
  const { users } = useUsers()
  const [collapsedRounds, setCollapsedRounds] = useState<Set<number>>(new Set())

  const game = games.find(g => g.id === gameId)

  if (!game) return null

  const toggleRound = (roundNumber: number) => {
    const newCollapsed = new Set(collapsedRounds)
    if (newCollapsed.has(roundNumber)) {
      newCollapsed.delete(roundNumber)
    } else {
      newCollapsed.add(roundNumber)
    }
    setCollapsedRounds(newCollapsed)
  }

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

      if (lifeGained) return `${to} gains ${value} life`
      if (fromSelf && !lifeGained) return `${from} loses ${value} life`
      if (!lifeGained) return `${from} deals ${value} damage to ${to}`

      return 'Unknown action'
    } else if (action.type === 'turn-change') {
      if (action.to === null) return 'Game ended'
      const to = getPlayerName(action.to)
      return to ? `${to}'s turn` : 'Unknown turn'
    }

    return 'Unknown action'
  }

  const canDeleteAction = (actionId: string): boolean => {
    if (game.state === 'finished') return false

    const action = game.actions.find(a => a.id === actionId)
    if (!action) return false

    if (action.type === 'life-change') return true

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
        if (currentTurn) {
          groups.push({ turn: currentTurn, lifeChanges: currentLifeChanges })
        }
        currentTurn = action
        currentLifeChanges = []
      } else if (action.type === 'life-change' && currentTurn) {
        currentLifeChanges.push(action)
      }
    })

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
      if (turnCount % game.players.length === 0) {
        currentTurns.push(turnGroup)
        roundGroups.push({ round: currentRound, turns: currentTurns })
        currentRound++
        currentTurns = []
      } else {
        currentTurns.push(turnGroup)
      }
    })

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

  const getRoundSummary = (roundGroup: {
    round: number
    turns: Array<{ turn: TurnChangeAction; lifeChanges: LifeChangeAction[] }>
  }) => {
    const totalLifeChanges = roundGroup.turns.reduce((sum, turn) => sum + turn.lifeChanges.length, 0)
    const firstTurn = roundGroup.turns[0]?.turn
    const lastTurn = roundGroup.turns[roundGroup.turns.length - 1]?.turn

    if (!firstTurn || !lastTurn) return ''

    const startTime = formatTime(safeToDateTime(firstTurn.createdAt))
    const endTime = formatTime(safeToDateTime(lastTurn.createdAt))

    return `${startTime} - ${endTime} • ${roundGroup.turns.length} turns • ${totalLifeChanges} actions`
  }

  const roundGroups = groupTurnsByRounds()
  const hasActions = game.actions.length > 0

  return (
    <div className="flex flex-col gap-4 overflow-hidden">
      {hasActions && (
        <FadeMask showMask={roundGroups.length > 3}>
          <div className="flex flex-col gap-2">
            {roundGroups.map(roundGroup => {
              const isCollapsed = collapsedRounds.has(roundGroup.round)
              const summary = getRoundSummary(roundGroup)

              return (
                <div
                  key={roundGroup.round}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {/* Round Header */}
                  <button
                    onClick={() => toggleRound(roundGroup.round)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-colors border-b border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <span className="text-blue-700 dark:text-blue-300 font-semibold text-sm">
                            {roundGroup.round}
                          </span>
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Round {roundGroup.round}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{summary}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {roundGroup.turns.length} turns
                        </span>
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </button>

                  {/* Round Content */}
                  {!isCollapsed && (
                    <div className="p-4 space-y-3">
                      {roundGroup.turns.map(turnGroup => {
                        const turnTime = formatTime(safeToDateTime(turnGroup.turn.createdAt))
                        const hasLifeChanges = turnGroup.lifeChanges.length > 0

                        return (
                          <div
                            key={turnGroup.turn.id}
                            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                          >
                            {/* Turn Header */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {formatAction(turnGroup.turn)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{turnTime}</span>
                              </div>
                              {canDeleteAction(turnGroup.turn.id) && (
                                <ThreeDotMenu onClose={() => handleActionRemove(turnGroup.turn.id)} asMenu={false} />
                              )}
                            </div>

                            {/* Life Changes */}
                            {hasLifeChanges && (
                              <div className="space-y-1 ml-6">
                                {turnGroup.lifeChanges.map(lifeChange => {
                                  const lifeChangeTime = formatTime(safeToDateTime(lifeChange.createdAt))
                                  const isLifeGain = lifeChange.value > 0

                                  return (
                                    <div
                                      key={lifeChange.id}
                                      className="flex items-center justify-between py-1 px-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Heart
                                          className={cn('w-3 h-3', isLifeGain ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                          {formatAction(lifeChange)}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {lifeChangeTime}
                                        </span>
                                      </div>
                                      {canDeleteAction(lifeChange.id) && (
                                        <ThreeDotMenu
                                          onClose={() => handleActionRemove(lifeChange.id)}
                                          asMenu={false}
                                        />
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
                  )}
                </div>
              )
            })}
          </div>
        </FadeMask>
      )}

      {!hasActions && (
        <div className="flex flex-col items-center justify-center text-center">
          <CircleSlash size={48} className="text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No actions recorded yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Start playing to see game history</p>
        </div>
      )}
    </div>
  )
}
