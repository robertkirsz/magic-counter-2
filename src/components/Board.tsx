import { DndContext, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { ArrowBigRightDash, List, Move, Play, Settings, Undo } from 'lucide-react'
import { DateTime } from 'luxon'
import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useGames } from '../hooks/useGames'
import { ActionsList } from './ActionsList'
import { Button } from './Button'
import { GameForm } from './GameForm'
import GameStatus from './GameStatus'
import { Modal } from './Modal'
import { SortablePlayerSection } from './SortablePlayerSection'
import ThemeToggle from './ThemeToggle'
import StartGameModal from './board/StartGameModal'

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

      <GameStatus gameId={gameId} />
    </div>
  )
}
