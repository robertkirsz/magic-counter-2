import { DndContext, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowBigRightDash, Clock, GripVertical, List, Move, Play, Settings, Undo } from 'lucide-react'
import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useGames } from '../hooks/useGames'
import { ActionsList } from './ActionsList'
import { Button } from './Button'
import { GameForm } from './GameForm'
import { Modal } from './Modal'
import { PlayerSection } from './PlayerSection'
import ThemeToggle from './ThemeToggle'
import StartGameModal from './board/StartGameModal'

interface BoardProps {
  gameId: string
}

// TODO: If a Player has no life, omit them when passing turn. Don't count them when counting rounds.

// Game Timer Component
const GameTimer: React.FC<{ gameId: string }> = ({ gameId }) => {
  const { games } = useGames()
  const [elapsedTime, setElapsedTime] = useState<string>('')
  const [isFinished, setIsFinished] = useState(false)

  const game = games.find(g => g.id === gameId)

  useEffect(() => {
    if (!game) return

    const updateTimer = () => {
      const turnActions = game.actions.filter(action => action.type === 'turn-change') as TurnChangeAction[]

      if (turnActions.length === 0) {
        setElapsedTime('')
        setIsFinished(false)
        return
      }

      const gameStartTime = DateTime.fromJSDate(turnActions[0].createdAt)
      let gameEndTime: DateTime | null = null
      let finished = false

      // Find the last TurnChangeAction with to=null (game end)
      for (let i = turnActions.length - 1; i >= 0; i--) {
        if (turnActions[i].to === null) {
          gameEndTime = DateTime.fromJSDate(turnActions[i].createdAt)
          finished = true
          break
        }
      }

      const endTime = gameEndTime || DateTime.now()
      const duration = endTime.diff(gameStartTime)

      const hours = Math.floor(duration.as('hours'))
      const minutes = Math.floor(duration.as('minutes')) % 60
      const seconds = Math.floor(duration.as('seconds')) % 60

      if (hours > 0) {
        setElapsedTime(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      } else {
        setElapsedTime(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }

      setIsFinished(finished)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [game])

  if (!elapsedTime) return null

  return (
    <div className="absolute top-4 left-4 z-20">
      <div
        className={`px-3 py-2 rounded-lg shadow-lg border flex items-center gap-2 ${
          isFinished ? 'bg-green-800/90 text-white border-green-600' : 'bg-gray-800/90 text-white border-gray-700'
        }`}
      >
        <Clock size={16} className={isFinished ? 'text-green-400' : 'text-blue-400'} />
        <span className="font-mono text-sm font-medium">{elapsedTime}</span>
        {isFinished && <span className="text-xs bg-green-600 px-2 py-0.5 rounded-full">FINISHED</span>}
      </div>
    </div>
  )
}

interface SortablePlayerSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  gameId: string
  dragEnabled: boolean
}

// Sortable wrapper for PlayerSection
function SortablePlayerSection({ id, gameId, dragEnabled, className, ...props }: SortablePlayerSectionProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !dragEnabled
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`SortablePlayerSection flex flex-col relative ${className}`}
      {...props}
    >
      {dragEnabled && (
        <div className={`drag-overlay${isDragging ? ' drag-overlay--active' : ''}`}>
          <Button
            ref={setActivatorNodeRef}
            {...listeners}
            {...attributes}
            className="drag-overlay-handle drag-overlay-handle--large"
            round
            variant="secondary"
            tabIndex={-1}
            aria-label="Drag to reorder player"
            type="button"
          >
            <GripVertical />
          </Button>
        </div>
      )}
      <PlayerSection gameId={gameId} playerId={id} />
    </div>
  )
}

export const Board: React.FC<BoardProps> = ({ gameId }) => {
  const { games, updateGame, getCurrentActivePlayer, getCurrentRound, dispatchAction, undoLastAction } = useGames()

  const game = games.find(g => g.id === gameId)

  const [showSettings, setShowSettings] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [previewPlayerCount, setPreviewPlayerCount] = useState<number>(game?.players.length || 4)
  const [dragEnabled, setDragEnabled] = useState(false)

  if (!game) return <div>Game not found</div>

  const handlePlay = () => {
    updateGame(game.id, { state: 'active' })
  }

  const handleFinish = () => {
    // Add confirmation dialog
    const confirmed = window.confirm('Are you sure you want to finish this game? This action cannot be undone.')

    if (!confirmed) return

    // Add a TurnChangeAction with to=null to mark game end
    const endAction: TurnChangeAction = {
      id: uuidv4(),
      createdAt: DateTime.now().toJSDate(),
      type: 'turn-change',
      from: getCurrentActivePlayer(),
      to: null
    }

    dispatchAction(game.id, endAction)
    updateGame(game.id, { state: 'finished' })
  }

  // Drag end handler for reordering players
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = game.players.findIndex(p => p.id === active.id)
    const newIndex = game.players.findIndex(p => p.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    // Switch places instead of moving
    const newPlayers = [...game.players]
    const temp = newPlayers[oldIndex]
    newPlayers[oldIndex] = newPlayers[newIndex]
    newPlayers[newIndex] = temp

    updateGame(game.id, { players: newPlayers })
  }

  // Pass turn to next player (append TurnChangeAction)
  const handlePassTurn = (playerId?: string) => {
    if (!game || !game.turnTracking) return

    const currentIndex = game.players.findIndex(p => p.id === getCurrentActivePlayer())
    const nextIndex = (currentIndex + 1) % game.players.length
    const nextPlayer = game.players[nextIndex] || game.players[0]

    const newAction: TurnChangeAction = {
      id: uuidv4(),
      createdAt: DateTime.now().toJSDate(),
      type: 'turn-change',
      from: getCurrentActivePlayer(),
      to: playerId || nextPlayer.id
    }

    dispatchAction(game.id, newAction)
  }

  const validPlayers = game.players.filter(player => player.userId && player.deckId)
  const canPlay = validPlayers.length === game.players.length
  const currentActivePlayer = getCurrentActivePlayer()
  const showStartModal = game.state === 'active' && !currentActivePlayer && game.turnTracking

  const handleUndoLastAction = () => {
    undoLastAction(game.id)
  }

  const canUndo = game.actions.length > 0

  // Use previewPlayerCount for layout, but actual game.players for data
  const displayPlayerCount = showSettings ? previewPlayerCount : game.players.length
  const displayPlayers = game.players.slice(0, displayPlayerCount)

  const handlePlayerCountChange = (count: number) => {
    setPreviewPlayerCount(count)
  }

  return (
    <div className="Board flex flex-col h-svh bg-black relative overflow-clip">
      {/* Player Sections */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={displayPlayers.map(p => p.id)}>
          <div
            className={`PlayersSortingWrapper flex-1 grid grid-rows-${displayPlayerCount > 1 ? 2 : 1}`}
            data-player-count={displayPlayerCount}
          >
            {displayPlayers.map((player, index) => (
              <SortablePlayerSection
                key={player.id}
                id={player.id}
                gameId={gameId}
                dragEnabled={dragEnabled}
                style={{ gridArea: `player-${index + 1}` }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Settings Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-3 z-20">
        <Button
          onClick={() => setShowSettings(true)}
          className="bg-gray-800/90 hover:bg-gray-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 border border-gray-700 dark:bg-gray-900 dark:border-gray-700"
        >
          <Settings size={24} className="text-white" />
        </Button>

        <ThemeToggle />

        <Button
          onClick={() => setDragEnabled(!dragEnabled)}
          className={`rounded-full p-3 shadow-lg transition-all duration-200 border ${
            dragEnabled
              ? 'bg-blue-600/90 hover:bg-blue-500 text-white border-blue-500'
              : 'bg-gray-800/90 hover:bg-gray-700 text-white border-gray-700 dark:bg-gray-900 dark:border-gray-700'
          }`}
          title={dragEnabled ? 'Disable player dragging' : 'Enable player dragging'}
        >
          <Move size={24} className="text-white" />
        </Button>

        <Button
          onClick={() => setShowActions(true)}
          className="bg-gray-800/90 hover:bg-gray-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 border border-gray-700 dark:bg-gray-900 dark:border-gray-700"
        >
          <List size={24} className="text-white" />
        </Button>
      </div>

      {/* Current Round Display */}
      {game.state === 'active' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-gray-800/90 text-white px-4 py-2 rounded-lg shadow-lg border border-gray-700">
            <span className="font-semibold">Round {getCurrentRound(game.id)}</span>
          </div>
        </div>
      )}

      {/* Undo Last Action Button */}
      {game.state === 'active' && canUndo && (
        <Button
          round
          variant="secondary"
          className="absolute top-1/2 left-1/2 -translate-y-1/2 z-20 -translate-x-20"
          onClick={handleUndoLastAction}
          title="Undo last action"
        >
          <Undo size={24} />
        </Button>
      )}

      {/* Pass Turn Button */}
      {game.state === 'active' && game.turnTracking && currentActivePlayer && (
        <Button
          round
          variant="primary"
          className="absolute top-1/2 left-1/2 -translate-y-1/2 z-20 translate-x-20"
          onClick={() => handlePassTurn()}
          title="Pass turn"
        >
          <ArrowBigRightDash size={32} />
        </Button>
      )}

      {/* Play/Finish Button */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center w-full z-20">
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

      <Modal title="Game Settings" isOpen={showSettings} onClose={() => setShowSettings(false)}>
        <GameForm
          gameId={gameId}
          onSave={() => setShowSettings(false)}
          onCancel={() => setShowSettings(false)}
          onPlayerCountChange={handlePlayerCountChange}
        />
      </Modal>

      <Modal fullSize title="Game Actions" isOpen={showActions} onClose={() => setShowActions(false)}>
        <ActionsList gameId={gameId} />
      </Modal>

      <Modal title="Who starts?" isOpen={showStartModal} hideCloseButton onClose={() => {}}>
        <StartGameModal gameId={gameId} onChoosePlayer={handlePassTurn} />
      </Modal>

      <GameTimer gameId={gameId} />
    </div>
  )
}
