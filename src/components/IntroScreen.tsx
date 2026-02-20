import {
  BookOpen,
  History,
  List,
  Maximize2,
  Minimize2,
  Move,
  Plus,
  Settings,
  Table,
  Trophy,
  Users as UsersIcon
} from 'lucide-react'
import React, { Suspense, useEffect, useState } from 'react'

import { useGames } from '../hooks/useGames'
import { cn } from '../utils/cn'
import { EventDispatcher } from '../utils/eventDispatcher'
import { isFullscreen, toggleFullscreen } from '../utils/fullscreen'
import { Modal } from './Modal'

const DeckForm = React.lazy(() => import('./DeckForm').then(m => ({ default: m.DeckForm })))
const Decks = React.lazy(() => import('./Decks').then(m => ({ default: m.Decks })))
const GameForm = React.lazy(() => import('./GameForm').then(m => ({ default: m.GameForm })))
const Games = React.lazy(() => import('./Games').then(m => ({ default: m.Games })))
const UserForm = React.lazy(() => import('./UserForm').then(m => ({ default: m.UserForm })))
const Users = React.lazy(() => import('./Users').then(m => ({ default: m.Users })))

interface IntroScreenProps {
  // In-game settings (only provided when opened from Board)
  gameId?: string
  tableMode?: boolean
  dragEnabled?: boolean
  gameState?: 'setup' | 'active' | 'finished'
  onTableModeChange?: (v: boolean) => void
  onDragEnabledChange?: (v: boolean) => void
  onShowGameSettings?: () => void
  onShowActions?: () => void
  onFinishGame?: () => void
  onNewGame?: () => void
  onClose?: () => void
  // Auto-open GameForm (for the "New Game" flow from Board)
  autoShowGameForm?: boolean
  onGameFormShown?: () => void
}

