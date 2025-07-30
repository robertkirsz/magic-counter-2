import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, rectSwappingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { ArrowBigRightDash, List, Move, Play, Settings, Table, Undo } from 'lucide-react'
import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import { useGames } from '../hooks/useGames'
import { cn } from '../utils/cn'
import { generateId } from '../utils/idGenerator'
import { ActionsList } from './ActionsList'
import { Button } from './Button'
import { GameForm } from './GameForm'
import GameStatus from './GameStatus'
import { Modal } from './Modal'
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
  const { games, updateGame, getCurrentActivePlayer, dispatchAction, undoLastAction } = useGames()

  const game = games.find(g => g.id === gameId)

  const [showSettings, setShowSettings] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [previewPlayerCount, setPreviewPlayerCount] = useState<number>(game?.players.length || 4)
  const [dragEnabled, setDragEnabled] = useState(false)
  const [tableMode, setTableMode] = useState(getInitialTableMode())

  // Save table mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(TABLE_MODE_KEY, tableMode.toString())
  }, [tableMode])

  const sensors = useSensors(
    useSensor(PointerSensor),
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

    // Add a TurnChangeAction with to=null to mark game end
    const endAction: TurnChangeAction = {
      id: generateId(),
      createdAt: DateTime.now().toJSDate(),
      type: 'turn-change',
      from: getCurrentActivePlayer()
    }

    dispatchAction(game.id, endAction)
    updateGame(game.id, { state: 'finished' })
  }

  // Drag end handler for reordering players and sword attacks
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    // Handle sword attacks
    if (active.data.current?.type === 'sword' && over.data.current?.type === 'player') {
      const attackerId = active.data.current.playerId
      const targetId = over.data.current.playerId

      if (attackerId !== targetId) {
        // Trigger attack modal - we'll need to communicate this to the PlayerSection
        // For now, we'll use a custom event
        window.dispatchEvent(new CustomEvent('sword-attack', { detail: { attackerId, targetId } }))
        return
      }
    }

    // Handle player reordering (existing logic)
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

  // Pass turn to next player (append TurnChangeAction)
  const handlePassTurn = (playerId?: string) => {
    if (!game || !game.turnTracking) return

    const currentIndex = game.players.findIndex(p => p.id === getCurrentActivePlayer())
    const nextIndex = (currentIndex + 1) % game.players.length
    const nextPlayer = game.players[nextIndex] || game.players[0]

    const newAction: TurnChangeAction = {
      id: generateId(),
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
    <div
      className={cn(
        'Board flex flex-col h-svh bg-black relative overflow-clip',
        dragEnabled && 'dragEnabled',
        tableMode && 'tableMode'
      )}
    >
      {/* Player Sections */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={displayPlayers.map(p => p.id)} strategy={rectSwappingStrategy}>
          <div className="PlayersSortingWrapper flex-1" data-player-count={displayPlayerCount}>
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
          {game.state === 'active' && game.turnTracking && currentActivePlayer && (
            <Button round variant="primary" onClick={() => handlePassTurn()} title="Pass turn">
              <ArrowBigRightDash size={32} />
            </Button>
          )}
        </div>

        {/* Play/Finish Button */}
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

      {/* Settings Overlay */}
      <div className="absolute top-0 right-0 flex flex-col gap-3 p-2 z-20">
        <Button round onClick={() => setShowSettings(true)}>
          <Settings size={24} />
        </Button>

        <Button
          round
          className={cn(dragEnabled && 'bg-blue-600/90 hover:bg-blue-500 text-white border-blue-500')}
          onClick={() => setDragEnabled(!dragEnabled)}
        >
          <Move size={24} />
        </Button>

        <Button round onClick={() => setShowActions(true)}>
          <List size={24} />
        </Button>

        <Button
          round
          className={cn(tableMode && 'bg-green-600/90 hover:bg-green-500 text-white border-green-500')}
          onClick={() => setTableMode(!tableMode)}
        >
          <Table size={24} />
        </Button>
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
    </div>
  )
}
