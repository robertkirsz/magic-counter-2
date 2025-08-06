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
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, rectSwappingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { ArrowBigRightDash, List, Move, Play, Settings, Sword, Table, Undo } from 'lucide-react'
import { DateTime } from 'luxon'
import React, { useEffect, useRef, useState } from 'react'

import { useGames } from '../hooks/useGames'
import { cn } from '../utils/cn'
import { EventDispatcher } from '../utils/eventDispatcher'
import { generateId } from '../utils/idGenerator'
import { ActionsList } from './ActionsList'
import { Button } from './Button'
import { GameEndModal } from './GameEndModal'
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
  const { games, updateGame, getCurrentActivePlayer, dispatchAction, undoLastAction, removeGame } = useGames()

  const game = games.find(g => g.id === gameId)

  const [showSettings, setShowSettings] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [showGameEndModal, setShowGameEndModal] = useState(false)
  const [previewPlayerCount, setPreviewPlayerCount] = useState<number>(game?.players.length || 4)
  const [dragEnabled, setDragEnabled] = useState(false)
  const [tableMode, setTableMode] = useState(getInitialTableMode())
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const settingsMenuRef = useRef<HTMLDivElement>(null)

  // Save table mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(TABLE_MODE_KEY, tableMode.toString())
  }, [tableMode])

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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

  // Drag end handler for reordering players and sword attacks
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    // Handle sword attacks
    if (active.data.current?.type === 'sword' && over.data.current?.type === 'player') {
      const attackerId = active.data.current.playerId
      const targetId = over.data.current.playerId

      if (attackerId !== targetId) {
        // Trigger attack modal using typed event dispatcher
        EventDispatcher.dispatchSwordAttack(attackerId, targetId)
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
  const canPlay = game.turnTracking ? validPlayers.length === game.players.length : true
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

        <DragOverlay>
          <div className="rounded-full p-2 bg-red-600 hover:bg-red-500 text-white border-red-500">
            <Sword size={24} />
          </div>
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
          {game.state === 'active' && game.turnTracking && currentActivePlayer && (
            <Button round variant="primary" onClick={() => handlePassTurn()} title="Pass turn">
              <ArrowBigRightDash size={32} />
            </Button>
          )}
        </div>

        {/* Play/Finish and Cancel Buttons */}
        <div className="flex gap-2 empty:hidden">
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

          {game.state === 'active' && (
            <Button variant="primary" onClick={handleFinish}>
              FINISH
            </Button>
          )}
        </div>
      </div>

      {/* Settings Menu */}
      <div className="absolute top-0 right-0 p-2 z-20" ref={settingsMenuRef}>
        <div className="relative">
          <Button
            round
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            className={cn(showSettingsMenu && 'bg-blue-600/90 hover:bg-blue-500 text-white border-blue-500')}
          >
            <Settings size={24} />
          </Button>

          {showSettingsMenu && (
            <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg min-w-[200px]">
              <div className="p-2 space-y-1">
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-white hover:bg-gray-700 rounded transition-colors"
                  onClick={() => {
                    setShowSettings(true)
                    setShowSettingsMenu(false)
                  }}
                >
                  <Settings size={20} />
                  <span>Game Settings</span>
                </button>

                <button
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-white hover:bg-gray-700 rounded transition-colors"
                  onClick={() => {
                    setShowActions(true)
                    setShowSettingsMenu(false)
                  }}
                >
                  <List size={20} />
                  <span>Game Actions</span>
                </button>

                <div className="border-t border-gray-600 my-1"></div>

                <button
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-left text-white hover:bg-gray-700 rounded transition-colors',
                    dragEnabled && 'bg-blue-600/90 text-white'
                  )}
                  onClick={() => {
                    setDragEnabled(!dragEnabled)
                    setShowSettingsMenu(false)
                  }}
                >
                  <Move size={20} />
                  <span>Drag Mode</span>
                </button>

                <button
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-left text-white hover:bg-gray-700 rounded transition-colors',
                    tableMode && 'bg-green-600/90 text-white'
                  )}
                  onClick={() => {
                    setTableMode(!tableMode)
                    setShowSettingsMenu(false)
                  }}
                >
                  <Table size={20} />
                  <span>Table Mode</span>
                </button>
              </div>
            </div>
          )}
        </div>
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

      <GameEndModal gameId={gameId} isOpen={showGameEndModal} onClose={() => setShowGameEndModal(false)} />
    </div>
  )
}