export const IntroScreen: React.FC<IntroScreenProps> = ({
  gameId,
  tableMode,
  dragEnabled,
  gameState,
  onTableModeChange,
  onDragEnabledChange,
  onShowGameSettings,
  onShowActions,
  onFinishGame,
  onNewGame,
  onClose,
  autoShowGameForm,
  onGameFormShown
}) => {
  const [showGames, setShowGames] = useState(false)
  const [showUsers, setShowUsers] = useState(false)
  const [showDecks, setShowDecks] = useState(false)
  const [showGameForm, setShowGameForm] = useState(false)
  const [deckFormVisible, setDeckFormVisible] = useState(false)
  const [userFormVisible, setUserFormVisible] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const { games, removeGame } = useGames()

  const hasGames = games.length > 0
  const isInGame = !!gameId

  // Auto-open GameForm when requested (e.g. after removing a game from Board)
  useEffect(() => {
    if (autoShowGameForm) {
      setShowGameForm(true)
      onGameFormShown?.()
    }
  }, [autoShowGameForm, onGameFormShown])

  // Fullscreen change listener (only needed during a game)
  useEffect(() => {
    if (!isInGame) return

    const handleFullscreenChange = () => {
      setFullscreen(isFullscreen())
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    setFullscreen(isFullscreen())

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [isInGame])

  const handleToggleFullscreen = async () => {
    try {
      await toggleFullscreen()
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error)
    }
  }

  const handleNewGame = () => {
    if (isInGame && gameId) {
      const confirmed = window.confirm('Are you sure you want to start a new game? The current game will be removed.')
      if (!confirmed) return

      EventDispatcher.dispatchGameDelete(gameId)
      removeGame(gameId)
      onNewGame?.()
    } else {
      setShowGameForm(true)
    }
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-4', !isInGame && 'h-svh')}>
      {!isInGame && <h1 className="mb-40 text-2xl text-center">Magic Counter</h1>}

      <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
        <button className="btn btn-primary col-span-2" onClick={handleNewGame}>
          <Plus size={20} />
          New Game
        </button>

        {hasGames && (
          <button className="btn" onClick={() => setShowGames(true)}>
            <History size={20} />
            Past Games
          </button>
        )}

        <button className="btn" onClick={() => setShowUsers(true)}>
          <UsersIcon size={20} />
          Users
        </button>

        <button className="btn" onClick={() => setShowDecks(true)}>
          <BookOpen size={20} />
          Decks
        </button>

        {/* In-game settings */}
        {isInGame && (
          <>
            <div className="col-span-2 border-t border-slate-600 my-1"></div>

            <button className="btn" onClick={() => onShowGameSettings?.()}>
              <Settings size={20} />
              Game Settings
            </button>

            <button className="btn" onClick={() => onShowActions?.()}>
              <List size={20} />
              Game Actions
            </button>

            <button
              className={cn('btn', dragEnabled && 'bg-blue-600/90 hover:bg-blue-500 text-white border-blue-500')}
              onClick={() => {
                onDragEnabledChange?.(!dragEnabled)
                onClose?.()
              }}
            >
              <Move size={20} />
              Drag Mode
            </button>

            <button
              className={cn('btn', tableMode && 'bg-green-600/90 hover:bg-green-500 text-white border-green-500')}
              onClick={() => {
                onTableModeChange?.(!tableMode)
                onClose?.()
              }}
            >
              <Table size={20} />
              Table Mode
            </button>

            <button
              className="btn col-span-2"
              onClick={() => {
                handleToggleFullscreen()
                onClose?.()
              }}
            >
              {fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              {fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>

            {gameState === 'active' && (
              <>
                <div className="col-span-2 border-t border-slate-600 my-1"></div>
                <button className="btn btn-error col-span-2" onClick={() => onFinishGame?.()}>
                  <Trophy size={20} />
                  Finish Game
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* GameForm Modal */}
      <Modal isOpen={showGameForm} onClose={() => setShowGameForm(false)} title="Game Form">
        <Suspense fallback={<div className="p-3 text-slate-400">Loading…</div>}>
          <GameForm onSave={() => setShowGameForm(false)} onCancel={() => setShowGameForm(false)} />
        </Suspense>
      </Modal>

      {/* Games Modal */}
      <Modal fullSize isOpen={showGames} onClose={() => setShowGames(false)} title="Games">
        <Suspense fallback={<div className="p-3 text-slate-400">Loading…</div>}>
          <Games className="flex-1" />
        </Suspense>
      </Modal>

      {/* Users Modal */}
      <Modal fullSize isOpen={showUsers} onClose={() => setShowUsers(false)} title="Users">
        <Suspense fallback={<div className="p-3 text-slate-400">Loading…</div>}>
          <Users className="flex-1" />
        </Suspense>

        {/* Floating Add User Button */}
        <button
          className="btn btn-primary btn-circle absolute bottom-3 right-3 shadow-lg z-10"
          onClick={() => setUserFormVisible(true)}
        >
          <Plus size={36} />
        </button>

        {/* User Form Modal */}
        <Modal isOpen={userFormVisible} title="Add User" onClose={() => setUserFormVisible(false)}>
          <Suspense fallback={<div className="p-3 text-slate-400">Loading…</div>}>
            <UserForm onSave={() => setUserFormVisible(false)} onCancel={() => setUserFormVisible(false)} />
          </Suspense>
        </Modal>
      </Modal>

      {/* Decks Modal */}
      <Modal fullSize isOpen={showDecks} onClose={() => setShowDecks(false)} title="Decks">
        <Suspense fallback={<div className="p-3 text-slate-400">Loading…</div>}>
          <Decks className="flex-1" />
        </Suspense>

        {/* Floating Add Deck Button */}
        <button
          className="btn btn-primary btn-circle absolute bottom-3 right-3 shadow-lg z-10"
          onClick={() => setDeckFormVisible(true)}
        >
          <Plus size={36} />
        </button>

        {/* Deck Form Modal */}
        <Modal isOpen={deckFormVisible} title="Add Deck" onClose={() => setDeckFormVisible(false)}>
          <Suspense fallback={<div className="p-3 text-slate-400">Loading…</div>}>
            <DeckForm onSave={() => setDeckFormVisible(false)} onCancel={() => setDeckFormVisible(false)} />
          </Suspense>
        </Modal>
      </Modal>
    </div>
  )
}
