import { DndContext, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowBigRightDash, GripVertical, List, Play, Settings } from 'lucide-react'
import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useGames } from '../hooks/useGames'
import { useUsers } from '../hooks/useUsers'
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
    zIndex: isDragging ? 10 : 'auto',
    position: 'relative'
  }

  return (
    <div ref={setNodeRef} style={style}>
      <button
        ref={setActivatorNodeRef}
        {...listeners}
        {...attributes}
        className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-white rounded-full p-1 shadow hover:bg-gray-100 cursor-grab active:cursor-grabbing"
        tabIndex={-1}
        aria-label="Drag to reorder player"
        type="button"
      >
        <GripVertical className="w-5 h-5 text-gray-400" />
      </button>

      <PlayerSection gameId={gameId} playerId={id} />
    </div>
  )
}

export const Board: React.FC<BoardProps> = ({ gameId }) => {
  const { games, updateGame, getCurrentActivePlayer } = useGames()
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
    const date = new Date(action.createdAt).toLocaleTimeString()

    if (action.type === 'life-change') {
      const sign = action.value > 0 ? '+' : ''
      return `${date}: ${action.from} ${sign}${action.value} life`
    } else if (action.type === 'turn-change') {
      if (action.from === null) return `${date}: ${action.to} starts`
      return `${date}: ${action.from} => ${action.to}`
    }

    return `${date}: Unknown action`
  }

  const handleActionRemove = (actionId: string) => {
    updateGame(game.id, {
      actions: game.actions.filter(action => action.id !== actionId)
    })
  }

  const getPlayerName = (playerId: string) => {
    const player = game.players.find(p => p.id === playerId)

    if (!player?.userId) return 'Unknown Player'

    const user = users.find(u => u.id === player.userId)

    return user?.name || 'Unknown User'
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
    <div className="Board flex min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
        <button
          onClick={() => setShowSettings(true)}
          className="bg-gray-800/90 hover:bg-gray-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 border border-gray-700 dark:bg-gray-900 dark:border-gray-700"
        >
          <Settings size={24} className="text-white" />
        </button>

        <ThemeToggle />

        <button
          onClick={() => setShowActions(true)}
          className="bg-gray-800/90 hover:bg-gray-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 border border-gray-700 dark:bg-gray-900 dark:border-gray-700"
        >
          <List size={24} className="text-white" />
        </button>
      </div>

      {/* Play/Finish Button */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex justify-center w-full z-20">
        {game.state !== 'finished' && (
          <button
            disabled={!canPlay && game.state !== 'active'}
            onClick={game.state === 'active' ? handleFinish : handlePlay}
            className={`bg-gray-800/90 hover:bg-gray-700 text-white rounded-full px-6 py-3 shadow-lg transition-all duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-green-500/30 hover:border-green-500/50 dark:bg-gray-900 dark:border-green-700`}
          >
            {game.state === 'active' ? (
              <span className="text-lg font-bold">FINISH</span>
            ) : (
              <>
                <Play size={32} />
                <span className="text-lg font-bold">PLAY</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Pass Turn Button */}
      {game.state === 'active' && game.turnTracking && currentActivePlayer && (
        <button
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-gray-800/90 hover:bg-gray-700 text-white rounded-full p-4 shadow-lg text-lg font-bold transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50 dark:bg-gray-900 dark:border-blue-700"
          onClick={() => handlePassTurn()}
        >
          <ArrowBigRightDash size={32} />
        </button>
      )}

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
              <div className="space-y-2">
                {game.actions.map(action => (
                  <div key={action.id} className="flex justify-between gap-1 p-2 border border-gray-200 rounded">
                    {formatAction(action)}
                    <ThreeDotMenu onClose={() => handleActionRemove(action.id)} asMenu={false} />
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
