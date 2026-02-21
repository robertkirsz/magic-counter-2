import { ChevronDown, ChevronRight, CircleSlash, Heart, Skull, Zap } from 'lucide-react'
import { DateTime } from 'luxon'
import React, { useState } from 'react'

import { useDecks } from '../hooks/useDecks'
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
  const { decks } = useDecks()
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

      // Handle poison counter changes
      if (action.poison) {
        if (lifeGained) {
          // Positive value means removing poison counters (healing)
          return `${to} lost ${value} poison counter${value !== 1 ? 's' : ''}`
        } else {
          // Negative value means gaining poison counters (damage)
          return `${to} gained ${value} poison counter${value !== 1 ? 's' : ''}`
        }
      }

      // Handle regular life changes
      if (lifeGained) return `${to} gains ${value} life`
      if (fromSelf && !lifeGained) return `${from} loses ${value} life`
      if (!lifeGained) {
        const commanderName = getCommanderName(action.commanderId)
        if (commanderName) {
          return `${from} deals ${value} commander damage to ${to} (${commanderName})`
        }
        return `${from} deals ${value} damage to ${to}`
      }

      return 'Unknown action'
    } else if (action.type === 'turn-change') {
      if (!action.to) return 'Game ended'
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

  const getLifeChangeActions = () => {
    return game.actions.filter(action => action.type === 'life-change') as LifeChangeAction[]
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

  const getCommanderName = (commanderId?: string) => {
    if (!commanderId) return null

    // Find the deck that contains this commander
    const deck = decks.find(d => d.commanders.some(c => c.id === commanderId))
    if (!deck) return null

    const commander = deck.commanders.find(c => c.id === commanderId)
    return commander?.name || null
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
  const lifeChangeActions = getLifeChangeActions()
  const hasActions = game.actions.length > 0
  const hasTurnTracking = game.turnTracking

  return (
    <div className="flex flex-col gap-4 overflow-hidden">
      {hasActions && hasTurnTracking && (
        <FadeMask showMask={roundGroups.length > 3}>
          <div className="flex flex-col gap-2">
            {roundGroups.map(roundGroup => {
              const isCollapsed = collapsedRounds.has(roundGroup.round)
              const summary = getRoundSummary(roundGroup)

              return (
                <CollapsibleSection
                  key={roundGroup.round}
                  isCollapsed={isCollapsed}
                  onToggle={() => toggleRound(roundGroup.round)}
                  header={<RoundHeader roundNumber={roundGroup.round} summary={summary} isCollapsed={isCollapsed} />}
                >
                  {roundGroup.turns.map(turnGroup => (
                    <TurnItem
                      key={turnGroup.turn.id}
                      turn={turnGroup.turn}
                      lifeChanges={turnGroup.lifeChanges}
                      formatAction={formatAction}
                      formatTime={formatTime}
                      safeToDateTime={safeToDateTime}
                      canDeleteAction={canDeleteAction}
                      onActionRemove={handleActionRemove}
                    />
                  ))}
                </CollapsibleSection>
              )
            })}
          </div>
        </FadeMask>
      )}

      {hasActions && !hasTurnTracking && (
        <FadeMask showMask={lifeChangeActions.length > 10}>
          <div className="flex flex-col gap-2">
            <div className="bg-base-200 rounded-lg border border-base-300 overflow-hidden">
              <SectionHeader
                icon={<Heart className="w-4 h-4 text-success" />}
                title="Life Changes"
                subtitle={`${lifeChangeActions.length} actions`}
                gradient="from-success/20 to-success/20"
                iconBg="bg-success/30"
              />

              <div className="p-4 space-y-2">
                {lifeChangeActions.map(action => (
                  <LifeChangeItem
                    key={action.id}
                    action={action}
                    formatAction={formatAction}
                    formatTime={formatTime}
                    safeToDateTime={safeToDateTime}
                    canDeleteAction={canDeleteAction}
                    onActionRemove={handleActionRemove}
                  />
                ))}
              </div>
            </div>
          </div>
        </FadeMask>
      )}

      {!hasActions && <EmptyState />}
    </div>
  )
}

// ============================================================================
// Reusable Components
// ============================================================================

interface SectionHeaderProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  gradient?: string
  iconBg: string
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title, subtitle, gradient, iconBg }) => (
  <div className={`px-4 py-3 bg-linear-to-r ${gradient} border-b border-base-300`}>
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 ${iconBg} rounded-full flex items-center justify-center`}>{icon}</div>
      <div>
        <h3 className="font-semibold text-base-content">{title}</h3>
        {subtitle && <p className="text-xs text-base-content/70">{subtitle}</p>}
      </div>
    </div>
  </div>
)

interface CollapsibleSectionProps {
  isCollapsed: boolean
  onToggle: () => void
  header: React.ReactNode
  children: React.ReactNode
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ isCollapsed, onToggle, header, children }) => (
  <div className="bg-base-200 rounded-lg border border-base-300 overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full px-4 py-3 bg-linear-to-r from-info/20 to-primary/20 hover:from-info/30 hover:to-primary/30 transition-colors border-b border-base-300"
    >
      {header}
    </button>
    {!isCollapsed && <div className="p-4 space-y-3">{children}</div>}
  </div>
)

interface RoundHeaderProps {
  roundNumber: number
  summary: string
  isCollapsed: boolean
}

const RoundHeader: React.FC<RoundHeaderProps> = ({ roundNumber, summary, isCollapsed }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-info/30 rounded-full flex items-center justify-center">
        <span className="text-info font-semibold text-sm">{roundNumber}</span>
      </div>
      <div className="text-left">
        <h3 className="font-semibold text-base-content">Round {roundNumber}</h3>
        <p className="text-xs text-base-content/70 mt-0.5">{summary}</p>
      </div>
    </div>
    {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
  </div>
)

interface TurnItemProps {
  turn: TurnChangeAction
  lifeChanges: LifeChangeAction[]
  formatAction: (action: LifeChangeAction | TurnChangeAction) => string
  formatTime: (date: DateTime) => string
  safeToDateTime: (date: Date | string) => DateTime
  canDeleteAction: (actionId: string) => boolean
  onActionRemove: (actionId: string) => void
}

const TurnItem: React.FC<TurnItemProps> = ({
  turn,
  lifeChanges,
  formatAction,
  formatTime,
  safeToDateTime,
  canDeleteAction,
  onActionRemove
}) => {
  const turnTime = formatTime(safeToDateTime(turn.createdAt))
  const hasLifeChanges = lifeChanges.length > 0

  return (
    <div className="bg-base-300/50 rounded-lg p-3 border border-base-300">
      {/* Turn Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-info" />
          <span className="text-sm font-medium text-base-content">{formatAction(turn)}</span>
          <span className="text-xs text-base-content/70">{turnTime}</span>
        </div>
        {canDeleteAction(turn.id) && <ThreeDotMenu onClose={() => onActionRemove(turn.id)} asMenu={false} />}
      </div>

      {/* Life Changes */}
      {hasLifeChanges && (
        <div className="space-y-1 ml-6">
          {lifeChanges.map(lifeChange => (
            <LifeChangeItem
              key={lifeChange.id}
              action={lifeChange}
              formatAction={formatAction}
              formatTime={formatTime}
              safeToDateTime={safeToDateTime}
              canDeleteAction={canDeleteAction}
              onActionRemove={onActionRemove}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface LifeChangeItemProps {
  action: LifeChangeAction
  formatAction: (action: LifeChangeAction | TurnChangeAction) => string
  formatTime: (date: DateTime) => string
  safeToDateTime: (date: Date | string) => DateTime
  canDeleteAction: (actionId: string) => boolean
  onActionRemove: (actionId: string) => void
}

const LifeChangeItem: React.FC<LifeChangeItemProps> = ({
  action,
  formatAction,
  formatTime,
  safeToDateTime,
  canDeleteAction,
  onActionRemove
}) => {
  const actionTime = formatTime(safeToDateTime(action.createdAt))
  const isLifeGain = action.value > 0
  const isPoison = action.poison
  const Icon = isPoison ? Skull : Heart
  const iconColor = isLifeGain ? 'text-success' : 'text-error'

  return (
    <div className="flex items-center justify-between py-1 px-2 bg-base-200 rounded border border-base-300">
      <div className="flex items-center gap-2">
        <Icon className={cn('flex-none w-3 h-3', iconColor)} />
        <span className="text-sm text-base-content/80">{formatAction(action)}</span>
        <span className="text-xs text-base-content/70">{actionTime}</span>
      </div>
      {canDeleteAction(action.id) && <ThreeDotMenu onClose={() => onActionRemove(action.id)} asMenu={false} />}
    </div>
  )
}

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-center">
    <CircleSlash size={48} className="text-base-content/70" />
    <h3 className="text-xl font-semibold text-base-content/80">No actions recorded yet</h3>
    <p className="text-base-content/70">Start playing to see game history</p>
  </div>
)
