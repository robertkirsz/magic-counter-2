import { Calendar, ChevronDown, ChevronRight, Clock, Trophy, Users } from 'lucide-react'
import { DateTime } from 'luxon'
import React, { Suspense, useState } from 'react'

import { useUsers } from '../hooks/useUsers'
import { ActionsList } from './ActionsList'
import { Button } from './Button'
import { Deck } from './Deck'
import { Modal } from './Modal'
import { ThreeDotMenu } from './ThreeDotMenu'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'

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

  const getGameDuration = (game: Game) => {
    const turnActions = game.actions.filter(action => action.type === 'turn-change') as TurnChangeAction[]

    if (turnActions.length === 0) return null

    const gameStartTime = DateTime.fromJSDate(turnActions[0].createdAt)
    let gameEndTime: DateTime | null = null

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

  const getPlayerName = (playerId: string | null) => {
    if (!playerId) return 'Unknown'
    const user = users.find(u => u.id === playerId)
    return user?.name || 'Unknown'
  }

  const getFinalLifeValues = (game: Game) => {
    const finalLifeValues: { [playerId: string]: number } = {}

    game.players.forEach((player: Player) => {
      finalLifeValues[player.id] = game.startingLife
    })

    game.actions.forEach((action: LifeChangeAction | TurnChangeAction | MonarchChangeAction) => {
      if (action.type === 'life-change' && action.to) {
        action.to.forEach((playerId: string) => {
          if (finalLifeValues[playerId] !== undefined) {
            if (!action.poison) {
              finalLifeValues[playerId] += action.value
            }
          }
        })
      }
    })

    return finalLifeValues
  }

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

  const getGameStateDisplay = (game: Game) => {
    const duration = getGameDuration(game)

    switch (game.state) {
      case 'setup':
        return {
          label: 'SETUP',
          variant: 'outline' as const,
          duration: null
        }
      case 'active':
        return {
          label: 'ACTIVE',
          variant: 'default' as const,
          duration
        }
      case 'finished':
        return {
          label: 'FINISHED',
          variant: 'secondary' as const,
          duration
        }
      default:
        return {
          label: 'UNKNOWN',
          variant: 'destructive' as const,
          duration: null
        }
    }
  }

  const stateDisplay = getGameStateDisplay(game)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={stateDisplay.variant}>
              {stateDisplay.label}
              {stateDisplay.duration && (
                <span className="flex items-center gap-1 ml-1">
                  <Clock size={12} />
                  {stateDisplay.duration}
                </span>
              )}
            </Badge>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{DateTime.fromJSDate(game.createdAt).toFormat('MMM dd, HH:mm')}</span>
              </div>

              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{game.players.length}</span>
              </div>

              {game.turnTracking && (
                <div className="flex items-center gap-1 text-primary">
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
            <Button
              variant="secondary"
              small
              onClick={() => setActionsListVisible(true)}
            >
              Actions
            </Button>

            <ThreeDotMenu onRemove={onRemove} asMenu={false} />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-wrap gap-2">
            {game.players.map(player => {
              const finalLifeValues = getFinalLifeValues(game)
              const finalLife = finalLifeValues[player.id]

              return (
                <div key={player.id} className="flex items-start gap-2 flex-1 max-w-43 p-2 rounded-lg bg-secondary/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">{getPlayerName(player.userId)}</span>
                      <span className="text-xs text-muted-foreground">(Life: {finalLife})</span>
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
            <Collapsible open={chartsExpanded} onOpenChange={setChartsExpanded} className="w-full">
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-2 w-full p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                  {chartsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="font-medium text-sm">Charts & Analytics</span>
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <Suspense
                  fallback={
                    <div className="mt-3 p-3 rounded-lg border text-muted-foreground">
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
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </CardContent>

      <Modal isOpen={actionsListVisible} title="Game Actions" onClose={() => setActionsListVisible(false)} fullSize>
        <ActionsList gameId={game.id} />
      </Modal>
    </Card>
  )
}
