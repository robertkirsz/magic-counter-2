import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, rectSwappingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { ArrowBigRightDash, Play, Undo } from 'lucide-react'
import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'
import { cn } from '../utils/cn'
import { EventDispatcher } from '../utils/eventDispatcher'
import { generateId } from '../utils/idGenerator'
import { ActionsList } from './ActionsList'
import { Button } from './Button'
import { GameEndModal } from './GameEndModal'
import { GameForm } from './GameForm'
import GameStatus from './GameStatus'
import { Modal } from './Modal'
import { MonarchDrawReminder } from './MonarchDrawReminder'
import { SettingsMenu } from './SettingsMenu'
import { SortablePlayerSection } from './SortablePlayerSection'
import StartGameModal from './board/StartGameModal'

const TABLE_MODE_KEY = 'tableMode'

function getInitialTableMode(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(TABLE_MODE_KEY)
  return stored === 'true'
}

interface BoardProps {
  gameId: string
}

export const Board: React.FC<BoardProps> = ({ gameId }) => {
  const {
    games,
    updateGame,
    getEffectiveActivePlayer,
    hasEffectiveActivePlayer,
    dispatchAction,
    undoLastAction,
    removeGame
  } = useGames()
  const { users } = useUsers()

  const game = games.find(g => g.id === gameId)

  const [showSettings, setShowSettings] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [showGameEndModal, setShowGameEndModal] = useState(false)
  const [previewPlayerCount, setPreviewPlayerCount] = useState<number>(game?.players.length || 4)
  const [dragEnabled, setDragEnabled] = useState(false)
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null)
  const [tableMode, setTableMode] = useState(getInitialTableMode())

  // Save table mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(TABLE_MODE_KEY, tableMode.toString())
  }, [tableMode])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  if (!game) return <div>Game not found</div>

  const handlePlay = () => {
    updateGame(game.id, { state: 'active' })
  }

  const handleFinish = () => {
    // Add confirmation dialog
    const confirmed = window.confirm('Are you sure you want to finish this game? This action cannot be undone.')

    if (!confirmed) return

    // Show the game end modal first
    setShowGameEndModal(true)
  }

  const handleCancel = () => {
    // Add confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to cancel this game? This will permanently delete the game and cannot be undone.'
    )

    if (!confirmed) return

    // Dispatch game delete event before removing the game
    EventDispatcher.dispatchGameDelete(game.id)
    removeGame(game.id)
  }

  // Drag end handler for reordering players
  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedPlayerId(null)
    const { active, over } = event

    if (!over || active.id === over.id) return

    // Handle player reordering
    const oldIndex = game.players.findIndex(p => p.id === active.id)
    const newIndex = game.players.findIndex(p => p.id === over.data.current?.playerId)

    if (oldIndex === -1 || newIndex === -1) return

    // Switch places instead of moving
    const newPlayers = [...game.players]
    const temp = newPlayers[oldIndex]
    newPlayers[oldIndex] = newPlayers[newIndex]
    newPlayers[newIndex] = temp

    updateGame(game.id, { players: newPlayers })
  }

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedPlayerId(String(event.active.id))
  }

  // Pass turn to next player (append TurnChangeAction)
  const handlePassTurn = (playerId?: string) => {
    // Don't allow passing turn when there's a temporary active player
    if (hasEffectiveActivePlayer(gameId)) return

    const activePlayer = getEffectiveActivePlayer()

    if (playerId) {
      // If a specific player is provided, pass turn to them
      const newAction: TurnChangeAction = {
        id: generateId(),
        createdAt: DateTime.now().toJSDate(),
        type: 'turn-change',
        from: activePlayer,
        to: playerId
      }

      dispatchAction(game.id, newAction)

      return
    }

    // TODO: Perhaps use just active players? Need to figure out what to do after a player gets eliminated.
    // const activePlayers = getActivePlayers(game)

    // Find the current active player in the active players list
    const currentIndex = game.players.findIndex(p => p.id === activePlayer)
    const nextIndex = (currentIndex + 1) % game.players.length
    const nextPlayer = game.players[nextIndex] || game.players[0]

    const newAction: TurnChangeAction = {
      id: generateId(),
      createdAt: DateTime.now().toJSDate(),
      type: 'turn-change',
      from: activePlayer,
      to: nextPlayer.id
    }

    dispatchAction(game.id, newAction)
  }

  const validPlayers = game.players.filter(player => player.userId && player.deckId)
  const canPlay = game.turnTracking ? validPlayers.length === game.players.length : true
  const activePlayer = getEffectiveActivePlayer()
  const showStartModal = game.state === 'active' && !activePlayer && game.turnTracking

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
    <div
      className={cn(
        'Board flex flex-col h-svh bg-black relative overflow-clip',
        dragEnabled && 'dragEnabled',
        tableMode && 'tableMode'
      )}
    >
      {/* Player Sections */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={displayPlayers.map(p => p.id)} strategy={rectSwappingStrategy}>
          <div className="PlayersSortingWrapper flex-1 w-full h-full" data-player-count={displayPlayerCount}>
            {displayPlayers.map((player, index) => (
              <SortablePlayerSection
                key={player.id}
                index={index}
                id={player.id}
                gameId={gameId}
                dragEnabled={dragEnabled}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {draggedPlayerId && (
            <div className="rounded-lg px-3 py-2 bg-slate-700/90 text-slate-100 border border-slate-600 shadow-lg min-w-[160px]">
              <div className="text-sm font-semibold">
                {(() => {
                  const player = game.players.find(p => p.id === draggedPlayerId)
                  if (!player) return 'Player'
                  const user = users.find(u => u.id === player.userId)
                  return user?.name || 'Player'
                })()}
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <div className="BoardOverlay hiddenWhenDragEnabled absolute top-0 left-0 w-full h-full z-20 flex flex-col items-center justify-between gap-2 p-2">
        <GameStatus gameId={gameId} />

        <div className="flex items-center gap-4">
          {/* Undo Last Action Button */}
          {game.state === 'active' && canUndo && (
            <Button round variant="secondary" onClick={handleUndoLastAction} title="Undo last action">
              <Undo size={32} />
            </Button>
          )}

          {/* Pass Turn Button */}
          {game.state === 'active' && game.turnTracking && activePlayer && (
            <Button
              round
              variant="primary"
              onClick={() => handlePassTurn()}
              title={
                hasEffectiveActivePlayer(gameId) ? 'Cannot pass turn while temporary player is active' : 'Pass turn'
              }
              className="!p-4"
              disabled={hasEffectiveActivePlayer(gameId)}
            >
              <ArrowBigRightDash size={64} />
            </Button>
          )}
        </div>

        {/* Monarch Draw Reminder */}
        {game.state === 'active' && <MonarchDrawReminder gameId={gameId} />}

        {/* Start and Cancel Buttons */}
        <div className="flex gap-2 min-h-[30px]">
          {game.state === 'setup' && (
            <>
              <Button variant="primary" disabled={!canPlay} onClick={handlePlay}>
                <Play size={32} />
                <span>START</span>
              </Button>

              <Button
                variant="secondary"
                className="bg-red-600 hover:bg-red-500 text-white border-red-500"
                onClick={handleCancel}
              >
                CANCEL
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Settings Menu */}
      <SettingsMenu
        tableMode={tableMode}
        dragEnabled={dragEnabled}
        gameState={game.state}
        onTableModeChange={setTableMode}
        onDragEnabledChange={setDragEnabled}
        onShowSettings={() => setShowSettings(true)}
        onShowActions={() => setShowActions(true)}
        onFinishGame={handleFinish}
      />

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

      <GameEndModal gameId={gameId} isOpen={showGameEndModal} onClose={() => setShowGameEndModal(false)} />
    </div>
  )
}
