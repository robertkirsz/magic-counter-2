import { DndContext, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowBigRightDash, GripVertical, List, Play, Settings } from 'lucide-react'
import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'
import { Button } from './Button'
import { GameForm } from './GameForm'
import { Modal } from './Modal'
import { PlayerSection } from './PlayerSection'
import ThemeToggle from './ThemeToggle'
import { ThreeDotMenu } from './ThreeDotMenu'
import StartGameModal from './board/StartGameModal'

interface BoardProps {
  gameId: string
}

// Sortable wrapper for PlayerSection
function SortablePlayerSection({ id, gameId }: { id: string; gameId: string }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto'
  }

  return (
    <div ref={setNodeRef} style={style} className="SortablePlayerSection flex flex-col relative">
      <Button
        ref={setActivatorNodeRef}
        {...listeners}
        {...attributes}
        className="absolute top-2 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing z-10"
        round
        small
        variant="secondary"
        tabIndex={-1}
        aria-label="Drag to reorder player"
        type="button"
      >
        <GripVertical />
      </Button>

      <PlayerSection gameId={gameId} playerId={id} />
    </div>
  )
}

export const Board: React.FC<BoardProps> = ({ gameId }) => {
  const { games, updateGame, getCurrentActivePlayer, getCurrentRound } = useGames()
  const { users } = useUsers()

  const game = games.find(g => g.id === gameId)

  const [showSettings, setShowSettings] = useState(false)
  const [showActions, setShowActions] = useState(false)

  if (!game) return <div>Game not found</div>

  const handlePlay = () => {
    updateGame(game.id, { state: 'active' })
  }

  const handleFinish = () => {
    updateGame(game.id, { state: 'finished' })
  }

  const formatAction = (action: LifeChangeAction | TurnChangeAction) => {
    if (action.type === 'life-change') {
      // Find the turn start time for this life change
      const actionIndex = game.actions.findIndex(a => a.id === action.id)
      let turnStartTime: Date | null = null

      // Look backwards to find the most recent turn change before this action
      for (let i = actionIndex - 1; i >= 0; i--) {
        const prevAction = game.actions[i]
        if (prevAction && 'createdAt' in prevAction && prevAction.type === 'turn-change') {
          turnStartTime = new Date(prevAction.createdAt)
          break
        }
      }

      // Calculate elapsed time since turn started
      let timeDisplay = ''
      if (turnStartTime) {
        const elapsedMs = new Date(action.createdAt).getTime() - turnStartTime.getTime()
        const elapsedSeconds = Math.floor(elapsedMs / 1000)
        const elapsedMinutes = Math.floor(elapsedSeconds / 60)

        if (elapsedMinutes > 0) {
          timeDisplay = `${elapsedMinutes}m ${elapsedSeconds % 60}s in`
        } else {
          timeDisplay = `${elapsedSeconds}s in`
        }
      } else {
        // Fallback to absolute time if no turn found
        timeDisplay = new Date(action.createdAt).toLocaleTimeString()
      }

      const lifeGained = action.value > 0
      const fromSelf = action.from === action.to?.[0] && action.to?.length === 1
      const value = Math.abs(action.value)
      const from = getPlayerName(action.from)
      const to = action.to?.map(getPlayerName).join(', ')

      if (lifeGained) return `${timeDisplay} ${from} gains ${value} life 💚`
      if (fromSelf && !lifeGained) return `${timeDisplay} ${from} loses ${value} life 💔`
      if (!lifeGained) return `${timeDisplay} ${from} deals ${value} damage to ${to} 💔`

      return `${timeDisplay}: Unknown message`
    } else if (action.type === 'turn-change') {
      const date = new Date(action.createdAt).toLocaleTimeString()
      const to = getPlayerName(action.to)

      if (to) return `${date}: ${to}'s turn`

      return `${date}: Unknown message`
    }

    return `${new Date().toLocaleTimeString()}: Unknown action`
  }

  const canDeleteAction = (actionId: string): boolean => {
    const action = game.actions.find(a => a.id === actionId)

    if (!action) return false

    // LifeChangeAction can always be deleted
    if (action.type === 'life-change') return true

    // For TurnChangeAction, only the last one can be deleted
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

  // Drag end handler for reordering players
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = game.players.findIndex(p => p.id === active.id)
    const newIndex = game.players.findIndex(p => p.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const newPlayers = arrayMove(game.players, oldIndex, newIndex)

    updateGame(game.id, { players: newPlayers })
  }

  // Pass turn to next player (append TurnChangeAction)
  const handlePassTurn = (playerId?: string) => {
    if (!game || !game.turnTracking) return

    const currentIndex = game.players.findIndex(p => p.id === currentActivePlayer)
    const nextIndex = (currentIndex + 1) % game.players.length
    const nextPlayer = game.players[nextIndex] || game.players[0]

    const newAction: TurnChangeAction = {
      id: uuidv4(),
      createdAt: new Date(),
      type: 'turn-change',
      from: currentActivePlayer,
      to: playerId || nextPlayer.id
    }

    updateGame(game.id, prevGame => ({ actions: [...prevGame.actions, newAction] }))
  }

  const validPlayers = game.players.filter(player => player.userId && player.deckId)
  const canPlay = validPlayers.length === game.players.length
  const currentActivePlayer = getCurrentActivePlayer()
  const showStartModal = game.state === 'active' && !currentActivePlayer && game.turnTracking

  return (
    <div className="Board flex h-svh bg-black">
      {/* Player Sections */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={game.players.map(p => p.id)}>
          <div className="PlayersSortingWrapper" data-player-count={game.players.length}>
            {game.players.map(player => (
              <SortablePlayerSection key={player.id} id={player.id} gameId={gameId} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Settings Overlay */}
      <div className="fixed top-4 right-4 flex flex-col gap-3 z-20">
        <Button
          onClick={() => setShowSettings(true)}
          className="bg-gray-800/90 hover:bg-gray-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 border border-gray-700 dark:bg-gray-900 dark:border-gray-700"
        >
          <Settings size={24} className="text-white" />
        </Button>

        <ThemeToggle />

        <Button
          onClick={() => setShowActions(true)}
          className="bg-gray-800/90 hover:bg-gray-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 border border-gray-700 dark:bg-gray-900 dark:border-gray-700"
        >
          <List size={24} className="text-white" />
        </Button>
      </div>

      {/* Current Round Display */}
      {game.state === 'active' && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-gray-800/90 text-white px-4 py-2 rounded-lg shadow-lg border border-gray-700">
            <span className="font-semibold">Round {getCurrentRound(game.id)}</span>
          </div>
        </div>
      )}

      {/* Pass Turn Button */}
      {game.state === 'active' && game.turnTracking && currentActivePlayer && (
        <Button
          round
          variant="primary"
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          onClick={() => handlePassTurn()}
        >
          <ArrowBigRightDash size={32} />
        </Button>
      )}

      {/* Play/Finish Button */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex justify-center w-full z-20">
        {game.state !== 'finished' && (
          <Button
            variant="primary"
            disabled={!canPlay && game.state !== 'active'}
            onClick={game.state === 'active' ? handleFinish : handlePlay}
          >
            {game.state === 'active' ? (
              <span>FINISH</span>
            ) : (
              <>
                <Play size={32} />
                <span>PLAY</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Game Settings">
          <GameForm gameId={gameId} onSave={() => setShowSettings(false)} onCancel={() => setShowSettings(false)} />
        </Modal>
      )}

      {/* Actions Modal */}
      {showActions && (
        <Modal fullSize isOpen={showActions} onClose={() => setShowActions(false)} title="Game Actions">
          <div className="flex flex-col gap-2">
            {game.actions.length === 0 ? (
              <p className="text-center text-gray-500">No actions recorded yet.</p>
            ) : (
              <div className="space-y-6">
                {groupTurnsByRounds().map(roundGroup => (
                  <div
                    key={roundGroup.round}
                    className="border border-gray-300 rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
                  >
                    {/* Round Header */}
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4">
                      Round {roundGroup.round}
                    </h3>

                    {/* Turns in this round */}
                    <div className="space-y-3">
                      {roundGroup.turns.map(turnGroup => (
                        <div
                          key={turnGroup.turn.id}
                          className="border border-blue-200 rounded-lg p-3 bg-blue-50 dark:bg-blue-900/10"
                        >
                          {/* Turn Header */}
                          <div className="flex justify-between gap-1 p-2 border border-blue-300 rounded bg-blue-100 dark:bg-blue-900/20 dark:border-blue-700 mb-2">
                            <span className="text-blue-700 dark:text-blue-300 font-medium">
                              {formatAction(turnGroup.turn)}
                            </span>
                            {canDeleteAction(turnGroup.turn.id) && (
                              <ThreeDotMenu onClose={() => handleActionRemove(turnGroup.turn.id)} asMenu={false} />
                            )}
                          </div>

                          {/* Life Changes in this turn */}
                          {turnGroup.lifeChanges.length > 0 && (
                            <div className="space-y-1 ml-4">
                              {turnGroup.lifeChanges.map(lifeChange => (
                                <div
                                  key={lifeChange.id}
                                  className="flex justify-between gap-1 p-2 border border-gray-200 rounded bg-white dark:bg-gray-800"
                                >
                                  <span className="text-gray-700 dark:text-gray-300">{formatAction(lifeChange)}</span>
                                  {canDeleteAction(lifeChange.id) && (
                                    <ThreeDotMenu onClose={() => handleActionRemove(lifeChange.id)} asMenu={false} />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Start Game Modal */}
      <StartGameModal
        isOpen={showStartModal}
        validPlayers={validPlayers}
        onChoosePlayer={handlePassTurn}
        getPlayerName={getPlayerName}
      />
    </div>
  )
}
